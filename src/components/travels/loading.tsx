export default function TravelsLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <div className="flex gap-2 max-w-2xl mx-auto">
                    <div className="flex-1 h-10 bg-muted animate-pulse rounded" />
                    <div className="w-24 h-10 bg-muted animate-pulse rounded" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
                ))}
            </div>
        </div>
    )
}
