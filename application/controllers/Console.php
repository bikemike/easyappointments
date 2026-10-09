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
            '⇾ php index.php console send_test_email [to_address] (send a test email to verify mail delivery)',
            '',
            '',
        ];

        response(implode(PHP_EOL, $help));
    }
}
