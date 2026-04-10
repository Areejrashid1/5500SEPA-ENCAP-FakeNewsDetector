<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Source.php';

class SourceRepository
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function findByDomain(string $domain): ?Source
    {
        $stmt = $this->db->prepare('SELECT * FROM sources WHERE domain = :domain LIMIT 1');
        $stmt->execute(['domain' => $domain]);
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }
        return $this->mapRowToSource($row);
    }

    private function mapRowToSource(array $row): Source
    {
        $s = new Source();
        $s->source_id = (int)$row['source_id'];
        $s->domain = $row['domain'];
        $s->credibility_level = $row['credibility_level'];
        return $s;
    }
}

