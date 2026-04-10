<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Claim.php';

class ClaimRepository
{
    private \PDO $db;

    public function __construct()
    {
        $this->db = Database::getConnection();
    }

    public function findByText(string $text): ?Claim
    {
        $stmt = $this->db->prepare('SELECT * FROM claims WHERE claim_text = :text LIMIT 1');
        $stmt->execute(['text' => $text]);
        $row = $stmt->fetch();
        if (!$row) {
            return null;
        }
        return $this->mapRowToClaim($row);
    }

    public function saveOrIncrement(string $text): Claim
    {
        $existing = $this->findByText($text);
        if ($existing) {
            $stmt = $this->db->prepare(
                'UPDATE claims SET times_flagged = times_flagged + 1 WHERE claim_id = :id'
            );
            $stmt->execute(['id' => $existing->claim_id]);
            $existing->times_flagged++;
            return $existing;
        }

        $stmt = $this->db->prepare('INSERT IGNORE INTO claims (claim_text, times_flagged) VALUES (:text, 1)');
$stmt->execute(['text' => $text]);

// If INSERT IGNORE skipped due to duplicate, fetch the existing row
$lastId = (int)$this->db->lastInsertId();
if ($lastId === 0) {
    $existing = $this->findByText($text);
    if ($existing) return $existing;
}

$claim = new Claim();
$claim->claim_id = $lastId;
$claim->claim_text = $text;
$claim->times_flagged = 1;
return $claim;
    }

    private function mapRowToClaim(array $row): Claim
    {
        $c = new Claim();
        $c->claim_id = (int)$row['claim_id'];
        $c->claim_text = $row['claim_text'];
        $c->times_flagged = (int)$row['times_flagged'];
        return $c;
    }
}

