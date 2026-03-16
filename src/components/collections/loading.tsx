export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="h-8 bg-muted animate-pulse rounded w-1/4 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
                ))}
            </div>
        </div>
    )
}
