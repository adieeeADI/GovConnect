// Scholarships Scraper for indiascholarships.in
// This script will scrape both external (listing) and internal (detail) data for scholarships from https://www.indiascholarships.in/scholarships-in/all-india

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DATA_PATH = path.join(__dirname, 'scholarships', 'data.json');

function saveScholarshipData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

async function scrapeScholarships() {
  const baseUrl = 'https://www.indiascholarships.in/scholarships-in/all-india';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let scholarships = [];
  let pageNum = 1;
  const MAX_PAGES = 1; // Only scrape one page for testing
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
    await page.waitForSelector('a[href^="/scholarships/"]', {timeout: 15000});
    console.log(`Scraping scholarships page ${pageNum}...`);
    // Scrape external listing data
    const pageScholarships = await page.evaluate(() => {
      const data = [];
      const links = document.querySelectorAll('a[href^="/scholarships/"]');
      links.forEach(link => {
        const titleBlock = link.innerText.split('View Details')[0].trim();
        const href = link.href;
        // Try to extract summary from nearby text
        let summary = '';
        let parent = link.parentElement;
        if (parent) {
          let textNodes = Array.from(parent.childNodes).filter(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
          summary = textNodes.map(n => n.textContent.trim()).join(' ');
        }
        // Extract deadline and scholarship money from the title block
        let deadline = '';
        let money = '';
        const moneyMatch = titleBlock.match(/₹[\d,]+\s*-\s*₹[\d,]+|₹[\d,]+/);
        if (moneyMatch) money = moneyMatch[0];
        const deadlineMatch = titleBlock.match(/\d{1,2}\s\w+\s20\d{2}/);
        if (deadlineMatch) deadline = deadlineMatch[0];
        data.push({ title: titleBlock, link: href, summary, deadline, money });
      });
      return data;
    });
    if (pageScholarships.length === 0) {
      break;
    }
    // For each scholarship, visit its detail page and extract all sectioned data
    for (const scholarship of pageScholarships) {
      try {
        const detailPage = await browser.newPage();
        await detailPage.goto(scholarship.link, { waitUntil: 'networkidle2' });
        await detailPage.waitForSelector('body', {timeout: 15000});
        const sectionData = await detailPage.evaluate(() => {
          const result = {};
          // Look for headings (h1-h4, strong, divs/spans with section-like classes)
          const headingTags = ['h1','h2','h3','h4','strong'];
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
            let content = [];
            let next = heading.nextElementSibling;
            while (next && !allHeadings.includes(next)) {
              if (next.innerText && next.innerText.trim()) {
                content.push(next.innerText.trim());
              }
              next = next.nextElementSibling;
            }
            if (content.length) {
              result[title] = content.map(item => item.replace(/\n/g, ' ')); // Remove newlines from each string
            }
          }
          if (!Object.keys(result).length) {
            result['allText'] = document.body.innerText;
          }
          return result;
        });
        scholarship.sections = sectionData;
        await detailPage.close();
      } catch (err) {
        scholarship.sections = { error: 'Failed to fetch details', message: err.message };
      }
    }
    scholarships = scholarships.concat(pageScholarships);
    pageNum++;
  }
  await browser.close();
  saveScholarshipData(scholarships);
}

async function main() {
  await scrapeScholarships();
  console.log('Scholarships scraping complete.');
}

main().catch(console.error);
