<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Article.php';

class ArticleRepository
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function create(Article $article): Article
    {
        $stmt = $this->db->prepare(
            'INSERT INTO articles (user_id, title, content, source, credibility_score, risk_level, created_at)
             VALUES (:user_id, :title, :content, :source, :score, :risk_level, NOW())'
        );

        $result = $stmt->execute([
    'user_id' => $article->user_id,
    'title' => $article->title,
    'content' => $article->content,
    'source' => $article->source,
    'score' => $article->credibility_score,
    'risk_level' => $article->risk_level,
]);

error_log('ARTICLE INSERT result: ' . ($result ? 'true' : 'false'));
error_log('ARTICLE INSERT errorInfo: ' . print_r($stmt->errorInfo(), true));
error_log('ARTICLE INSERT lastId: ' . $this->db->lastInsertId());
error_log('ARTICLE INSERT data: ' . json_encode([
    'user_id' => $article->user_id,
    'title'   => $article->title,
    'source'  => $article->source,
    'score'   => $article->credibility_score,
    'risk'    => $article->risk_level,
]));

$article->article_id = (int)$this->db->lastInsertId();
        return $article;
    }

    public function findById(int $id): ?Article
    {
        $stmt = $this->db->prepare('SELECT * FROM articles WHERE article_id = :id');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }
        return $this->mapRowToArticle($row);
    }

    public function findByUser(int $userId, int $limit = 50): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM articles WHERE user_id = :user_id ORDER BY created_at DESC LIMIT :limit'
        );
        $stmt->bindValue('user_id', $userId, \PDO::PARAM_INT);
        $stmt->bindValue('limit', $limit, \PDO::PARAM_INT);
        $stmt->execute();
        $rows = $stmt->fetchAll();
        return array_map([$this, 'mapRowToArticle'], $rows);
    }

    private function mapRowToArticle(array $row): Article
    {
        $article = new Article();
        $article->article_id = (int)$row['article_id'];
        $article->user_id = (int)$row['user_id'];
        $article->title = $row['title'];
        $article->content = $row['content'];
        $article->source = $row['source'];
        $article->credibility_score = (float)$row['credibility_score'];
        $article->risk_level = $row['risk_level'];
        $article->created_at = $row['created_at'];
        return $article;
    }
}

