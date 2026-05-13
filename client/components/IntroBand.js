'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { siteConfig } from '../lib/site-config';

const AVATAR_RENDER_SIZE = 144;

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

export default function IntroBand({ query, onQueryChange, isSearching }) {
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef(null);

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

    function toggleSearch() {
        setIsOpen((current) => {
            const next = !current;
            if (!next) {
                onQueryChange('');
            }
            return next;
        });
    }

    return (
        <>
            <section className="intro">
                <div className="intro__main">
                    <h2 className="intro__heading">{siteConfig.heading}</h2>
                    <p className="intro__text">{siteConfig.intro}</p>
                </div>
                <div className="intro__aside">
                    <button
                        type="button"
                        className="search-trigger"
                        onClick={toggleSearch}
                        aria-label={isOpen ? 'Close search' : 'Open search'}
                        aria-expanded={isOpen}
                    >
                        <SearchIcon />
                    </button>
                    <Avatar src={siteConfig.avatarSrc} />
                </div>
            </section>

            {isOpen ? (
                <div className="search-bar" role="search">
                    <span className="search-bar__icon"><SearchIcon size={14} /></span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-bar__input"
                        placeholder="Search posts"
                        value={query}
                        onChange={(event) => onQueryChange(event.target.value)}
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
                </div>
            ) : null}
        </>
    );
}
