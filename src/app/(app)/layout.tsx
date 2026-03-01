import Link from "next/link"
import { Topbar } from "@/components/layout/topbar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Topbar user={user} />
            <main className="flex-1 flex flex-col items-center p-6">
                {children}
            </main>
        </div>
    )
}
