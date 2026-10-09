<?php defined('BASEPATH') or exit('No direct script access allowed');

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
 * Appointment Notes controller.
 *
 * Handles clinical / practitioner session notes associated with appointments and clients.
 *
 * @package Controllers
 */
class Appointment_notes extends EA_Controller
{
    /**
     * Appointment_notes constructor.
     */
    public function __construct()
    {
        parent::__construct();

        $this->load->model('appointments_model');
        $this->load->model('appointment_notes_model');
        $this->load->model('customers_model');
        $this->load->model('providers_model');
        $this->load->model('services_model');
        $this->load->model('roles_model');
        $this->load->model('settings_model');

        $this->load->library('accounts');
        $this->load->library('permissions');
    }

    /**
     * Store (insert or update) session notes for an appointment.
     */
    public function store(): void
    {
        try {
            method('post');

            $user_id = (int) session('user_id');

            if (!$user_id) {
                abort(401, 'Unauthorized');
            }

            if (cannot('view', PRIV_APPOINTMENTS)) {
                abort(403, 'Forbidden');
            }

            check('appointment_id', 'numeric');

            $appointment_id = (int) request('appointment_id');
            $notes = trim((string) request('notes', ''));

            if ($notes === '') {
                throw new InvalidArgumentException(lang('notes_cannot_be_empty') ?? 'Session notes cannot be empty.');
            }

            $appointment = $this->appointments_model->find($appointment_id);

            if (!$appointment) {
                abort(404, 'Appointment not found');
            }

            $role_slug = session('role_slug');

            if ($role_slug === DB_SLUG_PROVIDER && (int) $appointment['id_users_provider'] !== $user_id) {
                abort(403, 'Forbidden - Cannot add notes to another provider\'s appointment');
            }

            $note_id = $this->appointment_notes_model->save([
                'id_appointments' => $appointment_id,
                'id_users_customer' => (int) $appointment['id_users_customer'],
                'id_users_provider' => (int) $appointment['id_users_provider'],
                'notes' => (string) $notes,
            ]);

            json_response([
                'success' => true,
                'id' => $note_id,
                'message' => lang('notes_saved'),
            ]);
        } catch (Throwable $e) {
            json_exception($e);
        }
    }

    /**
     * Get notes for a specific appointment.
     *
     * @param int $appointment_id
     */
    public function get(int $appointment_id): void
    {
        try {
            method('get');

            $user_id = (int) session('user_id');

            if (!$user_id) {
                abort(401, 'Unauthorized');
            }

            if (cannot('view', PRIV_APPOINTMENTS)) {
                abort(403, 'Forbidden');
            }

            $appointment = $this->appointments_model->find($appointment_id);

            if (!$appointment) {
                abort(404, 'Appointment not found');
            }

            $note = $this->appointment_notes_model->get_by_appointment($appointment_id);

            json_response([
                'success' => true,
                'note' => $note,
                'appointment' => $appointment,
            ]);
        } catch (Throwable $e) {
            json_exception($e);
        }
    }

    /**
     * Get all session notes for a specific customer.
     *
     * @param int $customer_id
     */
    public function get_by_customer(int $customer_id): void
    {
        try {
            method('get');

            $user_id = (int) session('user_id');

            if (!$user_id) {
                abort(401, 'Unauthorized');
            }

            if (cannot('view', PRIV_CUSTOMERS) && cannot('view', PRIV_APPOINTMENTS)) {
                abort(403, 'Forbidden');
            }

            $customer = $this->customers_model->find($customer_id);

            if (!$customer) {
                abort(404, 'Customer not found');
            }

            $notes = $this->appointment_notes_model->get_by_customer($customer_id);

            json_response([
                'success' => true,
                'customer' => $customer,
                'notes' => $notes,
            ]);
        } catch (Throwable $e) {
            json_exception($e);
        }
    }

    /**
     * Get completed appointments pending notes for the current user/provider.
     */
    public function pending(): void
    {
        try {
            method('get');

            $user_id = (int) session('user_id');

            if (!$user_id) {
                abort(401, 'Unauthorized');
            }

            if (cannot('view', PRIV_APPOINTMENTS)) {
                abort(403, 'Forbidden');
            }

            $role_slug = session('role_slug');
            $provider_id = ($role_slug === DB_SLUG_PROVIDER) ? $user_id : null;

            $limit = (int) request('limit', 100);
            $days_back = (int) request('days_back', 14);

            $pending = $this->appointment_notes_model->get_pending_appointments($provider_id, $limit, $days_back);

            json_response([
                'success' => true,
                'pending' => $pending,
            ]);
        } catch (Throwable $e) {
            json_exception($e);
        }
    }

    /**
     * Render printable view of all notes for a customer.
     *
     * @param int $customer_id
     */
    public function print_notes(int $customer_id): void
    {
        method('get');

        $user_id = (int) session('user_id');

        if (!$user_id) {
            redirect('login');
            return;
        }

        if (cannot('view', PRIV_CUSTOMERS) && cannot('view', PRIV_APPOINTMENTS)) {
            abort(403, 'Forbidden');
        }

        $customer = $this->customers_model->find($customer_id);

        if (!$customer) {
            abort(404, 'Customer not found');
        }

        $notes = $this->appointment_notes_model->get_by_customer($customer_id);

        $company = [
            'company_name' => setting('company_name'),
            'company_link' => setting('company_link'),
            'company_email' => setting('company_email'),
            'date_format' => setting('date_format'),
            'time_format' => setting('time_format'),
        ];

        $this->load->view('pages/print_client_notes', [
            'customer' => $customer,
            'notes' => $notes,
            'company' => $company,
        ]);
    }
}
