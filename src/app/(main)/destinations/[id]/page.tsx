'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DestinationApi, TravelApi } from '@/api'
import type { DestinationDetail } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Calendar, Eye, ArrowLeft, Star } from 'lucide-react'
import { toast } from 'sonner'

export default function DestinationDetailPage() {
    const params = useParams()
    const router = useRouter()
    const destinationId = params.id as string

    const [destination, setDestination] = useState<DestinationDetail | null>(null)
    const [travels, setTravels] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'info' | 'travels'>('info')

    useEffect(() => {
        if (destinationId) {
            fetchDestinationDetail()
            fetchDestinationTravels()
        }
    }, [destinationId])

    const fetchDestinationDetail = async () => {
        try {
            setLoading(true)
            const response = await DestinationApi.getDestinationById(destinationId)
            setDestination(response.data.data)
        } catch (error) {
            console.error('获取目的地详情失败:', error)
            toast.error('获取目的地详情失败')
        } finally {
            setLoading(false)
        }
    }

    const fetchDestinationTravels = async () => {
        try {
            const response = await TravelApi.getTravels({
                pageNum: 1,
                pageSize: 10,
                destinationId
            })
            const pageData = response.data.data
            const travelData = pageData?.records || []
            setTravels(Array.isArray(travelData) ? travelData : [])
        } catch (error) {
            console.error('获取目的地游记失败:', error)
        }
    }

    const goToTravelDetail = (noteId: string) => {
        router.push(`/travels/${noteId}`)
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-muted rounded w-1/4" />
                        <div className="h-64 bg-muted rounded" />
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                </div>
            </div>
        )
    }

    if (!destination) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-muted-foreground">目的地不存在或已被删除</p>
                    <Button onClick={() => router.back()} className="mt-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        返回
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                {/* 头部导航 */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        返回
                    </Button>
                </div>

                {/* 目的地信息 */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{destination.name}</h1>
                                {destination.aliasesName && (
                                    <p className="text-muted-foreground mb-4">{destination.aliasesName}</p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{destination.province} {destination.city}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Eye className="w-4 h-4" />
                                        <span>{destination.viewCount || 0} 次浏览</span>
                                    </div>
                                </div>
                            </div>
                            {destination.level && (
                                <Badge variant="secondary">
                                    {destination.level === 1 ? '国家/洲' : destination.level === 2 ? '省/州' : '城市/景区'}
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* 封面图 */}
                        {destination.coverImg && (
                            <div className="mb-6 rounded-lg overflow-hidden">
                                <img
                                    src={destination.coverImg}
                                    alt={destination.name}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        )}

                        {/* 描述 */}
                        {destination.description && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">简介</h3>
                                <p className="text-muted-foreground leading-relaxed">{destination.description}</p>
                            </div>
                        )}

                        {/* 基本信息 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {destination.bestSeason && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Star className="w-4 h-4" />
                                    <span>最佳旅游季节: {destination.bestSeason}</span>
                                </div>
                            )}
                            {destination.travelDays && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>建议游玩天数: {destination.travelDays} 天</span>
                                </div>
                            )}
                        </div>

                        {/* 标签 */}
                        {destination.tags && destination.tags.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">标签</h3>
                                <div className="flex flex-wrap gap-2">
                                    {destination.tags.map((tag: any) => (
                                        <Badge key={tag.id} variant="outline">
                                            {tag.tagName}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 标签页 */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                    <TabsList>
                        <TabsTrigger value="info">详细信息</TabsTrigger>
                        <TabsTrigger value="travels">相关游记 ({travels.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="mt-6">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-muted-foreground">更多详细信息正在完善中...</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="travels" className="mt-6">
                        {travels.length === 0 ? (
                            <Card>
                                <CardContent className="pt-6 text-center text-muted-foreground">
                                    暂无相关游记
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {travels.map((travel) => (
                                    <Card
                                        key={travel.noteId}
                                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                        onClick={() => goToTravelDetail(travel.noteId)}
                                    >
                                        {travel.coverImg && (
                                            <div className="h-32 bg-muted overflow-hidden">
                                                <img
                                                    src={travel.coverImg}
                                                    alt={travel.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <CardContent className="p-4">
                                            <h4 className="font-semibold mb-2">{travel.title}</h4>
                                            {travel.content && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {travel.content}
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}