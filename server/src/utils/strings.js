function slugify(input) {
    return String(input || '')
        .toLowerCase()
        .trim()
        .replace(/['"]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function uniqueTrimmed(values) {
    return [...new Set((values || []).map((value) => String(value).trim()).filter(Boolean))];
}

function isValidHttpUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (error) {
        return false;
    }
}

module.exports = {
    slugify,
    uniqueTrimmed,
    isValidHttpUrl,
};
