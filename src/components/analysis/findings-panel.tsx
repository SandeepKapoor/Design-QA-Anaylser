'use client'

import { Finding } from '@/lib/store/useComparisonStore'
import { ArrowRight } from 'lucide-react'

const categoryConfig: Record<string, { color: string; bg: string; icon: string; label: string }> = {
    spacing: { color: 'text-[#FF6B35]', bg: 'bg-[#FF6B35]/10', icon: '📐', label: 'Spacing' },
    typography: { color: 'text-[#A78BFA]', bg: 'bg-[#A78BFA]/10', icon: '🔤', label: 'Typography' },
    color: { color: 'text-[#FFD166]', bg: 'bg-[#FFD166]/10', icon: '🎨', label: 'Color' },
    layout: { color: 'text-[#F472B6]', bg: 'bg-[#F472B6]/10', icon: '📏', label: 'Layout' },
    component: { color: 'text-[#34D399]', bg: 'bg-[#34D399]/10', icon: '🧩', label: 'Component' },
    content: { color: 'text-[#00E0FF]', bg: 'bg-[#00E0FF]/10', icon: '📝', label: 'Content' },
}

export function FindingsPanel({ findings }: { findings: Finding[] }) {
    if (findings.length === 0) {
        return (
            <div className="p-8 text-center bg-surface-primary border border-border rounded-xl">
                <h3 className="font-medium text-text-primary mb-2">No differences found</h3>
                <p className="text-sm text-text-secondary">The two screenshots appear visually identical.</p>
            </div>
        )
    }

    // Count findings per category
    const categoryCounts: Record<string, number> = {}
    findings.forEach(f => {
        categoryCounts[f.category] = (categoryCounts[f.category] || 0) + 1
    })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-display font-bold text-xl uppercase tracking-wider text-text-primary">
                    UI Audit Report
                </h3>
                <span className="text-sm font-medium bg-surface-elevated px-3 py-1 rounded-full text-text-secondary border border-border">
                    {findings.length} issue{findings.length === 1 ? '' : 's'}
                </span>
            </div>

            {/* Category Summary Bar */}
            <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(categoryCounts).map(([cat, count]) => {
                    const config = categoryConfig[cat] || categoryConfig.content
                    return (
                        <span
                            key={cat}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border border-border ${config.bg} ${config.color}`}
                        >
                            <span>{config.icon}</span>
                            {config.label}: {count}
                        </span>
                    )
                })}
            </div>

            <div className="grid gap-3">
                {findings.map((finding) => {
                    const config = categoryConfig[finding.category] || categoryConfig.content

                    return (
                        <div
                            key={finding.id}
                            className="group flex flex-col gap-3 p-4 bg-surface-primary border border-border rounded-xl hover:bg-surface-elevated hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                        >
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.bg.replace('/10', '')}`} />

                            <div className="ml-2 space-y-2">
                                {/* Category + Severity */}
                                <div className="flex items-center gap-2">
                                    <span className="text-base" role="img" aria-label={finding.category}>{config.icon}</span>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>
                                        [{finding.category}]
                                    </span>
                                    {finding.severity === 'high' && (
                                        <span className="text-[10px] uppercase font-bold bg-accent-warm/20 text-accent-warm px-2 py-0.5 rounded-sm ml-1">
                                            High Impact
                                        </span>
                                    )}
                                    {finding.severity === 'medium' && (
                                        <span className="text-[10px] uppercase font-bold bg-amber-400/20 text-amber-400 px-2 py-0.5 rounded-sm ml-1">
                                            Medium
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                <p className="text-sm font-medium text-text-primary leading-snug">
                                    {finding.description}
                                </p>

                                {/* Expected → Actual */}
                                {(finding.expected || finding.actual) && (
                                    <div className="flex items-center gap-2 bg-surface-elevated/60 border border-border rounded-lg px-3 py-2 text-xs font-mono">
                                        {finding.expected && (
                                            <span className="text-accent-green/80">
                                                {finding.expected}
                                            </span>
                                        )}
                                        {finding.expected && finding.actual && (
                                            <ArrowRight className="w-3 h-3 text-text-secondary flex-shrink-0" />
                                        )}
                                        {finding.actual && (
                                            <span className="text-accent-warm/80">
                                                {finding.actual}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Location hint */}
                                <p className="text-xs text-text-secondary">
                                    Location: <span className="text-text-primary/70">{finding.location_hint}</span>
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
