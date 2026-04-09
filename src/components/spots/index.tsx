'use client'

import { useState, useEffect } from 'react'
import { SpotApi, DestinationApi } from '@/api'
import type { SpotInfo, DestinationInfo } from '@/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, Filter, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SpotsProps {
    initialKeyword?: string
}

export default function Spots({ initialKeyword = '' }: SpotsProps) {
    const router = useRouter()
    const [spots, setSpots] = useState<SpotInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [keyword, setKeyword] = useState(initialKeyword)
    const [destinationId, setDestinationId] = useState('')
    const [destinations, setDestinations] = useState<DestinationInfo[]>([])
    const [sortBy, setSortBy] = useState('default')
    const [showFilters, setShowFilters] = useState(false)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const pageSize = 12

    // 当initialKeyword变化时更新keyword
    useEffect(() => {
        if (initialKeyword !== keyword) {
            setKeyword(initialKeyword)
            setPage(1)
        }
    }, [initialKeyword])

    // 加载目的地列表
    const loadDestinations = async () => {
        if (destinations.length > 0) return

        try {
            const response = await DestinationApi.getDestinations({ page: 1, pageSize: 100 })
            const pageData = response.data.data as any
            const destData = pageData?.records || []
            setDestinations(Array.isArray(destData) ? destData : [])
        } catch (error) {
            console.error('加载目的地失败:', error)
        }
    }

    // 获取景点列表
    const fetchSpots = async () => {
        try {
            setLoading(true)
            const response = await SpotApi.getSpots({
                page,
                pageSize,
                name: keyword || undefined,
                destinationId: destinationId || undefined,
            })
            const pageData = response.data.data
            let spotsData = Array.isArray(pageData?.records) ? pageData.records : []

            // 前端排序
            if (sortBy === 'name') {
                spotsData.sort((a, b) => a.name.localeCompare(b.name))
            }

            setSpots(spotsData)
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
    }, [page, sortBy])

    // 搜索
    const handleSearch = () => {
        setPage(1)
        fetchSpots()
    }

    // 重置筛选
    const handleReset = () => {
        setKeyword('')
        setDestinationId('')
        setSortBy('default')
        setPage(1)
        fetchSpots()
    }

    // 切换筛选面板
    const toggleFilters = () => {
        setShowFilters(!showFilters)
        if (!showFilters) {
            loadDestinations()
        }
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
                    <Button onClick={handleSearch} disabled={loading}>
                        <Search className="w-4 h-4 mr-2" />
                        搜索
                    </Button>
                    <Button
                        variant="outline"
                        onClick={toggleFilters}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        筛选
                    </Button>
                </div>

                {/* 筛选条件 */}
                {showFilters && (
                    <div className="mt-4 p-4 border rounded-lg bg-card">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">筛选条件</h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                            >
                                <X className="w-4 h-4 mr-2" />
                                重置
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 目的地筛选 */}
                            <div className="space-y-2">
                                <Label>目的地</Label>
                                <Select
                                    value={destinationId}
                                    onValueChange={setDestinationId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择目的地" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {destinations.map((dest) => (
                                            <SelectItem key={dest.destinationId} value={dest.destinationId}>
                                                {dest.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 排序 */}
                            <div className="space-y-2">
                                <Label>排序</Label>
                                <Select
                                    value={sortBy}
                                    onValueChange={setSortBy}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择排序" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">默认</SelectItem>
                                        <SelectItem value="name">名称</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button onClick={handleSearch} className="w-full mt-4" disabled={loading}>
                            应用筛选
                        </Button>
                    </div>
                )}
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
                                key={spot.aid}
                                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => goToDetail(spot.aid)}
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
