'use client'

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, History, ImageIcon, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

// Mock Data for MVP
const historyLogs = [
    {
        id: "run-001",
        date: "A few seconds ago",
        project: "Landing Page Update",
        score: 92.5,
        status: "partial",
        thumbnails: ["/mock-thumb-1.webp", "/mock-thumb-2.webp"],
    },
    {
        id: "run-002",
        date: "2 hours ago",
        project: "Auth Flow QA",
        score: 99.8,
        status: "match",
        thumbnails: ["/mock-thumb-1.webp", "/mock-thumb-2.webp"],
    },
    {
        id: "run-003",
        date: "Yesterday",
        project: "Dashboard Layout",
        score: 42.1,
        status: "fail",
        thumbnails: ["/mock-thumb-1.webp", "/mock-thumb-2.webp"],
    }
]

export default function HistoryPage() {
    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center animate-in fade-in duration-700 top-4 relative">
            <div className="w-full mb-10 mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
                        <History className="w-8 h-8 text-accent-cyan" /> Comparison History
                    </h1>
                    <p className="text-text-secondary">View all your past visual regression checks.</p>
                </div>
                <Link href="/app/compare">
                    <Button className="bg-accent-cyan text-background rounded-full px-6 shadow-lg shadow-accent-cyan/20 hover:scale-105 transition-all">
                        New Comparison ⌘N
                    </Button>
                </Link>
            </div>

            <div className="w-full grid gap-4">
                {historyLogs.map((log) => (
                    <Card key={log.id} className="bg-surface-primary border-border hover:bg-surface-elevated transition-colors overflow-hidden group">
                        <div className="flex flex-col md:flex-row items-center p-6 gap-6">

                            {/* Thumbnails block */}
                            <div className="flex -space-x-4 relative">
                                <div className="w-20 h-20 rounded-md bg-surface-elevated border border-border flex items-center justify-center relative z-10 shadow-lg group-hover:-translate-x-1 transition-transform">
                                    <ImageIcon className="w-6 h-6 text-text-secondary opacity-50" />
                                </div>
                                <div className="w-20 h-20 rounded-md bg-surface-primary border border-border flex items-center justify-center relative z-0 shadow-md group-hover:translate-x-1 transition-transform">
                                    <ImageIcon className="w-6 h-6 text-text-secondary opacity-50" />
                                </div>
                            </div>

                            {/* Info block */}
                            <div className="flex-1 space-y-1 text-center md:text-left">
                                <CardTitle className="text-xl font-display text-text-primary">{log.project}</CardTitle>
                                <CardDescription className="text-text-secondary flex items-center justify-center md:justify-start gap-2">
                                    <span>{log.date}</span>
                                    <span className="w-1 h-1 rounded-full bg-border-active"></span>
                                    <span className="font-mono text-xs">{log.id}</span>
                                </CardDescription>
                            </div>

                            {/* Status block */}
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-end">
                                    <span className="text-2xl font-display font-bold tabular-nums">
                                        {log.score}%
                                    </span>
                                    <span className="text-xs uppercase tracking-wider font-semibold text-text-secondary flex items-center gap-1">
                                        {log.status === 'match' && <><CheckCircle2 className="w-3 h-3 text-accent-green" /> Match</>}
                                        {log.status === 'partial' && <><AlertTriangle className="w-3 h-3 text-amber-400" /> Partial</>}
                                        {log.status === 'fail' && <><XCircle className="w-3 h-3 text-accent-warm" /> Fail</>}
                                    </span>
                                </div>

                                <Button variant="ghost" size="icon" className="group-hover:translate-x-1 group-hover:bg-surface-elevated transition-transform border border-transparent group-hover:border-border rounded-full">
                                    <ArrowRight className="w-5 h-5 text-accent-cyan" />
                                </Button>
                            </div>

                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
