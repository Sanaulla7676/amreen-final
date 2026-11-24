import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveHtmlPage, SITE_PAGES } from './static-routes';

test('resolves root and index routes to index.html', () => {
  assert.equal(resolveHtmlPage('/'), 'index.html');
  assert.equal(resolveHtmlPage(''), 'index.html');
  assert.equal(resolveHtmlPage('/index.html'), 'index.html');
  assert.equal(resolveHtmlPage('/index'), 'index.html');
});

test('resolves all known site pages with or without .html and query strings', () => {
  for (const page of SITE_PAGES) {
    assert.equal(resolveHtmlPage(`/${page}`), page);
    const slug = page.replace(/\.html$/, '');
    assert.equal(resolveHtmlPage(`/${slug}`), page);
    assert.equal(resolveHtmlPage(`/${slug}/?utm_source=test`), page);
  }
});

test('rejects unknown routes, config files, and traversal attempts', () => {
  assert.equal(resolveHtmlPage('/package.json'), null);
  assert.equal(resolveHtmlPage('/server.ts'), null);
  assert.equal(resolveHtmlPage('/../etc/passwd'), null);
  assert.equal(resolveHtmlPage('/css/styles.css'), null);
  assert.equal(resolveHtmlPage('/nonexistent.html'), null);
});
