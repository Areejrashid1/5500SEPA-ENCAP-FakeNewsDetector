<?php

require_once __DIR__ . '/../services/NewsAnalyzerService.php';
require_once __DIR__ . '/../utils/PDFTextExtractor.php';

class NewsController
{
    private NewsAnalyzerService $analyzer;
    private PDFTextExtractor $pdfExtractor;

    public function __construct()
    {
        $this->analyzer = new NewsAnalyzerService();
        $this->pdfExtractor = new PDFTextExtractor();
    }

    /**
     * POST /api/analyze-news
     * Accepts JSON or multipart/form-data with headline, content, source, and optional PDF.
     */
    public function analyze(): void
    {
        try{
    error_reporting(E_ALL); error_log('DEBUG: analyze() called');
    error_log('DEBUG POST: ' . print_r($_POST, true));
    error_log('DEBUG FILES: ' . print_r($_FILES, true));
        ini_set('display_errors', 1);
// Get logged-in user from session
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized. Please log in first.']);
    return;
}
$userId = (int)$_SESSION['user_id'];

        $headline = trim($_POST['headline'] ?? ($_GET['headline'] ?? ''));
        $source = trim($_POST['source'] ?? ($_GET['source'] ?? ''));
        $content = trim($_POST['content'] ?? ($_GET['content'] ?? ''));

        // Handle PDF upload (multipart/form-data)
        if (isset($_FILES['pdf']) && $_FILES['pdf']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['pdf']['tmp_name'];
            $fileName = basename($_FILES['pdf']['name']);
            $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

            if ($extension !== 'pdf') {
                http_response_code(400);
                echo json_encode(['error' => 'Only PDF uploads are supported.']);
                return;
            }

            $destinationDir = __DIR__ . '/../uploads/pdf_files/';
            if (!is_dir($destinationDir)) {
                mkdir($destinationDir, 0775, true);
            }

            $destinationPath = $destinationDir . uniqid('encap_', true) . '.pdf';
            move_uploaded_file($fileTmpPath, $destinationPath);

            try {
    $extracted = $this->pdfExtractor->extractFromPath($destinationPath);
    if ($extracted !== '') {
        $content .= "\n\n" . $extracted;
    }
} catch (RuntimeException $e) {
    error_log('DEBUG PDF ERROR: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to read PDF content.', 'detail' => $e->getMessage()]);
    return;
}
        }

        if ($headline === '' && $content === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Provide at least a headline or article content for analysis.']);
            return;
        }

        [$article, $report] = $this->analyzer->analyzeAndPersist(
            $userId,
            $headline !== '' ? $headline : '(untitled article)',
            $content !== '' ? $content : $headline,
            $source !== '' ? $source : null
        );

        echo json_encode([
            'article_id' => $article->article_id,
            'credibility_score' => $article->credibility_score,
            'risk_level' => $article->risk_level,
            'report' => $report,
        ]);
    } catch (Throwable $e) {
        error_log('ANALYZE ERROR: ' . $e->getMessage() . ' in ' . $e->getFile() . ' line ' . $e->getLine());
        http_response_code(500);
        echo json_encode([
            'error' => 'Server error',
            'detail' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ]);
    }
}
}

