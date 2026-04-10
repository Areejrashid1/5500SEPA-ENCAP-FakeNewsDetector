<?php

class TextProcessor
{
    public function tokenizeWords(string $text = ''): array
    {
        if ($text === null || $text === '') {
            return [];
        }
        $clean  = preg_replace('/[^\p{L}\p{N}\s]+/u', ' ', $text);
        $tokens = preg_split('/\s+/u', $clean ?? '', -1, PREG_SPLIT_NO_EMPTY);
        return $tokens ?: [];
    }

    public function extractRepresentativeClaim(string $text = ''): string
    {
        if ($text === null || $text === '') {
            return '';
        }
        $sentences = preg_split('/(?<=[.!?])\s+/u', trim($text));
        if (!$sentences || count($sentences) === 0) {
            return trim(mb_substr($text, 0, 240));
        }
        usort($sentences, static function ($a, $b) {
            return mb_strlen($b) <=> mb_strlen($a);
        });
        return trim($sentences[0]);
    }
}