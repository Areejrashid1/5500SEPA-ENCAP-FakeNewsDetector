<?php

require_once __DIR__ . '/../utils/TextProcessor.php';

class HeadlineAnalysisService
{
    private TextProcessor $textProcessor;

    public function __construct()
    {
        $this->textProcessor = new TextProcessor();
    }

    /**
     * Returns H penalty and explanation based on headline structure.
     */
    public function analyze(string $headline): array
    {
        $penalty = 0;
        $reasons = [];

        $trimmed = trim($headline);
        $upper = mb_strtoupper($trimmed);

        // ALL CAPS check
        if ($trimmed !== '' && $trimmed === $upper) {
            $penalty += 8;
            $reasons[] = 'Headline is written in all capital letters.';
        }

        // Multiple exclamation marks
        if (preg_match('/!{2,}/u', $trimmed)) {
            $penalty += 5;
            $reasons[] = 'Headline contains multiple exclamation marks.';
        }

        // Common clickbait phrases
        $clickbaitPhrases = [
            "you won't believe",
            'what happens next',
            'shocking',
            'unbelievable',
            'secret',
            'miracle',
        ];
        $lower = mb_strtolower($trimmed);
        $clickbaitHit = false;
        foreach ($clickbaitPhrases as $phrase) {
            if (mb_strpos($lower, $phrase) !== false) {
                $clickbaitHit = true;
                break;
            }
        }
        if ($clickbaitHit) {
            $penalty += 7;
            $reasons[] = 'Headline contains common clickbait phrases.';
        }

        if ($penalty === 0) {
            $reasons[] = 'No strong clickbait or structural issues were detected in the headline.';
        }

        $explanation = implode(' ', $reasons);

        return [
            'penalty' => $penalty,
            'explanation' => $explanation,
        ];
    }
}

