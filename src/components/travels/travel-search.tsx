'use client'

import { useState, useEffect } from 'react'
import { TravelApi, DestinationApi } from '@/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, X } from 'lucide-react'
import { toast } from 'sonner'
import type { TravelInfo, DestinationInfo } from '@/api'

interface TravelSearchProps {
    onSearch: (params: any) => void
    loading?: boolean
    initialKeyword?: string
}

export default function TravelSearch({ onSearch, loading = false, initialKeyword = '' }: TravelSearchProps) {
    const [keyword, setKeyword] = useState(initialKeyword)
    const [destinationId, setDestinationId] = useState('')
    const [destinations, setDestinations] = useState<DestinationInfo[]>([])
    const [sortBy, setSortBy] = useState('default')
    const [timeRange, setTimeRange] = useState('all')
    const [showFilters, setShowFilters] = useState(false)

    // 当initialKeyword变化时更新keyword
    useEffect(() => {
        if (initialKeyword !== keyword) {
            setKeyword(initialKeyword)
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

    const handleSearch = () => {
        const params: any = {
            title: keyword || undefined,
            destinationId: destinationId || undefined,
        }

        // 添加排序参数
        if (sortBy === 'latest') {
            params.sortBy = 'createTime'
            params.sortOrder = 'desc'
        } else if (sortBy === 'hot') {
            params.sortBy = 'viewCount'
            params.sortOrder = 'desc'
        } else if (sortBy === 'mostLiked') {
            params.sortBy = 'likeCount'
            params.sortOrder = 'desc'
        }

        // 添加时间范围参数
        if (timeRange !== 'all') {
            const now = new Date()
            let startTime: Date

            if (timeRange === 'week') {
                startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            } else if (timeRange === 'month') {
                startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            } else if (timeRange === 'year') {
                startTime = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            }

            if (startTime) {
                params.startTime = startTime.toISOString()
                params.endTime = now.toISOString()
            }
        }

        onSearch(params)
    }

    const handleReset = () => {
        setKeyword('')
        setDestinationId('')
        setSortBy('default')
        setTimeRange('all')
        onSearch({})
    }

    const toggleFilters = () => {
        setShowFilters(!showFilters)
        if (!showFilters) {
            loadDestinations()
        }
    }

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* 搜索框 */}
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="搜索游记标题..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-10"
                            />
                        </div>
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
                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
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
                                            <SelectItem value="latest">最新发布</SelectItem>
                                            <SelectItem value="hot">最多浏览</SelectItem>
                                            <SelectItem value="mostLiked">最多点赞</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* 时间范围 */}
                                <div className="space-y-2">
                                    <Label>时间范围</Label>
                                    <Select
                                        value={timeRange}
                                        onValueChange={setTimeRange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="选择时间范围" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">全部时间</SelectItem>
                                            <SelectItem value="week">最近一周</SelectItem>
                                            <SelectItem value="month">最近一月</SelectItem>
                                            <SelectItem value="year">最近一年</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* 应用筛选 */}
                            <Button onClick={handleSearch} className="w-full" disabled={loading}>
                                应用筛选
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
