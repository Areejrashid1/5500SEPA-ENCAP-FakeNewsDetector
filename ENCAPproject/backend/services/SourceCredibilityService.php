<?php

require_once __DIR__ . '/../repositories/SourceRepository.php';

class SourceCredibilityService
{
    private SourceRepository $sources;

    public function __construct()
    {
        $this->sources = new SourceRepository();
    }

    /**
     * Returns an array with:
     * - penalty (S)
     * - explanation
     * - level (trusted|unknown|flagged)
     */
    public function analyze(?string $sourceDomain): array
    {
        if (!$sourceDomain) {
            return [
                'penalty' => 15,
                'level' => 'unknown',
                'explanation' => 'No source was provided. Treated as an unknown outlet and assigned a moderate penalty.',
            ];
        }

        $normalized = strtolower(trim($sourceDomain));
        $record = $this->sources->findByDomain($normalized);

        if (!$record) {
            return [
                'penalty' => 15,
                'level' => 'unknown',
                'explanation' => 'The source "' . $normalized . '" is not present in the trusted sources database and is treated as unknown.',
            ];
        }

        if ($record->credibility_level === 'trusted') {
            return [
                'penalty' => 0,
                'level' => 'trusted',
                'explanation' => 'The source "' . $normalized . '" is marked as trusted in the database and does not reduce the score.',
            ];
        }

        if ($record->credibility_level === 'flagged') {
            return [
                'penalty' => 35,
                'level' => 'flagged',
                'explanation' => 'The source "' . $normalized . '" has a history of flagged content and incurs the maximum source penalty.',
            ];
        }

        // default to unknown-like behaviour
        return [
            'penalty' => 15,
            'level' => $record->credibility_level,
            'explanation' => 'The source "' . $normalized . '" is not classified as trusted and is treated as higher risk.',
        ];
    }
}

