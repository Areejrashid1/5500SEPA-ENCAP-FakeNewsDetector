<?php

class ReportGeneratorService
{
    public function generate(array $context): array
    {
        return [
            'source_credibility' => [
                'level' => $context['source']['level'],
                'penalty' => $context['source']['penalty'],
                'explanation' => $context['source']['explanation'],
            ],
            'sensational_language' => [
                'penalty' => $context['language']['penalty'],
                'suspicious_count' => $context['language']['suspicious_count'],
                'total_words' => $context['language']['total_words'],
                'explanation' => $context['language']['explanation'],
            ],
            'headline_structure' => [
                'penalty' => $context['headline']['penalty'],
                'explanation' => $context['headline']['explanation'],
            ],
            'claim_repetition' => [
                'penalty' => $context['claims']['penalty'],
                'times_flagged' => $context['claims']['times_flagged'],
                'claim_text' => $context['claims']['claim_text'],
                'explanation' => $context['claims']['explanation'],
            ],
            'final_score' => $context['score']['score'],
            'risk_level' => $context['score']['risk_level'],
        ];
    }
}

