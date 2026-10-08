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
 * Appointment Notes HTTP client.
 *
 * This module implements the appointment session notes HTTP requests.
 */
App.Http.AppointmentNotes = (function () {
    /**
     * Store (insert or update) notes for an appointment.
     *
     * @param {number|string} appointmentId
     * @param {string} notes
     * @returns {Promise}
     */
    function store(appointmentId, notes) {
        const url = App.Utils.Url.siteUrl('appointment_notes/store');
        const data = {
            csrf_token: vars('csrf_token'),
            appointment_id: appointmentId,
            notes: notes,
        };
        return $.post(url, data);
    }

    /**
     * Get notes for an appointment.
     *
     * @param {number|string} appointmentId
     * @returns {Promise}
     */
    function get(appointmentId) {
        const url = App.Utils.Url.siteUrl('appointment_notes/get/' + appointmentId);
        return $.get(url);
    }

    /**
     * Get all notes for a customer.
     *
     * @param {number|string} customerId
     * @returns {Promise}
     */
    function getByCustomer(customerId) {
        const url = App.Utils.Url.siteUrl('appointment_notes/get_by_customer/' + customerId);
        return $.get(url);
    }

    /**
     * Get pending appointments needing notes.
     *
     * @param {number} [limit=10]
     * @param {number} [daysBack=30]
     * @returns {Promise}
     */
    function getPending(limit, daysBack) {
        const url = App.Utils.Url.siteUrl('appointment_notes/pending');
        const data = {
            limit: limit || 10,
            days_back: daysBack || 30,
        };
        return $.get(url, data);
    }

    return {
        store,
        get,
        getByCustomer,
        getPending,
    };
})();
