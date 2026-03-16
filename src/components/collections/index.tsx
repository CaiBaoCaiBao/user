'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SocialApi, TravelApi, DestinationApi, SpotApi } from '@/api'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bookmark, MapPin, Eye, Heart, MessageCircle, ExternalLink } from 'lucide-react'
import { useCurrentUser } from '@/store/userStore'
import { toast } from 'sonner'

interface CollectionItem {
    collectionId: string
    targetType: string
    targetId: string
    createdAt: string
}

interface TravelDetail {
    noteId: string
    title: string
    coverImg?: string
    content: string
    viewCount?: number
    likeCount?: number
    commentCount?: number
    userId?: string
    userName?: string
    nickName?: string
}

interface DestinationDetail {
    destinationId: string
    name: string
    coverImg?: string
    description?: string
    province?: string
    city?: string
    viewCount?: number
}

interface SpotDetail {
    aid: string
    name: string
    images?: string | string[]
    description?: string
    address?: string
    viewCount?: number
}

export default function Collections() {
    const router = useRouter()
    const currentUser = useCurrentUser()
    const [loading, setLoading] = useState(true)
    const [collections, setCollections] = useState<CollectionItem[]>([])
    const [travels, setTravels] = useState<Map<string, TravelDetail>>(new Map())
    const [destinations, setDestinations] = useState<Map<string, DestinationDetail>>(new Map())
    const [spots, setSpots] = useState<Map<string, SpotDetail>>(new Map())
    const [activeTab, setActiveTab] = useState<'all' | 'travel_note' | 'destination' | 'attraction'>('all')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const pageSize = 12

    useEffect(() => {
        if (currentUser?.uuid) {
            fetchCollections()
        }
    }, [currentUser?.uuid, page, activeTab])

    const fetchCollections = async () => {
        if (!currentUser?.uuid) return

        try {
            setLoading(true)
            const response = await SocialApi.getCollectionList({
                userId: currentUser.uuid,
                page,
                pageSize,
            })

            const result = response.data.data as any
            const collectionList = result.list || []
            setCollections(collectionList)
            setTotal(result.total || 0)

            // 批量获取详情
            await fetchDetails(collectionList)
        } catch (error) {
            console.error('获取收藏列表失败:', error)
            toast.error('获取收藏列表失败')
        } finally {
            setLoading(false)
        }
    }

    const fetchDetails = async (collectionList: CollectionItem[]) => {
        const travelIds = collectionList
            .filter(c => c.targetType === 'travel_note')
            .map(c => c.targetId)

        const destinationIds = collectionList
            .filter(c => c.targetType === 'destination')
            .map(c => c.targetId)

        const spotIds = collectionList
            .filter(c => c.targetType === 'attraction')
            .map(c => c.targetId)

        // 并行获取所有详情
        const [travelsRes, destinationsRes, spotsRes] = await Promise.allSettled([
            travelIds.length > 0 ? TravelApi.getBatchTravelDetail(travelIds) : Promise.resolve({ data: { data: [] } }),
            destinationIds.length > 0 ? Promise.all(destinationIds.map(id => DestinationApi.getDestinationById(id))) : Promise.resolve([]),
            spotIds.length > 0 ? Promise.all(spotIds.map(id => SpotApi.getSpotById(id))) : Promise.resolve([]),
        ])

        // 处理游记详情
        if (travelsRes.status === 'fulfilled' && travelsRes.value.data?.data) {
            const travelMap = new Map<string, TravelDetail>()
            const travelData = Array.isArray(travelsRes.value.data.data)
                ? travelsRes.value.data.data
                : [travelsRes.value.data.data]

            travelData.forEach((travel: any) => {
                if (travel?.noteId) {
                    travelMap.set(travel.noteId, travel)
                }
            })
            setTravels(travelMap)
        }

        // 处理目的地详情
        if (destinationsRes.status === 'fulfilled') {
            const destMap = new Map<string, DestinationDetail>()
            destinationsRes.value.forEach((res: any) => {
                const dest = res.data?.data
                if (dest?.destinationId) {
                    destMap.set(dest.destinationId, dest)
                }
            })
            setDestinations(destMap)
        }

        // 处理景点详情
        if (spotsRes.status === 'fulfilled') {
            const spotMap = new Map<string, SpotDetail>()
            spotsRes.value.forEach((res: any) => {
                const spot = res.data?.data
                if (spot?.aid) {
                    spotMap.set(spot.aid, spot)
                }
            })
            setSpots(spotMap)
        }
    }

    const handleToggleCollection = async (targetType: string, targetId: string) => {
        try {
            await SocialApi.toggleCollection({ targetType, targetId })
            toast.success('取消收藏成功')
            fetchCollections()
        } catch (error) {
            console.error('取消收藏失败:', error)
            toast.error('取消收藏失败')
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

    const filteredCollections = activeTab === 'all'
        ? collections
        : collections.filter(c => c.targetType === activeTab)

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">我的收藏</h1>

            {/* 标签页 */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
                <TabsList className="grid w-full max-w-md grid-cols-4">
                    <TabsTrigger value="all">全部</TabsTrigger>
                    <TabsTrigger value="travel_note">游记</TabsTrigger>
                    <TabsTrigger value="destination">目的地</TabsTrigger>
                    <TabsTrigger value="attraction">景点</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* 收藏列表 */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="h-96 animate-pulse" />
                    ))}
                </div>
            ) : filteredCollections.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>还没有收藏任何内容</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCollections.map((collection) => {
                            if (collection.targetType === 'travel_note') {
                                const travel = travels.get(collection.targetId)
                                if (!travel) return null

                                return (
                                    <Card
                                        key={collection.collectionId}
                                        className="overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        {travel.coverImg && (
                                            <div className="h-48 bg-muted overflow-hidden cursor-pointer" onClick={() => handleTravelClick(travel.noteId)}>
                                                <img
                                                    src={travel.coverImg}
                                                    alt={travel.title}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <CardContent className="p-4">
                                            <h3
                                                className="text-lg font-semibold mb-2 line-clamp-2 cursor-pointer hover:text-primary"
                                                onClick={() => handleTravelClick(travel.noteId)}
                                            >
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
                                        <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">
                                                收藏于 {new Date(collection.createdAt).toLocaleDateString('zh-CN')}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleCollection('travel_note', travel.noteId)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                取消收藏
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                )
                            }

                            if (collection.targetType === 'destination') {
                                const dest = destinations.get(collection.targetId)
                                if (!dest) return null

                                return (
                                    <Card
                                        key={collection.collectionId}
                                        className="overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        {dest.coverImg && (
                                            <div className="h-48 bg-muted overflow-hidden cursor-pointer" onClick={() => handleDestinationClick(dest.destinationId)}>
                                                <img
                                                    src={dest.coverImg}
                                                    alt={dest.name}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <CardContent className="p-4">
                                            <h3
                                                className="text-lg font-semibold mb-2 cursor-pointer hover:text-primary"
                                                onClick={() => handleDestinationClick(dest.destinationId)}
                                            >
                                                {dest.name}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                {dest.description}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <MapPin className="w-4 h-4" />
                                                <span>{dest.province} {dest.city}</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">
                                                收藏于 {new Date(collection.createdAt).toLocaleDateString('zh-CN')}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleCollection('destination', dest.destinationId)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                取消收藏
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                )
                            }

                            if (collection.targetType === 'attraction') {
                                const spot = spots.get(collection.targetId)
                                if (!spot) return null

                                const images = typeof spot.images === 'string'
                                    ? JSON.parse(spot.images)
                                    : spot.images
                                const coverImage = Array.isArray(images) && images.length > 0
                                    ? images[0]
                                    : spot.images

                                return (
                                    <Card
                                        key={collection.collectionId}
                                        className="overflow-hidden hover:shadow-lg transition-shadow"
                                    >
                                        {coverImage && (
                                            <div className="h-48 bg-muted overflow-hidden cursor-pointer" onClick={() => handleSpotClick(spot.aid)}>
                                                <img
                                                    src={coverImage}
                                                    alt={spot.name}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        )}
                                        <CardContent className="p-4">
                                            <h3
                                                className="text-lg font-semibold mb-2 cursor-pointer hover:text-primary"
                                                onClick={() => handleSpotClick(spot.aid)}
                                            >
                                                {spot.name}
                                            </h3>
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
                                        <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
                                            <span className="text-xs text-muted-foreground">
                                                收藏于 {new Date(collection.createdAt).toLocaleDateString('zh-CN')}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleCollection('attraction', spot.aid)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                取消收藏
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                )
                            }

                            return null
                        })}
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
                            <span className="flex items-center text-sm text-muted-foreground px-4">
                                第 {page} 页
                            </span>
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
