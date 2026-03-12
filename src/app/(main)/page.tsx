import Home from "@/components/home"
import Loading from "@/components/home/loading"
import { Suspense } from "react"
export default function HomePage() {
    return (<>
        <Suspense fallback={<Loading />}>
            <Home />
        </Suspense>

    </>)
}