import Travels from "@/components/travels"
import TravelsLoading from "@/components/travels/loading"
import { Suspense } from 'react'

export default function TravelsPage() {
    return (
        <>
            <Suspense fallback={<TravelsLoading />}>
                <Travels />
            </Suspense>
        </>
    )
}