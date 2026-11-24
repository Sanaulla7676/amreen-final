export const SITE_PAGES = [
  'index.html',
  'about.html',
  'courses.html',
  'professional-makeup.html',
  'skin-aesthetics.html',
  'hair-styling.html',
  'bridal-artistry.html',
  '45-day-course.html',
  'faculty.html',
  'student-success.html',
  'blog.html',
  'faqs.html',
  'contact.html',
  'verify.html',
  'admin.html',
] as const;

export type SitePage = (typeof SITE_PAGES)[number];

const PAGE_SET = new Set<string>(SITE_PAGES);

export function resolveHtmlPage(requestPath: string): SitePage | null {
  const cleanPath = requestPath.split('?')[0].split('#')[0];
  if (cleanPath === '/' || cleanPath === '') {
    return 'index.html';
  }

  const normalized = cleanPath.replace(/^\/+/, '').replace(/\/+$/, '');
  if (!normalized || normalized.includes('/') || normalized.includes('..')) {
    return null;
  }

  if (PAGE_SET.has(normalized)) {
    return normalized as SitePage;
  }

  const withHtml = `${normalized}.html`;
  if (PAGE_SET.has(withHtml)) {
    return withHtml as SitePage;
  }

  return null;
}
