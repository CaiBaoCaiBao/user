import Collections from '@/components/collections'
import Loading from '@/components/collections/loading'
import { Suspense } from 'react'

export default function CollectionsPage() {
    return (
        <Suspense fallback={<Loading />}>
            <Collections />
        </Suspense>
    )
}
