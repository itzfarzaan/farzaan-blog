'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { siteConfig } from '../lib/site-config';
import { fetchApi } from '../lib/api';

const AVATAR_RENDER_SIZE = 144;
const TAG_AUTOCOMPLETE_PATTERN = /^#([\w-]*)$/;

function SearchIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </svg>
    );
}

function Avatar({ src }) {
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(!src);
    const imgRef = useRef(null);

    useEffect(() => {
        const node = imgRef.current;
        if (!node) {
            return;
        }
        if (node.complete && node.naturalWidth > 0) {
            setLoaded(true);
        } else if (node.complete) {
            setFailed(true);
        }
    }, []);

    if (failed) {
        return <span className="intro-avatar intro-avatar--placeholder" aria-hidden="true" />;
    }

    return (
        <>
            {!loaded ? <span className="intro-avatar intro-avatar--placeholder" aria-hidden="true" /> : null}
            <Image
                ref={imgRef}
                className="intro-avatar"
                src={src}
                alt=""
                width={AVATAR_RENDER_SIZE}
                height={AVATAR_RENDER_SIZE}
                priority
                onLoad={() => setLoaded(true)}
                onError={() => setFailed(true)}
                style={{ display: loaded ? 'block' : 'none' }}
            />
        </>
    );
}

export default function IntroBand({ query, onQueryChange, isSearching, forceOpen = false }) {
    const [isOpen, setIsOpen] = useState(forceOpen);
    const [suggestions, setSuggestions] = useState([]);
    const [highlightIndex, setHighlightIndex] = useState(0);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (forceOpen) {
            setIsOpen(true);
        }
    }, [forceOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        function handleKey(event) {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
                onQueryChange('');
            }
        }

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOpen, onQueryChange]);

    useEffect(() => {
        if (!isOpen) {
            setSuggestions([]);
            return;
        }

        const match = query.match(TAG_AUTOCOMPLETE_PATTERN);
        if (!match) {
            setSuggestions([]);
            return;
        }

        const prefix = match[1];
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const params = new URLSearchParams({ limit: '10' });
                if (prefix) {
                    params.set('prefix', prefix);
                }
                const response = await fetchApi(`/tags?${params.toString()}`, {
                    signal: controller.signal,
                });
                setSuggestions(response.data || []);
                setHighlightIndex(0);
            } catch (fetchError) {
                if (fetchError.name !== 'AbortError') {
                    setSuggestions([]);
                }
            }
        }, 150);

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [isOpen, query]);

    useEffect(() => {
        function onDocPointer(event) {
            if (suggestions.length === 0) {
                return;
            }
            if (dropdownRef.current?.contains(event.target)) {
                return;
            }
            if (inputRef.current?.contains(event.target)) {
                return;
            }
            setSuggestions([]);
        }
        document.addEventListener('mousedown', onDocPointer);
        return () => document.removeEventListener('mousedown', onDocPointer);
    }, [suggestions.length]);

    function toggleSearch() {
        setIsOpen((current) => {
            const next = !current;
            if (!next) {
                onQueryChange('');
                setSuggestions([]);
            }
            return next;
        });
    }

    function selectSuggestion(tag) {
        if (!tag) {
            return;
        }
        onQueryChange(`#${tag.slug}`);
        setSuggestions([]);
        inputRef.current?.focus();
    }

    function handleInputKey(event) {
        if (suggestions.length === 0) {
            return;
        }
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setHighlightIndex((current) => Math.min(suggestions.length - 1, current + 1));
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setHighlightIndex((current) => Math.max(0, current - 1));
        } else if (event.key === 'Enter') {
            event.preventDefault();
            selectSuggestion(suggestions[highlightIndex]);
        } else if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            setSuggestions([]);
        }
    }

    return (
        <>
            <section className="intro">
                <Avatar src={siteConfig.avatarSrc} />
                <div className="intro__main">
                    <h2 className="intro__heading">{siteConfig.heading}</h2>
                    <p className="intro__text">{siteConfig.intro}</p>
                </div>
                <button
                    type="button"
                    className="search-trigger"
                    onClick={toggleSearch}
                    aria-label={isOpen ? 'Close search' : 'Open search'}
                    aria-expanded={isOpen}
                >
                    <SearchIcon />
                </button>
            </section>

            {isOpen ? (
                <div className="search-bar" role="search">
                    <span className="search-bar__icon"><SearchIcon size={14} /></span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-bar__input"
                        placeholder="Search posts or #tag"
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
                        onKeyDown={handleInputKey}
                        autoComplete="off"
                        spellCheck="false"
                    />
                    {isSearching ? <span className="search-bar__status">Searching</span> : null}
                    <button
                        type="button"
                        className="search-bar__close"
                        onClick={toggleSearch}
                        aria-label="Close search"
                    >
                        Esc
                    </button>

                    {suggestions.length > 0 ? (
                        <ul className="search-suggestions" ref={dropdownRef} role="listbox">
                            {suggestions.map((tag, index) => (
                                <li
                                    key={tag.id || tag.slug}
                                    role="option"
                                    aria-selected={index === highlightIndex}
                                    className={`search-suggestions__item${index === highlightIndex ? ' search-suggestions__item--active' : ''}`}
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                        selectSuggestion(tag);
                                    }}
                                    onMouseEnter={() => setHighlightIndex(index)}
                                >
                                    <span className="search-suggestions__name">#{tag.slug}</span>
                                    <span className="search-suggestions__count">{tag.post_count}</span>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            ) : null}
        </>
    );
}
