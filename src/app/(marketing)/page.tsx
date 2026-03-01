import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="px-6 h-20 flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-2xl tracking-tight text-text-primary">
                        ◈ Design QA
                    </span>
                </div>
                <nav className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                        Sign In
                    </Link>
                    <Link href="/signup">
                        <Button className="bg-surface-elevated text-text-primary border border-border hover:bg-border transition-colors">
                            Get Started
                        </Button>
                    </Link>
                </nav>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto py-20">
                <div className="space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-1000 ease-out fill-mode-both">
                    <h2 className="text-accent-cyan uppercase tracking-widest text-sm font-semibold">
                        See exactly what changed.
                    </h2>
                    <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-text-primary leading-[1.1]">
                        Visual diffs for <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-green">
                            elite product teams.
                        </span>
                    </h1>
                    <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto font-light">
                        Instantly compare screenshots frame-by-frame. Drop your expected design and your actual build, and let AI catch the visual regressions.
                    </p>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup">
                            <Button size="lg" className="h-14 px-8 text-base bg-accent-cyan text-background hover:brightness-110 shadow-[0_0_32px_rgba(0,224,255,0.25)] hover:shadow-[0_0_48px_rgba(0,224,255,0.4)] transition-all rounded-full font-medium">
                                Start Comparing Free →
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="mt-24 w-full aspect-video rounded-xl bg-surface-primary border border-border shadow-2xl overflow-hidden relative flex items-center justify-center animate-in slide-in-from-bottom-12 fade-in duration-1000 delay-300 ease-out fill-mode-both">
                    {/* Mock UI Demo Area */}
                    <div className="text-text-secondary font-mono text-sm opacity-50">
                        [ Product Demo Animation Placeholder ]
                    </div>
                </div>
            </main>

            <footer className="border-t border-border py-8 text-center text-text-secondary text-sm">
                <p>Works with any screenshot · No integrations needed · Results in seconds</p>
            </footer>
        </div>
    )
}
