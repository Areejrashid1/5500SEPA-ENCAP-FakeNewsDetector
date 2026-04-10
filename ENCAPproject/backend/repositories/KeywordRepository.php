<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Keyword.php';

class KeywordRepository
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function getAll(): array
    {
        $stmt = $this->db->query('SELECT * FROM keywords');
        $rows = $stmt->fetchAll();
        return array_map([$this, 'mapRowToKeyword'], $rows);
    }

    public function add(Keyword $keyword): Keyword
    {
        $stmt = $this->db->prepare('INSERT INTO keywords (word, category) VALUES (:word, :category)');
        $stmt->execute([
            'word' => $keyword->word,
            'category' => $keyword->category,
        ]);
        $keyword->keyword_id = (int)$this->db->lastInsertId();
        return $keyword;
    }

    private function mapRowToKeyword(array $row): Keyword
    {
        $k = new Keyword();
        $k->keyword_id = (int)$row['keyword_id'];
        $k->word = $row['word'];
        $k->category = $row['category'];
        return $k;
    }
}

