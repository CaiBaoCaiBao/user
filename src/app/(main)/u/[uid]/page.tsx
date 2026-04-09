'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { UserApi, TravelApi, SocialApi } from '@/api'
import type { UserInfo, TravelInfo, Like } from '@/api'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Eye, Heart, Bookmark, FileText, Settings, Mail, Phone, MessageCircle } from 'lucide-react'
import { useCurrentUser } from '@/store/userStore'
import { toast } from 'sonner'
import TravelCard from '@/components/travels/travel-card'

export default function UserPage({ params }: { params: Promise<{ uid: string }> }) {
    const router = useRouter()
    const currentUser = useCurrentUser()
    const { uid } = use(params)
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [travels, setTravels] = useState<TravelInfo[]>([])
    const [likes, setLikes] = useState<Like[]>([])
    const [likeTravels, setLikeTravels] = useState<TravelInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [userLoading, setUserLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'travels' | 'drafts' | 'likes'>('travels')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [travelTotalCount, setTravelTotalCount] = useState(0) // 用户游记总数
    const [draftTotalCount, setDraftTotalCount] = useState(0) // 用户草稿总数
    const [totalViewCount, setTotalViewCount] = useState(0) // 用户总浏览数
    const [totalLikeCount, setTotalLikeCount] = useState(0) // 用户总获赞数
    const pageSize = 12

    // 获取用户信息（包含资料）
    const fetchUserInfo = async () => {
        try {
            setUserLoading(true)
            console.log('开始获取用户信息，userName:', uid)
            // uid 参数实际上是 userName（用户名），使用 getUserByUserName 方法
            // 路由设计：/u/[uid] 中的 uid 存储的是 userName，而不是用户 UUID
            const response = await UserApi.getUserByUserName(uid)
            console.log('用户信息响应:', response.data.data)
            console.log('用户UUID:', response.data.data?.uuid)
            setUserInfo(response.data.data)
        } catch (error) {
            console.error('获取用户信息失败:', error)
            toast.error('获取用户信息失败')
        } finally {
            setUserLoading(false)
        }
    }

    // 判断是否是当前用户
    const isCurrentUser = currentUser?.uuid === userInfo?.uuid

    // 获取用户游记
    const fetchUserTravels = async () => {
        try {
            setLoading(true)
            console.log('获取用户游记，userId:', userInfo?.uuid, 'isCurrentUser:', isCurrentUser)
            console.log('currentUser:', currentUser)
            console.log('currentUser.uuid:', currentUser?.uuid)
            console.log('userInfo.uuid:', userInfo?.uuid)

            // 查看自己的主页时，调用 my-list 接口（显示所有状态的游记）
            // 查看别人的主页时，调用 list 接口（只显示审核通过的游记）
            const requestParams: any = {
                pageNum: page,
                pageSize,
            }

            let response
            if (isCurrentUser) {
                console.log('查看自己的主页，调用 my-list 接口，显示所有状态的游记')
                response = await TravelApi.getMyTravels(requestParams)
            } else {
                console.log('查看别人的主页，调用 list 接口，只显示审核通过的游记')
                requestParams.userId = userInfo?.uuid
                requestParams.status = 1 // 只显示审核通过的游记
                response = await TravelApi.getTravels(requestParams)
            }

            console.log('请求参数:', requestParams)
            console.log('游记响应:', response.data)
            const pageData = response.data.data
            const travelData = pageData?.records || []
            console.log('游记数据:', travelData)
            setTravels(Array.isArray(travelData) ? travelData : [])
            setTotal(pageData?.total || 0)

            // 获取用户游记总数和统计数据（第一页时获取）
            if (page === 1) {
                setTravelTotalCount(pageData?.total || 0)
                // 计算总浏览数和总获赞数
                const totalViews = travelData.reduce((sum: number, t: any) => sum + (t.viewCount || 0), 0)
                const totalLikes = travelData.reduce((sum: number, t: any) => sum + (t.likeCount || 0), 0)
                setTotalViewCount(totalViews)
                setTotalLikeCount(totalLikes)
            }
        } catch (error) {
            console.error('获取用户游记失败:', error)
            setTravels([])
        } finally {
            setLoading(false)
        }
    }

    // 获取用户草稿
    const fetchUserDrafts = async () => {
        try {
            setLoading(true)
            console.log('获取用户草稿，userId:', userInfo?.uuid)

            const response = await TravelApi.getMyDrafts(page, pageSize, userInfo?.uuid)
            console.log('草稿响应:', response.data)
            const pageData = response.data.data
            const draftData = pageData?.records || []
            console.log('草稿数据:', draftData)
            setTravels(Array.isArray(draftData) ? draftData : [])
            setTotal(pageData?.total || 0)

            // 获取用户草稿总数（第一页时获取）
            if (page === 1) {
                setDraftTotalCount(pageData?.total || 0)
            }
        } catch (error) {
            console.error('获取用户草稿失败:', error)
            setTravels([])
        } finally {
            setLoading(false)
        }
    }

    // 获取用户草稿数量（仅用于统计）
    const fetchUserDraftCount = async () => {
        try {
            console.log('获取用户草稿数量，userId:', userInfo?.uuid)
            const response = await TravelApi.getMyDrafts(1, 1, userInfo?.uuid)
            const pageData = response.data.data
            setDraftTotalCount(pageData?.total || 0)
        } catch (error) {
            console.error('获取用户草稿数量失败:', error)
            setDraftTotalCount(0)
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
                targetType: 'travel_note',
            })
            console.log('点赞响应:', response.data)
            const pageData = response.data.data
            const likeData = pageData?.records || []
            setLikes(Array.isArray(likeData) ? likeData : [])

            // 后端已经返回了完整的游记信息，直接转换为游记格式
            if (likeData.length > 0) {
                const travels: TravelInfo[] = likeData.map((like: any): TravelInfo => ({
                    id: 0,
                    noteId: like.targetId,
                    userId: like.authorId || '',
                    destinationId: '',
                    title: like.targetTitle || '游记标题',
                    content: like.targetContent || '',
                    coverImg: like.targetCover || '',
                    userName: like.authorUserName || '',
                    nickName: like.authorName || '',
                    userAvatar: like.authorAvatar || '',
                    viewCount: like.viewCount || 0,
                    commentCount: like.commentCount || 0,
                    likeCount: like.likeCount || 0,
                    collectionCount: like.collectionCount || 0,
                }))
                setLikeTravels(travels)
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



    useEffect(() => {
        fetchUserInfo()
    }, [uid])

    // 获取用户信息后，立即获取统计数据
    useEffect(() => {
        if (userInfo?.uuid) {
            // 获取游记数据
            if (activeTab === 'travels') {
                fetchUserTravels()
            } else if (activeTab === 'drafts') {
                fetchUserDrafts()
            } else if (activeTab === 'likes') {
                fetchUserLikes()
            }

            // 如果是当前用户，获取草稿数量统计
            if (isCurrentUser) {
                fetchUserDraftCount()
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

    // 使用用户信息中的资料字段
    const displayName = userInfo?.nickName || userInfo?.userName || ''
    const avatar = userInfo?.avatar || ''

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

        // 如果在喜欢标签页，且点赞数减少了，说明取消了点赞，需要从列表中移除
        if (activeTab === 'likes' && updates.likeCount !== undefined) {
            const travel = likeTravels.find(t => t.noteId === noteId)
            if (travel && updates.likeCount < travel.likeCount) {
                setLikeTravels(prev => prev.filter(t => t.noteId !== noteId))
                setTotal(prev => Math.max(0, prev - 1))
            }
        }
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
                                        <span className="font-medium">{travelTotalCount}</span>
                                        <span className="text-muted-foreground">篇游记</span>
                                    </div>
                                    {isCurrentUser && (
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-medium">{draftTotalCount}</span>
                                            <span className="text-muted-foreground">篇草稿</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-primary" />
                                        <span className="font-medium">{totalViewCount}</span>
                                        <span className="text-muted-foreground">浏览</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Heart className="w-4 h-4 text-primary" />
                                        <span className="font-medium">{totalLikeCount}</span>
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
                    <TabsList className={`grid w-full max-w-md mx-auto ${isCurrentUser ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        <TabsTrigger value="travels">游记</TabsTrigger>
                        {isCurrentUser && (
                            <TabsTrigger value="drafts">草稿</TabsTrigger>
                        )}
                        <TabsTrigger value="likes">喜欢</TabsTrigger>
                    </TabsList>
                </Tabs>
            )}

            {/* 操作按钮（仅当前用户可见） */}
            {isCurrentUser && (
                <div className="mb-6 flex justify-end gap-2">
                    {activeTab === 'travels' && (
                        <Button onClick={() => router.push('/travels/create')}>
                            <FileText className="w-4 h-4 mr-2" />
                            创建游记
                        </Button>
                    )}
                    {activeTab === 'drafts' && (
                        <Button onClick={() => router.push('/travels/create')}>
                            <FileText className="w-4 h-4 mr-2" />
                            创建游记
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => router.push('/collections')}>
                        <Bookmark className="w-4 h-4 mr-2" />
                        查看全部收藏
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
                                        showAuthor={true}
                                        showActions={isCurrentUser}
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

            {/* 草稿列表 */}
            {activeTab === 'drafts' && (
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
                                还没有草稿，快去创建吧！
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {travels.map(travel => (
                                    <TravelCard
                                        key={travel.noteId}
                                        travel={travel}
                                        showAuthor={false}
                                        showActions={true}
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
                                {likeTravels.map((travel) => {
                                    // 找到对应的点赞记录
                                    const like = likes.find(l => l.targetId === travel.noteId)
                                    return (
                                        <LikeTravelCard
                                            key={travel.noteId}
                                            travel={travel}
                                            like={like}
                                            goToTravelDetail={goToTravelDetail}
                                            isCurrentUser={isCurrentUser}
                                            activeTab={activeTab}
                                            router={router}
                                            onTravelUpdate={handleTravelUpdate}
                                        />
                                    )
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

// 喜欢游记卡片组件（显示点赞时间）
function LikeTravelCard({
    travel,
    like,
    goToTravelDetail,
    isCurrentUser,
    activeTab,
    router,
    onTravelUpdate,
}: {
    travel: TravelInfo
    like?: Like
    goToTravelDetail: (noteId: string) => void
    isCurrentUser: boolean
    activeTab: string
    router: any
    onTravelUpdate: (noteId: string, updates: Partial<TravelInfo>) => void
}) {
    const currentUser = useCurrentUser()
    const [isLiked, setIsLiked] = useState(true) // 在喜欢列表中默认为已点赞
    const [isCollected, setIsCollected] = useState(false)
    const [likeCount, setLikeCount] = useState(travel.likeCount || 0)
    const [collectionCount, setCollectionCount] = useState(travel.collectionCount || 0)
    const [isProcessingLike, setIsProcessingLike] = useState(false)
    const [isProcessingCollection, setIsProcessingCollection] = useState(false)

    // 获取收藏状态
    useEffect(() => {
        if (currentUser?.uuid && travel.noteId) {
            fetchCollectionStatus()
        }
    }, [currentUser?.uuid, travel.noteId])

    const fetchCollectionStatus = async () => {
        if (!currentUser?.uuid || !travel.noteId) return

        try {
            const collectResponse = await SocialApi.checkCollectionStatus({
                targetType: 'travel_note',
                targetId: travel.noteId,
            })
            setIsCollected(collectResponse.data.data?.isCollected || false)
        } catch (error) {
            console.error('获取收藏状态失败:', error)
        }
    }

    // 点赞/取消点赞（仅当前用户可以操作）
    const handleToggleLike = async (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!currentUser?.uuid) {
            toast.error('请先登录')
            return
        }

        // 只有当前用户才能操作自己的喜欢列表中的点赞
        if (!isCurrentUser) {
            toast.error('只能操作自己的喜欢列表')
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

    // 收藏/取消收藏（任何登录用户都可以操作）
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

    // 格式化点赞时间
    const formatLikeTime = (dateString?: string) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (days === 0) return '今天'
        if (days === 1) return '昨天'
        if (days < 7) return `${days}天前`
        return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    }

    return (
        <div className="relative group">
            <Card
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => goToTravelDetail(travel.noteId)}
            >
                {/* 封面图 */}
                {travel.coverImg ? (
                    <div className="h-48 bg-muted overflow-hidden relative">
                        <img
                            src={travel.coverImg}
                            alt={travel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* 点赞时间标签 */}
                        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            <Heart className="w-3 h-3 inline mr-1 fill-current" />
                            {formatLikeTime(like?.createdAt)}
                        </div>
                    </div>
                ) : (
                    <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative">
                        <FileText className="w-16 h-16 text-primary/30" />
                        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            <Heart className="w-3 h-3 inline mr-1 fill-current" />
                            {formatLikeTime(like?.createdAt)}
                        </div>
                    </div>
                )}

                <CardContent className="p-4">
                    {/* 标题 */}
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        {travel.title}
                    </h3>

                    {/* 内容预览 */}
                    {travel.content && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {travel.content}
                        </p>
                    )}

                    {/* 作者信息 */}
                    <div
                        className="flex items-center gap-2 text-sm text-muted-foreground mb-3 cursor-pointer hover:text-foreground transition-colors"
                        onClick={(e) => {
                            e.stopPropagation()
                            // 路由参数使用 userName，而不是 nickName
                            if (travel.userName) {
                                router.push(`/u/${travel.userName}`)
                            }
                        }}
                    >
                        <Avatar className="h-5 w-5">
                            <AvatarImage src={travel.userAvatar} alt={travel.nickName || travel.userName} />
                            <AvatarFallback className="text-xs">
                                {(travel.nickName || travel.userName || 'U')?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="truncate">
                            {travel.nickName || travel.userId}{' '}
                            <span className="text-sm text-muted-foreground">@{travel.userName}</span>
                        </span>
                    </div>

                    {/* 游玩天数 */}
                    {travel.travelDays && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Calendar className="w-4 h-4" />
                            <span>{travel.travelDays} 天行程</span>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center text-sm text-muted-foreground">
                    {/* 统计信息 */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{travel.viewCount || 0}</span>
                        </div>
                        <button
                            onClick={handleToggleLike}
                            disabled={isProcessingLike || !isCurrentUser}
                            className={`flex items-center gap-1 hover:text-foreground transition-colors ${
                                isLiked ? 'text-red-500' : ''
                            } ${isProcessingLike || !isCurrentUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                            <span>{likeCount}</span>
                        </button>
                        <button
                            onClick={handleToggleCollection}
                            disabled={isProcessingCollection || !currentUser?.uuid}
                            className={`flex items-center gap-1 hover:text-foreground transition-colors ${
                                isCollected ? 'text-yellow-500' : ''
                            } ${isProcessingCollection || !currentUser?.uuid ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Bookmark className={`w-4 h-4 ${isCollected ? 'fill-current' : ''}`} />
                            <span>{collectionCount}</span>
                        </button>
                        <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{travel.commentCount || 0}</span>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}