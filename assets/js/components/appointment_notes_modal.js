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
 * Provides dialog UI for writing, viewing, and saving session notes.
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
    const $printBtn = $('#btn-print-client-notes');

    let onSaveCallback = null;

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
     * Open notes modal for an appointment.
     *
     * @param {Object} appointment
     * @param {Function} [onSave]
     */
    function open(appointment, onSave) {
        onSaveCallback = typeof onSave === 'function' ? onSave : null;

        $message.addClass('d-none').removeClass('alert-danger alert-success').text('');
        $notes.val('').prop('disabled', true);
        $saveBtn.prop('disabled', true);

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

        $modal.modal('show');

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
                $saveBtn.prop('disabled', false);
            });
    }

    /**
     * Save session notes.
     */
    function save() {
        const aptId = $appointmentId.val();
        const noteText = $notes.val().trim();

        $saveBtn.prop('disabled', true);
        $message.addClass('d-none').removeClass('alert-danger alert-success').text('');

        App.Http.AppointmentNotes.store(aptId, noteText)
            .done((response) => {
                $message.text(lang('notes_saved') || 'Notes saved successfully.').addClass('alert-success').removeClass('d-none');

                if (onSaveCallback) {
                    onSaveCallback(aptId, noteText);
                }

                setTimeout(() => {
                    $modal.modal('hide');
                    $saveBtn.prop('disabled', false);
                }, 600);
            })
            .fail((error) => {
                $saveBtn.prop('disabled', false);
                const msg = (error.responseJSON && error.responseJSON.message) || lang('service_communication_error') || 'Error saving notes.';
                $message.text(msg).addClass('alert-danger').removeClass('d-none');
            });
    }

    /**
     * Initialize event handlers.
     */
    function initialize() {
        $saveBtn.off('click').on('click', save);
    }

    $(document).ready(() => {
        initialize();
    });

    return {
        open,
        save,
        initialize,
    };
})();
