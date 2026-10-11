<?php defined('BASEPATH') or exit('No direct script access allowed');

/* ----------------------------------------------------------------------------
 * Easy!Appointments - Online Appointment Scheduler
 *
 * @package     EasyAppointments
 * @author      A.Tselegidis <alextselegidis@gmail.com>
 * @copyright   Copyright (c) Alex Tselegidis
 * @license     https://opensource.org/licenses/GPL-3.0 - GPLv3
 * @link        https://easyappointments.org
 * @since       v1.6.0
 * ---------------------------------------------------------------------------- */

class Migration_Add_calendar_hours_settings extends EA_Migration
{
    /**
     * Upgrade method.
     */
    public function up(): void
    {
        if (!$this->db->get_where('settings', ['name' => 'day_start_time'])->num_rows()) {
            $this->db->insert('settings', [
                'name' => 'day_start_time',
                'value' => '08:00',
            ]);
        }

        if (!$this->db->get_where('settings', ['name' => 'day_end_time'])->num_rows()) {
            $this->db->insert('settings', [
                'name' => 'day_end_time',
                'value' => '22:00',
            ]);
        }
    }

    /**
     * Downgrade method.
     */
    public function down(): void
    {
        if ($this->db->get_where('settings', ['name' => 'day_start_time'])->num_rows()) {
            $this->db->delete('settings', ['name' => 'day_start_time']);
        }

        if ($this->db->get_where('settings', ['name' => 'day_end_time'])->num_rows()) {
            $this->db->delete('settings', ['name' => 'day_end_time']);
        }
    }
}
