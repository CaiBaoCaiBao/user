'use client'

import { useState, useEffect } from 'react'
import { DestinationApi } from '@/api'
import type { DestinationInfo } from '@/api'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, Star, Filter, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DestinationsProps {
    initialKeyword?: string
}

export default function Destinations({ initialKeyword = '' }: DestinationsProps) {
    const router = useRouter()
    const [destinations, setDestinations] = useState<DestinationInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [keyword, setKeyword] = useState(initialKeyword)
    const [province, setProvince] = useState('')
    const [level, setLevel] = useState('')
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

    // 省份列表
    const provinces = [
        '北京', '上海', '天津', '重庆',
        '河北', '山西', '辽宁', '吉林', '黑龙江',
        '江苏', '浙江', '安徽', '福建', '江西', '山东',
        '河南', '湖北', '湖南', '广东', '海南',
        '四川', '贵州', '云南', '陕西', '甘肃', '青海',
        '内蒙古', '广西', '西藏', '宁夏', '新疆',
        '香港', '澳门', '台湾'
    ]

    // 获取目的地列表
    const fetchDestinations = async () => {
        try {
            setLoading(true)
            const response = await DestinationApi.getDestinations({
                page,
                pageSize,
                name: keyword || undefined,
                province: province || undefined,
                level: level ? parseInt(level) : undefined,
            })
            console.log('目的地列表响应:', response)
            // 根据实际 API 返回结构获取数据
            let destinationsData = response.data?.data?.records || response.data?.records || []
            destinationsData = Array.isArray(destinationsData) ? destinationsData : []

            // 前端排序
            if (sortBy === 'spotCount') {
                destinationsData.sort((a, b) => (b.spotCount || 0) - (a.spotCount || 0))
            }

            setDestinations(destinationsData)
            setTotal(response.data?.data?.total || response.data?.total || 0)
        } catch (error) {
            console.error('获取目的地失败:', error)
            setDestinations([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDestinations()
    }, [page, sortBy])

    // 搜索
    const handleSearch = () => {
        setPage(1)
        fetchDestinations()
    }

    // 重置筛选
    const handleReset = () => {
        setKeyword('')
        setProvince('')
        setLevel('')
        setSortBy('default')
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
                    <Button onClick={handleSearch} disabled={loading}>
                        <Search className="w-4 h-4 mr-2" />
                        搜索
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* 省份筛选 */}
                            <div className="space-y-2">
                                <Label>省份</Label>
                                <Select
                                    value={province}
                                    onValueChange={setProvince}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择省份" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {provinces.map((p) => (
                                            <SelectItem key={p} value={p}>
                                                {p}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 等级筛选 */}
                            <div className="space-y-2">
                                <Label>等级</Label>
                                <Select
                                    value={level}
                                    onValueChange={setLevel}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择等级" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">城市</SelectItem>
                                        <SelectItem value="2">景区</SelectItem>
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
                                        <SelectItem value="spotCount">景点数量</SelectItem>
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
                        {destinations.map((destination, index) => (
                            <Card
                                key={destination.destinationId || destination.id || `dest-${index}`}
                                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => goToDetail(destination.destinationId || destination.id)}
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
                                            {destination.province || ''}
                                            {destination.province && destination.city && ' · '}
                                            {destination.city || ''}
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
