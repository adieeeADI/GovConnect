// Schemes Scraper for Government Websites
// This script will be the entry point for scraping data for internships, schemes, training & certification, and scholarships.
// Each category will have its own scraping logic and will store results in the corresponding JSON file.

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DATA_PATHS = {
  internships: path.join(__dirname, 'internships', 'data.json'),
  schemes: path.join(__dirname, 'schemes', 'data.json'),
  training_certification: path.join(__dirname, 'training_certification', 'data.json'),
  scholarships: path.join(__dirname, 'scholarships', 'data.json'),
};

// Utility to save data to JSON file
function saveData(category, data) {
  fs.writeFileSync(DATA_PATHS[category], JSON.stringify(data, null, 2));
}


// Scrape schemes from myscheme.gov.in
async function scrapeSchemesScraper() {
  const baseUrl = 'https://www.myscheme.gov.in/search/category/Education%20%26%20Learning';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let schemes = [];
  let pageNum = 1;
  let totalPages = null;
  const MAX_PAGES = 2;
  while (true) {
    if (pageNum > MAX_PAGES) {
      console.log(`Reached max page limit (${MAX_PAGES}). Stopping.`);
      break;
    }
    let url = baseUrl;
    if (pageNum > 1) {
      url = `${baseUrl}?page=${pageNum}`;
    }
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h2 a[href^="/schemes/"]', {timeout: 15000});
    console.log(`Scraping page ${pageNum}...`);
    // Scrape current page (basic info)
    const pageSchemes = await page.evaluate(() => {
      const data = [];
      const schemeNodes = document.querySelectorAll('h2 a[href^="/schemes/"]');
      schemeNodes.forEach(a => {
        const title = a.textContent.trim();
        const link = 'https://www.myscheme.gov.in' + a.getAttribute('href');
        let ministry = '';
        let description = '';
        const h2 = a.closest('h2');
        if (h2 && h2.nextElementSibling) {
          ministry = h2.nextElementSibling.textContent.trim();
          if (h2.nextElementSibling.nextElementSibling) {
            description = h2.nextElementSibling.nextElementSibling.textContent.trim();
          }
        }
        data.push({ title, link, ministry, description });
      });
      return data;
    });
    if (pageSchemes.length === 0) {
      break;
    }
    // For each scheme, visit its detail page and extract more info
    for (const scheme of pageSchemes) {
      try {
        const detailPage = await browser.newPage();
        await detailPage.goto(scheme.link, { waitUntil: 'networkidle2' });
        await detailPage.waitForSelector('body', {timeout: 15000});
        const redirectedUrl = detailPage.url();
        // Extract all visible section headings and their content
        const sectionData = await detailPage.evaluate(() => {
          const result = {};
          // Look for headings (h1-h4, strong, divs/spans with section-like classes)
          const headingTags = ['h1','h2','h3','h4','strong'];
          // Add divs/spans with likely section header classes
          const extraSelectors = [
            'div[class*="section" i]',
            'div[class*="title" i]',
            'span[class*="section" i]',
            'span[class*="title" i]',
            'div[role="heading"]',
            'span[role="heading"]'
          ];
          const allHeadings = Array.from(document.querySelectorAll(headingTags.join(',') + ',' + extraSelectors.join(',')));
          for (let i = 0; i < allHeadings.length; i++) {
            const heading = allHeadings[i];
            const title = heading.innerText.trim();
            if (!title || title.length < 3) continue;
            // Collect all sibling text until the next heading
            let content = [];
            let next = heading.nextElementSibling;
            while (next && !allHeadings.includes(next)) {
              if (next.innerText && next.innerText.trim()) {
                content.push(next.innerText.trim());
              }
              next = next.nextElementSibling;
            }
            if (content.length) {
              result[title] = content.join('\n');
            }
          }
          // Fallback: all visible text if no headings found
          if (!Object.keys(result).length) {
            result['allText'] = document.body.innerText;
          }
          return result;
        });
        scheme.eligibilityCheckerSections = { url: redirectedUrl, sections: sectionData };
        await detailPage.close();
      } catch (err) {
        scheme.eligibilityCheckerSections = { error: 'Failed to fetch redirected details', message: err.message };
      }
    }
    schemes = schemes.concat(pageSchemes);
    pageNum++;
  }
  await browser.close();
  saveData('schemes', schemes);
}


async function main() {
  // await scrapeInternships();
  await scrapeSchemesScraper();
  // await scrapeTrainingCertification();
  // await scrapeScholarships();
  console.log('Schemes scraping complete.');
}

main().catch(console.error);
