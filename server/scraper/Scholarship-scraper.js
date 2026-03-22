// Scholarship scraper for indiascholarships.in
// Outputs normalized scholarship schema to server/scraper/scholarships/data.json

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const BASE_URL = 'https://www.indiascholarships.in/scholarships-in/all-india';
const OUTPUT_FILE = path.join(__dirname, 'scholarships', 'data.json');
const STATIC_START_DATE = '2026-01-01';
const TARGET_COUNT = 30;

function clean(text) {
  return typeof text === 'string' ? text.replace(/\s+/g, ' ').trim() : '';
}

function parseDateToISO(dateText) {
  if (!dateText) return '';
  const cleanDate = clean(dateText);
  const m = cleanDate.match(/(\d{1,2})\s+([A-Za-z]+)\s+(20\d{2})/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const mon = m[2].slice(0, 3).toLowerCase();
    const year = m[3];
    const monthMap = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    if (monthMap[mon]) return `${year}-${monthMap[mon]}-${day}`;
  }
  const d = new Date(cleanDate);
  if (Number.isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function extractMoneyNumber(text) {
  if (!text) return null;
  const lakhMatch = text.match(/₹\s*([\d.]+)\s*lakh/i);
  if (lakhMatch) {
    return Math.round(Number(lakhMatch[1]) * 100000);
  }
  const rupeeMatch = text.match(/₹\s*([\d,]+)/);
  if (rupeeMatch) {
    return Number(rupeeMatch[1].replace(/,/g, ''));
  }
  return null;
}

function parseIncomeLimit(text) {
  if (!text) return null;
  const lakhMatch = text.match(/(?:up to|below|less than|<)\s*₹?\s*([\d.]+)\s*lakh/i);
  if (lakhMatch) {
    return Math.round(Number(lakhMatch[1]) * 100000);
  }
  const rupeeMatch = text.match(/(?:up to|below|less than|<)\s*₹?\s*([\d,]+)/i);
  if (rupeeMatch) {
    return Number(rupeeMatch[1].replace(/,/g, ''));
  }
  return null;
}

function parsePercent(text) {
  if (!text) return null;
  const m = text.match(/(\d{1,3})\s*%/);
  return m ? Number(m[1]) : null;
}

function splitListFromText(text) {
  if (!text) return [];
  return text
    .split(/[,;]|\s{2,}|\s•\s/)
    .map(v => clean(v))
    .filter(Boolean);
}

function splitCovers(text) {
  if (!text) return [];
  return text
    .split(/\s{2,}|\.|\s•\s/)
    .map(v => clean(v))
    .filter(v => v.length > 3);
}

function detectProviderType(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('state government')) return 'State Government';
  if (t.includes('central government') || t.includes('ministry')) return 'Central Government';
  if (t.includes('government of')) return 'Government';
  if (t.includes('public sector')) return 'Public Sector';
  if (t.includes('private') || t.includes('foundation') || t.includes('university')) return 'Private';
  return '';
}

function normalizeApplicationMode(mode) {
  const m = clean(mode).toLowerCase();
  if (m === 'form-only' || m === 'form only') return 'Form-only';
  if (m === 'online') return 'Online';
  if (m === 'offline') return 'Offline';
  if (m === 'exam') return 'Exam';
  return clean(mode);
}

function normalizeTitle(titleBlock) {
  const lines = (titleBlock || '')
    .split('\n')
    .map(v => clean(v))
    .filter(Boolean)
    .filter(v => !['Verified', 'New'].includes(v));
  return lines[0] || clean(titleBlock);
}

function parseQuickEligibility(titleBlock) {
  const flat = clean(titleBlock);
  const quickMatch = flat.match(/Quick Eligibility:\s*(.*)$/i);
  if (!quickMatch) {
    return { categories: [], states: [] };
  }
  const parts = quickMatch[1].split('•').map(v => clean(v)).filter(Boolean);
  let categories = [];
  let states = [];
  if (parts.length >= 1 && !parts[0].toLowerCase().includes('income')) {
    categories = splitListFromText(parts[0]);
  }
  if (parts.length >= 2) {
    states = splitListFromText(parts[parts.length - 1]);
  }
  return { categories, states };
}

function getSectionText(sections, keys) {
  for (const key of Object.keys(sections || {})) {
    const low = key.toLowerCase();
    if (keys.some(k => low.includes(k))) {
      const val = sections[key];
      if (Array.isArray(val)) return clean(val.join(' '));
      return clean(String(val));
    }
  }
  return '';
}

function parseFaqItems(sections, fallbackFaqText) {
  const items = [];

  for (const key of Object.keys(sections || {})) {
    if (!/^q\.?/i.test(key)) continue;
    const q = clean(key.replace(/^q\.?\s*/i, ''));
    const val = sections[key];
    const a = Array.isArray(val) ? clean(val.join(' ')) : clean(String(val));
    if (q && a) {
      items.push({ question: q, answer: a });
    }
  }

  if (!items.length && fallbackFaqText) {
    const text = String(fallbackFaqText);
    const regex = /Q\.\s*(.+?\?)\s*([^]*?)(?=Q\.|$)/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const question = clean(match[1]);
      const answer = clean(match[2]);
      if (question && answer) {
        items.push({ question, answer });
      }
    }
  }

  return items;
}

