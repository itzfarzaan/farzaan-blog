'use client';

import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '../lib/site-config';

function SearchIcon({ size = 16 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </svg>
    );
}

export default function IntroBand({ query, onQueryChange, isSearching }) {
    const [isOpen, setIsOpen] = useState(false);
    const [avatarBroken, setAvatarBroken] = useState(false);
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
                <div className="intro__left">
                    <span className="intro__hi">{siteConfig.intro}</span>
                    <span className="intro__divider" aria-hidden="true" />
                    <span className="intro__card">
                        {siteConfig.avatarSrc && !avatarBroken ? (
                            <img
                                className="intro__avatar"
                                src={siteConfig.avatarSrc}
                                alt=""
                                onError={() => setAvatarBroken(true)}
                            />
                        ) : (
                            <span className="intro__avatar intro__avatar--placeholder" aria-hidden="true" />
                        )}
                        <span>{siteConfig.tagline}</span>
                    </span>
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
