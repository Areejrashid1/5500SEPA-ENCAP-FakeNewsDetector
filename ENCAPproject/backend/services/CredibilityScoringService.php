<?php

class CredibilityScoringService
{
    // Recommended weights
    private const W_SOURCE = 35;
    private const W_LANGUAGE = 25;
    private const W_HEADLINE = 20;
    private const W_REPETITION = 20;

    /**
     * Compute final score and risk.
     *
     * @param float $S Source credibility penalty
     * @param float $L Sensational language penalty
     * @param float $H Headline structure penalty
     * @param float $R Claim repetition penalty
     */
    public function compute(float $S, float $L, float $H, float $R): array
    {
        // Using the weighted deduction formula but since each component is already scaled
        // to its own range, we interpret S,L,H,R as absolute deductions within their caps.
        $totalPenalty = $S + $L + $H + $R;
        $score = max(0, 100 - $totalPenalty);

        $risk = $this->classifyRisk($score);

        return [
            'score' => $score,
            'risk_level' => $risk,
            'components' => [
                'source_penalty' => $S,
                'language_penalty' => $L,
                'headline_penalty' => $H,
                'repetition_penalty' => $R,
            ],
        ];
    }

    private function classifyRisk(float $score): string
    {
        if ($score >= 80) {
            return 'Low Risk';
        }
        if ($score >= 50) {
            return 'Moderate Risk';
        }
        return 'High Risk';
    }
}

