<?php

header('Content-Type: application/json');

// Very simple router for ENCAP backend.

require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/NewsController.php';
require_once __DIR__ . '/../controllers/ReportController.php';
require_once __DIR__ . '/../controllers/AdminController.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$basePath = '/ENCAPproject/backend';

// Normalize to /api/...
if (strpos($uri, $basePath . '/api/') !== 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
    exit;
}

$path = trim(substr($uri, strlen($basePath . '/api/')), '/');
error_log('DEBUG path: [' . $path . ']');

try {
    if ($method === 'POST' && $path === 'register') {
        $body = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $controller = new AuthController();
        echo json_encode($controller->register($body));
        exit;
    }
    if ($method === 'GET' && $path === 'me') {
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized.']);
        exit;
    }
    echo json_encode([
        'user_id' => $_SESSION['user_id'],
        'name'    => $_SESSION['name'],
        'email'   => $_SESSION['email'],
    ]);
    exit;
}

    if ($method === 'POST' && $path === 'login') {
        $body = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $controller = new AuthController();
        echo json_encode($controller->login($body));
        exit;
    }

   if ($method === 'POST' && $path === 'analyze-news') {
    error_log('DEBUG: reached analyze-news route');
    $controller = new NewsController();
    error_log('DEBUG: controller created');
    $controller->analyze();
    exit;
}
    if ($method === 'GET' && preg_match('#^report/(\d+)$#', $path, $m)) {
        $controller = new ReportController();
        $controller->show((int)$m[1]);
        exit;
    }

    if ($method === 'GET' && $path === 'history') {
        $controller = new ReportController();
        $controller->history();
        exit;
    }

    if ($method === 'GET' && $path === 'admin/keywords') {
        $controller = new AdminController();
        $controller->listKeywords();
        exit;
    }

    if ($method === 'POST' && $path === 'admin/add-keyword') {
        $body = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $controller = new AdminController();
        $controller->addKeyword($body);
        exit;
    }
    if ($method === 'POST' && $path === 'logout') {
    session_destroy();
    echo json_encode(['message' => 'Logged out successfully.']);
    exit;
}

    http_response_code(404);
    echo json_encode(['error' => 'Unknown endpoint']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'message' => $e->getMessage()]);
}

