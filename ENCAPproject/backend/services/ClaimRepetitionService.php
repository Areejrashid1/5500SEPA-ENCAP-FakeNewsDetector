<?php

require_once __DIR__ . '/../repositories/ClaimRepository.php';
require_once __DIR__ . '/../utils/TextProcessor.php';

class ClaimRepetitionService
{
    private ClaimRepository $claims;
    private TextProcessor $textProcessor;

    public function __construct()
    {
        $this->claims = new ClaimRepository();
        $this->textProcessor = new TextProcessor();
    }

    /**
     * Extracts a simple representative claim (for demo) and checks repetition.
     * Returns R penalty, explanation and the stored Claim.
     */
    public function analyze(string $content): array
    {
        $representativeClaim = $this->textProcessor->extractRepresentativeClaim($content);
        $claim = $this->claims->saveOrIncrement($representativeClaim);

        $penalty = 0;
        $reason = 'Claim has not been flagged before in the database.';

        if ($claim->times_flagged === 1) {
            $penalty = 0;
        } elseif ($claim->times_flagged === 2) {
            $penalty = 10;
            $reason = 'This claim has been flagged once before and incurs a moderate repetition penalty.';
        } elseif ($claim->times_flagged > 2) {
            $penalty = 20;
            $reason = 'This claim has been flagged multiple times and incurs the maximum repetition penalty.';
        }

        return [
            'penalty' => $penalty,
            'times_flagged' => $claim->times_flagged,
            'claim_text' => $claim->claim_text,
            'explanation' => $reason,
        ];
    }
}

