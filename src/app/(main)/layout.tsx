import MainLayoutComponent from "@/components/layout/main-layout"
export default function MainLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (<>
        <MainLayoutComponent children={children} />
    </>)
}