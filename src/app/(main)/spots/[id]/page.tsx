'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { SpotApi, TravelApi } from '@/api'
import type { SpotDetail, TicketVO, PlayItemVO, OpenTimeRuleVO } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { MapPin, Phone, Clock, ArrowLeft, Eye, Calendar, DollarSign, Mountain, Camera, Ticket, Users, Timer, Navigation, Star, Bookmark } from 'lucide-react'
import { toast } from 'sonner'
import { SocialApi } from '@/api'
import { useCurrentUser } from '@/store/userStore'
import Comments from '@/components/common/comments'

export default function SpotDetailPage() {
    const params = useParams()
    const router = useRouter()
    const currentUser = useCurrentUser()
    const spotId = params.id as string

    const [spot, setSpot] = useState<SpotDetail | null>(null)
    const [travels, setTravels] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'info' | 'tickets' | 'playitems' | 'travels' | 'comments'>('info')
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isCollected, setIsCollected] = useState(false)
    const [isProcessingCollection, setIsProcessingCollection] = useState(false)
    const hasFetchedDetail = useRef(false)

    useEffect(() => {
        if (spotId && !hasFetchedDetail.current) {
            fetchSpotDetail()
            fetchSpotTravels()

            // 增加浏览次数（使用 sessionStorage 防止重复增加）
            const viewKey = `spot_viewed_${spotId}`
            if (!sessionStorage.getItem(viewKey)) {
                SpotApi.incrementViewCount(spotId).catch(err => {
                    console.error('增加浏览次数失败:', err)
                })
                sessionStorage.setItem(viewKey, 'true')
            }

            hasFetchedDetail.current = true
        }
    }, [spotId])

    // 监听用户登录状态变化，获取收藏状态
    useEffect(() => {
        if (currentUser?.uuid && spotId) {
            fetchCollectionStatus()
        }
    }, [currentUser?.uuid, spotId])

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

    // 获取收藏状态
    const fetchCollectionStatus = async () => {
        if (!currentUser?.uuid || !spotId) {
            return
        }

        try {
            const response = await SocialApi.checkCollectionStatus({
                targetType: 'attraction',
                targetId: spotId,
            })
            setIsCollected(response.data.data?.isCollected || false)
        } catch (error) {
            console.error('获取收藏状态失败:', error)
        }
    }

    // 收藏/取消收藏
    const handleToggleCollection = async (e?: React.MouseEvent) => {
        e?.stopPropagation()

        if (!currentUser?.uuid) {
            toast.error('请先登录')
            return
        }

        if (isProcessingCollection) {
            return
        }

        const wasCollected = isCollected
        setIsProcessingCollection(true)

        try {
            setIsCollected(!wasCollected)

            if (spot) {
                setSpot({
                    ...spot,
                    collectionCount: wasCollected
                        ? (spot.collectionCount || 0) - 1
                        : (spot.collectionCount || 0) + 1
                })
            }

            await SocialApi.toggleCollection({
                targetType: 'attraction',
                targetId: spotId,
            })
            toast.success(wasCollected ? '取消收藏成功' : '收藏成功')
        } catch (error) {
            console.error('收藏失败:', error)
            setIsCollected(wasCollected)
            if (spot) {
                setSpot({
                    ...spot,
                    collectionCount: spot.collectionCount || 0
                })
            }
            toast.error('操作失败')
        } finally {
            setIsProcessingCollection(false)
        }
    }

    const goToTravelDetail = (noteId: string) => {
        router.push(`/travels/${noteId}`)
    }

    const goToDestination = (destinationId: string) => {
        router.push(`/destinations/${destinationId}`)
    }

    // 图片轮播
    const nextImage = () => {
        if (spot && spot.images && spot.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % spot.images!.length)
        }
    }

    const prevImage = () => {
        if (spot && spot.images && spot.images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + spot.images!.length) % spot.images!.length)
        }
    }

    // 格式化时间
    const formatTime = (time: string) => {
        if (!time) return ''
        return time.substring(0, 5)
    }

    // 格式化日期
    const formatDate = (date: string) => {
        if (!date) return ''
        return new Date(date).toLocaleDateString('zh-CN')
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-muted rounded w-1/4" />
                        <div className="h-96 bg-muted rounded" />
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

    const images = Array.isArray(spot.images) ? spot.images : (spot.images ? [spot.images] : [])
    const ticketsCount = spot.tickets?.length || 0
    const playItemsCount = spot.playItems?.length || 0

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                {/* 头部导航 */}
                <div className="mb-6 flex items-center justify-between sticky top-4 z-10 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-sm">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="hover:bg-accent"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        返回
                    </Button>
                    <div className="flex items-center gap-2">
                        {spot.status === 1 && (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                营业中
                            </Badge>
                        )}
                        {spot.destinationName && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToDestination(spot.destinationId!)}
                            >
                                <Mountain className="w-4 h-4 mr-2" />
                                {spot.destinationName}
                            </Button>
                        )}
                        <Button
                            onClick={handleToggleCollection}
                            variant={isCollected ? "default" : "outline"}
                            size="sm"
                            disabled={isProcessingCollection}
                        >
                            <Bookmark className={`w-4 h-4 mr-2 ${isCollected ? 'fill-current' : ''}`} />
                            {isCollected ? '已收藏' : '收藏'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/travels/create')}
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            发布游记
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/spots')}
                        >
                            <Mountain className="w-4 h-4 mr-2" />
                            浏览更多
                        </Button>
                    </div>
                </div>

                {/* 主要内容区域 */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* 左侧主要内容 */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* 图片轮播 */}
                        {images.length > 0 && (
                            <Card className="overflow-hidden border-2 shadow-xl">
                                <div className="relative aspect-video group">
                                    <img
                                        src={images[currentImageIndex]}
                                        alt={spot.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {images.length > 1 && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg"
                                                onClick={prevImage}
                                            >
                                                <ArrowLeft className="w-5 h-5" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg"
                                                onClick={nextImage}
                                            >
                                                <ArrowLeft className="w-5 h-5 rotate-180" />
                                            </Button>
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                                                {currentImageIndex + 1} / {images.length}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* 景点信息卡片 */}
                        <Card className="border-2 shadow-xl">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold mb-2">{spot.name}</h1>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                                                <Eye className="w-4 h-4" />
                                                <span>{spot.viewCount || 0} 次浏览</span>
                                            </div>
                                            {spot.realTimeSyncFlag && (
                                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                                    实时同步
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* 简介 */}
                                {spot.description && (
                                    <div>
                                        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                                            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                            景点简介
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed text-base">
                                            {spot.description}
                                        </p>
                                    </div>
                                )}

                                <Separator className="my-6" />

                                {/* 基本信息 */}
                                <div>
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                        基本信息
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {spot.address && (
                                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl border border-blue-200 dark:border-blue-800">
                                                <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                                                    <MapPin className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-muted-foreground">地址</p>
                                                    <p className="font-semibold text-blue-700 dark:text-blue-300 truncate">{spot.address}</p>
                                                </div>
                                            </div>
                                        )}
                                        {spot.phone && (
                                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl border border-green-200 dark:border-green-800">
                                                <div className="p-2 bg-green-500 rounded-lg shadow-md">
                                                    <Phone className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">电话</p>
                                                    <p className="font-semibold text-green-700 dark:text-green-300">{spot.phone}</p>
                                                </div>
                                            </div>
                                        )}
                                        {spot.longitude && spot.latitude && (
                                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl border border-purple-200 dark:border-purple-800">
                                                <div className="p-2 bg-purple-500 rounded-lg shadow-md">
                                                    <Navigation className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">地理坐标</p>
                                                    <p className="font-semibold text-purple-700 dark:text-purple-300">
                                                        {spot.longitude.toFixed(4)}, {spot.latitude.toFixed(4)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 标签 */}
                                {spot.tags && spot.tags.length > 0 && (
                                    <>
                                        <Separator className="my-6" />
                                        <div>
                                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                                标签
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {spot.tags.map((tag) => (
                                                    <Badge
                                                        key={tag.id}
                                                        variant="outline"
                                                        className="px-3 py-1 text-sm hover:bg-primary/10 transition-colors cursor-default"
                                                    >
                                                        {tag.tagName}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* 标签页 */}
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                            <TabsList className="grid w-full max-w-md mx-auto grid-cols-5">
                                <TabsTrigger value="info">详细信息</TabsTrigger>
                                <TabsTrigger value="tickets">门票 ({ticketsCount})</TabsTrigger>
                                <TabsTrigger value="playitems">游玩项目 ({playItemsCount})</TabsTrigger>
                                <TabsTrigger value="travels">游记 ({travels.length})</TabsTrigger>
                                <TabsTrigger value="comments">评论</TabsTrigger>
                            </TabsList>

                            <TabsContent value="info" className="mt-6">
                                <Card className="border-2">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Mountain className="w-5 h-5" />
                                            详细信息
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* 标签 */}
                                        {spot.tags && spot.tags.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                                    <Bookmark className="w-4 h-4" />
                                                    标签
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {spot.tags.map((tag) => (
                                                        <Badge
                                                            key={tag.id}
                                                            variant="secondary"
                                                            className="flex items-center gap-1.5 px-3 py-1"
                                                            style={{
                                                                backgroundColor: tag.color ? `${tag.color}20` : undefined,
                                                                borderColor: tag.color || undefined,
                                                                color: tag.color || undefined
                                                            }}
                                                        >
                                                            {tag.iconUrl && (
                                                                <img
                                                                    src={tag.iconUrl}
                                                                    alt={tag.tagName}
                                                                    className="w-4 h-4"
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none'
                                                                    }}
                                                                />
                                                            )}
                                                            {tag.tagName}
                                                            {tag.recommendFlag && (
                                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                            )}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 地址 */}
                                        {spot.address && (
                                            <div>
                                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    地址
                                                </h3>
                                                <p className="text-muted-foreground">{spot.address}</p>
                                            </div>
                                        )}

                                        {/* 电话 */}
                                        {spot.phone && (
                                            <div>
                                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                                    <Phone className="w-4 h-4" />
                                                    联系电话
                                                </h3>
                                                <p className="text-muted-foreground">{spot.phone}</p>
                                            </div>
                                        )}

                                        {/* 所属目的地 */}
                                        {spot.destinationName && (
                                            <div>
                                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                                    <Navigation className="w-4 h-4" />
                                                    所属目的地
                                                </h3>
                                                <Button
                                                    variant="link"
                                                    className="p-0 h-auto"
                                                    onClick={() => goToDestination(spot.destinationId!)}
                                                >
                                                    {spot.destinationName}
                                                </Button>
                                            </div>
                                        )}

                                        {/* 景点代码 */}
                                        {spot.aid && (
                                            <div>
                                                <h3 className="font-semibold mb-2">景点代码</h3>
                                                <p className="text-muted-foreground font-mono">{spot.aid}</p>
                                            </div>
                                        )}

                                        {/* 状态 */}
                                        <div>
                                            <h3 className="font-semibold mb-2">状态</h3>
                                            <Badge variant={spot.status === 1 ? "default" : "secondary"}>
                                                {spot.status === 1 ? '启用' : '禁用'}
                                            </Badge>
                                        </div>

                                        {/* 实时同步标志 */}
                                        {spot.realTimeSyncFlag !== undefined && (
                                            <div>
                                                <h3 className="font-semibold mb-2">实时同步</h3>
                                                <Badge variant={spot.realTimeSyncFlag ? "default" : "secondary"}>
                                                    {spot.realTimeSyncFlag ? '已启用' : '未启用'}
                                                </Badge>
                                            </div>
                                        )}

                                        {/* 浏览次数 */}
                                        <div>
                                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                                <Eye className="w-4 h-4" />
                                                浏览次数
                                            </h3>
                                            <p className="text-muted-foreground">{spot.viewCount || 0} 次</p>
                                        </div>

                                        {/* 排序 */}
                                        {spot.sortOrder !== undefined && (
                                            <div>
                                                <h3 className="font-semibold mb-2">排序</h3>
                                                <p className="text-muted-foreground">{spot.sortOrder}</p>
                                            </div>
                                        )}

                                        {/* 创建时间 */}
                                        {spot.createdAt && (
                                            <div>
                                                <h3 className="font-semibold mb-2">创建时间</h3>
                                                <p className="text-muted-foreground text-sm">
                                                    {new Date(spot.createdAt).toLocaleString('zh-CN')}
                                                </p>
                                            </div>
                                        )}

                                        {/* 更新时间 */}
                                        {spot.updatedAt && (
                                            <div>
                                                <h3 className="font-semibold mb-2">更新时间</h3>
                                                <p className="text-muted-foreground text-sm">
                                                    {new Date(spot.updatedAt).toLocaleString('zh-CN')}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="tickets" className="mt-6">
                                {ticketsCount === 0 ? (
                                    <Card className="border-2">
                                        <CardContent className="pt-6 text-center text-muted-foreground py-12">
                                            <Ticket className="w-16 h-16 mx-auto mb-4" />
                                            <p>暂无门票信息</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {spot.tickets?.map((ticket: TicketVO) => (
                                            <Card key={ticket.tid} className="border-2 hover:shadow-xl transition-all duration-300">
                                                <CardContent className="p-6">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <h4 className="font-bold text-lg">{ticket.ticketName}</h4>
                                                        {ticket.ticketType && (
                                                            <Badge variant="secondary">{ticket.ticketType}</Badge>
                                                        )}
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-muted-foreground">价格</span>
                                                            <div className="flex items-center gap-2">
                                                                {ticket.discountPrice && Number(ticket.discountPrice) > 0 && Number(ticket.discountPrice) < Number(ticket.price || 0) && (
                                                                    <span className="text-sm text-muted-foreground line-through">
                                                                ¥{Number(ticket.price || 0).toFixed(2)}
                                                            </span>
                                                                )}
                                                                <span className="text-2xl font-bold text-red-600">
                                                                    ¥{Number((ticket.discountPrice && ticket.discountPrice > 0) ? ticket.discountPrice : ticket.price || 0).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {ticket.validDays && (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Calendar className="w-4 h-4" />
                                                                <span>有效期: {ticket.validDays} 天</span>
                                                            </div>
                                                        )}
                                                        {ticket.stock !== undefined && (
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Users className="w-4 h-4" />
                                                                <span className={ticket.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                                                    {ticket.stock > 0 ? `库存: ${ticket.stock}` : '已售罄'}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {ticket.description && (
                                                            <p className="text-sm text-muted-foreground mt-3">
                                                                {ticket.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="playitems" className="mt-6">
                                {playItemsCount === 0 ? (
                                    <Card className="border-2">
                                        <CardContent className="pt-6 text-center text-muted-foreground py-12">
                                            <Star className="w-16 h-16 mx-auto mb-4" />
                                            <p>暂无游玩项目</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {spot.playItems?.map((item: PlayItemVO) => (
                                            <Card key={item.id} className="border-2 hover:shadow-xl transition-all duration-300 overflow-hidden">
                                                {item.images && item.images.length > 0 && (
                                                    <div className="h-40 overflow-hidden">
                                                        <img
                                                            src={item.images[0]}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                )}
                                                <CardContent className="p-4">
                                                    <h4 className="font-bold text-lg mb-2">{item.name}</h4>
                                                    {item.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                    <div className="space-y-2">
                                                        {item.duration && (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Timer className="w-4 h-4" />
                                                                <span>时长: {item.duration} 分钟</span>
                                                            </div>
                                                        )}
                                                        {item.minPerson && item.maxPerson && (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Users className="w-4 h-4" />
                                                                <span>人数: {item.minPerson}-{item.maxPerson} 人</span>
                                                            </div>
                                                        )}
                                                        {item.minAge && (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <span>最低年龄: {item.minAge} 岁</span>
                                                            </div>
                                                        )}
                                                        {(item.price || item.discountPrice) && (
                                                            <div className="flex items-center gap-2 pt-2 border-t">
                                                                <DollarSign className="w-4 h-4 text-green-600" />
                                                                {item.discountPrice && Number(item.discountPrice) > 0 && Number(item.discountPrice) < Number(item.price || 0) ? (
                                                                    <>
                                                                        <span className="text-sm text-muted-foreground line-through">
                                                                            ¥{Number(item.price || 0).toFixed(2)}
                                                                        </span>
                                                                        <span className="text-lg font-bold text-green-600">
                                                                            ¥{Number(item.discountPrice).toFixed(2)}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-lg font-bold text-green-600">
                                                                        ¥{Number(item.price || 0).toFixed(2)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="travels" className="mt-6">
                                {travels.length === 0 ? (
                                    <Card className="border-2">
                                        <CardContent className="pt-6 text-center text-muted-foreground py-12">
                                            <Camera className="w-16 h-16 mx-auto mb-4" />
                                            <p>暂无相关游记</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {travels.map((travel) => (
                                            <Card
                                                key={travel.noteId}
                                                className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer"
                                                onClick={() => goToTravelDetail(travel.noteId)}
                                            >
                                                {travel.coverImg && (
                                                    <div className="h-48 overflow-hidden">
                                                        <img
                                                            src={travel.coverImg}
                                                            alt={travel.title}
                                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                )}
                                                <CardContent className="p-4">
                                                    <h4 className="font-bold text-lg mb-2 line-clamp-1">{travel.title}</h4>
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

                            <TabsContent value="comments" className="mt-6">
                                <Comments
                                    targetType="attraction"
                                    targetId={spotId}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* 右侧边栏 */}
                    <div className="xl:col-span-1 space-y-6">
                        {/* 快捷信息卡片 */}
                        <Card className="border-2 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-lg">快捷信息</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm text-muted-foreground">门票数量</span>
                                    <span className="font-bold text-lg">{ticketsCount}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm text-muted-foreground">游玩项目</span>
                                    <span className="font-bold text-lg">{playItemsCount}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm text-muted-foreground">游记数量</span>
                                    <span className="font-bold text-lg">{travels.length}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm text-muted-foreground">浏览次数</span>
                                    <span className="font-bold text-lg">{spot.viewCount || 0}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 开放时间卡片 */}
                        {spot.openTimeRules && spot.openTimeRules.length > 0 && (
                            <Card className="border-2 shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        开放时间
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {spot.openTimeRules.map((rule: OpenTimeRuleVO) => (
                                        <div key={rule.otrId} className="p-3 bg-muted/50 rounded-lg">
                                            <div className="font-semibold mb-2">{rule.openTimeName}</div>
                                            {rule.timeSlots && rule.timeSlots.length > 0 && (
                                                <div className="text-sm text-muted-foreground">
                                                    {rule.timeSlots.map((slot, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{formatTime(slot.start)} - {formatTime(slot.end)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {rule.startDate && rule.endDate && (
                                                <div className="text-xs text-muted-foreground mt-2">
                                                    {formatDate(rule.startDate)} - {formatDate(rule.endDate)}
                                                </div>
                                            )}
                                            {rule.description && (
                                                <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}


                    </div>
                </div>
            </div>
        </div>
    )
}