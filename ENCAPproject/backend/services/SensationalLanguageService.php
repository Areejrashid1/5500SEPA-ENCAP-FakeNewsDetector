<?php

require_once __DIR__ . '/../repositories/KeywordRepository.php';
require_once __DIR__ . '/../utils/TextProcessor.php';

class SensationalLanguageService
{
    private KeywordRepository $keywords;
    private TextProcessor $textProcessor;

    public function __construct()
    {
        $this->keywords = new KeywordRepository();
        $this->textProcessor = new TextProcessor();
    }

    /**
     * Returns L penalty and explanation based on suspicious word density.
     */
    public function analyze(string $content): array
    {
        $tokens = $this->textProcessor->tokenizeWords($content);
        $totalWords = max(count($tokens), 1);

        $keywordList = $this->keywords->getAll();
        $suspiciousSet = array_map(static function (Keyword $k) {
            return mb_strtolower($k->word);
        }, $keywordList);

        $suspiciousSet = array_unique($suspiciousSet);

        $suspiciousCount = 0;
        foreach ($tokens as $word) {
            if (in_array(mb_strtolower($word), $suspiciousSet, true)) {
                $suspiciousCount++;
            }
        }

        $ratio = ($suspiciousCount / $totalWords) * 100;
        // Cap raw ratio at 25 as per requirements
        $penalty = min(25, $ratio);

        $explanation = sprintf(
            'Detected %d suspicious keywords out of approximately %d words (≈ %.1f%%). This contributes to a sensational language penalty.',
            $suspiciousCount,
            $totalWords,
            $ratio
        );

        return [
            'penalty' => $penalty,
            'suspicious_count' => $suspiciousCount,
            'total_words' => $totalWords,
            'explanation' => $explanation,
        ];
    }
}

