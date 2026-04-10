<?php

require_once __DIR__ . '/../repositories/KeywordRepository.php';

class AdminController
{
    private KeywordRepository $keywords;

    public function __construct()
    {
        $this->keywords = new KeywordRepository();
    }

    // GET /api/admin/keywords
    public function listKeywords(): void
    {
        $rows = $this->keywords->getAll();
        $result = array_map(static function (Keyword $k) {
            return [
                'keyword_id' => $k->keyword_id,
                'word' => $k->word,
                'category' => $k->category,
            ];
        }, $rows);

        echo json_encode($result);
    }

    // POST /api/admin/add-keyword
    public function addKeyword(array $data): void
    {
        $word = trim($data['word'] ?? '');
        $category = trim($data['category'] ?? 'sensational');

        if ($word === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Keyword "word" is required.']);
            return;
        }

        $k = new Keyword();
        $k->word = $word;
        $k->category = $category;

        $k = $this->keywords->add($k);

        echo json_encode([
            'keyword_id' => $k->keyword_id,
            'word' => $k->word,
            'category' => $k->category,
        ]);
    }
}

