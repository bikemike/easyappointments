<?php defined('BASEPATH') or exit('No direct script access allowed');

/* ----------------------------------------------------------------------------
 * Easy!Appointments - Online Appointment Scheduler
 *
 * @package     EasyAppointments
 * @author      A.Tselegidis <alextselegidis@gmail.com>
 * @copyright   Copyright (c) Alex Tselegidis
 * @license     https://opensource.org/licenses/GPL-3.0 - GPLv3
 * @link        https://easyappointments.org
 * @since       v1.3.2
 * ---------------------------------------------------------------------------- */

use Jsvrcek\ICS\Exception\CalendarEventException;

require_once __DIR__ . '/Google.php';
require_once __DIR__ . '/Caldav.php';

/**
 * Console controller.
 *
 * Handles all the Console related operations.
 */
class Console extends EA_Controller
{
    /**
     * Console constructor.
     */
    public function __construct()
    {
        if (!is_cli()) {
            exit('No direct script access allowed');
        }

        parent::__construct();

        $this->load->dbutil();

        $this->load->library('instance');
        $this->load->library('cleanup');

        $this->load->model('admins_model');
        $this->load->model('customers_model');
        $this->load->model('providers_model');
        $this->load->model('services_model');
        $this->load->model('settings_model');
    }

    /**
     * Perform a console installation.
     *
     * Use this method to install Easy!Appointments directly from the terminal.
     *
     * Usage:
     *
     * php index.php console install
     *
     * @throws Exception
     */
    public function install(): void
    {
        $this->instance->migrate('fresh');

        $password = $this->instance->seed();

        response(
            PHP_EOL . '⇾ Installation completed, login with "administrator" / "' . $password . '".' . PHP_EOL . PHP_EOL,
        );
    }

    /**
     * Migrate the database to the latest state.
     *
     * Use this method to upgrade an Easy!Appointments instance to the latest database state.
     *
     * Notice:
     *
     * Do not use this method to install the app as it will not seed the database with the initial entries (admin,
     * provider, service, settings etc.).
     *
     * Usage:
     *
     * php index.php console migrate
     *
     * php index.php console migrate fresh
     *
     * @param string $type
     */
    public function migrate(string $type = ''): void
    {
        $this->instance->migrate($type);
    }

    /**
     * Seed the database with test data.
     *
     * Use this method to add test data to your database
     *
     * Usage:
     *
     * php index.php console seed
     * @throws Exception
     */
    public function seed(): void
    {
        $this->instance->seed();
    }

    /**
     * Create a database backup file.
     *
     * Use this method to back up your Easy!Appointments data.
     *
     * Usage:
     *
     * php index.php console backup
     *
     * php index.php console backup /path/to/backup/folder
     *
     * @throws Exception
     */
    public function backup(): void
    {
        $this->instance->backup($GLOBALS['argv'][3] ?? null);
    }

    /**
     * Trigger the synchronization of all provider calendars with Google Calendar.
     *
     * Use this method in a cronjob to automatically sync events between Easy!Appointments and Google Calendar.
     *
     * Notice:
     *
     * Google syncing must first be enabled for each individual provider from inside the backend calendar page.
     *
     * Usage:
     *
     * php index.php console sync
     *
     * @throws CalendarEventException
     * @throws Exception
     * @throws Throwable
     */
    public function sync(): void
    {
        $providers = $this->providers_model->get();

        foreach ($providers as $provider) {
            if (filter_var($provider['settings']['google_sync'], FILTER_VALIDATE_BOOLEAN)) {
                Google::sync((string) $provider['id']);
            }

            if (filter_var($provider['settings']['caldav_sync'], FILTER_VALIDATE_BOOLEAN)) {
                Caldav::sync((string) $provider['id']);
            }
        }
    }

    /**
     * Clean up old customer data based on data retention settings.
     *
     * Use this method in a cronjob to automatically delete customer data older than the configured retention period.
     *
     * Usage:
     *
     * php index.php console cleanup
     *
     * @throws Exception
     */
    public function cleanup(): void
    {
        $this->cleanup->run();
    }

