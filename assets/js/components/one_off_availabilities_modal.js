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
 * One-Off Availabilities modal component.
 *
 * This module implements the one-off availabilities modal functionality.
 */
App.Components.OneOffAvailabilitiesModal = (function () {
    const $oneOffModal = $('#one-off-availabilities-modal');
    const $id = $('#one-off-availability-id');
    const $startDatetime = $('#one-off-availability-start');
    const $endDatetime = $('#one-off-availability-end');
    const $selectProvider = $('#one-off-availability-provider');
    const $notes = $('#one-off-availability-notes');
    const $saveOneOff = $('#save-one-off-availability');
    const $insertOneOff = $('#insert-one-off-availability');
    const $selectFilterItem = $('#select-filter-item');
    const $reloadAppointments = $('#reload-appointments');

    const moment = window.moment;

    /**
     * Update the displayed timezone.
     */
    function updateTimezone() {
        const providerId = $selectProvider.val();

        const provider = vars('available_providers').find(
            (availableProvider) => Number(availableProvider.id) === Number(providerId),
        );

        if (provider && provider.timezone) {
            $oneOffModal.find('.provider-timezone').text(vars('timezones')[provider.timezone]);
        }
    }

    /**
     * Add the component event listeners.
     */
    function addEventListeners() {
        /**
         * Event: Provider "Change"
         */
        $selectProvider.on('change', () => {
            updateTimezone();
        });

        /**
         * Event: Manage One-Off Availability Dialog Save Button "Click"
         *
         * Stores the one-off availability period changes or inserts a new record.
         */
        $saveOneOff.on('click', () => {
            $oneOffModal.find('.modal-message').addClass('d-none');
            $oneOffModal.find('.is-invalid').removeClass('is-invalid');

            if (!$selectProvider.val()) {
                $selectProvider.addClass('is-invalid');
                return;
            }

            const startDateTimeMoment = moment(App.Utils.UI.getDateTimePickerValue($startDatetime));

            if (!startDateTimeMoment.isValid()) {
                $startDatetime.addClass('is-invalid');
                return;
            }

            const endDateTimeMoment = moment(App.Utils.UI.getDateTimePickerValue($endDatetime));

            if (!endDateTimeMoment.isValid()) {
                $endDatetime.addClass('is-invalid');
                return;
            }

            if (startDateTimeMoment.isAfter(endDateTimeMoment)) {
                // Start time is after end time - display message to user.
                $oneOffModal
                    .find('.modal-message')
                    .text(lang('start_date_before_end_error'))
                    .addClass('alert-danger')
                    .removeClass('d-none');

                $startDatetime.addClass('is-invalid');
                $endDatetime.addClass('is-invalid');
                return;
            }

            // One-off availability period records go to the appointments table (type = 2).
            const oneOffAvailability = {
                start_datetime: startDateTimeMoment.format('YYYY-MM-DD HH:mm:ss'),
                end_datetime: endDateTimeMoment.format('YYYY-MM-DD HH:mm:ss'),
                notes: $notes.val(),
                id_users_provider: $selectProvider.val(),
            };

            if ($id.val() !== '') {
                oneOffAvailability.id = $id.val();
            }

            const successCallback = () => {
                // Display success message to the user.
                App.Layouts.Backend.displayNotification(lang('one_off_availability_saved'));

                // Close the modal dialog and refresh the calendar appointments.
                $oneOffModal.find('.alert').addClass('d-none');
                $oneOffModal.modal('hide');
                $reloadAppointments.trigger('click');
            };

            App.Http.Calendar.saveOneOffAvailability(oneOffAvailability, successCallback, null);
        });

        /**
         * Event: Insert One-Off Availability Button "Click"
         */
        $insertOneOff.on('click', () => {
            resetModal();

            // Set the default datetime values.
            const startMoment = moment();
            const currentMin = parseInt(startMoment.format('mm'));

            if (currentMin > 0 && currentMin < 15) {
                startMoment.set({minutes: 15});
            } else if (currentMin > 15 && currentMin < 30) {
                startMoment.set({minutes: 30});
            } else if (currentMin > 30 && currentMin < 45) {
                startMoment.set({minutes: 45});
            } else {
                startMoment.add(1, 'hour').set({minutes: 0});
            }

            if ($selectFilterItem.val() && $selectFilterItem.val() !== 'all') {
                $selectProvider.val($selectFilterItem.val());
            }

            App.Utils.UI.setDateTimePickerValue($startDatetime, startMoment.toDate());
            App.Utils.UI.setDateTimePickerValue($endDatetime, startMoment.add(1, 'hour').toDate());

            $oneOffModal.find('.modal-header h3').text(lang('new_one_off_availability_title'));
            $oneOffModal.modal('show');
        });
    }

    /**
     * Reset dialog form to initial state.
     */
    function resetModal() {
        $id.val('');

        const start = App.Utils.Date.format(moment().toDate(), vars('date_format'), vars('time_format'), true);
        const end = App.Utils.Date.format(
            moment().add(1, 'hour').toDate(),
            vars('date_format'),
            vars('time_format'),
            true,
        );

        App.Utils.UI.initializeDateTimePicker($startDatetime);
        $startDatetime.val(start);

        App.Utils.UI.initializeDateTimePicker($endDatetime);
        $endDatetime.val(end);

        $notes.val('');
        $oneOffModal.find('.modal-message').addClass('d-none');
        $oneOffModal.find('.is-invalid').removeClass('is-invalid');
    }

    /**
     * Populate dialog form for editing.
     *
     * @param {Object} data - One-off availability data.
     */
    function populateModal(data) {
        resetModal();
        $oneOffModal.find('.modal-header h3').text(lang('edit_one_off_availability_title'));

        App.Utils.UI.setDateTimePickerValue($startDatetime, moment(data.start_datetime).toDate());
        App.Utils.UI.setDateTimePickerValue($endDatetime, moment(data.end_datetime).toDate());

        $id.val(data.id);
        $selectProvider.val(data.id_users_provider);
        $notes.val(data.notes || '');

        updateTimezone();
        $oneOffModal.modal('show');
    }

    /**
     * Initialize the module.
     */
    function initialize() {
        for (const index in vars('available_providers')) {
            const provider = vars('available_providers')[index];
            $selectProvider.append(new Option(provider.first_name + ' ' + provider.last_name, provider.id));
        }

        addEventListeners();
    }

    document.addEventListener('DOMContentLoaded', initialize);

    return {
        resetModal,
        populateModal,
    };
})();
