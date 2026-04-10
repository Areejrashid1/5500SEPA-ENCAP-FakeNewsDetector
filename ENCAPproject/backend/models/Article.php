<?php

class Article
{
    public ?int $article_id = null;
    public int $user_id;
    public string $title;
    public string $content;
    public ?string $source = null;
    public float $credibility_score;
    public string $risk_level;
    public string $created_at;
}

