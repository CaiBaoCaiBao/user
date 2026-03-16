'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { SpotApi, TravelApi } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Phone, Clock, ArrowLeft, Eye, Calendar } from 'lucide-react'
import { toast } from 'sonner'

export default function SpotDetailPage() {
    const params = useParams()
    const router = useRouter()
    const spotId = params.id as string

    const [spot, setSpot] = useState<any>(null)
    const [travels, setTravels] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'info' | 'tickets' | 'travels'>('info')

    useEffect(() => {
        if (spotId) {
            fetchSpotDetail()
            fetchSpotTravels()
        }
    }, [spotId])

    const fetchSpotDetail = async () => {
        try {
            setLoading(true)
            const response = await SpotApi.getSpotById(spotId)
            setSpot(response.data.data)
        } catch (error) {
            console.error('获取景点详情失败:', error)
            toast.error('获取景点详情失败')
        } finally {
            setLoading(false)
        }
    }

    const fetchSpotTravels = async () => {
        try {
            const response = await TravelApi.getTravels({
                pageNum: 1,
                pageSize: 10,
                status: 1
            })
            const pageData = response.data.data
            const travelData = pageData?.records || []
            setTravels(Array.isArray(travelData) ? travelData : [])
        } catch (error) {
            console.error('获取景点游记失败:', error)
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
                    </div>
                </div>
            </div>
        )
    }

    if (!spot) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-muted-foreground">景点不存在或已被删除</p>
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

                {/* 景点信息 */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">{spot.name}</h1>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Eye className="w-4 h-4" />
                                        <span>{spot.viewCount || 0} 次浏览</span>
                                    </div>
                                    {spot.status === 1 && (
                                        <Badge variant="default">营业中</Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* 图片 */}
                        {spot.images && spot.images.length > 0 && (
                            <div className="mb-6 rounded-lg overflow-hidden">
                                <img
                                    src={spot.images[0]}
                                    alt={spot.name}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        )}

                        {/* 描述 */}
                        {spot.description && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">简介</h3>
                                <p className="text-muted-foreground leading-relaxed">{spot.description}</p>
                            </div>
                        )}

                        {/* 基本信息 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {spot.address && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span>地址: {spot.address}</span>
                                </div>
                            )}
                            {spot.phone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                    <span>电话: {spot.phone}</span>
                                </div>
                            )}
                        </div>

                        {/* 标签 */}
                        {spot.tags && spot.tags.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">标签</h3>
                                <div className="flex flex-wrap gap-2">
                                    {spot.tags.map((tag: any) => (
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
                        <TabsTrigger value="tickets">门票信息</TabsTrigger>
                        <TabsTrigger value="travels">相关游记 ({travels.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="mt-6">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-muted-foreground">更多详细信息正在完善中...</p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="tickets" className="mt-6">
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-muted-foreground">门票信息正在完善中...</p>
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