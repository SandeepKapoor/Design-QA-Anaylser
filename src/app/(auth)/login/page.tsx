import Link from "next/link"
import { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
    title: "Login | Design QA Analyser",
    description: "Login to your account",
}

export default function LoginPage() {
    return (
        <div className="space-y-6">
            <div className="bg-surface-primary rounded-xl p-8 border border-border shadow-xl">
                <div className="space-y-2 mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
                    <p className="text-text-secondary">
                        Enter your email to sign in to your account
                    </p>
                </div>

                <LoginForm />

                <div className="mt-6 text-center text-sm">
                    <p className="text-text-secondary">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/signup"
                            className="text-accent-cyan underline underline-offset-4 hover:text-accent-cyan/80 transition-colors"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
