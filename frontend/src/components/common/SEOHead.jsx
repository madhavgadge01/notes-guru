import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Reusable SEO Head Manager component for client-side navigation.
 * Updates document.title, meta tags, canonical link, Open Graph, Twitter cards,
 * robots directives, and JSON-LD schema markup dynamically.
 */
const SEOHead = ({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = 'https://genznotes.in/og-image.png',
  ogTitle,
  ogDescription,
  noindex = false,
  jsonLd = null,
}) => {
  const location = useLocation();

  useEffect(() => {
    const defaultSiteName = 'GenZ Notes';
    const finalTitle = title
      ? title.includes(defaultSiteName)
        ? title
        : `${title} | ${defaultSiteName}`
      : 'GenZ Notes — Exam Tomorrow? GenZNotes Today.';

    const finalDescription =
      description ||
      'Syllabus-aligned college notes, previous year question solutions, unit summaries, and digital exam preparation guides for university students.';

    const siteOrigin = 'https://genznotes.in';
    const finalCanonical = canonical
      ? canonical.startsWith('http')
        ? canonical
        : `${siteOrigin}${canonical.startsWith('/') ? canonical : `/${canonical}`}`
      : `${siteOrigin}${location.pathname}`;

    // 1. Document Title
    document.title = finalTitle;

    // Helper to get or create meta tag
    const setMetaTag = (attribute, attrValue, content) => {
      let element = document.querySelector(`meta[${attribute}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', finalDescription);
    setMetaTag(
      'name',
      'robots',
      noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    // 3. Canonical Tag
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', finalCanonical);

    // 4. Open Graph Tags
    setMetaTag('property', 'og:site_name', defaultSiteName);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:title', ogTitle || finalTitle);
    setMetaTag('property', 'og:description', ogDescription || finalDescription);
    setMetaTag('property', 'og:url', finalCanonical);
    setMetaTag('property', 'og:image', ogImage);

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', ogTitle || finalTitle);
    setMetaTag('name', 'twitter:description', ogDescription || finalDescription);
    setMetaTag('name', 'twitter:image', ogImage);

    // 6. JSON-LD Structured Data
    const SCRIPT_ID = 'genznotes-jsonld';
    let scriptElement = document.getElementById(SCRIPT_ID);

    if (jsonLd) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = SCRIPT_ID;
        scriptElement.type = 'application/ld+json';
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(jsonLd);
    } else if (scriptElement) {
      scriptElement.remove();
    }

    // Cleanup on unmount / route transition if needed
    return () => {
      // keep latest meta intact
    };
  }, [
    title,
    description,
    canonical,
    ogType,
    ogImage,
    ogTitle,
    ogDescription,
    noindex,
    jsonLd,
    location.pathname,
  ]);

  return null;
};

export default SEOHead;
