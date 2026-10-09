<?php defined('BASEPATH') or exit('No direct script access allowed');

require_once __DIR__ . '/Console.php';

/**
 * Legacy CLI controller.
 *
 * Provides backward compatibility for legacy cron jobs and scripts invoking:
 * php index.php cli <command>
 */
class Cli extends Console
{
    public function __construct()
    {
        parent::__construct();
    }
}
