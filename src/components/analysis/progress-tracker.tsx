'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, CircleDashed, Loader2 } from 'lucide-react'
import { AnalysisStep } from '@/lib/store/useComparisonStore'

const steps: { key: AnalysisStep; label: string }[] = [
    { key: 'normalising', label: 'Normalising dimensions' },
    { key: 'comparing', label: 'Running pixel comparison' },
    { key: 'ai', label: 'Generating AI description' },
]

export function ProgressTracker({ currentStep, progress }: { currentStep: AnalysisStep; progress: number }) {

    const getStepStatus = (stepKey: AnalysisStep) => {
        const stepOrder = ['idle', 'normalising', 'comparing', 'ai', 'complete', 'error']
        const currentIndex = stepOrder.indexOf(currentStep)
        const thisIndex = stepOrder.indexOf(stepKey)

        if (currentStep === 'error') return 'error'
        if (thisIndex < currentIndex) return 'done'
        if (thisIndex === currentIndex) return 'active'
        return 'pending'
    }

    return (
        <div className="w-full max-w-xl mx-auto bg-surface-primary rounded-xl p-8 border border-border shadow-xl">
            <h3 className="text-xl font-bold mb-6 font-display">Analysing your screenshots</h3>

            <div className="space-y-4 mb-8">
                {steps.map((step) => {
                    const status = getStepStatus(step.key)

                    return (
                        <div key={step.key} className="flex items-center gap-3">
                            {status === 'done' ? (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-accent-green">
                                    <CheckCircle2 className="w-5 h-5 fill-accent-green/20" />
                                </motion.div>
                            ) : status === 'active' ? (
                                <Loader2 className="w-5 h-5 text-accent-cyan animate-spin" />
                            ) : (
                                <CircleDashed className="w-5 h-5 text-border" />
                            )}

                            <span className={`text-sm ${status === 'active' ? 'text-text-primary font-medium' : status === 'done' ? 'text-text-secondary' : 'text-text-secondary opacity-50'}`}>
                                {step.label}
                            </span>
                        </div>
                    )
                })}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs text-text-secondary">
                    <span>{progress === 100 ? 'Complete' : 'Processing...'}</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-surface-elevated rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-accent-cyan relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "easeOut", duration: 0.5 }}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
