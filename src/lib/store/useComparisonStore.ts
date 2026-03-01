import { create } from 'zustand'

export type AnalysisStep = 'idle' | 'normalising' | 'comparing' | 'ai' | 'complete' | 'error'

export interface Finding {
    id: string
    category: 'layout' | 'colour' | 'typography' | 'content' | 'removed'
    severity: 'high' | 'medium' | 'low'
    description: string
    location_hint: string
}

export interface ComparisonState {
    imageA: File | null
    imageB: File | null
    step: AnalysisStep
    progress: number
    score: number | null
    diffImageUrl: string | null
    findings: Finding[]
    setImageA: (file: File | null) => void
    setImageB: (file: File | null) => void
    setStep: (step: AnalysisStep, progress?: number) => void
    setResults: (score: number, diffUrl: string, findings: Finding[]) => void
    reset: () => void
}

export const useComparisonStore = create<ComparisonState>((set) => ({
    imageA: null,
    imageB: null,
    step: 'idle',
    progress: 0,
    score: null,
    diffImageUrl: null,
    findings: [],
    setImageA: (file) => set({ imageA: file }),
    setImageB: (file) => set({ imageB: file }),
    setStep: (step, progress) => set((state) => ({
        step,
        progress: progress !== undefined ? progress : state.progress
    })),
    setResults: (score, diffUrl, findings) => set({
        score,
        diffImageUrl: diffUrl,
        findings,
        step: 'complete',
        progress: 100
    }),
    reset: () => set({
        imageA: null,
        imageB: null,
        step: 'idle',
        progress: 0,
        score: null,
        diffImageUrl: null,
        findings: []
    }),
}))
