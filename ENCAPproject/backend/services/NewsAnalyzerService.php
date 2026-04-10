<?php

require_once __DIR__ . '/SourceCredibilityService.php';
require_once __DIR__ . '/SensationalLanguageService.php';
require_once __DIR__ . '/HeadlineAnalysisService.php';
require_once __DIR__ . '/ClaimRepetitionService.php';
require_once __DIR__ . '/CredibilityScoringService.php';
require_once __DIR__ . '/ReportGeneratorService.php';
require_once __DIR__ . '/../repositories/ArticleRepository.php';
require_once __DIR__ . '/../models/Article.php';

class NewsAnalyzerService
{
    private SourceCredibilityService $sourceService;
    private SensationalLanguageService $languageService;
    private HeadlineAnalysisService $headlineService;
    private ClaimRepetitionService $claimService;
    private CredibilityScoringService $scoringService;
    private ReportGeneratorService $reportService;
    private ArticleRepository $articles;

    public function __construct()
    {
        $this->sourceService = new SourceCredibilityService();
        $this->languageService = new SensationalLanguageService();
        $this->headlineService = new HeadlineAnalysisService();
        $this->claimService = new ClaimRepetitionService();
        $this->scoringService = new CredibilityScoringService();
        $this->reportService = new ReportGeneratorService();
        $this->articles = new ArticleRepository();
    }

    /**
     * Orchestrates the full analysis flow.
     *
     * @return array [article, report]
     */
    public function analyzeAndPersist(
        int $userId,
        string $headline,
        string $content,
        ?string $sourceDomain
    ): array {
        $sourceResult = $this->sourceService->analyze($sourceDomain);
        $languageResult = $this->languageService->analyze($content);
        $headlineResult = $this->headlineService->analyze($headline);
        $claimsResult = $this->claimService->analyze($content);

        $scoreResult = $this->scoringService->compute(
            $sourceResult['penalty'],
            $languageResult['penalty'],
            $headlineResult['penalty'],
            $claimsResult['penalty']
        );

        $reportArray = $this->reportService->generate([
            'source' => $sourceResult,
            'language' => $languageResult,
            'headline' => $headlineResult,
            'claims' => $claimsResult,
            'score' => $scoreResult,
        ]);

        $article = new Article();
        $article->user_id = $userId;
        $article->title = $headline;
        $article->content = $content;
        $article->source = $sourceDomain;
        $article->credibility_score = $scoreResult['score'];
        $article->risk_level = $scoreResult['risk_level'];

        $article = $this->articles->create($article);

        $report = [
            'article_id' => $article->article_id,
            'report' => $reportArray,
        ];

        // Persist report JSON in reports table
        $this->persistReport($article->article_id, $reportArray);

        return [$article, $reportArray];
    }

    private function persistReport(int $articleId, array $reportArray): void
    {
        $db = Database::getConnection();
        $stmt = $db->prepare(
            'INSERT INTO reports (article_id, analysis_details, created_at) VALUES (:article_id, :details, NOW())'
        );
        $stmt->execute([
            'article_id' => $articleId,
            'details' => json_encode($reportArray, JSON_PRETTY_PRINT),
        ]);
    }
}

