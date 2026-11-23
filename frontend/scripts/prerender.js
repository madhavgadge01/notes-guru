import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  IGNOU_INFO,
  IGNOU_COURSES,
  IGNOU_SUBJECTS,
  getCourseBySlug,
  getSubjectByCode,
  getUnitData,
  getAllIgnouRoutes,
} from '../src/data/ignouData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://genznotes.in';
const DIST_DIR = path.resolve(__dirname, '../dist');

// Read the built template from dist/index.html
if (!fs.existsSync(DIST_DIR)) {
  console.error('[Prerender] Error: dist directory does not exist. Run vite build first.');
  process.exit(1);
}

const templatePath = path.join(DIST_DIR, 'index.html');
const templateHtml = fs.readFileSync(templatePath, 'utf-8');

// Helper to escape HTML text
const escapeHtml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Generate prerendered pages
const generatePrerenderedPages = () => {
  const routes = getAllIgnouRoutes();

  // Also include home, available-subjects, explore
  const pagesToRender = [
    {
      path: '/',
      title: 'GenZ Notes — Exam Tomorrow? GenZNotes Today | College Study Notes Marketplace',
      description:
        'Access syllabus-aligned college study notes, previous year question solutions, unit summaries, and digital exam preparation guides for top universities across India.',
      type: 'home',
    },
    {
      path: '/available-subjects',
      title: 'Available Subjects & College Notes | GenZ Notes',
      description:
        'Browse syllabus-mapped subjects, semester note packages, and chapter summaries across engineering and university courses.',
      type: 'general',
    },
    {
      path: '/explore',
      title: 'Explore College Courses & Subjects | GenZ Notes',
      description:
        'Choose your university, course, and semester to discover verified academic study notes and exam preparation material.',
      type: 'general',
    },
    {
      path: '/academic',
      title: 'Explore College Courses & Subjects | GenZ Notes',
      description:
        'Choose your university, course, and semester to discover verified academic study notes and exam preparation material.',
      type: 'general',
    },
    ...routes,
  ];

  let count = 0;

  for (const page of pagesToRender) {
    const rawPath = page.path;
    const cleanPath = rawPath.replace(/^\/+|\/+$/g, ''); // e.g. "ignou/bca/bcs-011"
    const canonicalUrl = `${BASE_URL}/${cleanPath ? `${cleanPath}/` : ''}`;

    let title = page.title || 'GenZ Notes';
    let description = page.description || 'College study notes marketplace.';
    let jsonLd = [];
    let crawlableBody = '';

    // Route type resolution
    if (page.type === 'home') {
      title = 'GenZ Notes — Exam Tomorrow? GenZNotes Today | College Study Notes Marketplace';
      description =
        'Access syllabus-aligned college study notes, previous year question solutions, unit summaries, and digital exam preparation guides for top universities across India.';
      jsonLd = [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'GenZ Notes',
          url: BASE_URL,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${BASE_URL}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'EducationalOrganization',
          name: 'GenZ Notes',
          url: BASE_URL,
          logo: `${BASE_URL}/logo.png`,
          description,
        },
      ];
      crawlableBody = `
        <header style="padding: 2rem 1rem; text-align: center;">
          <h1 style="font-size: 2.25rem; font-weight: 900; margin-bottom: 1rem;">Syllabus-Mapped College Notes for Exam Night Clarity</h1>
          <p style="font-size: 1rem; color: #77736C; max-width: 48rem; margin: 0 auto 1.5rem;">Syllabus-aligned college notes, derivations, chapter summaries, and exam preparation guides for university students.</p>
          <nav aria-label="Featured educational hubs">
            <a href="/ignou/" style="display: inline-block; padding: 0.6rem 1.2rem; background: #DE8E5C; color: white; border-radius: 0.75rem; text-decoration: none; font-weight: bold; margin: 0.5rem;">Explore IGNOU Study Material</a>
            <a href="/explore" style="display: inline-block; padding: 0.6rem 1.2rem; background: #FAF9F6; color: #242321; border: 1px solid #E3DED5; border-radius: 0.75rem; text-decoration: none; font-weight: bold; margin: 0.5rem;">Explore All Colleges</a>
          </nav>
        </header>
      `;
    } else if (cleanPath === 'ignou') {
      // IGNOU Hub
      title = 'IGNOU Study Material & Notes – BCA, MCA, B.Com, BA | GenZ Notes';
      description =
        'Access comprehensive IGNOU study notes, unit-wise syllabus summaries, solved question papers, and digital revision guides for BCA, MCA, B.Com, and BA students.';
      jsonLd = [
        {
          '@context': 'https://schema.org',
          '@type': 'EducationalOrganization',
          name: 'GenZ Notes',
          url: BASE_URL,
          description,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'IGNOU', item: `${BASE_URL}/ignou/` },
          ],
        },
      ];
      crawlableBody = `
        <article style="max-width: 64rem; margin: 0 auto; padding: 2rem 1rem;">
          <nav aria-label="Breadcrumb" style="font-size: 0.85rem; color: #77736C; margin-bottom: 1.5rem;">
            <a href="/" style="color: #77736C; text-decoration: none;">Home</a> &gt; <span>IGNOU</span>
          </nav>
          <header style="margin-bottom: 2rem;">
            <h1 style="font-size: 2.25rem; font-weight: 900; margin-bottom: 0.5rem;">IGNOU Study Notes & Exam Preparation Resources</h1>
            <p style="color: #77736C; font-size: 1rem; line-height: 1.6;">${escapeHtml(description)}</p>
          </header>
          <section style="margin-bottom: 2.5rem;">
            <h2 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 1rem;">Available IGNOU Courses</h2>
            <ul style="list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
              ${Object.values(IGNOU_COURSES)
                .map(
                  (c) => `
                <li style="border: 1px solid #E3DED5; padding: 1.25rem; border-radius: 1rem; background: #FAF9F6;">
                  <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;"><a href="/ignou/${c.slug}/" style="color: #242321; text-decoration: none;">IGNOU ${c.code} (${c.name})</a></h3>
                  <p style="font-size: 0.85rem; color: #77736C; margin: 0 0 0.75rem 0;">${escapeHtml(c.overview)}</p>
                  <a href="/ignou/${c.slug}/" style="color: #DE8E5C; font-weight: bold; font-size: 0.85rem; text-decoration: none;">View Semester Notes &rarr;</a>
                </li>`
                )
                .join('')}
            </ul>
          </section>
        </article>
      `;
    } else {
      // Deconstruct path: e.g. "ignou/bca", "ignou/bca/semester-1", "ignou/bca/bcs-011", "ignou/bca/bcs-011/unit-1"
      const parts = cleanPath.split('/');
      if (parts[0] === 'ignou') {
        const courseSlug = parts[1];
        const course = getCourseBySlug(courseSlug);
        const subOrSem = parts[2];
        const unitPart = parts[3];

        if (course && !subOrSem) {
          // Course page: /ignou/:course
          title = `IGNOU ${course.code} Notes – ${course.name} Study Material | GenZ Notes`;
          description = `Comprehensive IGNOU ${course.code} study notes, semester-wise subjects, syllabus breakdowns, and exam preparation guides for ${course.name} students.`;
          jsonLd = [
            {
              '@context': 'https://schema.org',
              '@type': 'Course',
              name: `IGNOU ${course.code} – ${course.name}`,
              description: course.overview,
              provider: { '@type': 'EducationalOrganization', name: 'GenZ Notes', url: BASE_URL },
              educationalLevel: course.degreeType,
            },
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
                { '@type': 'ListItem', position: 2, name: 'IGNOU', item: `${BASE_URL}/ignou/` },
                { '@type': 'ListItem', position: 3, name: course.code, item: canonicalUrl },
              ],
            },
          ];
          crawlableBody = `
            <article style="max-width: 56rem; margin: 0 auto; padding: 2rem 1rem;">
              <nav aria-label="Breadcrumb" style="font-size: 0.85rem; color: #77736C; margin-bottom: 1.5rem;">
                <a href="/" style="color: #77736C; text-decoration: none;">Home</a> &gt; <a href="/ignou/" style="color: #77736C; text-decoration: none;">IGNOU</a> &gt; <span>${escapeHtml(course.code)}</span>
              </nav>
              <header style="margin-bottom: 2rem;">
                <div style="font-size: 0.8rem; font-weight: bold; color: #DE8E5C; text-transform: uppercase;">IGNOU • ${escapeHtml(course.degreeType)}</div>
                <h1 style="font-size: 2rem; font-weight: 900; margin: 0.5rem 0;">IGNOU ${escapeHtml(course.code)} Notes & Study Material</h1>
                <p style="color: #77736C; font-size: 0.95rem; line-height: 1.6;">${escapeHtml(course.overview)}</p>
              </header>
              <section style="margin-bottom: 2rem;">
                <h2 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 1rem;">Semester Breakdown</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
                  ${course.semesters
                    .map(
                      (s) => `
                    <div style="border: 1px solid #E3DED5; padding: 1rem; border-radius: 0.75rem; background: #FAF9F6;">
                      <h3 style="margin: 0 0 0.4rem 0; font-size: 1rem;"><a href="/ignou/${course.slug}/semester-${s.semesterNumber}/" style="color: #242321; text-decoration: none;">Semester ${s.semesterNumber}</a></h3>
                      <p style="font-size: 0.8rem; color: #77736C; margin: 0 0 0.5rem 0;">${escapeHtml(s.description)}</p>
                      <a href="/ignou/${course.slug}/semester-${s.semesterNumber}/" style="color: #DE8E5C; font-weight: bold; font-size: 0.8rem; text-decoration: none;">Explore Semester ${s.semesterNumber} Notes &rarr;</a>
                    </div>`
                    )
                    .join('')}
                </div>
              </section>
            </article>
          `;
        } else if (course && subOrSem && subOrSem.startsWith('semester-')) {
          // Semester page: /ignou/:course/semester-:sem
          const semNum = parseInt(subOrSem.replace('semester-', ''), 10);
          const sem = course.semesters.find((s) => s.semesterNumber === semNum);
          title = `IGNOU ${course.code} Semester ${semNum} Notes & Study Material | GenZ Notes`;
          description = `Study notes, unit summaries, and exam preparation material for IGNOU ${course.code} Semester ${semNum}.`;
          jsonLd = [
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
                { '@type': 'ListItem', position: 2, name: 'IGNOU', item: `${BASE_URL}/ignou/` },
                { '@type': 'ListItem', position: 3, name: course.code, item: `${BASE_URL}/ignou/${course.slug}/` },
                { '@type': 'ListItem', position: 4, name: `Semester ${semNum}`, item: canonicalUrl },
              ],
            },
          ];
          crawlableBody = `
            <article style="max-width: 56rem; margin: 0 auto; padding: 2rem 1rem;">
              <nav aria-label="Breadcrumb" style="font-size: 0.85rem; color: #77736C; margin-bottom: 1.5rem;">
                <a href="/" style="color: #77736C; text-decoration: none;">Home</a> &gt; <a href="/ignou/" style="color: #77736C; text-decoration: none;">IGNOU</a> &gt; <a href="/ignou/${course.slug}/" style="color: #77736C; text-decoration: none;">${escapeHtml(course.code)}</a> &gt; <span>Semester ${semNum}</span>
              </nav>
              <header style="margin-bottom: 2rem;">
                <div style="font-size: 0.8rem; font-weight: bold; color: #DE8E5C; text-transform: uppercase;">IGNOU • ${escapeHtml(course.code)} • Semester ${semNum}</div>
                <h1 style="font-size: 2rem; font-weight: 900; margin: 0.5rem 0;">IGNOU ${escapeHtml(course.code)} Semester ${semNum} Notes</h1>
                <p style="color: #77736C; font-size: 0.95rem; line-height: 1.6;">${escapeHtml(sem?.description || description)}</p>
              </header>
              <section>
                <h2 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 1rem;">Prescribed Subjects</h2>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                  ${(sem?.subjects || [])
                    .map((subCode) => {
                      const sub = IGNOU_SUBJECTS[subCode];
                      if (!sub) return '';
                      return `
                      <div style="border: 1px solid #E3DED5; padding: 1.25rem; border-radius: 1rem; background: #FAF9F6;">
                        <div style="font-size: 0.8rem; font-weight: bold; color: #DE8E5C;">${escapeHtml(sub.code)} • ${sub.credits} Credits</div>
                        <h3 style="margin: 0.25rem 0 0.5rem 0; font-size: 1.1rem;"><a href="/ignou/${course.slug}/${sub.code.toLowerCase()}/" style="color: #242321; text-decoration: none;">${escapeHtml(sub.name)}</a></h3>
                        <p style="font-size: 0.85rem; color: #77736C; margin: 0 0 0.75rem 0;">${escapeHtml(sub.description)}</p>
                        <a href="/ignou/${course.slug}/${sub.code.toLowerCase()}/" style="color: #DE8E5C; font-weight: bold; font-size: 0.85rem; text-decoration: none;">Explore Curriculum Units &rarr;</a>
                      </div>`;
                    })
                    .join('')}
                </div>
              </section>
            </article>
          `;
        } else if (course && subOrSem && !unitPart) {
          // Subject page: /ignou/:course/:subjectCode
          const subject = getSubjectByCode(courseSlug, subOrSem);
          if (subject) {
            title = `IGNOU ${subject.code} Notes – ${subject.name} | GenZ Notes`;
            description =
              subject.metaDescription ||
              `Explore IGNOU ${subject.code} ${subject.name} study material, unit-wise notes and learning resources for ${course.code} students.`;
            jsonLd = [
              {
                '@context': 'https://schema.org',
                '@type': 'Course',
                name: `IGNOU ${subject.code} Notes – ${subject.name}`,
                description: subject.description,
                provider: { '@type': 'EducationalOrganization', name: 'GenZ Notes', url: BASE_URL },
                educationalLevel: 'Undergraduate',
              },
              {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
                  { '@type': 'ListItem', position: 2, name: 'IGNOU', item: `${BASE_URL}/ignou/` },
                  { '@type': 'ListItem', position: 3, name: course.code, item: `${BASE_URL}/ignou/${course.slug}/` },
                  { '@type': 'ListItem', position: 4, name: `Semester ${subject.semesterNumber}`, item: `${BASE_URL}/ignou/${course.slug}/semester-${subject.semesterNumber}/` },
                  { '@type': 'ListItem', position: 5, name: subject.code, item: canonicalUrl },
                ],
              },
            ];
            crawlableBody = `
              <article style="max-width: 56rem; margin: 0 auto; padding: 2rem 1rem;">
                <nav aria-label="Breadcrumb" style="font-size: 0.85rem; color: #77736C; margin-bottom: 1.5rem;">
                  <a href="/" style="color: #77736C; text-decoration: none;">Home</a> &gt; <a href="/ignou/" style="color: #77736C; text-decoration: none;">IGNOU</a> &gt; <a href="/ignou/${course.slug}/" style="color: #77736C; text-decoration: none;">${escapeHtml(course.code)}</a> &gt; <a href="/ignou/${course.slug}/semester-${subject.semesterNumber}/" style="color: #77736C; text-decoration: none;">Semester ${subject.semesterNumber}</a> &gt; <span>${escapeHtml(subject.code)}</span>
                </nav>
                <header style="margin-bottom: 2rem;">
                  <div style="font-size: 0.8rem; font-weight: bold; color: #DE8E5C; text-transform: uppercase;">IGNOU • ${escapeHtml(course.code)} • Semester ${subject.semesterNumber} • ${subject.credits} Credits</div>
                  <h1 style="font-size: 2rem; font-weight: 900; margin: 0.5rem 0;">IGNOU ${escapeHtml(subject.code)} Notes – ${escapeHtml(subject.name)}</h1>
                  <p style="color: #77736C; font-size: 0.95rem; line-height: 1.6;">${escapeHtml(subject.description)}</p>
                </header>
                <section>
                  <h2 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 1rem;">Curriculum Blocks & Units</h2>
                  ${(subject.blocks || [])
                    .map(
                      (block) => `
                    <div style="border: 1px solid #E3DED5; padding: 1.25rem; border-radius: 1rem; background: #FAF9F6; margin-bottom: 1rem;">
                      <h3 style="margin: 0 0 0.5rem 0; font-size: 1.05rem; font-weight: bold;">Block ${block.blockNumber}: ${escapeHtml(block.name)}</h3>
                      <p style="font-size: 0.85rem; color: #77736C; margin: 0 0 0.75rem 0;">${escapeHtml(block.description || '')}</p>
                      <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem;">
                        ${(block.units || [])
                          .map(
                            (unit) => `
                          <li style="padding: 0.6rem 0.8rem; background: #F5F3EF; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 0.85rem; font-weight: 600;">Unit ${unit.unitNumber}: ${escapeHtml(unit.title)}</span>
                            <a href="/ignou/${course.slug}/${subject.code.toLowerCase()}/unit-${unit.unitNumber}/" style="color: #DE8E5C; font-size: 0.8rem; font-weight: bold; text-decoration: none;">Read Unit &rarr;</a>
                          </li>`
                          )
                          .join('')}
                      </ul>
                    </div>`
                    )
                    .join('')}
                </section>
              </article>
            `;
          }
        } else if (course && subOrSem && unitPart && unitPart.startsWith('unit-')) {
          // Unit page: /ignou/:course/:subjectCode/unit-:unitNum
          const unitNumber = parseInt(unitPart.replace('unit-', ''), 10);
          const unitData = getUnitData(courseSlug, subOrSem, unitNumber);
          if (unitData) {
            const { unit, block, subject } = unitData;
            title = `IGNOU ${subject.code} Unit ${unit.unitNumber} Notes: ${unit.title} | GenZ Notes`;
            description =
              unit.summary ||
              `Study notes, concepts, and syllabus coverage for IGNOU ${subject.code} Unit ${unit.unitNumber} (${unit.title}).`;
            jsonLd = [
              {
                '@context': 'https://schema.org',
                '@type': 'LearningResource',
                name: `IGNOU ${subject.code} Unit ${unit.unitNumber}: ${unit.title}`,
                description: unit.summary,
                educationalLevel: 'Undergraduate',
                provider: { '@type': 'EducationalOrganization', name: 'GenZ Notes', url: BASE_URL },
              },
              {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
                  { '@type': 'ListItem', position: 2, name: 'IGNOU', item: `${BASE_URL}/ignou/` },
                  { '@type': 'ListItem', position: 3, name: course.code, item: `${BASE_URL}/ignou/${course.slug}/` },
                  { '@type': 'ListItem', position: 4, name: subject.code, item: `${BASE_URL}/ignou/${course.slug}/${subject.code.toLowerCase()}/` },
                  { '@type': 'ListItem', position: 5, name: `Unit ${unit.unitNumber}`, item: canonicalUrl },
                ],
              },
            ];
            crawlableBody = `
              <article style="max-width: 56rem; margin: 0 auto; padding: 2rem 1rem;">
                <nav aria-label="Breadcrumb" style="font-size: 0.85rem; color: #77736C; margin-bottom: 1.5rem;">
                  <a href="/" style="color: #77736C; text-decoration: none;">Home</a> &gt; <a href="/ignou/" style="color: #77736C; text-decoration: none;">IGNOU</a> &gt; <a href="/ignou/${course.slug}/" style="color: #77736C; text-decoration: none;">${escapeHtml(course.code)}</a> &gt; <a href="/ignou/${course.slug}/${subject.code.toLowerCase()}/" style="color: #77736C; text-decoration: none;">${escapeHtml(subject.code)}</a> &gt; <span>Unit ${unit.unitNumber}</span>
                </nav>
                <header style="margin-bottom: 2rem;">
                  <div style="font-size: 0.8rem; font-weight: bold; color: #DE8E5C; text-transform: uppercase;">${escapeHtml(subject.code)} • Block ${block.blockNumber}: ${escapeHtml(block.name)}</div>
                  <h1 style="font-size: 2rem; font-weight: 900; margin: 0.5rem 0;">Unit ${unit.unitNumber}: ${escapeHtml(unit.title)}</h1>
                  <p style="color: #77736C; font-size: 0.95rem; line-height: 1.6;">${escapeHtml(unit.summary || '')}</p>
                </header>
                ${
                  unit.keyTopics && unit.keyTopics.length > 0
                    ? `
                  <section style="margin-bottom: 2rem; border: 1px solid #E3DED5; padding: 1.5rem; border-radius: 1rem; background: #FAF9F6;">
                    <h2 style="font-size: 1.15rem; font-weight: 800; margin: 0 0 1rem 0;">Key Concepts Covered</h2>
                    <ul style="padding-left: 1.25rem; margin: 0;">
                      ${unit.keyTopics.map((topic) => `<li style="margin-bottom: 0.4rem; font-size: 0.85rem;">${escapeHtml(topic)}</li>`).join('')}
                    </ul>
                  </section>`
                    : ''
                }
                <div style="margin-top: 1.5rem;">
                  <a href="/ignou/${course.slug}/${subject.code.toLowerCase()}/" style="color: #DE8E5C; font-weight: bold; text-decoration: none;">&larr; Back to all ${escapeHtml(subject.code)} Units</a>
                </div>
              </article>
            `;
          }
        }
      }
    }

    // Assemble HTML file
    let pageHtml = templateHtml;

    // Replace <title>
    pageHtml = pageHtml.replace(
      /<title>[\s\S]*?<\/title>/i,
      `<title>${escapeHtml(title)}</title>`
    );

    // Inject Meta, Canonical, Open Graph, Twitter, and JSON-LD inside <head>
    const metaTags = `
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
    <link rel="canonical" href="${canonicalUrl}" />
    <!-- Open Graph -->
    <meta property="og:site_name" content="GenZ Notes" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${BASE_URL}/og-image.png" />
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${BASE_URL}/og-image.png" />
    ${
      jsonLd.length > 0
        ? `<script type="application/ld+json" id="genznotes-jsonld">${JSON.stringify(jsonLd)}</script>`
        : ''
    }
`;

    pageHtml = pageHtml.replace('</head>', `${metaTags}\n  </head>`);

    // Inject crawlable content into <div id="root">
    if (crawlableBody) {
      pageHtml = pageHtml.replace(
        '<div id="root"></div>',
        `<div id="root">${crawlableBody}</div>`
      );
    }

    // Determine target file path
    const targetDir = cleanPath ? path.join(DIST_DIR, cleanPath) : DIST_DIR;
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const targetFilePath = path.join(targetDir, 'index.html');
    fs.writeFileSync(targetFilePath, pageHtml, 'utf-8');
    count++;
  }

  console.log(`[Prerender] Successfully generated ${count} crawlable HTML pages in dist/`);
};

generatePrerenderedPages();
