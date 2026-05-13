const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateReadingTime } = require('../src/utils/content');
const { slugify, uniqueTrimmed, isValidHttpUrl } = require('../src/utils/strings');

test('calculateReadingTime returns at least one minute', () => {
    assert.equal(calculateReadingTime(''), 1);
});

test('calculateReadingTime scales with content length', () => {
    const text = new Array(401).fill('word').join(' ');
    assert.equal(calculateReadingTime(text), 3);
});

test('slugify normalizes blog titles', () => {
    assert.equal(slugify('  Hello, World of Blogs!  '), 'hello-world-of-blogs');
});

test('uniqueTrimmed de-duplicates and trims values', () => {
    assert.deepEqual(uniqueTrimmed([' React ', 'react', '', 'Next.js']), ['React', 'react', 'Next.js']);
});

test('isValidHttpUrl only allows http and https', () => {
    assert.equal(isValidHttpUrl('https://example.com/file.pdf'), true);
    assert.equal(isValidHttpUrl('ftp://example.com/file.pdf'), false);
});
