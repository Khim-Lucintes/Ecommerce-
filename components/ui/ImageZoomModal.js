'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

const ZOOM = 2.5; // magnification factor

export default function ImageZoomModal({ src, alt }) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [hovered, setHovered]           = useState(false);
    const [imgStyle, setImgStyle]         = useState({});
    const containerRef                    = useRef(null);

    // Move the enlarged image so the cursor area is always centred in the viewport
    const handleMouseMove = useCallback((e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        // Cursor relative to container (0 → 1)
        const rx = (e.clientX - rect.left)  / rect.width;
        const ry = (e.clientY - rect.top)   / rect.height;

        // Shift the zoomed image so the hovered spot stays visible
        // left ranges: 0  (rx=0)  →  -W*(ZOOM-1)  (rx=1)
        const tx = -rx * rect.width  * (ZOOM - 1);
        const ty = -ry * rect.height * (ZOOM - 1);

        setImgStyle({
            transform:        `scale(${ZOOM})`,
            transformOrigin:  '0 0',
            translate:        `${tx}px ${ty}px`,
        });
    }, []);

    // Close lightbox on Escape
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') setLightboxOpen(false);
    }, []);

    useEffect(() => {
        if (lightboxOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [lightboxOpen, handleKeyDown]);

    if (!src) return null;

    return (
        <>
            {/* ── Zoom container ───────────────────────────────────────── */}
            <div
                ref={containerRef}
                className="absolute inset-0 overflow-hidden cursor-crosshair"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => { setHovered(false); setImgStyle({}); }}
                onMouseMove={handleMouseMove}
            >
                <img
                    src={src}
                    alt={alt}
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-cover select-none"
                    style={hovered ? {
                        ...imgStyle,
                        transition: 'none',    // instant tracking — no lag
                        willChange: 'transform',
                    } : {
                        transition: 'transform 0.2s ease',
                    }}
                />

                {/* Full-view button */}
                <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    aria-label="Open full image"
                    className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full
                               bg-black/40 px-3 py-1.5 text-xs text-white backdrop-blur-sm
                               opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity
                               group-hover:opacity-100 cursor-zoom-in"
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    Full view
                </button>
            </div>

            {/* ── Lightbox ─────────────────────────────────────────────── */}
            {lightboxOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Full view of ${alt}`}
                    onClick={() => setLightboxOpen(false)}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4
                               bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-h-[90vh] max-w-[90vw]
                                   animate-in zoom-in-95 fade-in duration-300 ease-out"
                    >
                        <img
                            src={src}
                            alt={alt}
                            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
                        />
                        <button
                            type="button"
                            onClick={() => setLightboxOpen(false)}
                            aria-label="Close"
                            className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center
                                       rounded-full bg-white text-gray-700 shadow-lg
                                       hover:bg-gray-100 transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/40 select-none pointer-events-none">
                        Press <kbd className="font-mono px-1 rounded bg-white/10">Esc</kbd> or click outside to close
                    </p>
                </div>
            )}
        </>
    );
}
