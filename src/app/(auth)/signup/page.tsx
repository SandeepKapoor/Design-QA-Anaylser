import Link from "next/link"
import { Metadata } from "next"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
    title: "Sign up | Design QA Analyser",
    description: "Create a new account",
}

export default function SignupPage() {
    return (
        <div className="space-y-6">
            <div className="bg-surface-primary rounded-xl p-8 border border-border shadow-xl">
                <div className="space-y-2 mb-6">
                    <h2 className="text-2xl font-bold tracking-tight">Create an account</h2>
                    <p className="text-text-secondary">
                        Enter your email below to create your account
                    </p>
                </div>

                <SignupForm />

                <div className="mt-6 text-center text-sm">
                    <p className="text-text-secondary">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-accent-cyan underline underline-offset-4 hover:text-accent-cyan/80 transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
