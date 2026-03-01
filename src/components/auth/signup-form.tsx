'use client'

import { useState } from 'react'
import { signup } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SignupForm() {
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(formData: FormData) {
        setIsLoading(true)
        setError(null)
        const result = await signup(formData)
        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        }
    }

    return (
        <form action={onSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    disabled={isLoading}
                    className="bg-background border-border focus:border-border-active"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                    className="bg-background border-border focus:border-border-active"
                />
            </div>

            {error && (
                <div className="p-3 rounded bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                </div>
            )}

            <Button type="submit" className="w-full bg-accent-cyan text-background hover:brightness-105 transition-all" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign up"}
            </Button>

            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-surface-primary px-2 text-text-secondary">
                        Or continue with
                    </span>
                </div>
            </div>

            <Button type="button" variant="outline" className="w-full bg-background border-border text-foreground hover:bg-surface-elevated hover:text-foreground" disabled>
                Google (Coming Soon)
            </Button>
        </form>
    )
}
