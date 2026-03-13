'use client'

import { useState, useEffect } from 'react'
import { SpotApi } from '@/api'
import type { SpotInfo } from '@/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Spots() {
    const router = useRouter()
    const [spots, setSpots] = useState<SpotInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [keyword, setKeyword] = useState('')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const pageSize = 12

    // 获取景点列表
    const fetchSpots = async () => {
        try {
            setLoading(true)
            const response = await SpotApi.getSpots({
                page,
                pageSize,
                keyword: keyword || undefined,
            })
            const pageData = response.data.data
            setSpots(Array.isArray(pageData?.records) ? pageData.records : [])
            setTotal(pageData?.total || 0)
        } catch (error) {
            console.error('获取景点失败:', error)
            setSpots([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSpots()
    }, [page])

    // 搜索
    const handleSearch = () => {
        setPage(1)
        fetchSpots()
    }

    // 跳转详情
    const goToDetail = (id: number) => {
        router.push(`/spots/${id}`)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* 搜索栏 */}
            <div className="mb-8">
                <div className="flex gap-2 max-w-2xl mx-auto">
                    <Input
                        placeholder="搜索景点..."
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

            {/* 景点列表 */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="h-80 animate-pulse" />
                    ))}
                </div>
            ) : spots.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    暂无景点数据
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {spots.map((spot) => (
                            <Card
                                key={spot.id}
                                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => goToDetail(spot.id)}
                            >
                                {/* 封面图 */}
                                {spot.images && (
                                    <div className="h-48 bg-muted overflow-hidden">
                                        <img
                                            src={Array.isArray(spot.images) ? spot.images[0] : spot.images}
                                            alt={spot.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <CardContent className="p-4">
                                    <h3 className="text-lg font-semibold mb-2">
                                        {spot.name}
                                    </h3>
                                    {spot.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {spot.description}
                                        </p>
                                    )}
                                    {spot.address && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{spot.address}</span>
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
