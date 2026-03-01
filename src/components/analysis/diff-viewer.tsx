'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { SplitSquareHorizontal, Layers, Highlighter, Columns } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ViewMode = 'side-by-side' | 'blend' | 'highlight' | 'slider'

interface DiffViewerProps {
    imageA: File
    imageB: File
    diffImageUrl: string | null
}

export function DiffViewer({ imageA, imageB, diffImageUrl }: DiffViewerProps) {
    const [mode, setMode] = useState<ViewMode>('slider')
    const [urlA, setUrlA] = useState('')
    const [urlB, setUrlB] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    // Slider positioning
    const [sliderPosition, setSliderPosition] = useState(50)
    const isDragging = useRef(false)

    useEffect(() => {
        setUrlA(URL.createObjectURL(imageA))
        setUrlB(URL.createObjectURL(imageB))
        return () => {
            URL.revokeObjectURL(urlA)
            URL.revokeObjectURL(urlB)
        }
    }, [imageA, imageB])

    // "Curtain Reveal" signature moment on mount
    useEffect(() => {
        if (mode === 'slider') {
            const timer = setTimeout(() => {
                setSliderPosition(20)
                setTimeout(() => setSliderPosition(80), 600)
                setTimeout(() => setSliderPosition(50), 1200)
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [mode])

    const handlePointerDown = () => {
        isDragging.current = true
    }

    const handlePointerUp = () => {
        isDragging.current = false
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging.current || !containerRef.current || mode !== 'slider') return
        const rect = containerRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
        setSliderPosition((x / rect.width) * 100)
    }

    return (
        <div className="space-y-6 w-full">
            {/* Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2 bg-surface-primary p-2 rounded-xl border border-border w-fit mx-auto shadow-lg">
                <Button
                    variant={mode === 'slider' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('slider')}
                    className={mode === 'slider' ? 'bg-accent-cyan text-background' : 'text-text-secondary'}
                >
                    <SplitSquareHorizontal className="w-4 h-4 mr-2" /> Slider
                </Button>
                <Button
                    variant={mode === 'side-by-side' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('side-by-side')}
                    className={mode === 'side-by-side' ? 'bg-accent-cyan text-background' : 'text-text-secondary'}
                >
                    <Columns className="w-4 h-4 mr-2" /> Side-by-Side
                </Button>
                <Button
                    variant={mode === 'blend' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('blend')}
                    className={mode === 'blend' ? 'bg-accent-cyan text-background' : 'text-text-secondary'}
                >
                    <Layers className="w-4 h-4 mr-2" /> Overlay Blend
                </Button>
                <Button
                    variant={mode === 'highlight' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('highlight')}
                    disabled={!diffImageUrl}
                    className={mode === 'highlight' ? 'bg-accent-cyan text-background' : 'text-text-secondary'}
                >
                    <Highlighter className="w-4 h-4 mr-2" /> Highlight Diff
                </Button>
            </div>

            {/* Viewer Area */}
            <div
                className="w-full bg-surface-elevated rounded-xl border border-border shadow-2xl overflow-hidden relative select-none"
                style={{ minHeight: '500px' }}
            >
                {mode === 'side-by-side' && (
                    <div className="grid grid-cols-2 h-full absolute inset-0">
                        <div className="border-r border-border h-full p-4 flex items-center justify-center">
                            <img src={urlA} className="max-w-full max-h-full object-contain" alt="A" />
                        </div>
                        <div className="h-full p-4 flex items-center justify-center">
                            <img src={urlB} className="max-w-full max-h-full object-contain" alt="B" />
                        </div>
                    </div>
                )}

                {mode === 'blend' && (
                    <div className="absolute inset-0 flex items-center justify-center p-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMjIyIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIHg9IjQiIHk9IjQiIGZpbGw9IiMyMjIiPjwvcmVjdD4KPC9zdmc+')]">
                        <div className="relative max-w-full max-h-full aspect-auto mix-blend-difference opacity-90">
                            <img src={urlA} className="absolute inset-0 object-contain w-full h-full opacity-50" alt="A" />
                            <img src={urlB} className="relative object-contain max-w-full max-h-full opacity-50" alt="B" />
                        </div>
                    </div>
                )}

                {mode === 'highlight' && diffImageUrl && (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <img src={diffImageUrl} className="max-w-full max-h-full object-contain drop-shadow-[0_0_12px_rgba(255,107,53,0.3)]" alt="Diff Highlight" />
                    </div>
                )}

                {mode === 'slider' && (
                    <div
                        ref={containerRef}
                        className="absolute inset-0 flex items-center justify-center cursor-ew-resize overflow-hidden touch-none"
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        onPointerMove={handlePointerMove}
                        onPointerLeave={handlePointerUp}
                    >
                        {/* Background Image (B - Actual) */}
                        <div className="absolute flex items-center justify-center w-full h-full p-4 bg-surface-primary">
                            <img src={urlB} className="max-w-full max-h-full object-contain pointer-events-none" alt="Actual" />
                        </div>

                        {/* Foreground Image (A - Expected) with clip-path */}
                        <div
                            className="absolute flex items-center justify-center w-full h-full p-4 bg-surface-elevated pointer-events-none transition-all duration-75 ease-out"
                            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                        >
                            <img src={urlA} className="max-w-full max-h-full object-contain" alt="Expected" />
                        </div>

                        {/* Slider Handle Line */}
                        <div
                            className="absolute top-0 bottom-0 w-1 bg-accent-cyan shadow-[0_0_12px_rgba(0,224,255,0.8)] z-10 transition-all duration-75 ease-out flex items-center justify-center pointer-events-none"
                            style={{ left: `calc(${sliderPosition}%)` }}
                        >
                            <div className="w-8 h-8 rounded-full bg-accent-cyan text-background flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-ew-resize pointer-events-auto border-2 border-background">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18 6-6-6-6" /><path d="m9 18-6-6 6-6" /></svg>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
