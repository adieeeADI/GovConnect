// Internship-scraper-puppeteer.js
// Scraper for https://internship.aicte-india.org/recentlyposted.php using Puppeteer

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://internship.aicte-india.org/recentlyposted.php';
const OUTPUT_FILE = path.join(__dirname, 'internships', 'data.json');
const TARGET_COUNT = 30;

// Helper function to clean text
const clean = obj => obj && typeof obj === 'string' ? obj.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim() : obj;

// Helper function to parse location (convert string to array)
function parseLocation(locationStr) {
    if (Array.isArray(locationStr)) return locationStr;
    if (!locationStr) return ['Remote'];
    const locations = locationStr.split(/[,;\/]/).map(l => l.trim()).filter(Boolean);
    return locations.length > 0 ? locations : ['Remote'];
}

// Helper function to parse stipend
function parseStipend(stipendStr) {
    if (!stipendStr) return 'Not Specified';
    return stipendStr.trim();
}

// Helper function to extract seats/openings
function parseSeats(seatsStr) {
    if (!seatsStr) return 0;
    const num = parseInt(seatsStr.match(/\d+/)?.[0] || '0', 10);
    return num || 0;
}

// Helper function to parse date
function parseDate(dateStr) {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (e) { }
    return new Date().toISOString().split('T')[0];
}

// Helper function to transform raw data to schema
function transformToSchema(rawData, idx) {
    const now = new Date().toISOString();

    return {
        _id: idx + 1,
        type: "Internship",

        basicInfo: {
            title: rawData.title || 'Untitled Internship',
            shortDescription: clean(rawData.about) || rawData.title || '',
            department: rawData.company || '',
            providerName: 'AICTE',
            officialWebsite: rawData.officialWebsite || '',
            applicationLink: rawData.url || '',
            logo: rawData.logo || ''
        },

        internshipDetails: {
            mode: rawData.mode || '',
            location: parseLocation(rawData.location),
            duration: rawData.duration || '',
            stipend: parseStipend(rawData.stipend),
            numberOfSeats: parseSeats(rawData.openings)
        },

        eligibility: {
            educationLevels: rawData.educationLevels || [],
            streamsAllowed: rawData.streamsAllowed || [],
            yearOfStudyAllowed: rawData.yearOfStudyAllowed || [],
            minimumCGPA: rawData.minimumCGPA || null,
            statesEligible: rawData.statesEligible || [],
            ageLimit: {
                min: rawData.ageMin || null,
                max: rawData.ageMax || null
            }
        },

        applicationDetails: {
            startDate: parseDate(rawData.startTime || rawData.postedDate),
            endDate: parseDate(rawData.applyBy),
            selectionProcess: clean(rawData.terms) || ''
        },

        programDetails: {
            about: clean(rawData.about) || '',
            perks: clean(rawData.perks) || '',
            whoCanApply: clean(rawData.whoCanApply) || '',
            terms: clean(rawData.terms) || ''
        },

        status: 'Active',
        isFeatured: false,

        metadata: {
            viewCount: 0,
            saveCount: 0,
            createdAt: now,
            updatedAt: now,
            source: 'AICTE Scraper',
            lastScrapedAt: now
        }
    };
}

async function scrapeInternships() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    let internships = [];
    let pageNum = 1;
    const MAX_PAGES = 10;
    while (pageNum <= MAX_PAGES && internships.length < TARGET_COUNT) {
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
                
                // Extract mode from li.wfh element
                const wfhLi = card.querySelector('li.wfh span');
                const mode = wfhLi ? wfhLi.textContent.trim() : '';
                
                // Extract logo might be in a different element or unavailable on listing page
                const logoImg = card.querySelector('img');
                const logo = logoImg ? logoImg.src : '';
                
                const company = card.querySelector('h5') ? card.querySelector('h5').textContent.trim() : '';
                const text = card.innerText;
                const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
                
                // Parse the structured info from list items
                const typeSpan = card.querySelector('li.wfh span');
                const type = typeSpan ? typeSpan.textContent.trim() : '';
                
                const postedDateSpan = card.querySelector('li.posted-on span');
                const postedDate = postedDateSpan ? postedDateSpan.textContent.trim() : '';
                
                const locationSpan = card.querySelector('li.location span');
                const location = locationSpan ? locationSpan.textContent.trim() : '';
                
                const durationSpan = card.querySelector('li.duration span');
                const duration = durationSpan ? durationSpan.textContent.trim() : '';
                
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
                
                return { title, company, type, postedDate, location, duration, startTime, stipend, openings, applyBy, mode, logo };
            });
        });
        // Now, for each link, get internal data
        for (let i = 0; i < links.length && internships.length < TARGET_COUNT; i++) {
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
                
                // Extract logo from image on detail page (company logo is in uploads/logo/)
                let logo = '';
                const logoImg = Array.from(document.querySelectorAll('img')).find(img => 
                    img.src.includes('uploads/logo')
                );
                if (logoImg) {
                    logo = logoImg.src;
                }
                
                // Extract official website - try to find in text or links
                let officialWebsite = '';
                const pageText = document.body.innerText;
                
                // Look for website URL patterns in page text
                const urlMatch = pageText.match(/https?:\/\/(?!internship\.aicte-india\.org)[^\s]+/);
                if (urlMatch) {
                    officialWebsite = urlMatch[0];
                }
                
                // If not found in text, try to find company website link explicitly
                if (!officialWebsite) {
                    const allLinks = Array.from(document.querySelectorAll('a'));
                    const companyLink = allLinks.find(a => {
                        const href = a.href.toLowerCase();
                        return href.includes('www') && 
                               !href.includes('internship.aicte-india.org') &&
                               !href.includes('facebook') && 
                               !href.includes('twitter') &&
                               !href.includes('linkedin') &&
                               !href.includes('youtube') &&
                               !href.includes('instagram') &&
                               !href.includes('google') &&
                               !href.includes('aicte');
                    });
                    if (companyLink) {
                        officialWebsite = companyLink.href;
                    }
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
                    officialWebsite: officialWebsite,
                    logo: logo
                };
            });
            
            const rawData = {
                ...cardData[i],
                url: link,
                about: clean(internal.about),
                perks: clean(internal.perks),
                whoCanApply: clean(internal.whoCanApply),
                terms: clean(internal.terms),
                startTime: internal.startTime,
                stipend: internal.stipend,
                openings: internal.openings,
                applyBy: internal.applyBy,
                logo: internal.logo,
                officialWebsite: internal.officialWebsite
            };

            // Transform to proper schema
            internships.push(transformToSchema(rawData, internships.length));
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
    const output = internships.slice(0, TARGET_COUNT);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`Scraped ${output.length} internships in new schema format.`);
}

scrapeInternships();
