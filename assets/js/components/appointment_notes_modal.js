/* ----------------------------------------------------------------------------
 * Easy!Appointments - Online Appointment Scheduler
 *
 * @package     EasyAppointments
 * @author      A.Tselegidis <alextselegidis@gmail.com>
 * @copyright   Copyright (c) Alex Tselegidis
 * @license     https://opensource.org/licenses/GPL-3.0 - GPLv3
 * @link        https://easyappointments.org
 * ---------------------------------------------------------------------------- */

/**
 * Appointment Notes Modal Component.
 *
 * Provides dialog UI for writing, viewing, and saving session notes,
 * including single appointment mode and queue batch-editing mode.
 */
App.Components.AppointmentNotesModal = (function () {
    const $modal = $('#appointment-notes-modal');
    const $message = $modal.find('.modal-message');
    const $appointmentId = $('#note-appointment-id');
    const $customerId = $('#note-customer-id');
    const $clientName = $('#note-client-name');
    const $serviceName = $('#note-service-name');
    const $datetime = $('#note-datetime');
    const $providerName = $('#note-provider-name');
    const $notes = $('#note-content');
    const $saveBtn = $('#btn-save-appointment-notes');
    const $saveAndNextBtn = $('#btn-save-and-next-note');
    const $saveAndNextText = $('#btn-save-and-next-text');
    const $printBtn = $('#btn-print-client-notes');
    const $queueNav = $('#notes-queue-nav');
    const $queueCounter = $('#notes-queue-counter');
    const $prevBtn = $('#btn-prev-note');
    const $nextBtn = $('#btn-next-note');

    let onSaveCallback = null;
    let queueList = null;
    let queueIndex = 0;
    let hasQueueChanges = false;

    /**
     * Format datetime for display.
     *
     * @param {string} dt
     * @returns {string}
     */
    function formatDateTime(dt) {
        if (!dt) return '-';
        if (window.moment) {
            return App.Utils.Date.format(
                window.moment(dt).format('YYYY-MM-DD HH:mm:ss'),
                vars('date_format'),
                vars('time_format'),
                true,
            );
        }
        return dt;
    }

    /**
     * Populate and display appointment data in the modal.
     *
     * @param {Object} appointment
     */
    function displayAppointment(appointment) {
        $message.addClass('d-none').removeClass('alert-danger alert-success').text('');
        $notes.val('').prop('disabled', true);
        $saveBtn.prop('disabled', true);
        $saveAndNextBtn.prop('disabled', true);

        const aptId = appointment.id || appointment.appointment_id;
        const custId = appointment.id_users_customer || (appointment.customer && appointment.customer.id) || appointment.customer_id;
        const custName = appointment.customer
            ? [appointment.customer.first_name, appointment.customer.last_name].filter(Boolean).join(' ')
            : [appointment.customer_first_name, appointment.customer_last_name].filter(Boolean).join(' ');
        const provName = appointment.provider
            ? [appointment.provider.first_name, appointment.provider.last_name].filter(Boolean).join(' ')
            : [appointment.provider_first_name, appointment.provider_last_name].filter(Boolean).join(' ');
        const srvName = (appointment.service && appointment.service.name) || appointment.service_name || '-';

        $appointmentId.val(aptId);
        $customerId.val(custId || '');
        $clientName.text(custName || '-');
        $serviceName.text(srvName);
        $datetime.text(formatDateTime(appointment.start_datetime));
        $providerName.text(provName || '-');

        if (custId) {
            $printBtn.attr('href', App.Utils.Url.siteUrl('appointment_notes/print_notes/' + custId)).removeClass('d-none');
        } else {
            $printBtn.addClass('d-none');
        }

        // Fetch existing note
        App.Http.AppointmentNotes.get(aptId)
            .done((response) => {
                if (response.note && response.note.notes) {
                    $notes.val(response.note.notes);
                } else {
                    $notes.val('');
                }
            })
            .fail(() => {
                $notes.val('');
            })
            .always(() => {
                $notes.prop('disabled', false).focus();
                updateSaveButtonsState();
            });
    }

    /**
     * Update disabled state of save buttons based on whether note content is blank.
     */
    function updateSaveButtonsState() {
        const hasContent = $notes.val().trim().length > 0;
        $saveBtn.prop('disabled', !hasContent);
        $saveAndNextBtn.prop('disabled', !hasContent);

        if (hasContent && $message.hasClass('alert-danger')) {
            $message.addClass('d-none').removeClass('alert-danger').text('');
        }
    }

    /**
     * Load an appointment at index in the queue.
     *
     * @param {number} index
     */
    function loadQueueItem(index) {
        if (!queueList || index < 0 || index >= queueList.length) {
            return;
        }

        queueIndex = index;
        $queueCounter.text(`${index + 1} of ${queueList.length}`);
        $prevBtn.prop('disabled', index === 0);
        $nextBtn.prop('disabled', index === queueList.length - 1);

        if (index === queueList.length - 1) {
            $saveAndNextBtn.html('<i class="fas fa-check me-1"></i> <span>' + (lang('save_and_finish') || 'Save & Finish') + '</span>');
        } else {
            $saveAndNextBtn.html('<i class="fas fa-forward me-1"></i> <span>' + (lang('save_and_next') || 'Save & Next') + '</span>');
        }

        displayAppointment(queueList[index]);
    }

    /**
     * Open notes modal for a single appointment.
     *
     * @param {Object} appointment
     * @param {Function} [onSave]
     */
    function open(appointment, onSave) {
        queueList = null;
        queueIndex = 0;
        hasQueueChanges = false;
        onSaveCallback = typeof onSave === 'function' ? onSave : null;

        $queueNav.addClass('d-none').removeClass('d-flex');
        $saveAndNextBtn.addClass('d-none');
        $saveBtn.removeClass('d-none');

        displayAppointment(appointment);
        $modal.modal('show');
    }

    /**
     * Open notes modal in queue mode to batch-edit appointments.
     *
     * @param {Array} appointmentsList
     * @param {number} [startIndex=0]
     * @param {Function} [onComplete]
     */
    function openQueue(appointmentsList, startIndex = 0, onComplete) {
        if (!appointmentsList || !appointmentsList.length) {
            return;
        }

        queueList = appointmentsList;
        hasQueueChanges = false;
        onSaveCallback = typeof onComplete === 'function' ? onComplete : null;

        $queueNav.removeClass('d-none').addClass('d-flex');
        $saveBtn.addClass('d-none');
        $saveAndNextBtn.removeClass('d-none');

        loadQueueItem(startIndex);
        $modal.modal('show');
    }

    /**
     * Save session notes.
     *
     * @param {boolean} advanceOnSuccess - Advance to next appointment in queue on success.
     */
    function save(advanceOnSuccess = false) {
        const aptId = $appointmentId.val();
        const noteText = $notes.val().trim();

        if (noteText === '') {
            $message.text(lang('notes_cannot_be_empty') || 'Session notes cannot be empty.')
                .addClass('alert-danger')
                .removeClass('d-none');
            $notes.focus();
            updateSaveButtonsState();
            return;
        }

        $saveBtn.prop('disabled', true);
        $saveAndNextBtn.prop('disabled', true);
        $message.addClass('d-none').removeClass('alert-danger alert-success').text('');

        App.Http.AppointmentNotes.store(aptId, noteText)
            .done((response) => {
                if (queueList && queueList.length) {
                    hasQueueChanges = true;

                    if (advanceOnSuccess) {
                        if (queueIndex < queueList.length - 1) {
                            loadQueueItem(queueIndex + 1);
                        } else {
                            // Reached the end of queue
                            $message.text(lang('notes_saved') || 'Notes saved successfully.').addClass('alert-success').removeClass('d-none');
                            setTimeout(() => {
                                $modal.modal('hide');
                            }, 600);
                        }
                    } else {
                        $message.text(lang('notes_saved') || 'Notes saved successfully.').addClass('alert-success').removeClass('d-none');
                        updateSaveButtonsState();
                    }
                } else {
                    $message.text(lang('notes_saved') || 'Notes saved successfully.').addClass('alert-success').removeClass('d-none');

                    if (onSaveCallback) {
                        onSaveCallback(aptId, noteText);
                    }

                    setTimeout(() => {
                        $modal.modal('hide');
                        updateSaveButtonsState();
                    }, 600);
                }
            })
            .fail((error) => {
                updateSaveButtonsState();
                const msg = (error.responseJSON && error.responseJSON.message) || lang('service_communication_error') || 'Error saving notes.';
                $message.text(msg).addClass('alert-danger').removeClass('d-none');
            });
    }

    /**
     * Handle modal hidden event.
     */
    function onModalHidden() {
        if (queueList && hasQueueChanges && onSaveCallback) {
            onSaveCallback();
        }
        queueList = null;
        hasQueueChanges = false;
    }

    /**
     * Initialize event handlers.
     */
    function initialize() {
        $notes.off('input propertychange').on('input propertychange', updateSaveButtonsState);

        $saveBtn.off('click').on('click', () => save(false));
        $saveAndNextBtn.off('click').on('click', () => save(true));

        $prevBtn.off('click').on('click', () => {
            if (queueList && queueIndex > 0) {
                loadQueueItem(queueIndex - 1);
            }
        });

        $nextBtn.off('click').on('click', () => {
            if (queueList && queueIndex < queueList.length - 1) {
                loadQueueItem(queueIndex + 1);
            }
        });

        $modal.off('hidden.bs.modal').on('hidden.bs.modal', onModalHidden);
    }

    $(document).ready(() => {
        initialize();
    });

    return {
        open,
        openQueue,
        save,
        initialize,
    };
})();
