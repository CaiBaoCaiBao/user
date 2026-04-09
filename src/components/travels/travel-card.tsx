'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, Heart, Bookmark, Calendar, User, MessageCircle, Pin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SocialApi, TravelApi } from '@/api'
import { useCurrentUser } from '@/store/userStore'
import { toast } from 'sonner'
import type { TravelInfo } from '@/api'

interface TravelCardProps {
    travel: TravelInfo
    showAuthor?: boolean
    showActions?: boolean
    onTravelUpdate?: (noteId: string, updates: Partial<TravelInfo>) => void
}

export default function TravelCard({
    travel,
    showAuthor = true,
    showActions = false,
    onTravelUpdate,
}: TravelCardProps) {
    const router = useRouter()
    const currentUser = useCurrentUser()
    const [isLiked, setIsLiked] = useState(false)
    const [isCollected, setIsCollected] = useState(false)
    const [likeCount, setLikeCount] = useState(travel.likeCount || 0)
    const [isProcessingLike, setIsProcessingLike] = useState(false)
    const [isProcessingCollection, setIsProcessingCollection] = useState(false)
    const [isProcessingTop, setIsProcessingTop] = useState(false)

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
            // 更新点赞数（使用后端返回的最新数据）
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

            // 调用回调函数更新父组件中的数据
            if (onTravelUpdate) {
                onTravelUpdate(travel.noteId, {
                    likeCount: newLikeCount
                })
            }

            await SocialApi.toggleLike({
                targetType: 'travel_note',
                targetId: travel.noteId,
            })
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

            // 更新收藏数
            const newCollectionCount = wasCollected
                ? (travel.collectionCount || 0) - 1
                : (travel.collectionCount || 0) + 1

            // 调用回调函数更新父组件中的数据
            if (onTravelUpdate) {
                onTravelUpdate(travel.noteId, {
                    collectionCount: newCollectionCount
                })
            }

            await SocialApi.toggleCollection({
                targetType: 'travel_note',
                targetId: travel.noteId,
            })
            toast.success(wasCollected ? '取消收藏成功' : '收藏成功')
        } catch (error) {
            console.error('收藏失败:', error)
            setIsCollected(wasCollected)
            toast.error('操作失败')
        } finally {
            setIsProcessingCollection(false)
        }
    }

    const handleClick = () => {
        router.push(`/travels/${travel.noteId}`)
    }

    // 置顶/取消置顶游记
    const handleToggleTop = async (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!currentUser?.uuid) {
            toast.error('请先登录')
            return
        }

        if (isProcessingTop) return

        const wasTop = travel.isTop || false
        setIsProcessingTop(true)

        try {
            await TravelApi.setTop({
                noteId: travel.noteId,
                isTop: !wasTop,
            })

            // 更新游记的置顶状态
            if (onTravelUpdate) {
                onTravelUpdate(travel.noteId, {
                    isTop: !wasTop
                })
            }

            toast.success(wasTop ? '已取消置顶' : '已置顶')
        } catch (error) {
            console.error('置顶失败:', error)
            toast.error('操作失败')
        } finally {
            setIsProcessingTop(false)
        }
    }

    return (
        <Card
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={handleClick}
        >
            {/* 封面图 */}
            {travel.coverImg && (
                <div className="h-48 bg-muted overflow-hidden relative">
                    <img
                        src={travel.coverImg}
                        alt={travel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {travel.status === 2 && (
                        <Badge className="absolute top-2 right-2 bg-red-500">
                            已驳回
                        </Badge>
                    )}
                    {travel.status === -1 && (
                        <Badge className="absolute top-2 right-2 bg-gray-500">
                            草稿
                        </Badge>
                    )}
                    {travel.isTop && (
                        <Badge className="absolute top-2 left-2 bg-yellow-500">
                            <Pin className="h-3 w-3 mr-1 fill-current" />
                            置顶
                        </Badge>
                    )}
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
                {showAuthor && (
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
                            <AvatarImage src={travel.avatar} alt={travel.nickName || travel.userName} />
                            <AvatarFallback className="text-xs">
                                {(travel.nickName || travel.userName || 'U')?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="truncate">
                            {travel.nickName || travel.userId}{" "}
                            <span className='text-sm text-muted-foreground'>@{travel.userName}</span>
                        </span>
                    </div>
                )}

                {/* 游玩天数 */}
                {travel.travelDays && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>{travel.travelDays} 天行程</span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
                {/* 统计信息 - 只有已发布的游记才显示社交功能 */}
                {travel.status === 1 ? (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                            <span>{travel.collectionCount || 0}</span>
                        </button>
                        <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{travel.commentCount || 0}</span>
                        </div>
                    </div>
                ) : (
                    /* 非已发布状态提示 */
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {travel.status === -1 && <span className="text-muted-foreground">草稿状态</span>}
                        {travel.status === 0 && <span className="text-muted-foreground">待审核</span>}
                        {travel.status === 2 && <span className="text-muted-foreground">已驳回</span>}
                    </div>
                )}

                {/* 操作按钮 - 只有已发布的游记才能置顶 */}
                {showActions && travel.status === 1 && (
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleToggleTop}
                            disabled={isProcessingTop}
                            className={`hover:bg-yellow-50 ${travel.isTop ? 'text-yellow-600' : ''}`}
                        >
                            <Pin className={`w-4 h-4 mr-1 ${travel.isTop ? 'fill-current' : ''}`} />
                            {travel.isTop ? '取消' : '置顶'}
                        </Button>
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}
