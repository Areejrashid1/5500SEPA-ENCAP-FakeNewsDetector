-- ENCAP backend schema
-- MySQL DDL for users, articles, keywords, sources, claims, reports

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE DATABASE IF NOT EXISTS encap_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE encap_db;

-- Users

CREATE TABLE IF NOT EXISTS users (
  user_id     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  email       VARCHAR(190) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Articles

CREATE TABLE IF NOT EXISTS articles (
  article_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           INT UNSIGNED NOT NULL,
  title             VARCHAR(255) NOT NULL,
  content           LONGTEXT NOT NULL,
  source            VARCHAR(255) NULL,
  credibility_score DECIMAL(5,2) NOT NULL,
  risk_level        VARCHAR(32) NOT NULL,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_articles_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  INDEX idx_articles_user_created (user_id, created_at),
  INDEX idx_articles_risk (risk_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Keywords for sensational language detection

CREATE TABLE IF NOT EXISTS keywords (
  keyword_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  word       VARCHAR(120) NOT NULL UNIQUE,
  category   VARCHAR(64) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- News sources and their credibility levels

CREATE TABLE IF NOT EXISTS sources (
  source_id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  domain            VARCHAR(255) NOT NULL UNIQUE,
  credibility_level VARCHAR(32) NOT NULL
  -- expected values: 'trusted', 'unknown', 'flagged', etc.
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Claims and repetition tracking

CREATE TABLE IF NOT EXISTS claims (
  claim_id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  claim_text    TEXT NOT NULL,
  times_flagged INT UNSIGNED NOT NULL DEFAULT 0,
  UNIQUE KEY uq_claim_text (claim_text(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Analysis reports (JSON payload per article)

CREATE TABLE IF NOT EXISTS reports (
  report_id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  article_id       INT UNSIGNED NOT NULL,
  analysis_details LONGTEXT NOT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_article
    FOREIGN KEY (article_id) REFERENCES articles(article_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  INDEX idx_reports_article (article_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed some default sensational keywords (optional)

-- ═══════════════════════════════════════════════════════════════
--  ENCAP — Extended Keywords & Sources Seed
--  Research-backed additions only — no duplicates from existing data
-- ═══════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────
--  SENSATIONAL / FAKE-NEWS INDICATOR KEYWORDS
--  Sources: PolitiFact, FactCheck, Chaffey College Fake News
--  Guide, Bridgewater State Fake News Research Guide,
--  Stanford fake-news-trends academic paper
-- ─────────────────────────────────────────────────────────────

INSERT INTO keywords (word, category) VALUES

  -- Urgency & fear-based framing
  ('breaking', 'sensational'),
  ('urgent', 'sensational'),
  ('alert', 'sensational'),
  ('warning', 'sensational'),
  ('danger', 'sensational'),
  ('crisis', 'sensational'),
  ('emergency', 'sensational'),
  ('disaster', 'sensational'),

  -- Exaggeration & hyperbole
  ('explosive', 'sensational'),
  ('bombshell', 'sensational'),
  ('massive', 'sensational'),
  ('enormous', 'sensational'),
  ('insane', 'sensational'),
  ('jaw-dropping', 'sensational'),
  ('mind-blowing', 'sensational'),
  ('stunning', 'sensational'),
  ('terrifying', 'sensational'),
  ('outrageous', 'sensational'),
  ('unprecedented', 'sensational'),
  ('sensational', 'sensational'),

  -- Conspiracy & cover-up language
  ('cover-up', 'sensational'),
  ('conspiracy', 'sensational'),
  ('exposed', 'sensational'),
  ('cover up', 'sensational'),
  ('they don''t want you to know', 'sensational'),
  ('what they''re hiding', 'sensational'),
  ('the truth about', 'sensational'),
  ('banned', 'sensational'),
  ('censored', 'sensational'),
  ('deep state', 'sensational'),
  ('elites', 'sensational'),
  ('new world order', 'sensational'),
  ('globalist', 'sensational'),

  -- Medical misinformation patterns
  ('cure', 'sensational'),
  ('cure-all', 'sensational'),
  ('doctors hate', 'sensational'),
  ('big pharma', 'sensational'),
  ('natural remedy', 'sensational'),
  ('detox', 'sensational'),
  ('toxins', 'sensational'),
  ('suppress', 'sensational'),
  ('cancer cure', 'sensational'),

  -- Clickbait & engagement bait
  ('you need to see this', 'sensational'),
  ('share before deleted', 'sensational'),
  ('going viral', 'sensational'),
  ('everyone is talking about', 'sensational'),
  ('what happened next', 'sensational'),
  ('this changes everything', 'sensational'),
  ('the real truth', 'sensational'),
  ('wake up', 'sensational'),
  ('sheeple', 'sensational'),
  ('mainstream media won''t show', 'sensational'),

  -- Political manipulation language
  ('rigged', 'sensational'),
  ('stolen', 'sensational'),
  ('coup', 'sensational'),
  ('traitor', 'sensational'),
  ('puppet', 'sensational'),
  ('radical', 'sensational'),
  ('destroy', 'sensational'),
  ('invasion', 'sensational'),
  ('regime', 'sensational'),
  ('takeover', 'sensational')

ON DUPLICATE KEY UPDATE category = VALUES(category);


-- ─────────────────────────────────────────────────────────────
--  TRUSTED SOURCES — International
--  Sources: Reuters Institute Digital News Report 2024,
--  newsdata.io Top International News Sources 2026,
--  YouGov/Reuters Trust Survey 2024,
--  FreePress Eagle Top 13 Reliable Sources
-- ─────────────────────────────────────────────────────────────

INSERT INTO sources (domain, credibility_level) VALUES

  -- Global wire services (highest tier)
  ('reuters.com',              'trusted'),
  ('apnews.com',               'trusted'),
  ('afp.com',                  'trusted'),

  -- UK
  ('bbc.com',                  'trusted'),
  ('bbc.co.uk',                'trusted'),
  ('theguardian.com',          'trusted'),
  ('telegraph.co.uk',          'trusted'),
  ('thetimes.co.uk',           'trusted'),
  ('ft.com',                   'trusted'),
  ('economist.com',            'trusted'),
  ('independent.co.uk',        'trusted'),

  -- USA
  ('nytimes.com',              'trusted'),
  ('washingtonpost.com',       'trusted'),
  ('wsj.com',                  'trusted'),
  ('npr.org',                  'trusted'),
  ('pbs.org',                  'trusted'),
  ('apnews.com',               'trusted'),
  ('bloomberg.com',            'trusted'),
  ('theatlantic.com',          'trusted'),
  ('politico.com',             'trusted'),
  ('propublica.org',           'trusted'),

  -- Europe
  ('dw.com',                   'trusted'),   -- Germany: Deutsche Welle
  ('spiegel.de',               'trusted'),   -- Germany: Der Spiegel
  ('lemonde.fr',               'trusted'),   -- France: Le Monde
  ('lefigaro.fr',              'trusted'),   -- France: Le Figaro
  ('liberation.fr',            'trusted'),   -- France
  ('elpais.com',               'trusted'),   -- Spain: El Pais
  ('corriere.it',              'trusted'),   -- Italy: Corriere della Sera
  ('repubblica.it',            'trusted'),   -- Italy: La Repubblica
  ('nrc.nl',                   'trusted'),   -- Netherlands: NRC
  ('svd.se',                   'trusted'),   -- Sweden: Svenska Dagbladet
  ('dn.se',                    'trusted'),   -- Sweden: Dagens Nyheter
  ('aftenposten.no',           'trusted'),   -- Norway
  ('yle.fi',                   'trusted'),   -- Finland: YLE
  ('rte.ie',                   'trusted'),   -- Ireland: RTE News

  -- Middle East & Africa
  ('aljazeera.com',            'trusted'),
  ('middleeasteye.net',        'mixed'),
  ('dailymaverick.co.za',      'trusted'),   -- South Africa
  ('nation.africa',            'trusted'),   -- Kenya/East Africa
  ('premiumtimesng.com',       'trusted'),   -- Nigeria

  -- Asia & Pacific
  ('straitstimes.com',         'trusted'),   -- Singapore
  ('scmp.com',                 'trusted'),   -- South China Morning Post (HK)
  ('thehindu.com',             'trusted'),   -- India
  ('ndtv.com',                 'trusted'),   -- India
  ('dawn.com',                 'trusted'),   -- Pakistan
  ('geo.tv',                   'trusted'),   -- Pakistan: Geo News
  ('thedawn.com',              'trusted'),
  ('smh.com.au',               'trusted'),   -- Australia: Sydney Morning Herald
  ('abc.net.au',               'trusted'),   -- Australia: ABC News
  ('japantimes.co.jp',         'trusted'),   -- Japan
  ('koreaherald.com',          'trusted'),   -- South Korea

  -- Latin America
  ('folha.uol.com.br',         'trusted'),   -- Brazil: Folha de S. Paulo
  ('estadao.com.br',           'trusted'),   -- Brazil: O Estado de S. Paulo
  ('clarin.com',               'trusted'),   -- Argentina
  ('elpais.com.uy',            'trusted'),   -- Uruguay
  ('eluniversal.com.mx',       'trusted'),   -- Mexico

  -- Canada
  ('cbc.ca',                   'trusted'),
  ('theglobeandmail.com',      'trusted'),
  ('nationalpost.com',         'trusted'),

  -- Fact-checking organisations (special trusted tier)
  ('snopes.com',               'trusted'),
  ('factcheck.org',            'trusted'),
  ('politifact.com',           'trusted'),
  ('fullfact.org',             'trusted'),
  ('africacheck.org',          'trusted'),
  ('boomlive.in',              'trusted'),   -- India fact-checker


-- ─────────────────────────────────────────────────────────────
--  FLAGGED / MIXED SOURCES
--  Sources: Wikipedia List of Fake News Websites,
--  PolitiFact Fake News Guide, Stanford fake-news-trends paper,
--  NewsGuard AI Content Farm list
-- ─────────────────────────────────────────────────────────────

  -- Known misinformation / low-credibility domains
  ('infowars.com',             'flagged'),
  ('naturalnews.com',          'flagged'),
  ('beforeitsnews.com',        'flagged'),
  ('worldnewsdailyreport.com', 'flagged'),
  ('empirenews.net',           'flagged'),
  ('thedcgazette.com',         'flagged'),
  ('abcnews.com.co',           'flagged'),   -- CNN impersonator
  ('newslo.com',               'flagged'),
  ('disclose.tv',              'flagged'),
  ('yournewswire.com',         'flagged'),
  ('newspunch.com',            'flagged'),
  ('veteranstoday.com',        'flagged'),
  ('activistpost.com',         'flagged'),
  ('globalresearch.ca',        'flagged'),
  ('zerohedge.com',            'mixed'),
  ('breitbart.com',            'mixed'),
  ('rt.com',                   'mixed'),     -- Russian state media
  ('sputniknews.com',          'flagged'),   -- Russian state propaganda
  ('presstv.ir',               'flagged'),   -- Iranian state media
  ('theonion.com',             'satire'),
  ('babylonbee.com',           'satire'),
  ('waterfordwhispersnews.com','satire')

ON DUPLICATE KEY UPDATE credibility_level = VALUES(credibility_level);