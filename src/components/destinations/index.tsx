'use client'

import { useState, useEffect } from 'react'
import { DestinationApi } from '@/api'
import type { DestinationInfo } from '@/api'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Destinations() {
    const router = useRouter()
    const [destinations, setDestinations] = useState<DestinationInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [keyword, setKeyword] = useState('')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const pageSize = 12

    // 获取目的地列表
    const fetchDestinations = async () => {
        try {
            setLoading(true)
            const response = await DestinationApi.getDestinations({
                page,
                pageSize,
                keyword: keyword || undefined,
            })
            setDestinations(response.data.data || [])
            setTotal(response.data.total || 0)
        } catch (error) {
            console.error('获取目的地失败:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDestinations()
    }, [page])

    // 搜索
    const handleSearch = () => {
        setPage(1)
        fetchDestinations()
    }

    // 跳转详情
    const goToDetail = (id: number) => {
        router.push(`/destinations/${id}`)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* 搜索栏 */}
            <div className="mb-8">
                <div className="flex gap-2 max-w-2xl mx-auto">
                    <Input
                        placeholder="搜索目的地..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-1"
                    />
                    <Button onClick={handleSearch}>
                        <Search className="w-4 h-4 mr-2" />
                        搜索
                    </Button>
                </div>
            </div>

            {/* 目的地列表 */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="h-80 animate-pulse" />
                    ))}
                </div>
            ) : destinations.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    暂无目的地数据
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {destinations.map((destination) => (
                            <Card
                                key={destination.id}
                                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => goToDetail(destination.id)}
                            >
                                {/* 封面图 */}
                                {destination.coverImage && (
                                    <div className="h-48 bg-muted overflow-hidden">
                                        <img
                                            src={destination.coverImage}
                                            alt={destination.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <CardContent className="p-4">
                                    <h3 className="text-lg font-semibold mb-2">
                                        {destination.name}
                                    </h3>
                                    {destination.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {destination.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4" />
                                        <span>
                                            {destination.country}
                                            {destination.province && ` · ${destination.province}`}
                                            {destination.city && ` · ${destination.city}`}
                                        </span>
                                    </div>
                                    {destination.spotCount !== undefined && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                            <Star className="w-4 h-4" />
                                            <span>{destination.spotCount} 个景点</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* 分页 */}
                    {total > pageSize && (
                        <div className="flex justify-center gap-2 mt-8">
                            <Button
                                variant="outline"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                上一页
                            </Button>
                            <Badge variant="secondary" className="px-4 py-2">
                                第 {page} 页
                            </Badge>
                            <Button
                                variant="outline"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page * pageSize >= total}
                            >
                                下一页
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
