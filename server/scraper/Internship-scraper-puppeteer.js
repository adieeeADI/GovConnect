// Internship-scraper-puppeteer.js
// Scraper for https://internship.aicte-india.org/recentlyposted.php using Puppeteer

const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = 'https://internship.aicte-india.org/recentlyposted.php';
const OUTPUT_FILE = './internships/data.json';

async function scrapeInternships() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    let internships = [];
    let pageNum = 1;
    // Scrape up to 10 pages
    const MAX_PAGES = 10;
    while (pageNum <= MAX_PAGES) {
        console.log(`Scraping page ${pageNum}...`);
        await page.waitForSelector('a');
        // Get all internship detail links on the current page
        const links = await page.$$eval('a', anchors =>
            anchors.filter(a => a.textContent.trim() === 'View Details')
                   .map(a => a.href)
        );
        // Scrape all visible card fields from the main page
        const cardData = await page.$$eval('h3', (titles) => {
            // Each h3 is a title, walk up DOM to get card info
            return titles.map((h3, idx) => {
                const card = h3.closest('div');
                const title = h3.textContent.trim();
                const company = card.querySelector('h5') ? card.querySelector('h5').textContent.trim() : '';
                const text = card.innerText;
                const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
                if (idx === 0) {
                    // Debug: log all lines from the first card
                    console.log('DEBUG_CARD_LINES', lines);
                }
                // ...existing extraction logic...
                const type = lines[2] || '';
                const postedDate = lines[3] || '';
                const location = lines[4] || '';
                const duration = lines[5] || '';
                function extractNextLinePartial(label) {
                    const idx = lines.findIndex(l => l.toLowerCase().includes(label));
                    if (idx !== -1) {
                        for (let i = idx + 1; i < lines.length; i++) {
                            if (lines[i]) return lines[i];
                        }
                    }
                    return '';
                }
                const startTime = extractNextLinePartial('start date');
                const stipend = extractNextLinePartial('stipend');
                const openings = extractNextLinePartial('number of openings');
                const applyBy = extractNextLinePartial('apply by');
                return { title, company, type, postedDate, location, duration, startTime, stipend, openings, applyBy };
            });
        });
        // Now, for each link, get internal data
        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            const detailPage = await browser.newPage();
            await detailPage.goto(link, { waitUntil: 'networkidle2' });
            const internal = await detailPage.evaluate(() => {
                function getSectionText(header) {
                    const h4s = Array.from(document.querySelectorAll('h4'));
                    const h4 = h4s.find(h => h.textContent.trim().toLowerCase().includes(header.toLowerCase()));
                    if (h4 && h4.nextElementSibling) return h4.nextElementSibling.textContent.trim();
                    return '';
                }
                // Extract info from detail page labels
                function extractByLabel(label) {
                    const els = Array.from(document.querySelectorAll('*'));
                    for (let i = 0; i < els.length; i++) {
                        if (els[i].textContent && els[i].textContent.trim().toLowerCase() === label) {
                            // Find next non-empty sibling text
                            let sib = els[i].nextElementSibling;
                            while (sib) {
                                const txt = sib.textContent.trim();
                                if (txt) return txt;
                                sib = sib.nextElementSibling;
                            }
                        }
                    }
                    return '';
                }
                return {
                    about: getSectionText('About the program'),
                    perks: getSectionText('Perks'),
                    whoCanApply: getSectionText('Who can apply?'),
                    terms: getSectionText('Terms of Engagement'),
                    startTime: extractByLabel('start date'),
                    stipend: extractByLabel('stipend'),
                    openings: extractByLabel('number of openings'),
                    applyBy: extractByLabel('apply by'),
                };
            });
            // Clean up newlines in about, perks, whoCanApply
            const clean = obj => obj && typeof obj === 'string' ? obj.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim() : obj;
            internships.push({
                ...cardData[i],
                url: link,
                about: clean(internal.about),
                perks: clean(internal.perks),
                whoCanApply: clean(internal.whoCanApply),
                terms: clean(internal.terms),
                startTime: internal.startTime,
                stipend: internal.stipend,
                openings: internal.openings,
                applyBy: internal.applyBy
            });
            await detailPage.close();
        }
        // Do not paginate, only process the first page
        // Check for next page using anchor text
        const hasNextBtn = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a'));
            return anchors.some(a => a.textContent.trim() === 'Next »');
        });
        if (hasNextBtn && pageNum < MAX_PAGES) {
            await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll('a'));
                const next = anchors.find(a => a.textContent.trim() === 'Next »');
                if (next) next.click();
            });
            await new Promise(res => setTimeout(res, 2000));
            pageNum++;
        } else {
            break;
        }
    }
    await browser.close();
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(internships, null, 2));
    console.log(`Scraped ${internships.length} internships.`);
}

scrapeInternships();
