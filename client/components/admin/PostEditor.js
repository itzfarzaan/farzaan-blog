'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../../lib/api';
import { buildExcerpt, slugify } from '../../lib/content';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const ASSET_TYPES = ['image', 'file', 'pdf', 'spreadsheet', 'notebook', 'other'];

function emptyForm() {
    return {
        title: '',
        slug: '',
        excerpt: '',
        content_markdown: '',
        status: 'draft',
        is_featured: false,
        tagsInput: '',
        assets: [],
    };
}

function normalizeIncomingPost(post) {
    return {
        title: post?.title || '',
        slug: post?.slug || '',
        excerpt: post?.excerpt || '',
        content_markdown: post?.content_markdown || '',
        status: post?.status || 'draft',
        is_featured: Boolean(post?.is_featured),
        tagsInput: (post?.tags || []).map((tag) => tag.name || tag).join(', '),
        assets: post?.assets || [],
    };
}

export default function PostEditor({ postId = null }) {
    const router = useRouter();
    const [form, setForm] = useState(emptyForm);
    const [savedForm, setSavedForm] = useState(emptyForm);
    const [loading, setLoading] = useState(Boolean(postId));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    useEffect(() => {
        if (!postId) {
            return;
        }

        fetchApi(`/admin/posts/${postId}`)
            .then((response) => {
                const next = normalizeIncomingPost(response.data);
                setForm(next);
                setSavedForm(next);
            })
            .catch((fetchError) => {
                if (fetchError.message === 'Session expired') {
                    router.replace('/admin/login');
                    return;
                }

                setError(fetchError.message);
            })
            .finally(() => setLoading(false));
    }, [postId, router]);

    const isDirty = JSON.stringify(form) !== JSON.stringify(savedForm);

    useEffect(() => {
        function warnIfDirty(event) {
            if (!isDirty) {
                return;
            }
            event.preventDefault();
            event.returnValue = '';
        }

        window.addEventListener('beforeunload', warnIfDirty);
        return () => window.removeEventListener('beforeunload', warnIfDirty);
    }, [isDirty]);

    function updateField(key, value) {
        setForm((current) => ({ ...current, [key]: value }));
        setNotice('');
    }

    function handleTitleChange(value) {
        setForm((current) => {
            const shouldRegenerateSlug = !current.slug || current.slug === slugify(current.title);
            return {
                ...current,
                title: value,
                slug: shouldRegenerateSlug ? slugify(value) : current.slug,
            };
        });
        setNotice('');
    }

    function handleMarkdownChange(value) {
        setForm((current) => ({
            ...current,
            content_markdown: value || '',
        }));
        setNotice('');
    }

    function fillExcerptFromContent() {
        setForm((current) => ({
            ...current,
            excerpt: buildExcerpt(current.content_markdown || current.title),
        }));
    }

    function updateAsset(index, field, value) {
        setForm((current) => ({
            ...current,
            assets: current.assets.map((asset, assetIndex) => (
                assetIndex === index ? { ...asset, [field]: value } : asset
            )),
        }));
    }

    function addAsset() {
        setForm((current) => ({
            ...current,
            assets: [
                ...current.assets,
                { label: '', url: '', asset_type: 'image', sort_order: current.assets.length },
            ],
        }));
    }

    function removeAsset(index) {
        setForm((current) => ({
            ...current,
            assets: current.assets.filter((_, assetIndex) => assetIndex !== index),
        }));
    }

    async function save() {
        const tags = form.tagsInput
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);

        const payload = {
            title: form.title,
            slug: form.slug,
            excerpt: form.excerpt,
            content_markdown: form.content_markdown,
            status: form.status,
            is_featured: form.is_featured,
            tags,
            assets: form.assets.map((asset, index) => ({
                ...asset,
                sort_order: index,
            })),
        };

        try {
            setSaving(true);
            setError('');
            setNotice('');

            const response = await fetchApi(postId ? `/admin/posts/${postId}` : '/admin/posts', {
                method: postId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const next = normalizeIncomingPost(response.data);
            setForm(next);
            setSavedForm(next);
            setNotice(form.status === 'published' ? 'Saved and published.' : 'Saved as draft.');

            if (!postId) {
                router.replace(`/admin/posts/${response.data.id}`);
            }
        } catch (saveError) {
            if (saveError.message === 'Session expired') {
                router.replace('/admin/login');
                return;
            }

            setError(saveError.message);
        } finally {
            setSaving(false);
        }
    }

    function handleBack() {
        if (isDirty && !window.confirm('You have unsaved changes. Discard and leave?')) {
            return;
        }
        router.push('/admin/posts');
    }

    if (loading) {
        return <div className="admin-empty">Loading post…</div>;
    }

    return (
        <div className="editor">
            <div className="editor__bar">
                <button type="button" className="editor__back" onClick={handleBack}>
                    ← Posts
                </button>
                <div className="editor__bar-right">
                    {isDirty ? <span className="editor__dirty">Unsaved changes</span> : null}
                    <label className="editor__status">
                        <span>Status</span>
                        <select
                            className="select"
                            value={form.status}
                            onChange={(event) => updateField('status', event.target.value)}
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </label>
                    <button className="button" type="button" onClick={save} disabled={saving}>
                        {saving ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </div>

            {notice ? <div className="editor__notice">{notice}</div> : null}
            {error ? <div className="login-form__error" role="alert">{error}</div> : null}

            <input
                type="text"
                className="editor__title-input"
                placeholder="Untitled post"
                value={form.title}
                onChange={(event) => handleTitleChange(event.target.value)}
            />

            <div className="editor__grid">
                <aside className="editor__meta">
                    <label className="editor__field">
                        <span>Slug</span>
                        <input
                            className="input"
                            value={form.slug}
                            onChange={(event) => updateField('slug', slugify(event.target.value))}
                            placeholder="auto-from-title"
                        />
                    </label>

                    <label className="editor__field">
                        <div className="editor__field-label">
                            <span>Excerpt</span>
                            <button type="button" className="editor__link-btn" onClick={fillExcerptFromContent}>
                                Fill from content
                            </button>
                        </div>
                        <textarea
                            className="textarea editor__excerpt"
                            value={form.excerpt}
                            onChange={(event) => updateField('excerpt', event.target.value)}
                            placeholder="One or two sentences shown on the home page."
                        />
                    </label>

                    <label className="editor__field">
                        <span>Tags</span>
                        <input
                            className="input"
                            value={form.tagsInput}
                            onChange={(event) => updateField('tagsInput', event.target.value)}
                            placeholder="comma, separated, tags"
                        />
                    </label>

                    <label className="editor__check">
                        <input
                            type="checkbox"
                            checked={form.is_featured}
                            onChange={(event) => updateField('is_featured', event.target.checked)}
                        />
                        <span>Feature on homepage</span>
                    </label>

                    <div className="editor__field">
                        <div className="editor__field-label">
                            <span>Resources</span>
                            <button type="button" className="editor__link-btn" onClick={addAsset}>
                                + Add
                            </button>
                        </div>

                        {form.assets.length === 0 ? (
                            <p className="editor__hint">Optional downloads or links shown at the bottom of the post.</p>
                        ) : (
                            <div className="editor__assets">
                                {form.assets.map((asset, index) => (
                                    <div key={index} className="editor__asset-row">
                                        <input
                                            className="input editor__asset-input"
                                            value={asset.label}
                                            onChange={(event) => updateAsset(index, 'label', event.target.value)}
                                            placeholder="Label"
                                        />
                                        <input
                                            className="input editor__asset-input"
                                            value={asset.url}
                                            onChange={(event) => updateAsset(index, 'url', event.target.value)}
                                            placeholder="URL"
                                        />
                                        <select
                                            className="select editor__asset-type"
                                            value={asset.asset_type}
                                            onChange={(event) => updateAsset(index, 'asset_type', event.target.value)}
                                        >
                                            {ASSET_TYPES.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            className="editor__asset-remove"
                                            onClick={() => removeAsset(index)}
                                            aria-label="Remove resource"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>

                <section className="editor__content">
                    <div data-color-mode="light">
                        <MDEditor
                            value={form.content_markdown}
                            onChange={handleMarkdownChange}
                            preview="live"
                            height={620}
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}
