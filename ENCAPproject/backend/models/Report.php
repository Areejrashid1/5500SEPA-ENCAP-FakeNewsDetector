<?php

class Report
{
    public ?int $report_id = null;
    public int $article_id;
    public string $analysis_details; // JSON string with structured report
    public string $created_at;
}

