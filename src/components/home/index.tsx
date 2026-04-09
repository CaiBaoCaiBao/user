'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TravelApi, DestinationApi, SpotApi } from '@/api'
import { request } from '@/config/axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, useCarousel } from '@/components/ui/carousel'
import { ChevronRight, MapPin, Calendar, Eye, Heart, MessageCircle, User } from 'lucide-react'
import { toast } from 'sonner'
import Autoplay from 'embla-carousel-autoplay'

interface Banner {
    id: number
    title: string
    image: string
    linkType: number
    targetId?: string
    linkUrl?: string
    sort: number
}

interface TravelNoteItem {
    noteId: string
    title: string
    coverImg?: string
    summary?: string
    userId: string
    userName?: string
    userAvatar?: string
    viewCount?: number
    likeCount?: number
    commentCount?: number
    createdAt?: string
    top?: boolean
}

interface DestinationItem {
    destinationId: string
    name: string
    coverImg?: string
    description?: string
    viewCount?: number
    province?: string
    city?: string
    bestSeason?: string
}

interface AttractionItem {
    aid: string
    destinationId: string
    name: string
    coverImg?: string
    description?: string
    viewCount?: number
    destinationName?: string
}

interface HomeRecommendData {
    banners: Banner[]
    recommendedTravelNotes: TravelNoteItem[]
    hotDestinations: DestinationItem[]
    hotAttractions: AttractionItem[]
}

