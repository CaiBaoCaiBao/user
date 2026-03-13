import Destinations from "@/components/destinations"
import DestinationsLoading from "@/components/destinations/loading"
import { Suspense } from 'react'

export default function DestinationsPage() {
    return (
        <>
            <Suspense fallback={<DestinationsLoading />}>
                <Destinations />
            </Suspense>
        </>
    )
}