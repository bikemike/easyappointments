<?php defined('BASEPATH') or exit('No direct script access allowed');

// Explicitly route all outgoing emails to the local Mailpit mock SMTP catcher.
// This guarantees that emails are captured locally and NEVER sent externally to real clients.

$config['useragent'] = 'Easy!Appointments';
$config['protocol'] = 'smtp';
$config['mailtype'] = 'html';
$config['smtp_debug'] = '0';
$config['smtp_auth'] = false;
$config['smtp_host'] = getenv('SMTP_HOST') ?: (gethostbyname('easyappointments-mailpit') !== 'easyappointments-mailpit' ? 'easyappointments-mailpit' : '127.0.0.1');
$config['smtp_port'] = 1025;
$config['crlf'] = "\r\n";
$config['newline'] = "\r\n";
