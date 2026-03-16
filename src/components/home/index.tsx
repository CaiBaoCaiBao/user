'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TravelApi, DestinationApi, SpotApi } from '@/api'
import { request } from '@/config/axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { ChevronRight, MapPin, Calendar, Eye, Heart, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Banner {
    id: number
    bannerId: string
    title: string
    imageUrl: string
    linkUrl?: string
    sortOrder: number
}

interface HomeRecommendData {
    banners: Banner[]
    recommendedTravels: any[]
    hotDestinations: any[]
    hotSpots: any[]
}

export default function Home() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<HomeRecommendData>({
        banners: [],
        recommendedTravels: [],
        hotDestinations: [],
        hotSpots: [],
    })

    useEffect(() => {
        fetchHomeData()
    }, [])

    const fetchHomeData = async () => {
        try {
            setLoading(true)

            // 并行获取所有数据
            const [bannersRes, travelsRes, destinationsRes, spotsRes] = await Promise.all([
                request.get('/banner/api/active'),
                TravelApi.getTravels({ pageNum: 1, pageSize: 6, status: 1 }),
                DestinationApi.getDestinations({ page: 1, pageSize: 6, status: '1' }),
                SpotApi.getSpots({ page: 1, pageSize: 6, status: 1 }),
            ])

            setData({
                banners: bannersRes.data.success ? bannersRes.data.data : [],
                recommendedTravels: travelsRes.data?.data?.records || [],
                hotDestinations: destinationsRes.data?.data?.records || [],
                hotSpots: spotsRes.data?.data?.records || [],
            })
        } catch (error) {
            console.error('获取首页数据失败:', error)
            toast.error('获取首页数据失败')
        } finally {
            setLoading(false)
        }
    }

    const handleBannerClick = (banner: Banner) => {
        if (banner.linkUrl) {
            router.push(banner.linkUrl)
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
                    <Carousel className="w-full">
                        <CarouselContent>
                            {data.banners.map((banner, index) => (
                                <CarouselItem key={banner.bannerId || `banner-${index}`}>
                                    <div
                                        className="relative h-96 rounded-lg overflow-hidden cursor-pointer"
                                        onClick={() => handleBannerClick(banner)}
                                    >
                                        <img
                                            src={banner.imageUrl}
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

            {/* 推荐游记 */}
            {data.recommendedTravels.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">推荐游记</h2>
                        <Button
                            variant="ghost"
                            onClick={() => router.push('/travels')}
                        >
                            查看更多 <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.recommendedTravels.map((travel, index) => (
                            <Card
                                key={travel.noteId || `travel-${index}`}
                                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleTravelClick(travel.noteId)}
                            >
                                {travel.coverImg && (
                                    <div className="h-48 bg-muted overflow-hidden">
                                        <img
                                            src={travel.coverImg}
                                            alt={travel.title}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                                <CardContent className="p-4">
                                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                                        {travel.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                        {travel.content}
                                    </p>
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
            {data.hotSpots.length > 0 && (
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
                        {data.hotSpots.map((spot, index) => {
                            const images = typeof spot.images === 'string'
                                ? JSON.parse(spot.images)
                                : spot.images
                            const coverImage = Array.isArray(images) && images.length > 0
                                ? images[0]
                                : spot.images

                            return (
                                <Card
                                    key={spot.aid || `spot-${index}`}
                                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => handleSpotClick(spot.aid)}
                                >
                                    {coverImage && (
                                        <div className="h-48 bg-muted overflow-hidden relative">
                                            <img
                                                src={coverImage}
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
                                        {spot.address && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="w-4 h-4" />
                                                <span className="line-clamp-1">{spot.address}</span>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* 空状态 */}
            {!loading && data.banners.length === 0 &&
                data.recommendedTravels.length === 0 &&
                data.hotDestinations.length === 0 &&
                data.hotSpots.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    暂无推荐内容
                </div>
            )}
        </div>
    )
}
