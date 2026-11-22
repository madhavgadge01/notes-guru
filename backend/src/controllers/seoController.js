const College = require('../models/College');
const Course = require('../models/Course');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const Unit = require('../models/Unit');
const { getCache, setCache } = require('../utils/cache');

const BASE_URL = 'https://genznotes.in';

/**
 * Dynamic XML Sitemap endpoint for Search Engines (Google Search Console, Bing)
 */
const getSitemapXml = async (req, res, next) => {
  try {
    const cacheKey = 'seo_sitemap_xml';
    const cached = getCache(cacheKey);
    if (cached) {
      res.header('Content-Type', 'application/xml');
      return res.status(200).send(cached);
    }

    const today = new Date().toISOString().split('T')[0];

    // Static core URLs
    const urls = [
      { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${BASE_URL}/ignou/`, priority: '0.95', changefreq: 'weekly' },
      { loc: `${BASE_URL}/available-subjects`, priority: '0.7', changefreq: 'weekly' },
      { loc: `${BASE_URL}/explore`, priority: '0.7', changefreq: 'weekly' },
    ];

    // Query active colleges, courses, and subjects
    const [colleges, courses, subjects] = await Promise.all([
      College.find({ isActive: true }).select('name code updatedAt').lean(),
      Course.find({ isActive: true }).select('name code collegeId updatedAt').lean(),
      Subject.find({ isActive: true })
        .populate('courseId', 'code')
        .populate('collegeId', 'code')
        .select('name code semesterId courseId collegeId updatedAt')
        .lean(),
    ]);

    // IGNOU specific courses
    const ignouCol = colleges.find((c) => c.code === 'IGNOU');
    if (ignouCol) {
      const ignouCourses = courses.filter((crs) => crs.collegeId?.toString() === ignouCol._id.toString());
      for (const crs of ignouCourses) {
        if (crs.code) {
          urls.push({
            loc: `${BASE_URL}/ignou/${crs.code.toLowerCase()}/`,
            priority: '0.85',
            changefreq: 'weekly',
            lastmod: crs.updatedAt ? crs.updatedAt.toISOString().split('T')[0] : today,
          });
        }
      }
    }

    // IGNOU subjects
    for (const sub of subjects) {
      if (sub.collegeId?.code === 'IGNOU' && sub.courseId?.code && sub.code) {
        urls.push({
          loc: `${BASE_URL}/ignou/${sub.courseId.code.toLowerCase()}/${sub.code.toLowerCase()}/`,
          priority: '0.8',
          changefreq: 'weekly',
          lastmod: sub.updatedAt ? sub.updatedAt.toISOString().split('T')[0] : today,
        });
      } else {
        urls.push({
          loc: `${BASE_URL}/subject/${sub._id}`,
          priority: '0.6',
          changefreq: 'monthly',
          lastmod: sub.updatedAt ? sub.updatedAt.toISOString().split('T')[0] : today,
        });
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || today}</lastmod>
    <changefreq>${u.changefreq || 'weekly'}</changefreq>
    <priority>${u.priority || '0.7'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    setCache(cacheKey, xml, 60 * 60 * 1000); // 1 hour cache
    res.header('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (error) {
    next(error);
  }
};

/**
 * IGNOU Educational summary
 */
const getIgnouSummary = async (req, res, next) => {
  try {
    const ignouCol = await College.findOne({ code: 'IGNOU' }).lean();
    if (!ignouCol) {
      return res.status(200).json({
        success: true,
        exists: false,
        message: 'IGNOU not yet populated in database; frontend uses static catalog fallback.',
      });
    }

    const courses = await Course.find({ collegeId: ignouCol._id, isActive: true }).lean();
    const subjects = await Subject.find({ collegeId: ignouCol._id, isActive: true })
      .populate('courseId', 'code name')
      .populate('semesterId', 'semesterNumber name')
      .lean();

    return res.status(200).json({
      success: true,
      exists: true,
      college: ignouCol,
      coursesCount: courses.length,
      subjectsCount: subjects.length,
      courses,
      subjects,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSitemapXml,
  getIgnouSummary,
};