    /**
     * Send email reminder notifications to clients for upcoming appointments.
     * Ported from legacy cli.php logic.
     *
     * Usage:
     * php index.php console reminders
     * php index.php console reminders 1                   (dry-run / simulation)
     * php index.php console reminders 1 client@test.com  (dry-run filtered to email)
     * php index.php console reminders 0 client@test.com  (live run filtered to email)
     * php index.php console reminders client@test.com    (live run filtered to email)
     *
     * @param mixed $simulate Pass 1/true/'dry-run' for dry run, 0/false for live, or an email address.
     * @param string|null $email_filter Optional email address to filter notifications to a specific client.
     */
    public function reminders(mixed $simulate = false, ?string $email_filter = null): void
    {
        $is_simulate = false;
        $target_email = null;

        foreach ([$simulate, $email_filter] as $arg) {
            if ($arg === null || $arg === false || $arg === '') {
                continue;
            }
            $str_arg = trim((string)$arg);
            if (str_contains($str_arg, '@')) {
                $target_email = strtolower($str_arg);
            } elseif (in_array(strtolower($str_arg), ['1', 'true', 'dry-run', 'dryrun', 'simulate'], true)) {
                $is_simulate = true;
            } elseif (in_array(strtolower($str_arg), ['0', 'false', 'live'], true)) {
                $is_simulate = false;
            }
        }

        $this->load->model('appointments_model');
        $this->load->model('services_model');
        $this->load->model('customers_model');
        $this->load->model('providers_model');
        $this->load->model('settings_model');
        $this->load->library('notifications');
        $this->load->library('email_messages');

        $this->db
            ->select('appointments.*')
            ->from('appointments')
            ->join('users', 'users.id = appointments.id_users_customer', 'inner')
            ->where('is_unavailability', 0)
            ->where('status !=', 'Cancelled')
            ->where('id_services IS NOT NULL', null, false)
            ->where('notified', 0)
            ->where('start_datetime > NOW()', null, false);

        if (!empty($target_email)) {
            $this->db->where('users.email', $target_email);
        } else {
            $this->db
                ->where('DATE_SUB(DATE(start_datetime), INTERVAL 37 HOUR) < NOW()', null, false)
                ->where('book_datetime < DATE_SUB(start_datetime, INTERVAL 36 HOUR)', null, false);
        }

        $query = $this->db->get();
        $appointments = $query->result_array();

        if ($is_simulate) {
            echo PHP_EOL . '[DRY-RUN / SIMULATION MODE] No emails will be sent and no database records updated.' . PHP_EOL;
        }

        if (!empty($target_email)) {
            echo 'Filtered to recipient: ' . $target_email . PHP_EOL;
        }

        if (empty($appointments)) {
            if (!empty($target_email)) {
                echo PHP_EOL . 'No upcoming appointments for ' . $target_email . ' require reminders.' . PHP_EOL . PHP_EOL;
            } else {
                echo PHP_EOL . 'No upcoming appointments require reminders.' . PHP_EOL . PHP_EOL;
            }
            return;
        }

        echo PHP_EOL . 'Processing reminder email(s) for ' . count($appointments) . ' appointment(s):' . PHP_EOL;

        $company_settings = [
            'company_name' => setting('company_name'),
            'company_link' => setting('company_link'),
            'company_email' => setting('company_email'),
            'date_format' => setting('date_format'),
            'time_format' => setting('time_format'),
        ];

        foreach ($appointments as $appointment) {
            $service = $this->services_model->find($appointment['id_services']);
            $customer = $this->customers_model->find($appointment['id_users_customer']);
            $provider = $this->providers_model->find($appointment['id_users_provider']);

            if (!$customer || empty($customer['email'])) {
                continue;
            }

            if (!empty($target_email) && strcasecmp($customer['email'], $target_email) !== 0) {
                continue;
            }

            $subject = lang('appointment_reminder') ?: 'Appointment Reminder';
            $message = lang('thank_you_for_appointment') ?: '';
            $customer_link = site_url('booking/reschedule/' . $appointment['hash']);

            echo '⇾ Reminder to ' . $customer['email'] . ' for appointment #' . $appointment['id'] . ' (' . $appointment['start_datetime'] . ')' . PHP_EOL;

            if (!$is_simulate) {
                $this->db->where('id', $appointment['id'])->update('appointments', ['notified' => 1]);

                try {
                    $this->email_messages->send_appointment_saved(
                        $appointment,
                        $provider,
                        $service,
                        $customer,
                        $company_settings,
                        $subject,
                        $message,
                        $customer_link,
                        $customer['email'],
                        '',
                        $customer['timezone']
                    );
                    echo '  [SENT] Email successfully dispatched.' . PHP_EOL;
                } catch (Throwable $e) {
                    echo '  [ERROR] Failed to send email: ' . $e->getMessage() . PHP_EOL;
                }
            } else {
                echo '  [SIMULATED - email not sent, database not updated]' . PHP_EOL;
            }
        }

        echo PHP_EOL . 'Reminder task completed.' . PHP_EOL . PHP_EOL;
    }

