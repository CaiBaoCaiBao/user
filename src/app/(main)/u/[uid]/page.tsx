'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { UserApi, TravelApi, SocialApi } from '@/api'
import type { UserInfo, TravelInfo, Collect, Like } from '@/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Calendar, Eye, Heart, Bookmark, FileText, Settings, UserPlus, UserMinus, Mail, Phone,MessageCircle } from 'lucide-react'
import { useCurrentUser } from '@/store/userStore'
import { toast } from 'sonner'

export default function UserPage({ params }: { params: Promise<{ uid: string }> }) {
    const router = useRouter()
    const currentUser = useCurrentUser()
    const { uid } = use(params)
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [travels, setTravels] = useState<TravelInfo[]>([])
    const [likes, setLikes] = useState<Like[]>([])
    const [likeTravels, setLikeTravels] = useState<TravelInfo[]>([])
    const [collections, setCollections] = useState<Collect[]>([])
    const [collectionTravels, setCollectionTravels] = useState<TravelInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [userLoading, setUserLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'travels' | 'likes' | 'collections'>('travels')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [isFollowing, setIsFollowing] = useState(false)
    const [followingLoading, setFollowingLoading] = useState(false)
    const pageSize = 12

    // 获取用户信息（包含资料）
    const fetchUserInfo = async () => {
        try {
            setUserLoading(true)
            // uid 参数实际上是 userName，使用 getUserByUserName 方法
            const response = await UserApi.getUserByUserName(uid)
            setUserInfo(response.data.data)
        } catch (error) {
            console.error('获取用户信息失败:', error)
            toast.error('获取用户信息失败')
        } finally {
            setUserLoading(false)
        }
    }

    // 获取用户游记
    const fetchUserTravels = async () => {
        try {
            setLoading(true)
            // 如果是当前用户，获取所有游记（包括草稿）；否则只获取已发布的游记
            const response = await TravelApi.getTravels({
                pageNum: page,
                pageSize,
                userId: userInfo?.uuid,
                status: isCurrentUser ? undefined : 1,
            })
            console.log('游记响应:', response.data)
            const pageData = response.data.data
            const travelData = pageData?.records || []
            setTravels(Array.isArray(travelData) ? travelData : [])
            setTotal(pageData?.total || 0)
        } catch (error) {
            console.error('获取用户游记失败:', error)
            setTravels([])
        } finally {
            setLoading(false)
        }
    }

    // 获取用户点赞列表
    const fetchUserLikes = async () => {
        try {
            setLoading(true)
            const response = await SocialApi.getLikeList({
                page,
                pageSize,
                userId: userInfo?.uuid,
                targetType: 'travel-note',
            })
            console.log('点赞响应:', response.data)
            const pageData = response.data.data
            const likeData = pageData?.records || []
            setLikes(Array.isArray(likeData) ? likeData : [])

            // 获取点赞的游记详情
            if (likeData.length > 0) {
                const noteIds = likeData.map((l: any) => l.targetId)
                const travelsResponse = await TravelApi.getBatchTravelDetail(noteIds)
                const travelData = travelsResponse.data.data || []
                setLikeTravels(Array.isArray(travelData) ? travelData : [])
            } else {
                setLikeTravels([])
            }

            setTotal(pageData?.total || 0)
        } catch (error) {
            console.error('获取用户点赞失败:', error)
            setLikes([])
            setLikeTravels([])
        } finally {
            setLoading(false)
        }
    }

    // 获取用户收藏列表
    const fetchUserCollections = async () => {
        try {
            setLoading(true)
            const response = await SocialApi.getCollectionList({
                page,
                pageSize,
                userId: userInfo?.uuid,
                targetType: 'travel-note',
            })
            console.log('收藏响应:', response.data)
            const pageData = response.data.data
            const collectionData = pageData?.data || []
            setCollections(Array.isArray(collectionData) ? collectionData : [])

            // 获取收藏的游记详情
            if (collectionData.length > 0) {
                const noteIds = collectionData.map((c: any) => c.targetId)
                const travelsResponse = await TravelApi.getBatchTravelDetail(noteIds)
                const travelData = travelsResponse.data.data || []
                setCollectionTravels(Array.isArray(travelData) ? travelData : [])
            } else {
                setCollectionTravels([])
            }

            setTotal(pageData?.total || 0)
        } catch (error) {
            console.error('获取用户收藏失败:', error)
            setCollections([])
            setCollectionTravels([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUserInfo()
    }, [uid])

    useEffect(() => {
        if (userInfo?.uuid) {
            if (activeTab === 'travels') {
                fetchUserTravels()
            } else if (activeTab === 'likes') {
                fetchUserLikes()
            } else if (activeTab === 'collections') {
                fetchUserCollections()
            }
        }
    }, [userInfo?.uuid, page, activeTab])

    // 跳转游记详情
    const goToTravelDetail = (noteId: string) => {
        router.push(`/travels/${noteId}`)
    }

    // 跳转编辑资料
    const goToEditProfile = () => {
        router.push('/settings/profile')
    }

    // 判断是否是当前用户
    const isCurrentUser = currentUser?.uuid === userInfo?.uuid

    // 使用用户信息中的资料字段
    const displayName = userInfo?.nickName || userInfo?.userName || ''
    const avatar = userInfo?.avatar || ''

    // 关注/取消关注
    const handleFollow = async () => {
        if (!currentUser) {
            toast.error('请先登录')
            return
        }

        try {
            setFollowingLoading(true)
            // TODO: 调用关注/取消关注API
            // await UserApi.followUser(userInfo?.uuid)
            setIsFollowing(!isFollowing)
            toast.success(isFollowing ? '已取消关注' : '关注成功')
        } catch (error) {
            console.error('关注操作失败:', error)
            toast.error('操作失败')
        } finally {
            setFollowingLoading(false)
        }
    }

    // 格式化日期
    const formatDate = (dateString?: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    }

    // 处理游记更新（用于点赞/收藏后的回调）
    const handleTravelUpdate = (noteId: string, updates: Partial<TravelInfo>) => {
        // 更新游记列表
        setTravels(prev => prev.map(t =>
            t.noteId === noteId ? { ...t, ...updates } : t
        ))
        // 更新喜欢列表
        setLikeTravels(prev => prev.map(t =>
            t.noteId === noteId ? { ...t, ...updates } : t
        ))
        // 更新收藏列表
        setCollectionTravels(prev => prev.map(t =>
            t.noteId === noteId ? { ...t, ...updates } : t
        ))
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* 用户信息卡片 */}
            {userLoading ? (
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                            <div className="h-24 w-24 rounded-full bg-muted animate-pulse" />
                            <div className="flex-1 space-y-4">
                                <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
                                <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                                <div className="flex gap-6">
                                    <div className="h-4 bg-muted animate-pulse rounded w-20" />
                                    <div className="h-4 bg-muted animate-pulse rounded w-20" />
                                    <div className="h-4 bg-muted animate-pulse rounded w-20" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : userInfo ? (
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                            {/* 头像 */}
                            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                <AvatarImage src={avatar} alt={displayName} />
                                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                    {displayName?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {/* 用户信息 */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h1 className="text-2xl font-bold mb-1">
                                            {displayName}
                                        </h1>
                                        <p className="text-muted-foreground">@{userInfo.userName}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {!isCurrentUser && (
                                            <Button
                                                variant={isFollowing ? "outline" : "default"}
                                                size="sm"
                                                onClick={handleFollow}
                                                disabled={followingLoading}
                                            >
                                                {followingLoading ? (
                                                    '处理中...'
                                                ) : isFollowing ? (
                                                    <>
                                                        <UserMinus className="w-4 h-4 mr-2" />
                                                        取消关注
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="w-4 h-4 mr-2" />
                                                        关注
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                        {isCurrentUser && (
                                            <Button variant="outline" size="sm" onClick={goToEditProfile}>
                                                <Settings className="w-4 h-4 mr-2" />
                                                编辑资料
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* 个人简介 */}
                                {userInfo.bio && (
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {userInfo.bio}
                                    </p>
                                )}

                                {/* 联系方式 */}
                                <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                                    {userInfo.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            <span>{userInfo.email}</span>
                                        </div>
                                    )}
                                    {userInfo.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            <span>{userInfo.phone}</span>
                                        </div>
                                    )}
                                    {userInfo.birthday && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>生日: {formatDate(userInfo.birthday)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* 统计信息 */}
                                <div className="flex gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary" />
                                        <span className="font-medium">{total}</span>
                                        <span className="text-muted-foreground">篇游记</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-primary" />
                                        <span className="font-medium">{travels.reduce((sum, t) => sum + (t.viewCount || 0), 0)}</span>
                                        <span className="text-muted-foreground">浏览</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Heart className="w-4 h-4 text-primary" />
                                        <span className="font-medium">{travels.reduce((sum, t) => sum + (t.likeCount || 0), 0)}</span>
                                        <span className="text-muted-foreground">获赞</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="mb-8">
                    <CardContent className="p-12 text-center text-muted-foreground">
                        用户不存在
                    </CardContent>
                </Card>
            )}

            {/* 标签页 */}
            {userInfo && (
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                        <TabsTrigger value="travels">游记</TabsTrigger>
                        <TabsTrigger value="likes">喜欢</TabsTrigger>
                        <TabsTrigger value="collections">收藏</TabsTrigger>
                    </TabsList>
                </Tabs>
            )}

            {/* 创建按钮（仅当前用户可见） */}
            {isCurrentUser && activeTab === 'travels' && (
                <div className="mb-6 flex justify-end">
                    <Button onClick={() => router.push('/travels/create')}>
                        <FileText className="w-4 h-4 mr-2" />
                        创建游记
                    </Button>
                </div>
            )}

            {/* 游记列表 */}
            {activeTab === 'travels' && (
                <>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i} className="h-96 animate-pulse" />
                            ))}
                        </div>
                    ) : travels.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center text-muted-foreground">
                                {isCurrentUser ? '还没有发布游记，快去创建吧！' : '该用户还没有发布游记'}
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {travels.map(travel => (
                                    <TravelCard
                                        key={travel.noteId}
                                        travel={travel}
                                        goToTravelDetail={goToTravelDetail}
                                        isCurrentUser={isCurrentUser}
                                        activeTab={activeTab}
                                        router={router}
                                        onTravelUpdate={handleTravelUpdate}
                                    />
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
                </>
            )}

            {/* 喜欢列表 */}
            {activeTab === 'likes' && (
                <>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i} className="h-96 animate-pulse" />
                            ))}
                        </div>
                    ) : likeTravels.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center text-muted-foreground">
                                {isCurrentUser ? '还没有点赞游记' : '该用户还没有点赞游记'}
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {likeTravels.map(travel => (
                                    <TravelCard
                                        key={travel.noteId}
                                        travel={travel}
                                        goToTravelDetail={goToTravelDetail}
                                        isCurrentUser={isCurrentUser}
                                        activeTab={activeTab}
                                        router={router}
                                        onTravelUpdate={handleTravelUpdate}
                                    />
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
                </>
            )}

            {/* 收藏列表 */}
            {activeTab === 'collections' && (
                <>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i} className="h-96 animate-pulse" />
                            ))}
                        </div>
                    ) : collectionTravels.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center text-muted-foreground">
                                {isCurrentUser ? '还没有收藏游记' : '该用户还没有收藏游记'}
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {collectionTravels.map(travel => (
                                    <TravelCard
                                        key={travel.noteId}
                                        travel={travel}
                                        goToTravelDetail={goToTravelDetail}
                                        isCurrentUser={isCurrentUser}
                                        activeTab={activeTab}
                                        router={router}
                                        onTravelUpdate={handleTravelUpdate}
                                    />
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
                </>
            )}
        </div>
    )
}

// 游记卡片组件
function TravelCard({
    travel,
    goToTravelDetail,
    isCurrentUser,
    activeTab,
    router,
    onTravelUpdate,
}: {
    travel: TravelInfo
    goToTravelDetail: (noteId: string) => void
    isCurrentUser: boolean
    activeTab: string
    router: any
    onTravelUpdate: (noteId: string, updates: Partial<TravelInfo>) => void
}) {
    const currentUser = useCurrentUser()
    const [isLiked, setIsLiked] = useState(false)
    const [isCollected, setIsCollected] = useState(false)
    const [likeCount, setLikeCount] = useState(travel.likeCount || 0)
    const [collectionCount, setCollectionCount] = useState(travel.collectionCount || 0)
    const [isProcessingLike, setIsProcessingLike] = useState(false)
    const [isProcessingCollection, setIsProcessingCollection] = useState(false)

    // 获取点赞和收藏状态
    useEffect(() => {
        if (currentUser?.uuid && travel.noteId) {
            fetchSocialStatus()
        }
    }, [currentUser?.uuid, travel.noteId])

    const fetchSocialStatus = async () => {
        if (!currentUser?.uuid || !travel.noteId) return

        try {
            // 获取点赞状态
            const likeResponse = await SocialApi.checkLikeStatus({
                targetType: 'travel_note',
                targetId: travel.noteId,
            })
            const likeData = likeResponse.data.data
            setIsLiked(likeData?.isLiked || false)
            if (likeData?.likeCount !== undefined) {
                setLikeCount(likeData.likeCount)
            }
        } catch (error) {
            console.error('获取点赞状态失败:', error)
        }

        try {
            // 获取收藏状态
            const collectResponse = await SocialApi.checkCollectionStatus({
                targetType: 'travel_note',
                targetId: travel.noteId,
            })
            setIsCollected(collectResponse.data.data?.isCollected || false)
        } catch (error) {
            console.error('获取收藏状态失败:', error)
        }
    }

    // 点赞/取消点赞
    const handleToggleLike = async (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!currentUser?.uuid) {
            toast.error('请先登录')
            return
        }

        if (isProcessingLike) return

        const wasLiked = isLiked
        setIsProcessingLike(true)

        try {
            setIsLiked(!wasLiked)
            const newLikeCount = wasLiked ? likeCount - 1 : likeCount + 1
            setLikeCount(newLikeCount)

            await SocialApi.toggleLike({
                targetType: 'travel_note',
                targetId: travel.noteId,
            })

            // 通知父组件更新
            onTravelUpdate(travel.noteId, { likeCount: newLikeCount })

            toast.success(wasLiked ? '取消点赞成功' : '点赞成功')
        } catch (error) {
            console.error('点赞失败:', error)
            setIsLiked(wasLiked)
            setLikeCount(likeCount)
            toast.error('操作失败')
        } finally {
            setIsProcessingLike(false)
        }
    }

    // 收藏/取消收藏
    const handleToggleCollection = async (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!currentUser?.uuid) {
            toast.error('请先登录')
            return
        }

        if (isProcessingCollection) return

        const wasCollected = isCollected
        setIsProcessingCollection(true)

        try {
            setIsCollected(!wasCollected)
            const newCollectionCount = wasCollected ? collectionCount - 1 : collectionCount + 1
            setCollectionCount(newCollectionCount)

            await SocialApi.toggleCollection({
                targetType: 'travel_note',
                targetId: travel.noteId,
            })

            // 通知父组件更新
            onTravelUpdate(travel.noteId, { collectionCount: newCollectionCount })

            toast.success(wasCollected ? '取消收藏成功' : '收藏成功')
        } catch (error) {
            console.error('收藏失败:', error)
            setIsCollected(wasCollected)
            setCollectionCount(collectionCount)
            toast.error('操作失败')
        } finally {
            setIsProcessingCollection(false)
        }
    }

    return (
        <div className="relative group">
            <Card
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => goToTravelDetail(travel.noteId)}
            >
                {/* 封面图 */}
                {travel.coverImg ? (
                    <div className="h-48 bg-muted overflow-hidden">
                        <img
                            src={travel.coverImg}
                            alt={travel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                ) : (
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <FileText className="w-16 h-16 text-primary/30" />
                    </div>
                )}

                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold flex-1 line-clamp-1">
                            {travel.title}
                        </h3>
                        {isCurrentUser && travel.status === 0 && (
                            <Badge variant="secondary" className="ml-2">草稿</Badge>
                        )}
                    </div>
                    {travel.content && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {travel.content}
                        </p>
                    )}
                    {travel.travelDays && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{travel.travelDays} 天行程</span>
                        </div>
                    )}
                </CardContent>

                <CardContent className="px-4 pb-4 pt-0 flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{travel.viewCount || 0}</span>
                        </div>
                        <button
                            onClick={handleToggleLike}
                            disabled={isProcessingLike}
                            className={`flex items-center gap-1 hover:text-foreground transition-colors ${
                                isLiked ? 'text-red-500' : ''
                            } ${isProcessingLike ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                            <span>{likeCount}</span>
                        </button>
                        <button
                            onClick={handleToggleCollection}
                            disabled={isProcessingCollection}
                            className={`flex items-center gap-1 hover:text-foreground transition-colors ${
                                isCollected ? 'text-yellow-500' : ''
                            } ${isProcessingCollection ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Bookmark className={`w-4 h-4 ${isCollected ? 'fill-current' : ''}`} />
                            <span>{collectionCount}</span>
                        </button>
                        <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{travel.commentCount || 0}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {/* 作者操作菜单（仅当前用户可见） */}
            {isCurrentUser && activeTab === 'travels' && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/travels/${travel.noteId}/edit`)
                        }}
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}