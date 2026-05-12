/**
 * Site-specific scrapers. Each function gets the live Document and returns a
 * best-effort plain-text representation of the job posting. The AI extractor
 * does the final structured pass, so these only need to bound the text to the
 * relevant region rather than parse it perfectly.
 *
 * Fall back to document.body.innerText when no site-specific path matches.
 */

export type ScrapedPage = {
  url: string;
  title: string;
  pageText: string;
};

const MAX_TEXT = 18_000;

function clean(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim()
    .slice(0, MAX_TEXT);
}

function tryQuery(doc: Document, selectors: string[]): string | null {
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    if (el && (el as HTMLElement).innerText && (el as HTMLElement).innerText.trim().length > 50) {
      return (el as HTMLElement).innerText;
    }
  }
  return null;
}

function scrapeLinkedIn(doc: Document): string | null {
  return tryQuery(doc, [
    'div.jobs-search__job-details--container',
    'main.jobs-details',
    'section.jobs-description',
    'div.job-view-layout',
    'article',
  ]);
}

function scrapeIndeed(doc: Document): string | null {
  return tryQuery(doc, [
    'div.jobsearch-JobComponent',
    'div#jobDescriptionText',
    'div.jobsearch-jobDescriptionText',
  ]);
}

function scrapeGreenhouse(doc: Document): string | null {
  return tryQuery(doc, ['div#content', 'div.app-body', 'div#main', 'div.job']);
}

function scrapeLever(doc: Document): string | null {
  return tryQuery(doc, ['div.posting', 'div.content']);
}

function scrapeWorkday(doc: Document): string | null {
  return tryQuery(doc, [
    "[data-automation-id='jobPostingDescription']",
    'div[role=main]',
    'main',
  ]);
}

function scrapeGlassdoor(doc: Document): string | null {
  return tryQuery(doc, [
    'div.JobDetails_jobDescription__uW_fK',
    "div[class*='JobDetails_jobDescription']",
    'div.jobDescriptionContent',
  ]);
}

export function scrapePage(): ScrapedPage {
  const url = window.location.href;
  const host = window.location.hostname.toLowerCase();
  const title = document.title;

  let raw: string | null = null;
  if (host.includes('linkedin.com')) raw = scrapeLinkedIn(document);
  else if (host.includes('indeed.com')) raw = scrapeIndeed(document);
  else if (host.includes('greenhouse.io')) raw = scrapeGreenhouse(document);
  else if (host.includes('lever.co')) raw = scrapeLever(document);
  else if (host.includes('workday.com') || host.includes('myworkdayjobs.com'))
    raw = scrapeWorkday(document);
  else if (host.includes('glassdoor.com')) raw = scrapeGlassdoor(document);

  if (!raw) {
    raw = document.body?.innerText ?? document.body?.textContent ?? '';
  }

  return {
    url,
    title,
    pageText: clean(raw),
  };
}
