ENCAP – Explainable News Credibility Analysis Platform
📌 Overview

ENCAP (Explainable News Credibility Analysis Platform) is a web-based system designed to detect and analyze potentially fake or misleading news articles using a rule-based, data-guided approach.

Unlike traditional systems that rely on machine learning or AI, ENCAP focuses on:

Transparency
Lightweight performance
Explainable results

The system evaluates news credibility based on predefined rules derived from real-world fake news datasets.

🎯 Objectives
Detect fake or misleading news articles
Provide clear reasoning behind results
Offer a lightweight alternative to AI-based systems
Enable users to analyze news quickly and easily
Maintain user-friendly and transparent analysis
⚙️ Features
🔍 Source Credibility
Verifies news sources against trusted and suspicious domain lists
🧠 Linguistic Analysis
Detects clickbait words and suspicious phrases derived from datasets
📋 Claim Verification
Checks consistency between headline and article content
📊 Sentiment Scoring
Identifies excessive punctuation, capitalization, and emotional tone
🔗 Headline Integrity
Detects misleading or exaggerated headlines
🌐 Source Pattern Analysis
Flags suspicious domain structures and unknown sources
🧠 Detection Methodology

ENCAP uses a rule-based scoring system instead of AI.

Detection Factors:
Clickbait keywords
Excessive punctuation (!!!, ???)
ALL CAPS headlines
Suspicious words/phrases
Untrusted sources
Domain patterns
Headline-content mismatch
📊 Scoring System
Score Range	Classification
0 – 2	Likely Real
3 – 5	Suspicious
6+	Likely Fake
📌 Example Output
Fake Score: 7
Status: Likely Fake

Reasons:
- Clickbait word detected: "shocking"
- Excessive punctuation
- Source not trusted
- Headline mismatch detected
🏗️ System Architecture
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
🧩 Tech Stack
Frontend
HTML
CSS
JavaScript
Backend
Java (Spring Boot)
Data Handling
CSV / Text files (for dataset-derived rules)
📂 Project Structure
ENCAP
│
├── frontend
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend
│   ├── controller
│   ├── service
│   ├── model
│   └── main application
│
├── data
│   ├── suspicious_words.txt
│   ├── trusted_sources.txt
│   └── suspicious_sources.txt
🔄 Workflow
User enters:
Headline
Article content
Source URL
Frontend sends data to backend
Backend processes:
Keyword detection
Source verification
Pattern analysis
Score is calculated
Result + explanation is returned
Displayed to user
📊 Dataset Usage

Public fake news datasets are used to:

Extract common fake news keywords
Identify suspicious sources
Improve rule accuracy

This makes the system:

Rule-Based + Data-Guided

✅ Advantages
Lightweight and fast
No training required
Transparent decision-making
Easy to deploy
Explainable results
⚠️ Limitations
Cannot understand deep context
Requires manual rule updates
Less accurate than AI models in complex cases
🚀 Future Improvements
Integration with machine learning models
Real-time news scraping
Browser extension support
Advanced domain verification
User history tracking

📌 Conclusion

ENCAP demonstrates that effective fake news detection can be achieved without AI, using structured rules and real-world data patterns while maintaining transparency and efficiency.
