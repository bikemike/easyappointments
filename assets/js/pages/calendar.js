/* ----------------------------------------------------------------------------
 * Easy!Appointments - Online Appointment Scheduler
 *
 * @package     EasyAppointments
 * @author      A.Tselegidis <alextselegidis@gmail.com>
 * @copyright   Copyright (c) Alex Tselegidis
 * @license     https://opensource.org/licenses/GPL-3.0 - GPLv3
 * @link        https://easyappointments.org
 * @since       v1.5.0
 * ---------------------------------------------------------------------------- */

/**
 * Calendar page.
 *
 * This module implements the functionality of the backend calendar page.
 */
App.Pages.Calendar = (function () {
    const $insertWorkingPlanException = $('#insert-working-plan-exception');

    const moment = window.moment;

    /**
     * Add the page event listeners.
     */
    function addEventListeners() {
        const $calendarPage = $('#calendar-page');

        $calendarPage.on('click', '#toggle-fullscreen', (event) => {
            const $toggleFullscreen = $(event.target);
            const element = document.documentElement;
            const isFullScreen =
                document.fullScreenElement || document.mozFullScreen || document.webkitIsFullScreen || false;

            if (isFullScreen) {
                // Exit fullscreen mode.
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }

                $toggleFullscreen.removeClass('btn-success').addClass('btn-light');
            } else {
                // Switch to fullscreen mode.
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                }
                $toggleFullscreen.removeClass('btn-light').addClass('btn-success');
            }
        });

        $insertWorkingPlanException.on('click', () => {
            const providerId = $('#select-filter-item').val();

            if (providerId === App.Utils.CalendarDefaultView.FILTER_TYPE_ALL) {
                return;
            }

            const provider = vars('available_providers').find((availableProvider) => {
                return Number(availableProvider.id) === Number(providerId);
            });

            if (!provider) {
                throw new Error('Provider could not be found: ' + providerId);
            }

            App.Components.WorkingPlanExceptionsModal.add().done((workingPlanException) => {
                const successCallback = (response) => {
                    App.Layouts.Backend.displayNotification(lang('working_plan_exception_saved'));

                    // Update the in-memory provider data with the new exception
                    let exceptions = JSON.parse(provider.settings.working_plan_exceptions || '[]');
                    if (!Array.isArray(exceptions)) {
                        exceptions = [];
                    }

                    // Add the new exception (with ID from response if available)
                    if (response && response.id) {
                        workingPlanException.id = response.id;
                    }
                    exceptions.push(workingPlanException);
                    provider.settings.working_plan_exceptions = JSON.stringify(exceptions);

                    $('#select-filter-item').trigger('change'); // Update the calendar.
                };

                App.Http.Calendar.saveWorkingPlanException(
                    workingPlanException,
                    providerId,
                    successCallback,
                    null,
                );
            });
        });
    }

    /**
     * Get calendar selection end date.
     *
     * On calendar slot selection, calculate the end date based on the provided start date.
     *
     * @param {Object} info Holding the "start" and "end" props, as provided by FullCalendar.
     *
     * @return {Date}
     */
    function getSelectionEndDate(info) {
        const startMoment = moment(info.start);
        const endMoment = moment(info.end);
        const startTillEndDiff = endMoment.diff(startMoment);
        const startTillEndDuration = moment.duration(startTillEndDiff);
        const durationInMinutes = startTillEndDuration.asMinutes();
        const minDurationInMinutes = 15;

        if (durationInMinutes <= minDurationInMinutes) {
            const serviceId = $('#select-service').val();
            const service = vars('available_services').find(
                (availableService) => Number(availableService.id) === Number(serviceId),
            );

            if (service) {
                endMoment.add(service.duration - durationInMinutes, 'minutes');
            }
        }

        return endMoment.toDate();
    }

    /**
     * Check for completed appointments awaiting session notes.
     */
    function checkPendingSessionNotes() {
        if (vars('role_slug') === 'customer') {
            return;
        }

        App.Http.AppointmentNotes.getPending(5, 30).done((response) => {
            if (!response.pending || response.pending.length === 0) {
                return;
            }

            const count = response.pending.length;
            const message = lang('pending_notes_banner')
                ? lang('pending_notes_banner').replace('%d', count)
                : `You have ${count} completed appointment(s) awaiting session notes.`;

            const $banner = $(`
                <div id="pending-notes-alert" class="alert alert-warning alert-dismissible fade show d-flex align-items-center justify-content-between mb-3 mx-3 shadow-sm" role="alert">
                    <div>
                        <i class="fas fa-notes-medical me-2 text-warning"></i>
                        <strong>${lang('session_notes')}:</strong> ${message}
                    </div>
                    <div class="d-flex align-items-center">
                        <button type="button" class="btn btn-sm btn-dark me-2" id="btn-review-pending-notes">
                            <i class="fas fa-edit me-1"></i> ${lang('write_notes') || 'Write Notes'}
                        </button>
                        <button type="button" class="btn-close position-static" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                </div>
            `);

            $('#calendar-toolbar').after($banner);

            $banner.on('click', '#btn-review-pending-notes', () => {
                const firstApt = response.pending[0];
                App.Components.AppointmentNotesModal.open(firstApt, () => {
                    $('#pending-notes-alert').remove();
                    checkPendingSessionNotes();
                });
            });
        });
    }

    /**
     * Initialize the module.
     *
     * This function makes the necessary initialization for the default backend calendar page.
     *
     * If this module is used in another page then this function might not be needed.
     */
    function initialize() {
        // Load and initialize the calendar view.
        if (vars('calendar_view') === 'table') {
            App.Utils.CalendarTableView.initialize();
        } else {
            App.Utils.CalendarDefaultView.initialize();
        }

        App.Pages.Calendar.addEventListeners();

        checkPendingSessionNotes();
    }

    document.addEventListener('DOMContentLoaded', initialize);

    return {
        addEventListeners,
        getSelectionEndDate,
    };
})();
