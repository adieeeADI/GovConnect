// Training-certification-scraper-puppeteer.js
// Scraper for https://swayam.gov.in/explorer using Puppeteer

const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = 'https://swayam.gov.in/explorer';
const OUTPUT_FILE = './training_certification/data.json';
const MAX_COURSES = 100;

async function scrapeCertifications() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    let certifications = [];
    let courseLinks = [];
    let loaded = false;
    // Scroll and load more courses until we have enough
    while (courseLinks.length < MAX_COURSES && !loaded) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(res => setTimeout(res, 2000));
        // Find all anchor tags with href ending in '/preview'
        courseLinks = await page.$$eval('a', anchors => anchors.map(a => a.href).filter(href => href && href.endsWith('/preview')));
        if (courseLinks.length >= MAX_COURSES) loaded = true;
    }
    courseLinks = courseLinks.slice(0, MAX_COURSES);

    for (const link of courseLinks) {
        try {
            const detailPage = await browser.newPage();
            await detailPage.goto(link, { waitUntil: 'networkidle2' });
            const data = await detailPage.evaluate(() => {
                // Helper to extract value by label (removes label from value)
                function extractValue(label) {
                    const regex = new RegExp(label + '\\s*:?\\s*(.*)', 'i');
                    const lines = document.body.innerText.split('\n').map(l => l.trim());
                    for (let line of lines) {
                        const match = line.match(regex);
                        if (match && match[1]) return match[1].trim();
                    }
                    // Fallback: look for label, then next non-empty line
                    const idx = lines.findIndex(l => l.toLowerCase().includes(label.toLowerCase()));
                    if (idx !== -1) {
                        for (let i = idx + 1; i < lines.length; i++) {
                            if (lines[i]) return lines[i];
                        }
                    }
                    return '';
                }
                // Extract title
                let title = '';
                const h3 = document.querySelector('h3');
                if (h3) title = h3.textContent.trim();
                // Extract instructor and institute (robust)
                let instructor = '';
                let institute = '';
                const byLineElem = Array.from(document.querySelectorAll('span, div')).find(e => e.textContent.includes('By '));
                if (byLineElem) {
                    // Try to match: By [Instructor] | [Institute]
                    const match = byLineElem.textContent.match(/By\s+([^|\n]+)\s*\|\s*([^\n]+)/);
                    if (match) {
                        instructor = match[1].trim();
                        institute = match[2].trim();
                    } else {
                        // Fallback: just after 'By'
                        const bySplit = byLineElem.textContent.split('By');
                        if (bySplit[1]) {
                            const parts = bySplit[1].split('|');
                            instructor = parts[0].trim();
                            institute = parts[1] ? parts[1].trim() : '';
                        }
                    }
                }
                // Extract total enrolled
                let totalEnrolled = '';
                const enrolledMatch = document.body.innerText.match(/Learners enrolled:\s*([\d,]+)/);
                if (enrolledMatch) {
                    totalEnrolled = enrolledMatch[1].replace(/,/g, '');
                }
                // Extract summary fields (values only)
                const summary = {};
                const summaryLabels = [
                    'Course Status', 'Course Type', 'Language for course content', 'Duration', 'Category',
                    'Credit Points', 'Level', 'Start Date', 'End Date', 'Enrollment Ends', 'Exam Date',
                    'Translation Languages', 'Industry Details', 'NCrF Level', 'Exam Shift'
                ];
                summaryLabels.forEach(label => {
                    summary[label] = extractValue(label);
                });
                // Extract certificate info
                let certificate = '';
                const certIdx = document.body.innerText.indexOf('Course certificate');
                if (certIdx !== -1) {
                    const certText = document.body.innerText.substring(certIdx);
                    certificate = certText.split('\n').slice(1, 10).join(' ').trim();
                }
                // Extract course layout
                let courseLayout = '';
                const layoutIdx = document.body.innerText.indexOf('Course layout');
                if (layoutIdx !== -1) {
                    const layoutText = document.body.innerText.substring(layoutIdx);
                    courseLayout = layoutText.split('\n').slice(1, 20).join(' ').trim();
                }
                return {
                    title,
                    instructor,
                    institute,
                    totalEnrolled,
                    url: window.location.href,
                    courseStatus: summary['Course Status'],
                    courseType: summary['Course Type'],
                    language: summary['Language for course content'],
                    duration: summary['Duration'],
                    category: summary['Category'],
                    creditPoints: summary['Credit Points'],
                    level: summary['Level'],
                    startDate: summary['Start Date'],
                    endDate: summary['End Date'],
                    enrollmentEnds: summary['Enrollment Ends'],
                    examDate: summary['Exam Date'],
                    translationLanguages: summary['Translation Languages'],
                    industryDetails: summary['Industry Details'],
                    ncrfLevel: summary['NCrF Level'],
                    examShift: summary['Exam Shift'],
                    certificate,
                    courseLayout
                };
            });
            certifications.push(data);
            await detailPage.close();
        } catch (err) {
            certifications.push({ error: err.message, url: link });
        }
    }
    await browser.close();
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(certifications, null, 2));
    console.log(`Scraped ${certifications.length} certifications.`);
}

scrapeCertifications();
