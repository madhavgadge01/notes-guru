const express = require('express');
const router = express.Router();
const { getSitemapXml, getIgnouSummary } = require('../controllers/seoController');

// Dynamic sitemap endpoint
router.get('/sitemap', getSitemapXml);
router.get('/sitemap.xml', getSitemapXml);

// IGNOU SEO status summary
router.get('/ignou-summary', getIgnouSummary);

module.exports = router;