    public function send_reminders(mixed $simulate = false, ?string $email_filter = null): void
    {
        $this->reminders($simulate, $email_filter);
    }

    public function send_appointment_reminders(mixed $simulate = false, ?string $email_filter = null): void
    {
        $this->reminders($simulate, $email_filter);
    }

    /**
     * Send a test email via CLI to verify mail server connectivity.
     * Ported from legacy cli.php logic.
     *
     * Usage:
     * php index.php cli send_test_email [to_address]
     * php index.php console send_test_email [to_address]
     *
     * @param string|null $to_address
     */
    public function send_test_email(?string $to_address = null): void
    {
        $recipient = !empty($to_address) ? $to_address : setting('company_email');

        if (empty($recipient)) {
            response(PHP_EOL . '[ERROR] No recipient specified and company_email setting is empty.' . PHP_EOL . 'Usage: php index.php console send_test_email <email>' . PHP_EOL . PHP_EOL);
            return;
        }

        response(PHP_EOL . "Sending test email to: {$recipient}..." . PHP_EOL);

        try {
            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
            $mail->CharSet = 'UTF-8';
            $mail->SMTPDebug = \PHPMailer\PHPMailer\SMTP::DEBUG_SERVER;

            if (config('protocol') === 'smtp') {
                $mail->isSMTP();
                $mail->Host = config('smtp_host');
                $mail->Port = config('smtp_port');
                $mail->SMTPAuth = config('smtp_auth');
                if ($mail->SMTPAuth) {
                    $mail->Username = config('smtp_user');
                    $mail->Password = config('smtp_pass');
                }
                if (!empty(config('smtp_crypto'))) {
                    $mail->SMTPSecure = config('smtp_crypto');
                }
            }

            $from_name = config('from_name') ?: setting('company_name');
            $from_address = config('from_address') ?: setting('company_email');
            $reply_to_address = config('reply_to') ?: setting('company_email');

            $mail->setFrom($from_address ?: 'noreply@example.com', $from_name ?: 'Easy!Appointments');
            if (!empty($reply_to_address)) {
                $mail->addReplyTo($reply_to_address);
            }
            $mail->addAddress($recipient);

            $mail->Subject = 'Easy!Appointments Test Email';
            $mail->Body = "This is a test of the email system from Easy!Appointments (" . config('version') . ").\n\nSent at: " . date('Y-m-d H:i:s');

            $mail->send();

            response(PHP_EOL . "✓ Test email successfully sent to {$recipient}." . PHP_EOL . PHP_EOL);
        } catch (\Throwable $e) {
            response(PHP_EOL . "[ERROR] Email could not be sent: " . $e->getMessage() . PHP_EOL . PHP_EOL);
        }
    }

    /**
     * Show help information about the console capabilities.
     *
     * Use this method to see the available commands.
     *
     * Usage:
     *
     * php index.php console help
     */
    public function help(): void
    {
        $help = [
            '',
            'Easy!Appointments ' . config('version'),
            '',
            'Usage:',
            '',
            '⇾ php index.php console [command] [arguments]',
            '',
            'Commands:',
            '',
            '⇾ php index.php console migrate',
            '⇾ php index.php console migrate fresh',
            '⇾ php index.php console migrate up',
            '⇾ php index.php console migrate down',
            '⇾ php index.php console seed',
            '⇾ php index.php console install',
            '⇾ php index.php console backup',
            '⇾ php index.php console sync',
            '⇾ php index.php console cleanup    (cleans sessions, logs, cache, and customer data)',
            '⇾ php index.php console reminders [simulate=0/1] [email] (send upcoming appointment reminders)',
            '⇾ php index.php console send_test_email [to_address] (send a test email to verify mail delivery)',
            '',
            '',
        ];

        response(implode(PHP_EOL, $help));
    }
}
