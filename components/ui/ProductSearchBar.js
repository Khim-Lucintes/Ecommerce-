'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function ProductSearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [value, setValue] = useState(searchParams.get('q') || '');
    const inputRef = useRef(null);

    // Keep input in sync if URL changes externally (e.g. browser back)
    useEffect(() => {
        setValue(searchParams.get('q') || '');
    }, [searchParams]);

    const commit = (text) => {
        const params = new URLSearchParams(searchParams.toString());
        if (text.trim()) {
            params.set('q', text.trim());
        } else {
            params.delete('q');
        }
        // Reset to page 1 when searching
        params.delete('offset');
        router.push(`/products?${params.toString()}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') commit(value);
        if (e.key === 'Escape') {
            setValue('');
            commit('');
            inputRef.current?.blur();
        }
    };

    const handleClear = () => {
        setValue('');
        commit('');
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full sm:w-80">
            {/* Search icon */}
            <svg
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>

            <input
                ref={inputRef}
                id="product-search"
                type="search"
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search products…"
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-9 text-sm shadow-sm outline-none transition
                           placeholder:text-gray-400
                           focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
                           hover:border-gray-300"
            />

            {/* Clear button — only shown when there's text */}
            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}
