import Spots from "@/components/spots"
import SpotsLoading from "@/components/spots/loading"
import { Suspense } from 'react'

export default function SpotsPage() {
    return (
        <>
            <Suspense fallback={<SpotsLoading />}>
                <Spots />
            </Suspense>
        </>
    )
}