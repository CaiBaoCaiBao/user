'use client'

import { useState, useEffect } from 'react'
import { TravelApi } from '@/api'
import type { TravelInfo } from '@/api'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Heart, Bookmark, Eye, User, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/store/userStore'

export default function Travels() {
    const router = useRouter()
    const currentUser = useCurrentUser()
    const [travels, setTravels] = useState<TravelInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [keyword, setKeyword] = useState('')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [activeTab, setActiveTab] = useState<'all' | 'my' | 'hot'>('all')
    const pageSize = 12

    // 获取旅行攻略列表
    const fetchTravels = async () => {
        try {
            setLoading(true)
            let response

            if (activeTab === 'my') {
                response = await TravelApi.getMyTravels(page, pageSize)
            } else if (activeTab === 'hot') {
                response = await TravelApi.getHotTravels(pageSize)
                const travelData = response.data.data
                setTravels(Array.isArray(travelData) ? travelData : [])
                setTotal(Array.isArray(travelData) ? travelData.length : 0)
                setLoading(false)
                return
            } else {
                response = await TravelApi.getTravels({
                    page,
                    pageSize,
                    title: keyword || undefined,
                })
            }

            const travelData = response.data.data
            setTravels(Array.isArray(travelData) ? travelData : [])
            setTotal(response.data.total || 0)
        } catch (error) {
            console.error('获取旅行攻略失败:', error)
            setTravels([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTravels()
    }, [page, activeTab])

    // 搜索
    const handleSearch = () => {
        setPage(1)
        fetchTravels()
    }

    // 跳转详情
    const goToDetail = (noteId: string) => {
        router.push(`/travels/${noteId}`)
    }

    // 跳转创建
    const goToCreate = () => {
        router.push('/travels/create')
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* 搜索栏 */}
            <div className="mb-8">
                <div className="flex gap-2 max-w-2xl mx-auto">
                    <Input
                        placeholder="搜索旅行攻略..."
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

            {/* 标签页 */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                    <TabsTrigger value="all">全部攻略</TabsTrigger>
                    <TabsTrigger value="hot">热门攻略</TabsTrigger>
                    {currentUser && <TabsTrigger value="my">我的攻略</TabsTrigger>}
                </TabsList>
            </Tabs>

            {/* 创建按钮 */}
            {currentUser && activeTab === 'my' && (
                <div className="mb-6 flex justify-end">
                    <Button onClick={goToCreate}>
                        创建攻略
                    </Button>
                </div>
            )}

            {/* 旅行攻略列表 */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="h-96 animate-pulse" />
                    ))}
                </div>
            ) : travels.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    {activeTab === 'my' ? '还没有创建攻略，快去创建吧！' : '暂无攻略数据'}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {travels.map((travel) => (
                            <Card
                                key={travel.noteId}
                                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => goToDetail(travel.noteId)}
                            >
                                {/* 封面图 */}
                                {travel.coverImg && (
                                    <div className="h-48 bg-muted overflow-hidden">
                                        <img
                                            src={travel.coverImg}
                                            alt={travel.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <CardContent className="p-4">
                                    <h3 className="text-lg font-semibold mb-2">
                                        {travel.title}
                                    </h3>
                                    {travel.content && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {travel.content}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                        <User className="w-4 h-4" />
                                        <span>{travel.userId}</span>
                                    </div>
                                    {travel.travelDays && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            <span>{travel.travelDays} 天行程</span>
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="px-4 pb-4 pt-0 flex justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" />
                                            <span>{travel.viewCount || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Heart className="w-4 h-4" />
                                            <span>{travel.likeCount || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Bookmark className="w-4 h-4" />
                                            <span>{travel.commentCount || 0}</span>
                                        </div>
                                    </div>
                                </CardFooter>
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