export default function Home() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<HomeRecommendData>({
        banners: [],
        recommendedTravelNotes: [],
        hotDestinations: [],
        hotAttractions: [],
    })

    // 自动播放插件配置
    const autoplayPlugin = useCallback(
        Autoplay({
            delay: 3000, // 3秒自动切换
            stopOnInteraction: false, // 用户交互后继续自动播放
            stopOnMouseEnter: false, // 鼠标悬停时不停止
        }),
        []
    )

    useEffect(() => {
        fetchHomeData()
    }, [])

    const fetchHomeData = async () => {
        try {
            setLoading(true)

            // 使用后端的首页推荐接口
            const [bannersRes, recommendRes] = await Promise.all([
                request.get('/banner/api/active'),
                request.get('/home/api/recommend'),
            ])

            setData({
                banners: bannersRes.data.success ? bannersRes.data.data : [],
                recommendedTravelNotes: recommendRes.data?.data?.recommendedTravelNotes || [],
                hotDestinations: recommendRes.data?.data?.hotDestinations || [],
                hotAttractions: recommendRes.data?.data?.hotAttractions || [],
            })
        } catch (error) {
            console.error('获取首页数据失败:', error)
            toast.error('获取首页数据失败')
        } finally {
            setLoading(false)
        }
    }

    const handleBannerClick = (banner: Banner) => {
        // 根据链接类型跳转
        switch (banner.linkType) {
            case 0: // 外部链接
                if (banner.linkUrl) {
                    window.open(banner.linkUrl, '_blank')
                }
                break
            case 1: // 景点
                if (banner.targetId) {
                    router.push(`/spots/${banner.targetId}`)
                }
                break
            case 2: // 目的地
                if (banner.targetId) {
                    router.push(`/destinations/${banner.targetId}`)
                }
                break
            case 3: // 游记
                if (banner.targetId) {
                    router.push(`/travels/${banner.targetId}`)
                }
                break
            default:
                break
        }
    }

    const handleTravelClick = (noteId: string) => {
        router.push(`/travels/${noteId}`)
    }

    const handleDestinationClick = (destinationId: string) => {
        router.push(`/destinations/${destinationId}`)
    }

    const handleSpotClick = (aid: string) => {
        router.push(`/spots/${aid}`)
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-8">
                <div className="h-96 bg-muted animate-pulse rounded-lg" />
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
                <div className="h-64 bg-muted animate-pulse rounded-lg" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-12">
            {/* 轮播图 */}
            {data.banners.length > 0 && (
                <section>
                    <Carousel
                        className="w-full"
                        plugins={[autoplayPlugin]}
                        opts={{
                            loop: true, // 启用循环播放
                        }}
                    >
                        <CarouselContent>
                            {data.banners.map((banner, index) => (
                                <CarouselItem key={banner.id || `banner-${index}`}>
                                    <div
                                        className="relative h-96 rounded-lg overflow-hidden cursor-pointer"
                                        onClick={() => handleBannerClick(banner)}
                                    >
                                        <img
                                            src={banner.image}
                                            alt={banner.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-8 left-8 text-white">
                                            <h2 className="text-3xl font-bold mb-2">{banner.title}</h2>
                                        </div>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </section>
            )}

            {/* 热门攻略 */}
            {data.recommendedTravelNotes.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">热门攻略</h2>
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/travels')}
                        >
                            查看更多 <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.recommendedTravelNotes.map((travel, index) => (
                            <Card
                                key={travel.noteId || `travel-${index}`}
                                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleTravelClick(travel.noteId)}
                            >
                                {travel.coverImg && (
                                    <div className="h-48 bg-muted overflow-hidden relative">
                                        <img
                                            src={travel.coverImg}
                                            alt={travel.title}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                        {travel.top && (
                                            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                                置顶
                                            </div>
                                        )}
                                    </div>
                                )}
                                <CardContent className="p-4">
                                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                                        {travel.title}
                                    </h3>
                                    {travel.summary && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                            {travel.summary}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                                        {travel.userAvatar && (
                                            <img
                                                src={travel.userAvatar}
                                                alt={travel.userName}
                                                className="w-5 h-5 rounded-full"
                                            />
                                        )}
                                        <span className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {travel.userName || '未知用户'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" />
                                            <span>{travel.viewCount || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Heart className="w-4 h-4" />
                                            <span>{travel.likeCount || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageCircle className="w-4 h-4" />
                                            <span>{travel.commentCount || 0}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* 热门目的地 */}
            {data.hotDestinations.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">热门目的地</h2>
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/destinations')}
                        >
                            查看更多 <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.hotDestinations.map((dest, index) => (
                            <Card
                                key={dest.destinationId || `dest-${index}`}
                                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleDestinationClick(dest.destinationId)}
                            >
                                {dest.coverImg && (
                                    <div className="h-48 bg-muted overflow-hidden relative">
                                        <img
                                            src={dest.coverImg}
                                            alt={dest.name}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                                            <Eye className="w-3 h-3 inline mr-1" />
                                            {dest.viewCount || 0}
                                        </div>
                                    </div>
                                )}
                                <CardContent className="p-4">
                                    <h3 className="text-lg font-semibold mb-2">{dest.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                        {dest.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4" />
                                        <span>{dest.province} {dest.city}</span>
                                    </div>
                                    {dest.bestSeason && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>最佳季节: {dest.bestSeason}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* 热门景点 */}
            {data.hotAttractions.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">热门景点</h2>
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/spots')}
                        >
                            查看更多 <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.hotAttractions.map((spot, index) => (
                            <Card
                                key={spot.aid || `spot-${index}`}
                                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleSpotClick(spot.aid)}
                            >
                                {spot.coverImg && (
                                    <div className="h-48 bg-muted overflow-hidden relative">
                                        <img
                                            src={spot.coverImg}
                                            alt={spot.name}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                                            <Eye className="w-3 h-3 inline mr-1" />
                                            {spot.viewCount || 0}
                                        </div>
                                    </div>
                                )}
                                <CardContent className="p-4">
                                    <h3 className="text-lg font-semibold mb-2">{spot.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                        {spot.description}
                                    </p>
                                    {spot.destinationName && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="w-4 h-4" />
                                            <span className="line-clamp-1">{spot.destinationName}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* 空状态 */}
            {!loading && data.banners.length === 0 &&
                data.recommendedTravelNotes.length === 0 &&
                data.hotDestinations.length === 0 &&
                data.hotAttractions.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    暂无推荐内容
                </div>
            )}
        </div>
    )
}
