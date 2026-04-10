'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DestinationApi, TravelApi } from '@/api'
import type { DestinationDetail, AttractionSimpleVO } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { MapPin, Calendar, Eye, ArrowLeft, Star, Camera, Navigation, Clock, DollarSign, Mountain, Bookmark } from 'lucide-react'
import { toast } from 'sonner'
import { SocialApi } from '@/api'
import { useCurrentUser } from '@/store/userStore'
import Comments from '@/components/common/comments'

export default function DestinationDetailPage() {
    const params = useParams()
    const router = useRouter()
    const currentUser = useCurrentUser()
    const destinationId = params.id as string

    const [destination, setDestination] = useState<DestinationDetail | null>(null)
    const [travels, setTravels] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'info' | 'attractions' | 'travels' | 'comments'>('info')
    const [isCollected, setIsCollected] = useState(false)
    const [isProcessingCollection, setIsProcessingCollection] = useState(false)
    const hasFetchedDetail = useRef(false)

    useEffect(() => {
        if (destinationId && !hasFetchedDetail.current) {
            fetchDestinationDetail()
            fetchDestinationTravels()

            // 增加浏览次数（使用 sessionStorage 防止重复增加）
            const viewKey = `destination_viewed_${destinationId}`
            if (!sessionStorage.getItem(viewKey)) {
                DestinationApi.incrementViewCount(destinationId).catch(err => {
                    console.error('增加浏览次数失败:', err)
                })
                sessionStorage.setItem(viewKey, 'true')
            }

            hasFetchedDetail.current = true
        }
    }, [destinationId])

    // 监听用户登录状态变化，获取收藏状态
    useEffect(() => {
        if (currentUser?.uuid && destinationId) {
            fetchCollectionStatus()
        }
    }, [currentUser?.uuid, destinationId])

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

    // 获取收藏状态
    const fetchCollectionStatus = async () => {
        if (!currentUser?.uuid || !destinationId) {
            return
        }

        try {
            const response = await SocialApi.checkCollectionStatus({
                targetType: 'destination',
                targetId: destinationId,
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

            if (destination) {
                setDestination({
                    ...destination,
                    collectionCount: wasCollected
                        ? (destination.collectionCount || 0) - 1
                        : (destination.collectionCount || 0) + 1
                })
            }

            await SocialApi.toggleCollection({
                targetType: 'destination',
                targetId: destinationId,
            })
            toast.success(wasCollected ? '取消收藏成功' : '收藏成功')
        } catch (error) {
            console.error('收藏失败:', error)
            setIsCollected(wasCollected)
            if (destination) {
                setDestination({
                    ...destination,
                    collectionCount: destination.collectionCount || 0
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

    const goToSpotDetail = (aid: string) => {
        router.push(`/spots/${aid}`)
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-muted rounded w-1/4" />
                        <div className="h-96 bg-muted rounded" />
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

    const attractionsCount = destination.attractions?.length || 0

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
                        {destination.status === '1' && (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                营业中
                            </Badge>
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
                            onClick={() => router.push('/destinations')}
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
                        {/* 封面图片 */}
                        {destination.coverImg && (
                            <Card className="overflow-hidden border-2 shadow-xl">
                                <div className="relative aspect-video group">
                                    <img
                                        src={destination.coverImg}
                                        alt={destination.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                                            {destination.name}
                                        </h1>
                                        {destination.aliasesName && (
                                            <p className="text-white/90 text-lg mt-1">{destination.aliasesName}</p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* 目的地信息卡片 */}
                        <Card className="border-2 shadow-xl">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                                                <MapPin className="w-4 h-4" />
                                                <span>{destination.province} {destination.city}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                                                <Eye className="w-4 h-4" />
                                                <span>{destination.viewCount || 0} 次浏览</span>
                                            </div>
                                        </div>
                                        {destination.level && (
                                            <Badge variant="secondary" className="mb-4">
                                                {destination.level === 1 ? '国家/洲' : destination.level === 2 ? '省/州' : '城市/景区'}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* 简介 */}
                                {destination.description && (
                                    <div>
                                        <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                                            <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                            目的地简介
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed text-base">
                                            {destination.description}
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
                                        {destination.bestSeason && (
                                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 rounded-xl border border-yellow-200 dark:border-yellow-800">
                                                <div className="p-2 bg-yellow-500 rounded-lg shadow-md">
                                                    <Star className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">最佳旅游季节</p>
                                                    <p className="font-semibold text-yellow-700 dark:text-yellow-300">{destination.bestSeason}</p>
                                                </div>
                                            </div>
                                        )}
                                        {destination.travelDays && (
                                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl border border-blue-200 dark:border-blue-800">
                                                <div className="p-2 bg-blue-500 rounded-lg shadow-md">
                                                    <Calendar className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">建议游玩天数</p>
                                                    <p className="font-semibold text-blue-700 dark:text-blue-300">{destination.travelDays} 天</p>
                                                </div>
                                            </div>
                                        )}
                                        {destination.longitude && destination.latitude && (
                                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl border border-green-200 dark:border-green-800">
                                                <div className="p-2 bg-green-500 rounded-lg shadow-md">
                                                    <Navigation className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">地理坐标</p>
                                                    <p className="font-semibold text-green-700 dark:text-green-300">
                                                        {destination.longitude.toFixed(4)}, {destination.latitude.toFixed(4)}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {destination.destCode && (
                                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl border border-purple-200 dark:border-purple-800">
                                                <div className="p-2 bg-purple-500 rounded-lg shadow-md">
                                                    <Mountain className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">目的地代码</p>
                                                    <p className="font-semibold text-purple-700 dark:text-purple-300">{destination.destCode}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 标签 */}
                                {destination.tags && destination.tags.length > 0 && (
                                    <>
                                        <Separator className="my-6" />
                                        <div>
                                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                                标签
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {destination.tags.map((tag) => (
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
                            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                                <TabsTrigger value="info">详细信息</TabsTrigger>
                                <TabsTrigger value="attractions">景点 ({attractionsCount})</TabsTrigger>
                                <TabsTrigger value="travels">游记 ({travels.length})</TabsTrigger>
                                {/* <TabsTrigger value="comments">评论</TabsTrigger> */}
                            </TabsList>

                            <TabsContent value="info" className="mt-6">
                                <Card className="border-2">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Camera className="w-5 h-5" />
                                            详细信息
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* 标签 */}
                                        {destination.tags && destination.tags.length > 0 && (
                                            <div>
                                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                                    <Bookmark className="w-4 h-4" />
                                                    标签
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {destination.tags.map((tag) => (
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

                                        {/* 最佳旅游季节 */}
                                        {destination.bestSeason && (
                                            <div>
                                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    最佳旅游季节
                                                </h3>
                                                <p className="text-muted-foreground">{destination.bestSeason}</p>
                                            </div>
                                        )}

                                        {/* 建议游玩天数 */}
                                        {destination.travelDays && (
                                            <div>
                                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    建议游玩天数
                                                </h3>
                                                <p className="text-muted-foreground">{destination.travelDays} 天</p>
                                            </div>
                                        )}

                                        {/* 地理位置 */}
                                        {(destination.province || destination.city) && (
                                            <div>
                                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    地理位置
                                                </h3>
                                                <p className="text-muted-foreground">
                                                    {destination.province && destination.city
                                                        ? `${destination.province} ${destination.city}`
                                                        : destination.province || destination.city}
                                                </p>
                                            </div>
                                        )}

                                        {/* 别名 */}
                                        {destination.aliasesName && (
                                            <div>
                                                <h3 className="font-semibold mb-2">别名</h3>
                                                <p className="text-muted-foreground">{destination.aliasesName}</p>
                                            </div>
                                        )}

                                        {/* 目的地代码 */}
                                        {destination.destCode && (
                                            <div>
                                                <h3 className="font-semibold mb-2">目的地代码</h3>
                                                <p className="text-muted-foreground font-mono">{destination.destCode}</p>
                                            </div>
                                        )}

                                        {/* 等级 */}
                                        {destination.level && (
                                            <div>
                                                <h3 className="font-semibold mb-2">等级</h3>
                                                <Badge variant={destination.level === 1 ? "default" : "secondary"}>
                                                    {destination.level === 1 ? '城市' : '景区'}
                                                </Badge>
                                            </div>
                                        )}

                                        {/* 浏览次数 */}
                                        <div>
                                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                                <Eye className="w-4 h-4" />
                                                浏览次数
                                            </h3>
                                            <p className="text-muted-foreground">{destination.viewCount || 0} 次</p>
                                        </div>

                                        {/* 创建时间 */}
                                        {destination.createdAt && (
                                            <div>
                                                <h3 className="font-semibold mb-2">创建时间</h3>
                                                <p className="text-muted-foreground text-sm">
                                                    {new Date(destination.createdAt).toLocaleString('zh-CN')}
                                                </p>
                                            </div>
                                        )}

                                        {/* 更新时间 */}
                                        {destination.updatedAt && (
                                            <div>
                                                <h3 className="font-semibold mb-2">更新时间</h3>
                                                <p className="text-muted-foreground text-sm">
                                                    {new Date(destination.updatedAt).toLocaleString('zh-CN')}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="attractions" className="mt-6">
                                {attractionsCount === 0 ? (
                                    <Card className="border-2">
                                        <CardContent className="pt-6 text-center text-muted-foreground py-12">
                                            <Mountain className="w-16 h-16 mx-auto mb-4" />
                                            <p>暂无景点信息</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {destination.attractions?.map((attraction: AttractionSimpleVO) => (
                                            <Card
                                                key={attraction.aid}
                                                className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer"
                                                onClick={() => goToSpotDetail(attraction.aid)}
                                            >
                                                {attraction.coverImg && (
                                                    <div className="h-48 overflow-hidden">
                                                        <img
                                                            src={attraction.coverImg}
                                                            alt={attraction.name}
                                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                )}
                                                <CardContent className="p-4">
                                                    <h4 className="font-bold text-lg mb-2">{attraction.name}</h4>
                                                    {attraction.description && (
                                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                                            {attraction.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                                                        <Eye className="w-4 h-4" />
                                                        <span>{attraction.viewCount || 0} 次浏览</span>
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

                            {/* <TabsContent value="comments" className="mt-6">
                                <Comments
                                    targetType="destination"
                                    targetId={destinationId}
                                />
                            </TabsContent> */}
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
                                    <span className="text-sm text-muted-foreground">景点数量</span>
                                    <span className="font-bold text-lg">{attractionsCount}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm text-muted-foreground">游记数量</span>
                                    <span className="font-bold text-lg">{travels.length}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <span className="text-sm text-muted-foreground">浏览次数</span>
                                    <span className="font-bold text-lg">{destination.viewCount || 0}</span>
                                </div>
                            </CardContent>
                        </Card>


                    </div>
                </div>
            </div>
        </div>
    )
}