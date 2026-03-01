'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function Topbar({ user }: { user: User }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const navItems = [
        { label: "New ⌘N", href: "/app/compare" },
        { label: "History", href: "/app/history" },
        { label: "Settings", href: "/settings" },
    ]

    return (
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="flex items-center gap-8">
                <Link href="/app/compare" className="flex items-center gap-2">
                    <span className="font-display font-bold text-xl tracking-tight">
                        ◈ Design QA
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href === '/app/compare' && pathname === '/app')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-4 py-2 text-sm font-medium transition-all relative ${isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary hover:bg-surface-elevated rounded-md"
                                    }`}
                            >
                                {item.label}
                                {isActive && (
                                    <span className="absolute bottom-[-16px] left-0 right-0 h-[2px] bg-accent-cyan rounded-t-md shadow-[0_-2px_8px_rgba(0,224,255,0.4)]" />
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-sm text-text-secondary hidden sm:inline-block">
                        {user.email}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center font-medium overflow-hidden">
                        {user.email?.[0].toUpperCase() || 'U'}
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="border-border text-text-secondary hover:text-text-primary hover:bg-surface-elevated"
                >
                    Sign Out
                </Button>
            </div>
        </header>
    )
}
