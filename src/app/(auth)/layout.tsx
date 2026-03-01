import { Metadata } from "next"

export const metadata: Metadata = {
    title: "Authentication | Design QA Analyser",
    description: "Login or Sign up to Design QA Analyser.",
}

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="font-display font-bold text-3xl tracking-tight">
                        ◈ Design QA
                    </h1>
                    <p className="text-text-secondary mt-2">
                        See exactly what changed.
                    </p>
                </div>
                {children}
            </div>
        </div>
    )
}
