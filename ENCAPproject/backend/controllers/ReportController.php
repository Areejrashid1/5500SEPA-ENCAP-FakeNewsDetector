<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../repositories/ArticleRepository.php';

class ReportController
{
    private ArticleRepository $articles;
    private \PDO $db;

    public function __construct()
    {
        $this->articles = new ArticleRepository();
        $this->db = Database::getConnection();
    }

    // GET /api/report/{id}
    public function show(int $id): void
    {
        $article = $this->articles->findById($id);
        if (!$article) {
            http_response_code(404);
            echo json_encode(['error' => 'Report not found.']);
            return;
        }

        $stmt = $this->db->prepare('SELECT * FROM reports WHERE article_id = :id ORDER BY created_at DESC LIMIT 1');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        if (!$row) {
            http_response_code(404);
            echo json_encode(['error' => 'Report not found.']);
            return;
        }

        echo json_encode([
            'article' => [
                'article_id' => $article->article_id,
                'title' => $article->title,
                'source' => $article->source,
                'credibility_score' => $article->credibility_score,
                'risk_level' => $article->risk_level,
                'created_at' => $article->created_at,
            ],
            'report' => json_decode($row['analysis_details'], true),
        ]);
    }

    // GET /api/history
    public function history(): void
    {
       if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized.']);
    return;
}
$userId = (int)$_SESSION['user_id'];
        $articles = $this->articles->findByUser($userId);

        $result = array_map(static function (Article $a) {
            return [
                'article_id' => $a->article_id,
                'title' => $a->title,
                'source' => $a->source,
                'credibility_score' => $a->credibility_score,
                'risk_level' => $a->risk_level,
                'created_at' => $a->created_at,
            ];
        }, $articles);

        echo json_encode($result);
    }
}

