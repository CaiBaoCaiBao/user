'use client'
import Header from "./header"
export default function MainLayoutComponent({
    children
}: {
    children: React.ReactNode
}) {
    return (<>
        <Header />
        {children}
    </>)
}