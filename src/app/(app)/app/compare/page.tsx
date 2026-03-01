'use client'

import { useComparisonStore } from "@/lib/store/useComparisonStore"
import { UploadZone } from "@/components/upload/upload-zone"
import { Button } from "@/components/ui/button"
import { ProgressTracker } from "@/components/analysis/progress-tracker"
import { ScoreBadge } from "@/components/analysis/score-badge"
import { FindingsPanel } from "@/components/analysis/findings-panel"
import { DiffViewer } from "@/components/analysis/diff-viewer"
import { Play, RotateCcw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ComparePage() {
    const { imageA, imageB, setImageA, setImageB, step, setStep, progress, setResults, score, findings, diffImageUrl, reset } = useComparisonStore()
    const supabase = createClient()

    const handleAnalyse = async () => {
        if (!imageA || !imageB) return

        setStep('normalising', 10)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert("You must be logged in to compare designs.")
                return;
            }

            const compId = crypto.randomUUID()
            const extA = imageA.name.split('.').pop() || 'png'
            const extB = imageB.name.split('.').pop() || 'png'

            const pathA = `${user.id}/${compId}-design.${extA}`
            const pathB = `${user.id}/${compId}-build.${extB}`

            setStep('normalising', 30)

            // Upload files to Supabase Storage
            const [uploadA, uploadB] = await Promise.all([
                supabase.storage.from('designs').upload(pathA, imageA),
                supabase.storage.from('designs').upload(pathB, imageB)
            ])

            if (uploadA.error || uploadB.error) {
                console.error("Upload failed", uploadA.error, uploadB.error)
                throw new Error("Failed to upload images securely to Supabase.")
            }

            setStep('comparing', 50)

            const res = await fetch('/api/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectName: 'Interactive Verification',
                    designImage: pathA,
                    implementationImage: pathB
                })
            })

            setStep('ai', 80)

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Analysis failed")
            }

            setStep('complete', 100)

            setResults(
                data.score || 0,
                URL.createObjectURL(imageB),
                data.findings || []
            )

        } catch (err: any) {
            console.error(err)
            setStep('error', 100)
            alert(err.message || "An error occurred during analysis.")
        }
    }

    const isReady = imageA && imageB
    const isAnalysing = step !== 'idle' && step !== 'complete' && step !== 'error'
    const isComplete = step === 'complete'

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center animate-in fade-in duration-700 top-4 relative">
            <div className="text-center mb-10 mt-6">
                <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Start Comparison</h1>
                <p className="text-text-secondary">Upload both screenshots to see what visually changed.</p>
            </div>

            {!isAnalysing && !isComplete && (
                <div className="w-full max-w-5xl mx-auto">
                    <div className="w-full grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center mb-12 relative">
                        <UploadZone
                            label="Screenshot A (Expected)"
                            file={imageA}
                            onFileSelect={setImageA}
                        />

                        <div className="flex justify-center flex-col items-center py-4 text-text-secondary font-display font-bold text-xl opacity-40">
                            VS
                            {isReady && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent-cyan/10 rounded-full blur-3xl animate-pulse -z-10" />
                            )}
                        </div>

                        <UploadZone
                            label="Screenshot B (Actual)"
                            file={imageB}
                            onFileSelect={setImageB}
                        />
                    </div>

                    <div className="flex justify-center">
                        <Button
                            size="lg"
                            onClick={handleAnalyse}
                            disabled={!isReady}
                            className={`
                h-14 px-12 rounded-full font-medium text-base transition-all duration-300
                ${isReady
                                    ? 'bg-accent-cyan text-background shadow-[0_0_24px_rgba(0,224,255,0.3)] hover:shadow-[0_0_40px_rgba(0,224,255,0.5)] hover:scale-105'
                                    : 'bg-surface-elevated text-text-secondary border border-border cursor-not-allowed'}
              `}
                        >
                            <Play className={`w-5 h-5 mr-2 ${isReady ? 'fill-background' : ''}`} />
                            Analyse Screenshots
                        </Button>
                    </div>
                </div>
            )}

            {isAnalysing && (
                <div className="w-full py-12">
                    <ProgressTracker currentStep={step} progress={progress} />
                </div>
            )}

            {isComplete && imageA && imageB && score !== null && (
                <div className="w-full animate-in slide-in-from-bottom-16 fade-in duration-700 ease-out fill-mode-both space-y-12">

                    {/* Top Results Bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between bg-surface-primary border border-border rounded-2xl p-8 shadow-xl gap-8">
                        <div className="flex-1">
                            <h2 className="text-3xl font-display font-bold mb-2">Analysis Complete</h2>
                            <p className="text-text-secondary max-w-md">Our AI has analysed the per-pixel differences and structural layout shifts between your two uploaded screenshots.</p>
                            <Button onClick={reset} variant="outline" className="mt-6 border-border hover:bg-surface-elevated">
                                <RotateCcw className="w-4 h-4 mr-2" /> Start New Comparison
                            </Button>
                        </div>

                        <div className="flex-shrink-0">
                            <ScoreBadge score={score} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Visual Diff Viewers */}
                        <div className="lg:col-span-2">
                            <DiffViewer imageA={imageA} imageB={imageB} diffImageUrl={diffImageUrl} />
                        </div>

                        {/* Findings Panel */}
                        <div className="lg:col-span-1">
                            <FindingsPanel findings={findings} />
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
