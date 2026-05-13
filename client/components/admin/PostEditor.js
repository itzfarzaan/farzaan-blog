'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearToken, getToken } from '../../lib/admin-auth';
import { fetchApi } from '../../lib/api';
import { buildExcerpt, emptyPost, slugify } from '../../lib/content';
import MarkdownArticle from '../MarkdownArticle';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

function normalizeIncomingPost(post) {
    return {
        title: post?.title || '',
        slug: post?.slug || '',
        excerpt: post?.excerpt || '',
        content_markdown: post?.content_markdown || '',
        status: post?.status || 'draft',
        is_featured: Boolean(post?.is_featured),
        tags: (post?.tags || []).map((tag) => tag.name || tag),
        assets: post?.assets || [],
    };
}

export default function PostEditor({ postId = null }) {
    const router = useRouter();
    const [form, setForm] = useState(emptyPost);
    const [loading, setLoading] = useState(Boolean(postId));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    useEffect(() => {
        if (!postId) {
            return;
        }

        const token = getToken();
        if (!token) {
            router.replace('/admin/login');
            return;
        }

        fetchApi(`/admin/posts/${postId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                setForm(normalizeIncomingPost(response.data));
            })
            .catch((fetchError) => {
                if (fetchError.message === 'Session expired') {
                    clearToken();
                    router.replace('/admin/login');
                    return;
                }

                setError(fetchError.message);
            })
            .finally(() => setLoading(false));
    }, [postId, router]);

    function updateField(key, value) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    function handleTitleChange(value) {
        setForm((current) => {
            const nextTitle = value;
            const shouldRegenerateSlug = !current.slug || current.slug === slugify(current.title);

            return {
                ...current,
                title: nextTitle,
                slug: shouldRegenerateSlug ? slugify(nextTitle) : current.slug,
                excerpt: current.excerpt || buildExcerpt(current.content_markdown || nextTitle),
            };
        });
    }

    function handleMarkdownChange(value) {
        setForm((current) => ({
            ...current,
            content_markdown: value || '',
            excerpt: current.excerpt || buildExcerpt(value || ''),
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
                { label: '', url: '', asset_type: 'other', sort_order: current.assets.length },
            ],
        }));
    }

    function removeAsset(index) {
        setForm((current) => ({
            ...current,
            assets: current.assets.filter((_, assetIndex) => assetIndex !== index),
        }));
    }

    async function savePost(nextStatus = form.status) {
        const token = getToken();
        if (!token) {
            router.replace('/admin/login');
            return;
        }

        const payload = {
            ...form,
            status: nextStatus,
            tags: form.tags
                .join(',')
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean),
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
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            setForm(normalizeIncomingPost(response.data));
            setNotice(nextStatus === 'published' ? 'Post saved and published.' : 'Draft saved.');

            if (!postId) {
                router.replace(`/admin/posts/${response.data.id}`);
            }
        } catch (saveError) {
            if (saveError.message === 'Session expired') {
                clearToken();
                router.replace('/admin/login');
                return;
            }

            setError(saveError.message);
        } finally {
            setSaving(false);
        }
    }

    async function changePublishState(action) {
        if (!postId) {
            await savePost(action === 'publish' ? 'published' : 'draft');
            return;
        }

        const token = getToken();
        if (!token) {
            router.replace('/admin/login');
            return;
        }

        try {
            setSaving(true);
            setError('');
            const response = await fetchApi(`/admin/posts/${postId}/${action}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setForm(normalizeIncomingPost(response.data));
            setNotice(action === 'publish' ? 'Post published.' : 'Post moved back to draft.');
        } catch (publishError) {
            if (publishError.message === 'Session expired') {
                clearToken();
                router.replace('/admin/login');
                return;
            }

            setError(publishError.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="panel">Loading post editor...</div>;
    }

    return (
        <div className="editor-card stack">
            <div className="editor-header">
                <div>
                    <div className="muted">{postId ? 'Edit post' : 'New post'}</div>
                    <h2 style={{ margin: '0.35rem 0 0' }}>{form.title || 'Untitled draft'}</h2>
                </div>
                <div className="button-row">
                    <button className="button-secondary" onClick={() => router.push('/admin/posts')}>
                        Back to posts
                    </button>
                    <button className="button-secondary" disabled={saving} onClick={() => savePost('draft')}>
                        {saving ? 'Saving...' : 'Save draft'}
                    </button>
                    <button className="button" disabled={saving} onClick={() => savePost('published')}>
                        {saving ? 'Saving...' : (postId ? 'Save as published' : 'Create & publish')}
                    </button>
                    {postId ? (
                        <>
                            <button className="button" disabled={saving} onClick={() => changePublishState('publish')}>
                                Publish
                            </button>
                            <button className="button-danger" disabled={saving} onClick={() => changePublishState('unpublish')}>
                                Unpublish
                            </button>
                        </>
                    ) : null}
                </div>
            </div>

            {notice ? <div className="notice">{notice}</div> : null}
            {error ? <div className="notice error">{error}</div> : null}

            <div className="split-grid">
                <div className="stack">
                    <label>
                        Title
                        <input className="input" value={form.title} onChange={(event) => handleTitleChange(event.target.value)} />
                    </label>

                    <label>
                        Slug
                        <input className="input" value={form.slug} onChange={(event) => updateField('slug', slugify(event.target.value))} />
                    </label>

                    <label>
                        Excerpt
                        <textarea className="textarea" value={form.excerpt} onChange={(event) => updateField('excerpt', event.target.value)} />
                    </label>

                    <div className="inline-fields">
                        <label>
                            Tags
                            <input
                                className="input"
                                value={form.tags.join(', ')}
                                onChange={(event) => updateField('tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))}
                                placeholder="react, postgres, essays"
                            />
                        </label>

                        <label>
                            Status
                            <select className="select" value={form.status} onChange={(event) => updateField('status', event.target.value)}>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </label>
                    </div>

                    <label>
                        <input
                            type="checkbox"
                            checked={form.is_featured}
                            onChange={(event) => updateField('is_featured', event.target.checked)}
                            style={{ marginRight: '0.5rem' }}
                        />
                        Featured on homepage
                    </label>

                    <div className="stack">
                        <div className="admin-toolbar">
                            <h3>Assets</h3>
                            <button className="button-secondary" type="button" onClick={addAsset}>
                                Add asset
                            </button>
                        </div>

                        {form.assets.map((asset, index) => (
                            <div key={`${asset.url}-${index}`} className="asset-editor stack">
                                <label>
                                    Label
                                    <input className="input" value={asset.label} onChange={(event) => updateAsset(index, 'label', event.target.value)} />
                                </label>
                                <label>
                                    URL
                                    <input className="input" value={asset.url} onChange={(event) => updateAsset(index, 'url', event.target.value)} />
                                </label>
                                <label>
                                    Type
                                    <select
                                        className="select"
                                        value={asset.asset_type}
                                        onChange={(event) => updateAsset(index, 'asset_type', event.target.value)}
                                    >
                                        <option value="image">image</option>
                                        <option value="file">file</option>
                                        <option value="pdf">pdf</option>
                                        <option value="spreadsheet">spreadsheet</option>
                                        <option value="notebook">notebook</option>
                                        <option value="other">other</option>
                                    </select>
                                </label>
                                <button className="button-danger" type="button" onClick={() => removeAsset(index)}>
                                    Remove asset
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="stack">
                    <label>
                        Markdown body
                        <div data-color-mode="light">
                            <MDEditor value={form.content_markdown} onChange={handleMarkdownChange} preview="edit" height={540} />
                        </div>
                    </label>

                    <div className="panel">
                        <div className="muted" style={{ marginBottom: '0.75rem' }}>Live preview</div>
                        <MarkdownArticle content={form.content_markdown} />
                    </div>
                </div>
            </div>
        </div>
    );
}
