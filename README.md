**ENCAP - Explainable News Credibility Analysis Platform**

**OVERVIEW**
ENCAP is a web-based system designed to detect and analyze potentially fake or misleading news articles using a rule-based, data-guided approach.
Unlike traditional systems that rely on AI or machine learning, ENCAP focuses on transparency, lightweight performance, and explainable results.

**OBJECTIVES**
1.  Detect fake or misleading news articles
2.  Provide clear reasoning behind results
3.  Offer a lightweight alternative to AI-based systems
4.  Enable quick and easy news analysis
5.  Maintain transparency in detection

**FEATURES**
**Source Credibility**
Verifies news sources using trusted and suspicious domain lists
**Linguistic Analysis**
Detects clickbait words and suspicious phrases derived from datasets
**Claim Verification**
Checks consistency between headline and article content
**Sentiment Scoring**
Identifies excessive punctuation, capitalization, and emotional tone
**Headline Integrity**
Detects misleading or exaggerated headlines
**Source Pattern Analysis**
Flags suspicious domain structures and unknown sources

**DETECTION METHODOLOGY**
ENCAP uses a rule-based scoring system.
Detection factors include:
**Clickbait keywords
Excessive punctuation (!!!, ???)
ALL CAPS headlines
Suspicious words and phrases
Untrusted sources
Domain patterns
Headline-content mismatch**

**SCORING SYSTEM**
  0 – 2 → Likely Real
  3 – 5 → Suspicious
  6+ → Likely Fake

**EXAMPLE OUTPUT**
  Fake Score: 7
  Status: Likely Fake

**Reasons**:
  Clickbait word detected: "shocking"
  Excessive punctuation
  Source not trusted
  Headline mismatch detected

**SYSTEM ARCHITECTURE**
  User
  ↓
  Frontend (HTML, CSS, JavaScript)
  ↓
  API Request
  ↓
  Java Backend (Spring Boot)
  ↓
  Rule-Based Detection Engine
  ↓
  Pattern Files (keywords, sources)
  ↓
  Score Calculation
  ↓
  Result Display

**TECH STACK**
**Frontend:**
HTML
CSS
JavaScript

**Backend:**
Java (Spring Boot)

**Data Handling:**
CSV / Text files

**PROJECT STRUCTURE**
ENCAPproject/
│
├── backend/
│   ├── config/
│   │   └── database.php              # PDO database connection (singleton)
│   │
│   ├── controllers/
│   │   ├── AuthController.php        # Register & login logic
│   │   ├── NewsController.php        # Article analysis entry point
│   │   ├── ReportController.php      # Report fetch & history
│   │   └── AdminController.php       # Keyword management
│   │
│   ├── models/
│   │   ├── User.php
│   │   ├── Article.php
│   │   ├── Claim.php
│   │   └── Report.php
│   │
│   ├── repositories/
│   │   ├── UserRepository.php        # User DB operations
│   │   ├── ArticleRepository.php     # Article DB operations
│   │   ├── ClaimRepository.php       # Claim DB operations
│   │   ├── KeywordRepository.php     # Keyword DB operations
│   │   └── SourceRepository.php      # Source DB operations
│   │
│   ├── services/
│   │   ├── NewsAnalyzerService.php       # Orchestrates all modules
│   │   ├── SourceCredibilityService.php  # Module 1
│   │   ├── SensationalLanguageService.php# Module 2
│   │   ├── HeadlineAnalysisService.php   # Module 3
│   │   ├── ClaimRepetitionService.php    # Module 4
│   │   ├── CredibilityScoringService.php # Score computation
│   │   └── ReportGeneratorService.php    # Report assembly
│   │
│   ├── utils/
│   │   ├── PDFTextExtractor.php      # Java-based PDF extraction
│   │   └── TextProcessor.php         # Tokenization & claim extraction
│   │
│   ├── routes/
│   │   └── api.php                   # All API route definitions
│   │
│   ├── uploads/
│   │   └── pdf_files/                # Uploaded PDFs stored here
│   │
│   ├── pdf-extractor.jar             # Custom Java PDF extractor
│   ├── pdfbox-app-3.0.7.jar          # Apache PDFBox library
│   └── index.php                     # Backend entry point (session_start)
│
├── index.html                        # Landing page
├── index2.html                       # Scrollytelling landing page
├── analyze.html                      # Article submission form
├── result.html                       # Credibility report display
├── history.html                      # User analysis history
├── dashboard.html                    # User dashboard
├── login.html                        # Login page
├── register.html                     # Registration page
├── style.css                         # Shared styles (index, login, register)
├── style3.css                        # Shared styles (analyze, history, result)
├── script.js                         # Auth forms JS (login/register pages)
├── script2.js                        # Main app JS (analyze, result, history)
└── encap.js                          # Scrollytelling canvas engine


**WORKFLOW**
  User inputs headline, content, and source URL
  Frontend sends request to backend
  Backend analyzes using rules
  Score is calculated
  Result and explanation returned
  Displayed to user

**DATASET USAGE**
  Datasets are used to extract:
  Suspicious keywords
  Source credibility patterns
  This makes the system rule-based but data-guided.

**ADVANTAGES**
  Lightweight and fast
  No training required
  Transparent results
  Easy to deploy

**LIMITATIONS**
  Cannot understand deep context
  Requires manual updates
  Less accurate than AI models

**FUTURE IMPROVEMENTS**
  Machine learning integration
  Real-time news scraping
  Browser extension
  Advanced verification
  User history system

**Developers:**
  Areej Rashid
  Haseeb Rahat
**CONCLUSION**
ENCAP proves that fake news detection can be achieved without AI by using structured rules and real-world data patterns.
