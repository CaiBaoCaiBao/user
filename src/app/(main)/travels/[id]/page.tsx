'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TravelApi, SocialApi } from '@/api'
import { useCurrentUser } from '@/store/userStore'
import type { TravelDetail } from '@/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Eye, Heart, MessageCircle, Calendar, MapPin, DollarSign, Image as ImageIcon, Edit, Trash2, Bookmark } from 'lucide-react'
import { toast } from 'sonner'
import TravelComments from '@/components/travels/comments'
import TravelShare from '@/components/travels/share'

export default function TravelDetailPage() {
    const params = useParams()
    const router = useRouter()
    const currentUser = useCurrentUser()
    const noteId = params.id as string

    const [travel, setTravel] = useState<TravelDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    const [isCollected, setIsCollected] = useState(false)
    const [likeCount, setLikeCount] = useState(0)
    const [isProcessingLike, setIsProcessingLike] = useState(false)
    const [isProcessingCollection, setIsProcessingCollection] = useState(false)

    // 获取游记详情
    useEffect(() => {
        if (noteId) {
            fetchTravelDetail()
        }
    }, [noteId])

    // 监听用户登录状态变化，获取点赞和收藏状态
    useEffect(() => {
        if (currentUser?.uuid && noteId) {
            fetchUserSocialStatus()
        }
    }, [currentUser?.uuid, noteId])

    // 监控状态变化（调试用）
    useEffect(() => {
        console.log('状态变化:', { isLiked, isCollected, likeCount })
    }, [isLiked, isCollected, likeCount])

    // 获取用户的点赞和收藏状态
    const fetchUserSocialStatus = async () => {
        if (!currentUser?.uuid || !noteId) {
            console.log('跳过获取社交状态：', { currentUser: !!currentUser, noteId: !!noteId })
            return
        }

        console.log('开始获取社交状态，用户ID:', currentUser.uuid, '游记ID:', noteId)

        try {
            // 检查点赞状态
            const likeResponse = await SocialApi.checkLikeStatus({
                targetType: 'travel_note',
                targetId: noteId,
            })
            console.log('点赞状态响应:', likeResponse.data)
            const likeData = likeResponse.data.data
            console.log('点赞数据:', likeData)
            console.log('设置点赞状态:', likeData?.isLiked || false)
            setIsLiked(likeData?.isLiked || false)
            // 更新点赞数（使用后端返回的最新数据）
            if (likeData?.likeCount !== undefined) {
                console.log('设置点赞数:', likeData.likeCount)
                setLikeCount(likeData.likeCount)
            }
        } catch (error) {
            console.error('获取点赞状态失败:', error)
        }

        try {
            // 检查收藏状态
            const collectResponse = await SocialApi.checkCollectionStatus({
                targetType: 'travel_note',
                targetId: noteId,
            })
            console.log('收藏状态响应:', collectResponse.data)
            const collectData = collectResponse.data.data
            console.log('收藏数据:', collectData)
            console.log('设置收藏状态:', collectData?.isCollected || false)
            setIsCollected(collectData?.isCollected || false)
        } catch (error) {
            console.error('获取收藏状态失败:', error)
        }
    }

    const fetchTravelDetail = async () => {
        try {
            setLoading(true)
            const response = await TravelApi.getTravelById(noteId)
            const travelData = response.data.data
            setTravel(travelData)
            // 不在这里设置 likeCount，由 fetchUserSocialStatus 来设置
            // setLikeCount(travelData.likeCount || 0)
        } catch (error) {
            console.error('获取游记详情失败:', error)
            toast.error('获取游记详情失败')
        } finally {
            setLoading(false)
        }
    }

    // 返回上一页
    const handleBack = () => {
        router.back()
    }

    // 检查是否是作者
    const isAuthor = travel?.userId === currentUser?.uuid

    // 编辑游记
    const handleEdit = () => {
        router.push(`/travels/${noteId}/edit`)
    }

    // 删除游记
    const handleDelete = async () => {
        try {
            setDeleting(true)
            await TravelApi.deleteTravel({ noteIds: [noteId] })
            toast.success('游记删除成功')
            router.push('/travels')
        } catch (error) {
            console.error('删除游记失败:', error)
            toast.error('删除游记失败')
        } finally {
            setDeleting(false)
            setDeleteDialogOpen(false)
        }
    }

    // 点赞/取消点赞
    const handleToggleLike = async (e?: React.MouseEvent) => {
        // 阻止事件冒泡
        e?.stopPropagation()

        if (!currentUser?.uuid) {
            toast.error('请先登录')
            return
        }

        // 防止重复点击
        if (isProcessingLike) {
            return
        }

        const wasLiked = isLiked
        setIsProcessingLike(true)

        try {
            // 先更新UI状态，提供即时反馈
            setIsLiked(!wasLiked)
            setLikeCount(wasLiked ? likeCount - 1 : likeCount + 1)

            await SocialApi.toggleLike({
                targetType: 'travel_note',
                targetId: noteId,
            })
            toast.success(wasLiked ? '取消点赞成功' : '点赞成功')
        } catch (error) {
            console.error('点赞失败:', error)
            // 失败时回滚状态
            setIsLiked(wasLiked)
            setLikeCount(likeCount)
            toast.error('操作失败')
        } finally {
            setIsProcessingLike(false)
        }
    }

    // 收藏/取消收藏
    const handleToggleCollection = async (e?: React.MouseEvent) => {
        // 阻止事件冒泡
        e?.stopPropagation()

        if (!currentUser?.uuid) {
            toast.error('请先登录')
            return
        }

        // 防止重复点击
        if (isProcessingCollection) {
            return
        }

        const wasCollected = isCollected
        setIsProcessingCollection(true)

        try {
            // 先更新UI状态，提供即时反馈
            setIsCollected(!wasCollected)

            // 更新收藏数
            if (travel) {
                setTravel({
                    ...travel,
                    collectionCount: wasCollected
                        ? (travel.collectionCount || 0) - 1
                        : (travel.collectionCount || 0) + 1
                })
            }

            await SocialApi.toggleCollection({
                targetType: 'travel_note',
                targetId: noteId,
            })
            toast.success(wasCollected ? '取消收藏成功' : '收藏成功')
        } catch (error) {
            console.error('收藏失败:', error)
            // 失败时回滚状态
            setIsCollected(wasCollected)
            if (travel) {
                setTravel({
                    ...travel,
                    collectionCount: travel.collectionCount || 0
                })
            }
            toast.error('操作失败')
        } finally {
            setIsProcessingCollection(false)
        }
    }

    // 下一张图片
    const nextImage = () => {
        if (travel && travel.images && travel.images.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % travel.images!.length)
        }
    }

    // 上一张图片
    const prevImage = () => {
        if (travel && travel.images && travel.images.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + travel.images!.length) % travel.images!.length)
        }
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

    if (!travel) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-muted-foreground">游记不存在或已被删除</p>
                    <Button onClick={handleBack} className="mt-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        返回
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                {/* 头部导航 */}
                <div className="mb-6 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="hover:bg-accent"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        返回
                    </Button>
                    <div className="flex gap-2">
                        <TravelShare noteId={noteId} title={travel.title} />
                        {isAuthor && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleEdit}
                                    className="hover:bg-accent"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    编辑
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    删除
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* 主要内容区域 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 左侧主要内容 */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 封面图片 */}
                        {travel.coverImg && (
                            <Card className="overflow-hidden border-2 shadow-lg">
                                <div className="relative aspect-video">
                                    <img
                                        src={travel.coverImg}
                                        alt={travel.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>
                            </Card>
                        )}

                        {/* 游记内容卡片 */}
                        <Card className="border-2 shadow-lg">
                            <CardHeader className="space-y-4">
                                {/* 标题 */}
                                <div>
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                        {travel.title}
                                    </h1>
                                    {travel.status !== undefined && (
                                        <Badge 
                                            variant={travel.status === 1 ? 'default' : 'secondary'}
                                            className="mt-2"
                                        >
                                            {travel.status === 1 ? '已发布' : travel.status === 0 ? '待审核' : '已驳回'}
                                        </Badge>
                                    )}
                                </div>

                                {/* 作者信息 */}
                                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                                    <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                                        <AvatarImage src={travel.userAvatar} />
                                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                            {travel.userName?.charAt(0) || travel.userId?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-semibold text-lg">
                                            {travel.nickName || travel.userName || travel.userId}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            @{travel.userName} · {travel.createdAt ? new Date(travel.createdAt).toLocaleDateString('zh-CN') : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* 统计信息 */}
                                <div className="flex items-center justify-center gap-6 py-3 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-xl">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg shadow-sm">
                                        <Eye className="w-5 h-5 text-muted-foreground" />
                                        <span className="font-semibold">{travel.viewCount || 0}</span>
                                        <span className="text-sm text-muted-foreground">浏览</span>
                                    </div>
                                    <button
                                        onClick={handleToggleLike}
                                        disabled={isProcessingLike}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all ${
                                            isLiked
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                : 'bg-background hover:bg-accent'
                                        } ${isProcessingLike ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                        <span className="font-semibold">{likeCount}</span>
                                        <span className="text-sm text-muted-foreground">点赞</span>
                                    </button>
                                    <button
                                        onClick={handleToggleCollection}
                                        disabled={isProcessingCollection}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition-all ${
                                            isCollected
                                                ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                                                : 'bg-background hover:bg-accent'
                                        } ${isProcessingCollection ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Bookmark className={`w-5 h-5 ${isCollected ? 'fill-current' : ''}`} />
                                        <span className="font-semibold">{travel.collectionCount || 0}</span>
                                        <span className="text-sm text-muted-foreground">收藏</span>
                                    </button>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg shadow-sm">
                                        <MessageCircle className="w-5 h-5 text-muted-foreground" />
                                        <span className="font-semibold">{travel.commentCount || 0}</span>
                                        <span className="text-sm text-muted-foreground">评论</span>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-8">
                                {/* 基本信息 */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {travel.destinationName && (
                                        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl">
                                            <div className="p-2 bg-blue-500 rounded-lg">
                                                <MapPin className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">目的地</p>
                                                <p className="font-semibold text-blue-700 dark:text-blue-300">{travel.destinationName}</p>
                                            </div>
                                        </div>
                                    )}
                                    {travel.travelDays && (
                                        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl">
                                            <div className="p-2 bg-green-500 rounded-lg">
                                                <Calendar className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">游玩天数</p>
                                                <p className="font-semibold text-green-700 dark:text-green-300">{travel.travelDays} 天</p>
                                            </div>
                                        </div>
                                    )}
                                    {travel.budget && (
                                        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl">
                                            <div className="p-2 bg-purple-500 rounded-lg">
                                                <DollarSign className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">预算</p>
                                                <p className="font-semibold text-purple-700 dark:text-purple-300">¥{travel.budget.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator className="my-6" />

                                {/* 游记内容 */}
                                <div className="prose prose-lg max-w-none">
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <span className="w-1 h-8 bg-primary rounded-full"></span>
                                        游记内容
                                    </h2>
                                    <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed text-base">
                                        {travel.content}
                                    </div>
                                </div>

                                {/* 图片轮播 */}
                                {travel.images && travel.images.length > 0 && (
                                    <>
                                        <Separator className="my-6" />
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                                <span className="w-1 h-8 bg-primary rounded-full"></span>
                                                <ImageIcon className="w-6 h-6" />
                                                图片集 ({travel.images.length})
                                            </h2>
                                            <div className="relative rounded-xl overflow-hidden shadow-lg border-2">
                                                <img
                                                    src={travel.images[currentImageIndex]}
                                                    alt={`图片 ${currentImageIndex + 1}`}
                                                    className="w-full h-auto max-h-[600px] object-contain bg-muted"
                                                />
                                                {travel.images.length > 1 && (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
                                                            onClick={prevImage}
                                                        >
                                                            <ArrowLeft className="w-5 h-5" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
                                                            onClick={nextImage}
                                                        >
                                                            <ArrowLeft className="w-5 h-5 rotate-180" />
                                                        </Button>
                                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                                                            {currentImageIndex + 1} / {travel.images.length}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* 关联景点 */}
                                {travel.attractions && travel.attractions.length > 0 && (
                                    <>
                                        <Separator className="my-6" />
                                        <div className="space-y-4">
                                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                                <span className="w-1 h-8 bg-primary rounded-full"></span>
                                                相关景点
                                            </h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {travel.attractions.map((attraction) => (
                                                    <Card key={attraction.aid} className="overflow-hidden hover:shadow-lg transition-shadow border-2">
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
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* 评论组件 */}
                        <TravelComments noteId={noteId} commentCount={travel.commentCount} />
                    </div>

                    {/* 右侧边栏 */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* 作者卡片 */}
                        <Card className="border-2 shadow-lg">
                            <CardHeader>
                                <h3 className="text-lg font-bold">作者信息</h3>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center text-center space-y-4">
                                    <Avatar className="h-20 w-20 ring-4 ring-primary/20">
                                        <AvatarImage src={travel.userAvatar} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                                            {travel.userName?.charAt(0) || travel.userId?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-xl">{travel.nickName || travel.userName || travel.userId}</p>
                                        <p className="text-sm text-muted-foreground">@{travel.userName}</p>
                                    </div>
                                    <div className="flex gap-4 text-sm">
                                        <div className="text-center">
                                            <p className="font-bold text-lg">{travel.viewCount || 0}</p>
                                            <p className="text-muted-foreground">浏览</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-lg">{likeCount}</p>
                                            <p className="text-muted-foreground">点赞</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-lg">{travel.collectionCount || 0}</p>
                                            <p className="text-muted-foreground">收藏</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-lg">{travel.commentCount || 0}</p>
                                            <p className="text-muted-foreground">评论</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 快捷操作 */}
                        <Card className="border-2 shadow-lg">
                            <CardHeader>
                                <h3 className="text-lg font-bold">快捷操作</h3>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    onClick={handleToggleLike}
                                    variant={isLiked ? "default" : "outline"}
                                    className="w-full justify-start"
                                    disabled={isProcessingLike}
                                >
                                    <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                                    {isLiked ? '取消点赞' : '点赞游记'}
                                </Button>
                                <Button
                                    onClick={handleToggleCollection}
                                    variant={isCollected ? "default" : "outline"}
                                    className="w-full justify-start"
                                    disabled={isProcessingCollection}
                                >
                                    <Bookmark className={`w-4 h-4 mr-2 ${isCollected ? 'fill-current' : ''}`} />
                                    {isCollected ? '取消收藏' : '收藏游记'}
                                </Button>
                                <TravelShare noteId={noteId} title={travel.title} />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* 删除确认对话框 */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>确认删除游记</AlertDialogTitle>
                            <AlertDialogDescription>
                                您确定要删除这篇游记吗？此操作无法撤销。
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={deleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {deleting ? '删除中...' : '确认删除'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}