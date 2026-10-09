<?php defined('BASEPATH') or exit('No direct script access allowed');

require_once __DIR__ . '/Console.php';

/**
 * Legacy CLI controller.
 *
 * Provides backward compatibility for legacy cron jobs invoking:
 * php index.php cli send_appointment_reminders
 */
class Cli extends Console
{
    public function __construct()
    {
        parent::__construct();
    }
}
