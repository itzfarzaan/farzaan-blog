const POST_STATUSES = ['draft', 'published'];
const ASSET_TYPES = ['image', 'file', 'pdf', 'spreadsheet', 'notebook', 'other'];

const postWrite = {
    fields: {
        title: { type: 'text', required: true },
        slug: { type: 'text' },
        excerpt: { type: 'text', required: true },
        content_markdown: { type: 'text', required: true },
        status: { type: 'text', check: POST_STATUSES },
        is_featured: { type: 'boolean' },
        tags: { type: 'array', itemType: 'text' },
        assets: {
            type: 'array',
            itemType: 'object',
            itemShape: {
                label: { type: 'text', required: true },
                url: { type: 'text', required: true, url: true },
                asset_type: { type: 'text', check: ASSET_TYPES },
                sort_order: { type: 'int' },
            },
        },
    },
};

module.exports = {
    POST_STATUSES,
    ASSET_TYPES,
    schemas: {
        postWrite,
    },
};
