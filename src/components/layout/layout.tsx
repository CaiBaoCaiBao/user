'use client'
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip"
export default function Layout({
    children
}: {
    children: React.ReactNode
}) {
    return (<>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
    </>)
}