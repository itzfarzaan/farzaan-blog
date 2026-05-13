export function formatDate(value) {
    if (!value) {
        return 'Unpublished';
    }

    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'long',
    }).format(new Date(value));
}

export function buildExcerpt(content) {
    return String(content || '')
        .replace(/[#>*_`\-\[\]\(\)]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 180);
}

export function slugify(input) {
    return String(input || '')
        .toLowerCase()
        .trim()
        .replace(/['"]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export const emptyPost = {
    title: '',
    slug: '',
    excerpt: '',
    content_markdown: '',
    status: 'draft',
    is_featured: false,
    tags: [],
    assets: [],
};
