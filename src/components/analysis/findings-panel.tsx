'use client'

import { Finding } from '@/lib/store/useComparisonStore'

const categoryConfig: Record<string, { color: string; bg: string; icon: string }> = {
    layout: { color: 'text-[#FF6B35]', bg: 'bg-[#FF6B35]/10', icon: '🔴' },
    colour: { color: 'text-[#FFD166]', bg: 'bg-[#FFD166]/10', icon: '🟡' },
    typography: { color: 'text-[#A78BFA]', bg: 'bg-[#A78BFA]/10', icon: '🟣' },
    content: { color: 'text-[#00E0FF]', bg: 'bg-[#00E0FF]/10', icon: '🔵' },
    removed: { color: 'text-[#F87171]', bg: 'bg-[#F87171]/10', icon: '❌' },
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-xl uppercase tracking-wider text-text-primary">
                    What Changed
                </h3>
                <span className="text-sm font-medium bg-surface-elevated px-3 py-1 rounded-full text-text-secondary border border-border">
                    Found {findings.length} difference{findings.length === 1 ? '' : 's'}
                </span>
            </div>

            <div className="grid gap-3">
                {findings.map((finding) => {
                    const config = categoryConfig[finding.category] || categoryConfig.layout

                    return (
                        <div
                            key={finding.id}
                            className="group flex flex-col sm:flex-row gap-4 p-4 bg-surface-primary border border-border rounded-xl hover:bg-surface-elevated hover:shadow-lg transition-all duration-300 relative overflow-hidden"
                        >
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.bg.replace('/10', '')}`} />

                            <div className="flex-1 space-y-1 ml-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-base" role="img" aria-label={finding.category}>{config.icon}</span>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>
                                        [{finding.category}]
                                    </span>
                                    {finding.severity === 'high' && (
                                        <span className="text-[10px] uppercase font-bold bg-accent-warm/20 text-accent-warm px-2 py-0.5 rounded-sm ml-2">
                                            High Impact
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-text-primary leading-snug">
                                    {finding.description}
                                </p>
                                <p className="text-xs text-text-secondary pt-1">
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
