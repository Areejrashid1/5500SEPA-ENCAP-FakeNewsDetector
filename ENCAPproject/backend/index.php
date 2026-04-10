<?php
session_start();
// Front controller for ENCAP backend.
// Responsibilities:
// - Receive HTTP requests
// - Load routes/api.php
// - Let routes file dispatch to controllers
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/routes/api.php';

