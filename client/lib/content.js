const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(value) {
    if (!value) {
        return 'Unpublished';
    }

    const date = new Date(value);
    const month = MONTHS[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
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
