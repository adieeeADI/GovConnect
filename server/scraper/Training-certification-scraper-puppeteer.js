// Training-certification-scraper-puppeteer.js
// Scraper for https://swayam.gov.in/search_courses using Puppeteer

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://swayam.gov.in/search_courses';
const OUTPUT_FILE = path.join(__dirname, 'training_certification', 'data.json');
const MAX_COURSES = 30;

function clean(value) {
    return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function parseDateToISO(value) {
    if (!value) return '';
    const text = clean(value).replace(/\bIST\b/gi, '').trim();
    const m = text.match(/(\d{1,2})\s+([A-Za-z]+)\s+(20\d{2})/);
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
    const dt = new Date(text);
    if (Number.isNaN(dt.getTime())) return '';
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function parseDurationToDays(durationText) {
    const txt = clean(durationText).toLowerCase();
    const m = txt.match(/(\d+)\s*(week|weeks|month|months|day|days)/i);
    if (!m) return null;
    const qty = Number(m[1]);
    const unit = m[2].toLowerCase();
    if (unit.startsWith('week')) return qty * 7;
    if (unit.startsWith('month')) return qty * 30;
    if (unit.startsWith('day')) return qty;
    return null;
}

function calculateEndDateFromDuration(startDateIso, durationText) {
    if (!startDateIso || !durationText) return '';
    const days = parseDurationToDays(durationText);
    if (!days) return '';
    const d = new Date(startDateIso);
    if (Number.isNaN(d.getTime())) return '';
    d.setDate(d.getDate() + days);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function extractDateByLabel(text, label) {
    const src = clean(text);
    const re = new RegExp(`${label}\\s*:?\\s*(\\d{1,2}\\s+[A-Za-z]+\\s+20\\d{2})`, 'i');
    const m = src.match(re);
    return m ? m[1] : '';
}

function parseFee(certificateText) {
    const txt = clean(certificateText);
    const feeMatch = txt.match(/(?:fee(?: of)?\s*Rs\.?\s*|₹\s*)(\d[\d,]*)/i);
    if (feeMatch) return `Rs. ${feeMatch[1]}`;
    if (!txt) return '';
    if (/free/i.test(txt)) return 'Free';
    return '';
}

function parseProgramType(certificateText) {
    const txt = clean(certificateText).toLowerCase();
    if (!txt || /n\/a|no final examination|will not receive a certificate/.test(txt)) {
        return 'Training';
    }
    return 'Certification';
}

function parseCertificationProvided(certificateText) {
    const txt = clean(certificateText).toLowerCase();
    if (!txt) return null;
    if (/n\/a|no final examination|will not receive a certificate/.test(txt)) return false;
    if (/certificate|certification|proctored exam/.test(txt)) return true;
    return null;
}

function cleanSummaryField(value) {
    return clean(value || '')
    .replace(/^["'`]+/, '')
        .replace(/^:\s*/, '')
        .replace(/\b(Note:|Contact NC Support|Share:).*$/i, '')
    .replace(/["'`]+$/, '')
        .trim();
}

function cleanCertificateText(value) {
    return clean(value || '')
        .replace(/^(course\s*certificate\s*){1,}/i, '')
    .replace(/^["'`]+/, '')
        .replace(/\bShare:\s*$/i, '')
    .replace(/["'`]+$/, '')
        .trim();
}

function normalizeCategory(value) {
    const txt = clean(value || '');
    if (!txt) return '';
    return txt
        .split(/[,_]/)
        .map(part => clean(part))
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
}

function inferExamShift(raw) {
    const explicit = clean(raw.examShift || '');
    if (explicit) return explicit;

    const text = `${clean(raw.certificationDetails || '')} ${clean(raw.certificate || '')}`.toLowerCase();
    if (/morning session/.test(text) && /afternoon session/.test(text)) {
        return 'Morning & Afternoon';
    }
    if (/\bshift\s*1\b/.test(text)) return 'Shift 1';
    if (/\bshift\s*2\b/.test(text)) return 'Shift 2';
    return '';
}

function firstMatch(text, regex) {
    const src = clean(text || '');
    const m = src.match(regex);
    return m ? clean(m[1] || m[0]) : '';
}

function inferLanguage(raw) {
    if (raw.apiLanguage) return raw.apiLanguage;
    if (raw.language) return raw.language;
    if (raw.translationLanguages && !/^n\/?a$/i.test(clean(raw.translationLanguages))) {
        return clean(raw.translationLanguages.split(',')[0]);
    }
    const cardText = clean(raw.cardText || '');
    return firstMatch(cardText, /\b(English|Hindi|Tamil|Telugu|Kannada|Malayalam|Marathi|Bengali|Gujarati|Punjabi|Urdu)\b/i);
}

function inferCategory(raw) {
    if (raw.apiCategory) return raw.apiCategory;
    if (raw.category) return raw.category;
    const cardText = clean(raw.cardText || '');
    return firstMatch(cardText, /category\s*:?\s*([^\n|,;]+)/i);
}

function inferCourseStatus(raw) {
    if (raw.apiCourseStatus) return raw.apiCourseStatus;
    if (raw.courseStatus) return raw.courseStatus;
    const cardText = clean(raw.cardText || '');
    return firstMatch(cardText, /\b(Ongoing|Upcoming|Closed|Completed|Active)\b/i);
}

function inferCourseType(raw) {
    if (raw.apiCourseType) return raw.apiCourseType;
    if (raw.courseType) return raw.courseType;
    const cardText = clean(raw.cardText || '');
    return firstMatch(cardText, /\b(Elective|Core|Compulsory|Skill|Foundation)\b/i);
}

function inferCreditPoints(raw) {
    if (raw.apiCreditPoints) return String(raw.apiCreditPoints);
    if (raw.creditPoints) return raw.creditPoints;
    const cardText = clean(raw.cardText || '');
    return firstMatch(cardText, /credit\s*points?\s*:?\s*([^\n|,;]+)/i);
}

function transformToSchema(raw, idx) {
    const now = new Date().toISOString();
    const programType = parseProgramType(raw.certificate);
    const certProvided = parseCertificationProvided(raw.certificate)
        ?? ((raw.gradingPolicy || raw.eligibilityForCertification || raw.certificationDetails) ? true : null);
    const mode = 'Online';
    const examMode = raw.examDate || raw.cardExamDate ? 'Proctored' : null;
    const status = /closed|completed/i.test(raw.courseStatus || '') ? 'Closed' : 'Active';

    const registrationStart = parseDateToISO(raw.startDate || raw.cardStartDate);
    const registrationEnd = parseDateToISO(raw.enrollmentEnds || raw.cardEnrollmentEnds);
    const lastDateToApply = registrationEnd;
    const examDate = parseDateToISO(raw.examDate || raw.cardExamDate);

    const duration = raw.duration || raw.cardDuration || '';
    const computedEnd = calculateEndDateFromDuration(registrationStart, duration);
    const registrationComputedEnd = parseDateToISO(raw.endDate) || computedEnd;

    const minimumEducation = cleanSummaryField(raw.indicativeProgramAlignments || raw.level || '');
    const gradingPolicy = raw.gradingPolicy || '';
    const eligibilityForCertification = raw.eligibilityForCertification || '';
    const certificationDetails = cleanCertificateText(raw.certificationDetails || raw.certificate || '');

    return {
        _id: idx + 1,
        type: programType,
        basicInfo: {
            title: raw.title || 'Untitled Program',
            shortDescription: raw.shortDescription || '',
            providerName: clean(raw.institute || '')
                .replace(/(Learners\s*enrolled|Course\s*Information|Summary|Join\s*the\s*Course|Share:).*$/i, '')
                .trim(),
            officialWebsite: raw.url || '',
            applicationLink: raw.url || '',
            logo: raw.cardLogo || raw.logo || ''
        },
        programDetails: {
            mode,
            duration,
            fees: parseFee(raw.certificate),
            certificationProvided: certProvided,
            examMode,
            validity: null,
            level: raw.level || null,
            gradingPolicy,
            eligibilityForCertification,
            certificationDetails
        },
        eligibility: {
            minimumEducation,
            recommendedSkills: raw.category ? [raw.category] : [],
            statesEligible: ['All India'],
            categoryEligible: ['All']
        },
        applicationDetails: {
            applicationMode: 'Online',
            registrationStart,
            registrationEnd: registrationEnd || registrationComputedEnd,
            lastDateToApply,
            examDate
        },
        status,
        isFeatured: false,
        metadata: {
            viewCount: 0,
            saveCount: 0,
            createdAt: now,
            updatedAt: now
        },
        additionalInfo: {
            instructor: raw.instructor || '',
            totalEnrolled: raw.totalEnrolled ? Number(raw.totalEnrolled) : null,
            language: inferLanguage(raw),
            category: inferCategory(raw),
            creditPoints: inferCreditPoints(raw),
            translationLanguages: raw.translationLanguages || raw.apiTranslationLanguages || '',
            industryDetails: cleanSummaryField(raw.industryDetails || raw.apiIndustryDetails || ''),
            ncrfLevel: raw.ncrfLevel || raw.apiNcrfLevel || '',
            examShift: inferExamShift({ ...raw, examShift: raw.examShift || raw.apiExamShift || '' }),
            courseStatus: inferCourseStatus(raw) || status,
            courseType: inferCourseType(raw) || programType,
            certificateInfo: cleanCertificateText(raw.certificate || ''),
            sourceUrl: raw.url || ''
        }
    };
}

async function scrapePrograms() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    let programs = [];
    let courseRows = [];

    while (courseRows.length < MAX_COURSES) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(res => setTimeout(res, 2000));
        courseRows = await page.evaluate(() => {
            function clean(v) {
                return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '';
            }

            const anchors = Array.from(document.querySelectorAll('a[href*="/preview"]'));
            const seen = new Set();
            const rows = [];

            for (const a of anchors) {
                const href = a.href;
                if (!href || seen.has(href)) continue;
                seen.add(href);

                let card = a.closest('mat-card, .mat-card, article, li, .card, .course-card, .search-result-card, .search-card, div') || a.parentElement;
                let probe = card;
                let bestText = clean(card ? card.innerText : a.innerText);
                for (let i = 0; i < 6 && probe && probe.parentElement; i++) {
                    probe = probe.parentElement;
                    const t = clean(probe?.innerText || '');
                    if (t.length > bestText.length && t.length < 4500) {
                        bestText = t;
                        card = probe;
                    }
                }
                const cardText = bestText;
                const title = clean(a.textContent) || clean(cardText.split('Learners enrolled')[0]);

                const duration = (cardText.match(/(\d+\s*(?:week|weeks|month|months|day|days))/i) || [])[1] || '';
                const startDate = (cardText.match(/start\s*date\s*:?\s*(\d{1,2}\s+[A-Za-z]+\s+20\d{2})/i) || [])[1] || '';
                const examDate = (cardText.match(/exam\s*date\s*:?\s*(\d{1,2}\s+[A-Za-z]+\s+20\d{2})/i) || [])[1] || '';
                const enrollmentEnds = (cardText.match(/enrollment\s*ends\s*:?\s*(\d{1,2}\s+[A-Za-z]+\s+20\d{2})/i) || [])[1] || '';
                const logo = card?.querySelector('img')?.src || '';

                rows.push({
                    href,
                    cardTitle: title,
                    cardText,
                    cardDuration: duration,
                    cardStartDate: startDate,
                    cardExamDate: examDate,
                    cardEnrollmentEnds: enrollmentEnds,
                    cardLogo: logo
                });
            }

            return rows;
        });
        if (courseRows.length >= MAX_COURSES) break;
    }

    courseRows = courseRows.slice(0, MAX_COURSES);

    for (const course of courseRows) {
        try {
            const link = course.href;
            console.log(`Scraping: ${link}`);
            const detailPage = await browser.newPage();
            await detailPage.goto(link, { waitUntil: 'networkidle2' });

            let apiFields = {};
            try {
                const u = new URL(link);
                const pathParts = u.pathname.split('/').filter(Boolean);
                const courseId = (pathParts[pathParts.length - 1] || '').toLowerCase() === 'preview'
                    ? pathParts[pathParts.length - 2]
                    : pathParts[pathParts.length - 1];

                if (/onlinecourses\.swayam2\.ac\.in$/i.test(u.hostname) && courseId) {
                    const apiData = await detailPage.evaluate(async (id) => {
                        try {
                            const resp = await fetch(`/e-learning/api/coursepreview?course_id=${id}`);
                            if (!resp.ok) return null;
                            return await resp.json();
                        } catch {
                            return null;
                        }
                    }, courseId);

                    if (apiData && apiData.payload) {
                        const payloadObj = typeof apiData.payload === 'string'
                            ? JSON.parse(apiData.payload)
                            : apiData.payload;
                        const courseInfo = payloadObj?.course_info?.course || {};
                        const summary = payloadObj?.sw_course_summary || {};

                        const categorySource = Array.isArray(courseInfo.category_name) && courseInfo.category_name.length
                            ? courseInfo.category_name.join(', ')
                            : (Array.isArray(summary.category) ? summary.category.join(', ') : '');
                        const ncrfSource = Array.isArray(courseInfo.ncrf_level) && courseInfo.ncrf_level.length
                            ? courseInfo.ncrf_level.join(' - ')
                            : (summary.ncrf_level || '');
                        const translationSource = Array.isArray(courseInfo.translation_languages) && courseInfo.translation_languages.length
                            ? courseInfo.translation_languages.join(', ')
                            : (Array.isArray(summary.translation_languages) ? summary.translation_languages.join(', ') : '');

                        apiFields = {
                            apiLanguage: clean(courseInfo.course_language || ''),
                            apiCategory: normalizeCategory(categorySource),
                            apiCreditPoints: courseInfo.credits ?? summary.credits ?? '',
                            apiCourseStatus: clean(payloadObj.course_status || ''),
                            apiCourseType: clean(courseInfo.course_type || ''),
                            apiNcrfLevel: clean(ncrfSource),
                            apiTranslationLanguages: clean(translationSource),
                            apiIndustryDetails: clean(courseInfo.industry_details || summary.industry_details || ''),
                            apiExamShift: clean(courseInfo.custom_preview_info_text || ''),
                            apiDuration: courseInfo.weeks ? `${courseInfo.weeks} Week` : '',
                            apiStartDate: clean(summary.startDate || ''),
                            apiEndDate: clean(summary.endDate || ''),
                            apiEnrollmentEnds: clean(summary.enrollmentEndDate || ''),
                            apiExamDate: clean(summary.examDate || '')
                        };
                    }
                }
            } catch {
                apiFields = {};
            }

            // Some SWAYAM fields are rendered only when summary/details panels are activated.
            await detailPage.evaluate(() => {
                function norm(v) {
                    return (v || '').replace(/\s+/g, ' ').trim().toLowerCase();
                }
                const targets = [
                    'summary',
                    'course information',
                    'course info',
                    'about the course',
                    'course certificate',
                    'course layout'
                ];
                const nodes = Array.from(document.querySelectorAll('button, a, [role="tab"], .mat-tab-label, .accordion-button, summary, div, span'));
                for (const n of nodes) {
                    const t = norm(n.textContent || '');
                    if (!t) continue;
                    if (targets.includes(t) || targets.some(x => t === x || t.startsWith(`${x} `))) {
                        n.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                    }
                }
            });
            await new Promise(res => setTimeout(res, 1200));

            const raw = await detailPage.evaluate(() => {
                function clean(value) {
                    return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
                }

                const text = document.body.innerText || document.body.textContent || '';
                const lines = text.split('\n').map(l => clean(l)).filter(Boolean);

                const labelList = [
                    'Course Status', 'Course Type', 'Language for course content', 'Duration', 'Category',
                    'Credit Points', 'Level', 'Start Date', 'End Date', 'Enrollment Ends', 'Exam Date',
                    'Translation Languages', 'Industry Details', 'NCrF Level', 'Exam Shift'
                ];

                function isLabelLine(line) {
                    const low = line.toLowerCase();
                    return labelList.some(label => low === label.toLowerCase() || low.startsWith(label.toLowerCase() + ':'));
                }

                function extractValue(label) {
                    const re = new RegExp(`${label}\\s*:?\\s*(.*)`, 'i');
                    for (const line of lines) {
                        const m = line.match(re);
                        if (m) {
                            const inlineVal = clean(m[1]);
                            if (inlineVal && !isLabelLine(inlineVal)) return inlineVal;
                        }
                    }

                    const idx = lines.findIndex(l => l.toLowerCase() === label.toLowerCase() || l.toLowerCase().startsWith(label.toLowerCase() + ':'));
                    if (idx !== -1) {
                        const sameLine = clean(lines[idx].replace(new RegExp(`^${label}\\s*:?`, 'i'), ''));
                        if (sameLine && !isLabelLine(sameLine)) return sameLine;
                        for (let i = idx + 1; i < lines.length; i++) {
                            if (lines[i] && !isLabelLine(lines[i])) return lines[i];
                        }
                    }
                    return '';
                }

                function extractSection(label, stopLabels) {
                    const source = text;
                    const startIdx = source.toLowerCase().indexOf(label.toLowerCase());
                    if (startIdx === -1) return '';

                    const after = source.substring(startIdx + label.length);
                    let endIdx = after.length;
                    for (const stop of stopLabels) {
                        const i = after.toLowerCase().indexOf(stop.toLowerCase());
                        if (i !== -1 && i < endIdx) endIdx = i;
                    }
                    return clean(after.substring(0, endIdx));
                }

                const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '';
                const h1 = document.querySelector('h1')?.textContent || '';
                const h2 = document.querySelector('h2')?.textContent || '';
                const h3 = document.querySelector('h3')?.textContent || '';
                const titleCandidates = [ogTitle, h1, h2, h3, document.title]
                    .map(v => clean(v))
                    .filter(Boolean)
                    .filter(v => !/^(course layout|instructor bio|course certificate)$/i.test(v));
                let title = titleCandidates[0] || '';
                if (/\|/.test(title)) title = clean(title.split('|')[0]);

                let instructor = '';
                let institute = '';
                const byLineElem = Array.from(document.querySelectorAll('span, div')).find(e => e.textContent.includes('By '));
                if (byLineElem) {
                    const match = byLineElem.textContent.match(/By\s+([^|\n]+)\s*\|\s*([^\n]+)/);
                    if (match) {
                        instructor = clean(match[1]);
                        institute = clean(match[2]);
                    } else {
                        const bySplit = byLineElem.textContent.split('By');
                        if (bySplit[1]) {
                            const parts = bySplit[1].split('|');
                            instructor = clean(parts[0]);
                            institute = parts[1] ? clean(parts[1]) : '';
                        }
                    }
                }

                const enrolledMatch = text.match(/Learners enrolled:\s*([\d,]+)/i);
                const totalEnrolled = enrolledMatch ? enrolledMatch[1].replace(/,/g, '') : '';

                const summary = {};
                labelList.forEach(label => {
                    summary[label] = extractValue(label);
                });

                const indicativeIndustrySectors = extractSection('Indicative Industry Sectors', [
                    'Indicative Program Alignments', 'Eligibility for certification', 'Grading Policy', 'Certification details', 'Share:'
                ]) || (text.match(/Indicative\s*Industry\s*Sectors\s*:?\s*([^\n]+)/i)?.[1] || '');
                const indicativeProgramAlignments = extractSection('Indicative Program Alignments', [
                    'Eligibility for certification', 'Grading Policy', 'Certification details', 'Contact NC Support', 'Share:'
                ]) || extractValue('Indicative Program Alignments') || (text.match(/Indicative\s*Program\s*Alignments\s*:?\s*([^\n]+)/i)?.[1] || '');
                const gradingPolicy = extractSection('Grading Policy', [
                    'Eligibility for certification', 'Certification details', 'Share:'
                ]);
                const eligibilityForCertification = extractSection('Eligibility for certification', [
                    'Certification details', 'Grading Policy', 'Share:'
                ]);
                const certificationDetails = extractSection('Certification details', [
                    'Share:', 'Course layout', 'DOWNLOAD APP'
                ]);

                let certificate = '';
                const certIdx = text.toLowerCase().indexOf('course certificate');
                if (certIdx !== -1) {
                    const certText = text.substring(certIdx);
                    certificate = clean(certText.split('\n').slice(1, 16).join(' '));
                }

                let courseLayout = '';
                const layoutIdx = text.toLowerCase().indexOf('course layout');
                if (layoutIdx !== -1) {
                    const layoutText = text.substring(layoutIdx);
                    courseLayout = clean(layoutText.split('\n').slice(1, 24).join(' '));
                }

                let shortDescription = '';
                const aboutIdx = text.toLowerCase().indexOf('about the course');
                if (aboutIdx !== -1) {
                    const aboutText = text.substring(aboutIdx);
                    shortDescription = clean(aboutText.split('\n').slice(1, 10).join(' '));
                }

                const logo = document.querySelector('meta[property="og:image"]')?.getAttribute('content')
                    || document.querySelector('img[src]')?.getAttribute('src')
                    || '';

                const startDateFallback = (text.match(/Start Date\s*:?\s*(\d{1,2}\s+[A-Za-z]+\s+20\d{2})/i) || [])[1] || '';
                const endDateFallback = (text.match(/End Date\s*:?\s*(\d{1,2}\s+[A-Za-z]+\s+20\d{2})/i) || [])[1] || '';
                const enrollmentEndsFallback = (text.match(/Enrollment Ends\s*:?\s*(\d{1,2}\s+[A-Za-z]+\s+20\d{2})/i) || [])[1] || '';
                const examDateFallback = (text.match(/Exam Date\s*:?\s*(\d{1,2}\s+[A-Za-z]+\s+20\d{2}(?:\s*IST)?)/i) || [])[1] || '';
                const durationFallback = (text.match(/(\d+\s*(?:week|weeks|month|months|day|days))/i) || [])[1] || '';
                const categoryFallback = (text.match(/Category\s*:?\s*([^\n]+)/i) || [])[1] || '';
                const languageFallback = (text.match(/Language for course content\s*:?\s*([^\n]+)/i) || [])[1] || '';
                const examShiftFallback = (text.match(/Exam Shift\s*:?\s*([^\n]+)/i) || [])[1]
                    || (text.match(/\bShift\s*[12]\b/i) || [])[0]
                    || '';

                return {
                    title,
                    shortDescription,
                    instructor,
                    institute,
                    totalEnrolled,
                    url: window.location.href,
                    logo,
                    courseStatus: summary['Course Status'],
                    courseType: summary['Course Type'],
                    language: summary['Language for course content'] || clean(languageFallback),
                    duration: summary['Duration'] || clean(durationFallback),
                    category: summary['Category'] || clean(categoryFallback),
                    creditPoints: summary['Credit Points'],
                    level: summary['Level'],
                    startDate: summary['Start Date'] || clean(startDateFallback),
                    endDate: summary['End Date'] || clean(endDateFallback),
                    enrollmentEnds: summary['Enrollment Ends'] || clean(enrollmentEndsFallback),
                    examDate: summary['Exam Date'] || clean(examDateFallback),
                    translationLanguages: summary['Translation Languages'],
                    industryDetails: summary['Industry Details'],
                    indicativeIndustrySectors,
                    ncrfLevel: summary['NCrF Level'],
                    examShift: summary['Exam Shift'] || clean(examShiftFallback),
                    indicativeProgramAlignments,
                    gradingPolicy,
                    eligibilityForCertification,
                    certificationDetails,
                    certificate,
                    courseLayout
                };
            });

            const merged = {
                ...raw,
                ...apiFields,
                title: raw.title || course.cardTitle,
                cardDuration: course.cardDuration,
                cardText: course.cardText,
                cardStartDate: course.cardStartDate,
                cardExamDate: course.cardExamDate,
                cardEnrollmentEnds: course.cardEnrollmentEnds,
                cardLogo: course.cardLogo,
                startDate: raw.startDate || apiFields.apiStartDate || course.cardStartDate,
                endDate: raw.endDate || apiFields.apiEndDate || '',
                examDate: raw.examDate || apiFields.apiExamDate || course.cardExamDate,
                enrollmentEnds: raw.enrollmentEnds || apiFields.apiEnrollmentEnds || course.cardEnrollmentEnds,
                duration: raw.duration || apiFields.apiDuration || course.cardDuration,
                logo: raw.logo || course.cardLogo
            };

            if (!merged.endDate) {
                const cardTextSeed = `${course.cardStartDate} ${course.cardDuration}`;
                merged.endDate = extractDateByLabel(cardTextSeed, 'End Date');
            }

            programs.push(transformToSchema(merged, programs.length));
            await detailPage.close();
        } catch (err) {
            const now = new Date().toISOString();
            programs.push({
                _id: programs.length + 1,
                type: 'Training',
                basicInfo: {
                    title: 'Untitled Program',
                    shortDescription: '',
                    providerName: '',
                    officialWebsite: course.href,
                    applicationLink: course.href,
                    logo: ''
                },
                programDetails: {
                    mode: 'Online',
                    duration: '',
                    fees: '',
                    certificationProvided: null,
                    examMode: null,
                    validity: null,
                    level: null
                },
                eligibility: {
                    minimumEducation: '',
                    recommendedSkills: [],
                    statesEligible: ['All India'],
                    categoryEligible: ['All']
                },
                applicationDetails: {
                    applicationMode: 'Online',
                    registrationStart: '',
                    registrationEnd: '',
                    lastDateToApply: '',
                    examDate: ''
                },
                status: 'Active',
                isFeatured: false,
                metadata: {
                    viewCount: 0,
                    saveCount: 0,
                    createdAt: now,
                    updatedAt: now
                },
                additionalInfo: {
                    scrapeError: err.message,
                    sourceUrl: course.href
                }
            });
        }
    }

    await browser.close();
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(programs, null, 2));
    console.log(`Scraped ${programs.length} training/certification programs in normalized schema format.`);
}

scrapePrograms().catch(err => {
    console.error(err);
    process.exit(1);
});
