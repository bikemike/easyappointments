<?php defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Appointment Notes model.
 */
class Appointment_notes_model extends EA_Model
{
    /**
     * @var string
     */
    protected string $table = 'appointment_notes';

    /**
     * Save (insert or update) an appointment note.
     *
     * @param array $data
     * @return int
     */
    public function save(array $data): int
    {
        $now = date('Y-m-d H:i:s');

        if (!empty($data['id'])) {
            $id = (int) $data['id'];
            unset($data['id']);
            $data['updated_at'] = $now;
            $this->db->update('appointment_notes', $data, ['id' => $id]);
            return $id;
        }

        // Check if a note already exists for this appointment
        if (!empty($data['id_appointments'])) {
            $existing = $this->db
                ->get_where('appointment_notes', ['id_appointments' => $data['id_appointments']])
                ->row_array();

            if ($existing) {
                unset($data['id']);
                $data['updated_at'] = $now;
                $this->db->update('appointment_notes', $data, ['id' => $existing['id']]);
                return (int) $existing['id'];
            }
        }

        $data['created_at'] = $now;
        $data['updated_at'] = $now;
        $this->db->insert('appointment_notes', $data);

        return (int) $this->db->insert_id();
    }

    /**
     * Get note by appointment ID.
     *
     * @param int $appointment_id
     * @return array|null
     */
    public function get_by_appointment(int $appointment_id): ?array
    {
        return $this->db
            ->get_where('appointment_notes', ['id_appointments' => $appointment_id])
            ->row_array();
    }

    /**
     * Get all notes for a customer in chronological order.
     *
     * @param int $customer_id
     * @return array
     */
    public function get_by_customer(int $customer_id): array
    {
        $this->db->select('
            an.id as note_id,
            an.notes as session_notes,
            an.created_at as note_date,
            an.updated_at as note_updated,
            a.id as appointment_id,
            a.start_datetime,
            a.end_datetime,
            a.notes as booking_notes,
            a.status as appointment_status,
            s.name as service_name,
            s.duration as service_duration,
            p.id as provider_id,
            p.first_name as provider_first_name,
            p.last_name as provider_last_name
        ');
        $this->db->from('appointment_notes AS an');
        $this->db->join('appointments AS a', 'a.id = an.id_appointments', 'left');
        $this->db->join('services AS s', 's.id = a.id_services', 'left');
        $this->db->join('users AS p', 'p.id = an.id_users_provider', 'left');
        $this->db->where('an.id_users_customer', $customer_id);
        $this->db->order_by('a.start_datetime', 'DESC');

        return $this->db->get()->result_array();
    }

    /**
     * Get completed appointments that are pending notes.
     *
     * @param int|null $provider_id
     * @param int $limit
     * @param int|null $days_back Default 14 days (2 weeks)
     * @return array
     */
    public function get_pending_appointments(?int $provider_id = null, int $limit = 100, ?int $days_back = 14): array
    {
        $now = date('Y-m-d H:i:s');

        $this->db->select('
            a.id as appointment_id,
            a.start_datetime,
            a.end_datetime,
            a.notes as booking_notes,
            c.id as customer_id,
            c.first_name as customer_first_name,
            c.last_name as customer_last_name,
            c.phone_number as customer_phone,
            c.email as customer_email,
            s.name as service_name,
            p.id as provider_id,
            p.first_name as provider_first_name,
            p.last_name as provider_last_name
        ');
        $this->db->from('appointments AS a');
        $this->db->join('users AS c', 'c.id = a.id_users_customer', 'inner');
        $this->db->join('services AS s', 's.id = a.id_services', 'inner');
        $this->db->join('users AS p', 'p.id = a.id_users_provider', 'inner');
        $this->db->join('appointment_notes AS an', 'an.id_appointments = a.id', 'left');
        $this->db->where('an.id IS NULL', null, false);
        $this->db->where('a.end_datetime <', $now);
        if ($days_back !== null) {
            $this->db->where('a.start_datetime >=', date('Y-m-d H:i:s', strtotime("-{$days_back} days")));
        }
        $this->db->where('a.status !=', 'Cancelled');
        $this->db->where('a.is_unavailability', 0);
        $this->db->group_start()
            ->where('a.type', 0)
            ->or_where('a.type IS NULL', null, false)
            ->group_end();

        if ($provider_id) {
            $this->db->where('a.id_users_provider', $provider_id);
        }

        // Show oldest first so practitioner works chronologically
        $this->db->order_by('a.start_datetime', 'ASC');
        if ($limit > 0) {
            $this->db->limit($limit);
        }

        return $this->db->get()->result_array();
    }
}
