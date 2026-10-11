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

class Migration_Add_calendar_colors_settings extends EA_Migration
{
    /**
     * Upgrade method.
     */
    public function up(): void
    {
        if (!$this->db->get_where('settings', ['name' => 'color_not_working'])->num_rows()) {
            $this->db->insert('settings', [
                'name' => 'color_not_working',
                'value' => '#BEBEBE',
            ]);
        }

        if (!$this->db->get_where('settings', ['name' => 'color_unavailability'])->num_rows()) {
            $this->db->insert('settings', [
                'name' => 'color_unavailability',
                'value' => '#879DB4',
            ]);
        }

        if (!$this->db->get_where('settings', ['name' => 'color_blocked_period'])->num_rows()) {
            $this->db->insert('settings', [
                'name' => 'color_blocked_period',
                'value' => '#d65069',
            ]);
        }
    }

    /**
     * Downgrade method.
     */
    public function down(): void
    {
        if ($this->db->get_where('settings', ['name' => 'color_not_working'])->num_rows()) {
            $this->db->delete('settings', ['name' => 'color_not_working']);
        }

        if ($this->db->get_where('settings', ['name' => 'color_unavailability'])->num_rows()) {
            $this->db->delete('settings', ['name' => 'color_unavailability']);
        }

        if ($this->db->get_where('settings', ['name' => 'color_blocked_period'])->num_rows()) {
            $this->db->delete('settings', ['name' => 'color_blocked_period']);
        }
    }
}
