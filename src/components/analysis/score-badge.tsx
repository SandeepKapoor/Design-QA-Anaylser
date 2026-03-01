'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'

export function ScoreBadge({ score }: { score: number }) {
    const [displayScore, setDisplayScore] = useState(0)

    useEffect(() => {
        let startTime: number
        const duration = 800 // ms

        const animate = (time: number) => {
            if (!startTime) startTime = time
            const progress = Math.min((time - startTime) / duration, 1)
            // easeOutCubic
            const easeProgress = 1 - Math.pow(1 - progress, 3)

            setDisplayScore(score * easeProgress)

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [score])

    let colorClass = 'text-accent-green'
    let ringClass = 'stroke-accent-green'
    let label = 'Strong Match'
    let Icon = CheckCircle2

    if (score < 50) {
        colorClass = 'text-accent-warm'
        ringClass = 'stroke-accent-warm'
        label = 'Significant Differences'
        Icon = XCircle
    } else if (score < 85) {
        colorClass = 'text-amber-400'
        ringClass = 'stroke-amber-400'
        label = 'Partial Match'
        Icon = AlertTriangle
    }

    const radius = 60
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (displayScore / 100) * circumference

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Background track */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 140 140">
                    <circle
                        cx="70" cy="70" r={radius}
                        className="stroke-border fill-none"
                        strokeWidth="8"
                    />
                    {/* Animated progress ring */}
                    <motion.circle
                        cx="70" cy="70" r={radius}
                        className={`${ringClass} fill-none drop-shadow-[0_0_8px_currentColor]`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        strokeDasharray={circumference}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    />
                </svg>

                <div className="flex flex-col items-center">
                    <span className={`font-display font-bold text-5xl ${colorClass} tracking-tighter`}>
                        {displayScore.toFixed(1)}
                    </span>
                    <span className="text-text-secondary font-light text-xl mt-1">%</span>
                </div>
            </div>

            <div className={`mt-4 flex items-center gap-2 ${colorClass} bg-surface-primary border border-border px-4 py-1.5 rounded-full shadow-lg`}>
                <Icon className="w-4 h-4" />
                <span className="font-medium text-sm">{label}</span>
            </div>
        </div>
    )
}
