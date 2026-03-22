const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.myscheme.gov.in/search';
const OUTPUT_FILE = path.join(__dirname, 'schemes', 'data.json');

const clean = (v) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');
const splitSentences = (text) => (text || '').split(/[.!?]\s+/).map(s => s.trim()).filter(s => s.length > 5);

function extractMinistry(text) {
  const m = (text || '').match(/(?:Ministry of|Department of)\s+[A-Za-z\s,&]+/i);
  return m ? clean(m[0]) : 'Government of India';
}

function parseMoney(text) {
  const t = clean(text);
  const match = t.match(/(?:Rs\.?|INR|₹)\s?([\d,]+(?:\.\d+)?\s*(?:Lakh|Crore)?)/i);
  return match ? `INR ${match[1]}` : 'Varies';
}

function parseMinimumEducation(text) {
  const t = clean(text).toLowerCase();
  if (/class\s*12|12th|10\+2/i.test(t)) return 'Class 12';
  if (/class\s*10|10th|matric/i.test(t)) return 'Class 10';
  if (/graduation|bachelor|degree/i.test(t)) return "Bachelor's Degree";
  if (/post\s*graduate|master/i.test(t)) return "Master's Degree";
  if (/diploma/i.test(t)) return 'Diploma';
  return 'Not Specified';
}

async function scrapeSchemePage(browser, url, idx) {
  const detail = await browser.newPage();
  try {
    console.log(`Analyzing: ${url}`);
    await detail.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await detail.waitForSelector('h1', { timeout: 20000 });

    const data = await detail.evaluate(() => {
      const getSec = (id) => {
        const el = document.getElementById(id);
        if (!el) return '';
        const md = el.querySelector('.markdown-options');
        return md ? md.innerText.trim() : el.innerText.trim();
      };

      const faqsList = Array.from(document.querySelectorAll('.border-t.border-shimmer-500')).map(a => ({
         question: a.querySelector('h4')?.innerText?.trim() || '',
         answer: a.querySelector('.markdown-options')?.innerText?.trim() || ''
      }));

      return {
        title: document.querySelector('h1')?.innerText || '',
        details: getSec('details'),
        benefits: getSec('benefits'),
        eligibility: getSec('eligibility'),
        process: getSec('applicationProcess') || getSec('process'),
        documents: getSec('documentsRequired') || getSec('documents'),
        faqs: faqsList,
        pageText: document.body.innerText
      };
    });

    const ministry = extractMinistry(data.pageText);
    const now = new Date().toISOString();

    return {
      _id: idx + 1,
      type: 'Scheme',
      basicInfo: {
        title: clean(data.title),
        shortDescription: clean(data.details).slice(0, 500),
        providerName: ministry,
        officialWebsite: url,
        applicationLink: url
      },
      schemeDetails: {
        benefitType: 'Financial Assistance',
        benefits: splitSentences(data.benefits).slice(0, 10),
        financialDetails: { amount: parseMoney(data.benefits), currency: 'INR' },
        mode: 'Online'
      },
      eligibility: {
        minimumEducation: parseMinimumEducation(data.eligibility + ' ' + data.details),
        gender: 'All',
        categoryEligible: ['All'],
        statesEligible: ['All India']
      },
      applicationProcess: {
        applicationMode: 'Online',
        steps: splitSentences(data.process).slice(0, 15)
      },
      faq: {
        questionsAndAnswers: data.faqs.filter(f => f.question && f.answer)
      },
      documentsRequired: splitSentences(data.documents).slice(0, 10),
      status: 'Active',
      metadata: { createdAt: now, updatedAt: now },
      additionalInfo: { ministry, sourceUrl: url }
    };
  } catch (err) {
    console.error(`Error scraping ${url}:`, err.message);
    return null;
  } finally {
    await detail.close();
  }
}

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 6000));

    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href*="/schemes/"]'))
        .map(a => a.href)
        .filter(href => !href.includes('/search'))
        .slice(0, 5);
    });

    const results = [];
    for (let i = 0; i < links.length; i++) {
        const res = await scrapeSchemePage(browser, links[i], i);
        if (res) {
          results.push(res);
          console.log(`✓ [${i+1}/5] ${res.basicInfo.title}`);
        }
    }

    if (!fs.existsSync(path.join(__dirname, 'schemes'))) {
        fs.mkdirSync(path.join(__dirname, 'schemes'));
    }
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`\n✓ Scraped ${results.length} schemes successfully!`);
  } finally {
    await browser.close();
  }
}

run();