function buildScholarshipSchema(raw, idx) {
  const now = new Date().toISOString();
  const quick = parseQuickEligibility(raw.titleBlock);

  const aboutText = getSectionText(raw.sections, ['about the program']);
  const benefitsText = getSectionText(raw.sections, ['benefits & financial support']);
  const inclusionsText = getSectionText(raw.sections, ['inclusions']);
  const eligibilityText = getSectionText(raw.sections, ['eligibility criteria']);
  const educationalText = getSectionText(raw.sections, ['educational qualification']);
  const financialText = getSectionText(raw.sections, ['financial & category']);
  const docsText = getSectionText(raw.sections, ['documents required']);
  const importantDatesText = getSectionText(raw.sections, ['important dates']);
  const quickFactsText = getSectionText(raw.sections, ['scholarship quick facts']);
  const selectionProcess = getSectionText(raw.sections, ['selection process']);
  const renewalPolicy = getSectionText(raw.sections, ['renewal policy']);
  const faqText = getSectionText(raw.sections, ['common questions']);

  const incomeLimit = parseIncomeLimit(`${financialText} ${eligibilityText} ${raw.titleBlock}`);
  const minPct = parsePercent(`${eligibilityText} ${educationalText}`);

  const parsedDocs = splitListFromText(docsText).filter(v => v.length > 3);
  const parsedCovers = splitCovers(inclusionsText);

  const dateMatches = importantDatesText.match(/\d{1,2}\s+[A-Za-z]+\s+20\d{2}/g) || [];
  const endDateRaw = raw.deadline || dateMatches[dateMatches.length - 1] || '';
  const endDate = parseDateToISO(endDateRaw);
  const startDate = dateMatches.length > 1 ? parseDateToISO(dateMatches[0]) : STATIC_START_DATE;

  const typeFromFacts = (quickFactsText.match(/PROVIDER TYPE\s+([^\n]+?)\s+(?:EDUCATION LEVEL|APPLICATION MODE|STATE\/REGION|INCOME LIMIT|LAST VERIFIED)/i) || [])[1] || '';
  const providerType = detectProviderType(`${typeFromFacts} ${raw.providerName}`) || clean(typeFromFacts);

  const appModeFromFacts = (quickFactsText.match(/APPLICATION MODE\s+([^\n]+?)\s+(?:STATE\/REGION|INCOME LIMIT|LAST VERIFIED)/i) || [])[1] || '';

  const eduFromFacts = (quickFactsText.match(/EDUCATION LEVEL\s+([^\n]+?)\s+(?:APPLICATION MODE|STATE\/REGION|INCOME LIMIT|LAST VERIFIED)/i) || [])[1] || '';
  const educationLevels = splitListFromText(eduFromFacts || raw.educationLevel || educationalText).map(v => v.replace(/^Class\s*/i, 'Class '));

  const categoryFromFinancial = (financialText.match(/APPLICABLE CATEGORY\s+([^\n]+)/i) || [])[1] || '';
  const categoryEligible = splitListFromText(categoryFromFinancial).length
    ? splitListFromText(categoryFromFinancial)
    : (quick.categories.length ? quick.categories : []);

  const genderEligible = /girl child|female|women/i.test(`${eligibilityText} ${raw.titleBlock}`) ? ['Female'] : ['All'];
  const stateRaw = (raw.stateOrRegion || quick.states.join(',') || 'All India').replace(/View Details.*$/i, '').trim();
  const statesEligible = splitListFromText(stateRaw);

  const headerText = getSectionText(raw.sections, [normalizeTitle(raw.titleBlock).toLowerCase()]);
  const providerFromHeader = clean(
    headerText
      .replace(/\s*Deadline:.*$/i, '')
      .replace(/\s*All India\s*$/i, '')
  );
  const sanitizedProviderName = ['verified', 'new'].includes((raw.providerName || '').toLowerCase()) ? '' : raw.providerName;
  const providerName = clean(providerFromHeader || sanitizedProviderName);

  const isPwDEligible = /pwd|person with disabilit|disability/i.test(`${eligibilityText} ${aboutText}`);
  const isMinorityEligible = /minority/i.test(`${eligibilityText} ${aboutText}`);
  const faqItems = parseFaqItems(raw.sections, faqText);

  const status = 'Active';
  const isFeatured = /verified/i.test(raw.titleBlock);

  return {
    _id: idx + 1,
    type: 'Scholarship',
    basicInfo: {
      title: normalizeTitle(raw.titleBlock),
      shortDescription: aboutText || clean(raw.summary),
      providerName,
      providerType,
      officialWebsite: raw.link,
      applicationLink: raw.link
    },
    benefits: {
      scholarshipAmount: clean(raw.money) || clean(benefitsText),
      covers: parsedCovers
    },
    eligibility: {
      educationLevels,
      minimumPercentage: minPct,
      categoryEligible,
      genderEligible,
      incomeLimit,
      statesEligible,
      ageLimit: {
        min: null,
        max: null
      },
      isPwDEligible,
      isMinorityEligible
    },
    applicationDetails: {
      applicationMode: normalizeApplicationMode(appModeFromFacts || raw.applicationMode),
      startDate,
      endDate,
      documentsRequired: parsedDocs
    },
    faq: {
      questionsAndAnswers: faqItems
    },
    status,
    isFeatured,
    metadata: {
      viewCount: 0,
      saveCount: 0,
      createdAt: now,
      updatedAt: now
    },
    additionalInfo: {
      selectionProcess,
      renewalPolicy
    }
  };
}

async function scrapeScholarships() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const scholarships = [];
  let pageNum = 1;
  const MAX_PAGES = 10;

  while (pageNum <= MAX_PAGES && scholarships.length < TARGET_COUNT) {
    const url = pageNum === 1 ? BASE_URL : `${BASE_URL}?page=${pageNum}`;
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('a[href^="/scholarships/"]', { timeout: 20000 });
    console.log(`Scraping scholarships page ${pageNum}...`);

    const listingRows = await page.evaluate(() => {
      const map = new Map();
      const anchors = Array.from(document.querySelectorAll('a[href^="/scholarships/"]'));
      for (const a of anchors) {
        const href = a.href;
        if (map.has(href)) continue;

        const card = a.closest('article, .card, .scholarship-card, li, div');
        const cardText = card ? card.innerText : a.innerText;
        const text = (cardText || '').replace(/\s+/g, ' ').trim();

        const lines = (a.innerText || '')
          .split('\n')
          .map(v => v.trim())
          .filter(Boolean);

        const meaningful = lines.filter(v => !/^verified$/i.test(v) && !/^new$/i.test(v));
        const providerName = meaningful.length > 1 ? meaningful[1] : '';
        const titleText = (a.innerText || '').replace(/\s+/g, ' ').trim();
        const moneyMatch = titleText.match(/₹\s*[\d,]+(?:\s*-\s*₹\s*[\d,]+)?|Amount varies/i);
        const deadlineMatch = titleText.match(/\d{1,2}\s+[A-Za-z]+\s+20\d{2}/);
        const modeMatch = text.match(/\b(Online|Form-only|Exam|Offline)\b/i);

        map.set(href, {
          link: href,
          titleBlock: a.innerText || '',
          summary: '',
          providerName,
          money: moneyMatch ? moneyMatch[0] : '',
          deadline: deadlineMatch ? deadlineMatch[0] : '',
          applicationMode: modeMatch ? modeMatch[0] : '',
          educationLevel: '',
          stateOrRegion: ''
        });
      }
      return Array.from(map.values());
    });

    if (!listingRows.length) break;

    for (const row of listingRows) {
      if (scholarships.length >= TARGET_COUNT) break;
      const detailPage = await browser.newPage();
      try {
        await detailPage.goto(row.link, { waitUntil: 'networkidle2' });
        await detailPage.waitForSelector('body', { timeout: 20000 });

        const detail = await detailPage.evaluate(() => {
          const sections = {};
          const headingTags = ['h1', 'h2', 'h3', 'h4', 'strong'];
          const headingNodes = Array.from(document.querySelectorAll(headingTags.join(',')));

          for (let i = 0; i < headingNodes.length; i++) {
            const heading = headingNodes[i];
            const key = heading.innerText.replace(/\s+/g, ' ').trim();
            if (!key || key.length < 3) continue;
            const collected = [];
            let next = heading.nextElementSibling;
            while (next && !headingNodes.includes(next)) {
              const txt = next.innerText ? next.innerText.replace(/\s+/g, ' ').trim() : '';
              if (txt) collected.push(txt);
              next = next.nextElementSibling;
            }
            if (collected.length) {
              sections[key] = collected;
            }
          }

          const logoMeta = document.querySelector('meta[property="og:image"]');
          const logoFromMeta = logoMeta ? logoMeta.getAttribute('content') : '';

          const links = Array.from(document.querySelectorAll('a[href]')).map(a => a.href);
          const externalLinks = links.filter(h =>
            /^https?:\/\//i.test(h) &&
            !h.includes('indiascholarships.in') &&
            !h.includes('facebook.com') &&
            !h.includes('twitter.com') &&
            !h.includes('instagram.com') &&
            !h.includes('youtube.com')
          );

          return {
            sections,
            logo: logoFromMeta || '',
            officialWebsite: externalLinks[0] || '',
            applicationLink: externalLinks[1] || externalLinks[0] || ''
          };
        });

        scholarships.push(buildScholarshipSchema({ ...row, ...detail }, scholarships.length));
      } catch (e) {
        scholarships.push(buildScholarshipSchema({ ...row, sections: {}, officialWebsite: '', applicationLink: '' }, scholarships.length));
      } finally {
        await detailPage.close();
      }
    }

    pageNum++;
  }

  await browser.close();
  const output = scholarships.slice(0, TARGET_COUNT);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`Scraped ${output.length} scholarships in normalized schema format.`);
}

scrapeScholarships().catch(err => {
  console.error(err);
  process.exit(1);
});
