'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import useSWR from 'swr'
import { SocialApi } from '@/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, Heart, Send } from 'lucide-react'
import { useCurrentUser } from '@/store/userStore'
import { toast } from 'sonner'
import type { Comment } from '@/api'
import Link from 'next/link'

interface CommentsProps {
    targetType: 'travel_note' | 'destination' | 'attraction'
    targetId: string
    commentCount?: number
}

export default function Comments({ targetType, targetId, commentCount = 0 }: CommentsProps) {
    const currentUser = useCurrentUser()
    const [submitting, setSubmitting] = useState(false)
    const [content, setContent] = useState('')
    const [replyContent, setReplyContent] = useState('')
    const [replyingTo, setReplyingTo] = useState<{ commentId: string; userName: string } | null>(null)
    const [allComments, setAllComments] = useState<Comment[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const pageSize = 10
    const [collapsedReplies, setCollapsedReplies] = useState<Set<string>>(new Set())
    const loadMoreRef = useRef<HTMLDivElement>(null)
    const currentTargetIdRef = useRef<string>(targetId)
    const observerRef = useRef<IntersectionObserver | null>(null)

    // SWR fetcher 函数
    const fetchComments = useCallback(async (pageNum: number) => {
        const response = await SocialApi.getComments({
            targetType,
            targetId,
            page: pageNum,
            pageSize,
        })
        return response.data.data as { records: Comment[]; total: number }
    }, [targetType, targetId, pageSize])

    // 使用 SWR 获取评论数据
    const { data, error, isLoading, mutate } = useSWR(
        `/comments/${targetType}/${targetId}/${page}`,
        () => fetchComments(page),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 5000,
            shouldRetryOnError: true,
            errorRetryCount: 3,
            errorRetryInterval: 1000,
        }
    )

    const comments = data?.records || []
    const total = data?.total || 0

    // 加载更多评论
    const loadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore) return

        setIsLoadingMore(true)
        try {
            const nextPage = page + 1
            const result = await fetchComments(nextPage)

            if (result.records.length > 0) {
                setAllComments(prev => {
                    const existingIds = new Set(prev.map(c => c.commentId))
                    const newComments = result.records.filter(c => !existingIds.has(c.commentId))
                    const newAllComments = [...prev, ...newComments]
                    setHasMore(result.total > newAllComments.length)
                    return newAllComments
                })
                setPage(nextPage)
            } else {
                setHasMore(false)
            }
        } catch (error) {
            console.error('加载更多评论失败:', error)
            toast.error('加载更多评论失败')
        } finally {
            setIsLoadingMore(false)
        }
    }, [hasMore, isLoadingMore, fetchComments, page])

    // 初始化评论数据
    useEffect(() => {
        if (data && page === 1 && data.records) {
            setAllComments(data.records)
            setHasMore(data.total > data.records.length)
            currentTargetIdRef.current = targetId
        }
    }, [data, page, targetId])

    // 无限滚动观察器
    useEffect(() => {
        if (!hasMore || allComments.length === 0) {
            if (observerRef.current) {
                observerRef.current.disconnect()
                observerRef.current = null
            }
            return
        }

        if (observerRef.current) {
            observerRef.current.disconnect()
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    loadMore()
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        )

        observerRef.current = observer

        const timer = setTimeout(() => {
            const currentRef = loadMoreRef.current
            if (currentRef) {
                observer.observe(currentRef)
            }
        }, 200)

        return () => {
            clearTimeout(timer)
            if (observerRef.current) {
                observerRef.current.disconnect()
                observerRef.current = null
            }
        }
    }, [hasMore, isLoadingMore, allComments.length, loadMore])

    // 重置评论列表（当 targetId 变化时）
    useEffect(() => {
        if (currentTargetIdRef.current !== targetId) {
            setPage(1)
            setAllComments([])
            setHasMore(true)
            setCollapsedReplies(new Set())
        }
    }, [targetId])

    // 提交评论
    const handleSubmit = async (parentCommentId?: string) => {
        if (!currentUser?.uuid) {
            toast.error('请先登录')
            return
        }

        const commentContent = parentCommentId ? replyContent : content
        if (!commentContent || !commentContent.trim()) {
            toast.error('请输入评论内容')
            return
        }

        setSubmitting(true)
        try {
            await SocialApi.createComment({
                targetType,
                targetId,
                parentCommentId,
                content: commentContent.trim(),
            })
            toast.success(parentCommentId ? '回复成功' : '评论成功')
            setContent('')
            setReplyContent('')
            setReplyingTo(null)
            setPage(1)
            setAllComments([])
            setHasMore(true)
            await mutate()
        } catch (error) {
            console.error('评论失败:', error)
            toast.error('评论失败')
        } finally {
            setSubmitting(false)
        }
    }

    // 点赞评论
    const handleLikeComment = async (commentId: string) => {
        if (!currentUser?.uuid) {
            toast.error('请先登录')
            return
        }
        try {
            const optimisticUpdate = (comment: Comment) => {
                if (comment.commentId === commentId) {
                    const newIsLiked = !comment.isLiked
                    const newLikeCount = (comment.likeCount || 0) + (newIsLiked ? 1 : -1)
                    return {
                        ...comment,
                        isLiked: newIsLiked,
                        likeCount: newLikeCount
                    }
                }
                return comment
            }

            mutate(
                (currentData) => {
                    if (!currentData) return currentData
                    return {
                        ...currentData,
                        records: currentData.records.map(optimisticUpdate)
                    }
                },
                false
            )

            setAllComments(prev => prev.map(optimisticUpdate))

            await SocialApi.toggleLike({
                targetType: 'comment',
                targetId: commentId,
            })
            await mutate()
        } catch (error) {
            console.error('点赞失败:', error)
            toast.error('点赞失败')
            await mutate()
        }
    }

    // 删除评论
    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('确定要删除这条评论吗？')) return

        try {
            await SocialApi.deleteComment({
                commentId: commentId,
            })
            toast.success('删除成功')
            
            setAllComments(prev => {
                const filtered = prev.filter(c => c.commentId !== commentId)
                return filtered.filter(c => c.parentCommentId !== commentId)
            })
            
            await mutate()
        } catch (error) {
            console.error('删除失败:', error)
            toast.error('删除失败')
        }
    }

    // 检查是否是作者
    const isAuthor = (comment: Comment) => comment.userId === currentUser?.uuid

    // 开始回复
    const handleReply = (comment: Comment) => {
        setReplyingTo({
            commentId: comment.commentId,
            userName: comment.nickname || comment.username || '用户'
        })
        setReplyContent('')
    }

    // 取消回复
    const handleCancelReply = () => {
        setReplyingTo(null)
        setReplyContent('')
    }

    // 切换回复展开/收起
    const toggleReplies = (commentId: string) => {
        setCollapsedReplies(prev => {
            const newSet = new Set(prev)
            if (newSet.has(commentId)) {
                newSet.delete(commentId)
            } else {
                newSet.add(commentId)
            }
            return newSet
        })
    }

    // 格式化相对时间
    const formatRelativeTime = (dateString?: string) => {
        if (!dateString) return ''

        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()

        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)
        const days = Math.floor(hours / 24)
        const months = Math.floor(days / 30)
        const years = Math.floor(days / 365)

        if (seconds < 60) {
            return '刚刚'
        } else if (minutes < 60) {
            return `${minutes}分钟前`
        } else if (hours < 24) {
            return `${hours}小时前`
        } else if (days < 30) {
            return `${days}天前`
        } else if (months < 12) {
            return `${months}个月前`
        } else {
            return `${years}年前`
        }
    }

    // 组织评论层级结构
    const { topLevelComments, repliesMap, commentMap } = useMemo(() => {
        const topLevelComments: Comment[] = []
        const repliesMap = new Map<string, Comment[]>()
        const commentMap = new Map<string, Comment>()

        allComments.forEach(comment => {
            commentMap.set(comment.commentId, comment)
        })

        allComments.forEach(comment => {
            if (!comment.parentCommentId) {
                topLevelComments.push(comment)
            } else {
                let currentComment = comment
                let topLevelId = comment.parentCommentId

                while (topLevelId && commentMap.has(topLevelId)) {
                    const parentComment = commentMap.get(topLevelId)!
                    if (!parentComment.parentCommentId) {
                        break
                    }
                    topLevelId = parentComment.parentCommentId
                }

                if (topLevelId) {
                    if (!repliesMap.has(topLevelId)) {
                        repliesMap.set(topLevelId, [])
                    }
                    repliesMap.get(topLevelId)!.push(comment)
                }
            }
        })

        return { topLevelComments, repliesMap, commentMap }
    }, [allComments])

    // 默认收起新出现的回复
    useEffect(() => {
        const currentIds = topLevelComments.map(c => c.commentId).sort()
        const prevIds = Array.from(collapsedReplies).sort()

        if (JSON.stringify(currentIds) !== JSON.stringify(prevIds)) {
            setCollapsedReplies(prev => {
                const newSet = new Set(prev)
                topLevelComments.forEach(comment => {
                    if (!newSet.has(comment.commentId)) {
                        newSet.add(comment.commentId)
                    }
                })
                const currentIdSet = new Set(topLevelComments.map(c => c.commentId))
                for (const id of newSet) {
                    if (!currentIdSet.has(id)) {
                        newSet.delete(id)
                    }
                }
                return newSet
            })
        }
    }, [topLevelComments.map(c => c.commentId).join(',')])

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">评论 ({total})</h3>
                </div>
            </CardHeader>
            <CardContent>
                {/* 评论输入框 */}
                {currentUser && (
                    <div className="mb-6">
                        <div className="flex gap-2">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={currentUser.avatar} />
                                <AvatarFallback>
                                    {currentUser.nickName?.charAt(0) || currentUser.userName?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <Textarea
                                    placeholder="写下你的评论..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={3}
                                />
                                <div className="flex justify-end">
                                    <Button
                                        onClick={() => handleSubmit()}
                                        disabled={submitting || !content.trim()}
                                        size="sm"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        {submitting ? '发送中...' : '发送'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 评论列表 */}
                {isLoading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex gap-3 animate-pulse">
                                <div className="h-10 w-10 rounded-full bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-muted rounded w-1/4" />
                                    <div className="h-16 bg-muted rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-destructive">
                        加载评论失败，请稍后重试
                    </div>
                ) : allComments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        还没有评论，快来抢沙发吧！
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* 顶级评论 */}
                        {topLevelComments.map((comment) => (
                            <div key={comment.commentId}>
                                {/* 顶级评论 */}
                                <div className="flex gap-3">
                                    <Link href={`/u/${comment.username}`}>
                                        <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                                            <AvatarImage src={comment.avatar} />
                                            <AvatarFallback>
                                                {comment.nickname?.charAt(0) || comment.username?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <span className="font-medium">
                                                    {comment.nickname || comment.username}
                                                </span>
                                                <span className="text-sm text-muted-foreground ml-2">
                                                    {formatRelativeTime(comment.createdAt)}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleReply(comment)}
                                                >
                                                    回复
                                                </Button>
                                                {isAuthor(comment) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteComment(comment.commentId)}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        删除
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm mb-2">{comment.content}</p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <button
                                                onClick={() => handleLikeComment(comment.commentId)}
                                                className={`flex items-center gap-1 hover:text-foreground ${
                                                    comment.isLiked ? 'text-red-500' : ''
                                                }`}
                                            >
                                                <Heart
                                                    className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`}
                                                />
                                                <span>{comment.likeCount || 0}</span>
                                            </button>
                                            {repliesMap.get(comment.commentId) && repliesMap.get(comment.commentId)!.length > 0 && (
                                                <button
                                                    onClick={() => toggleReplies(comment.commentId)}
                                                    className="flex items-center gap-1 hover:text-foreground"
                                                >
                                                    <span>{collapsedReplies.has(comment.commentId) ? '展开' : '收起'}</span>
                                                    <span>{repliesMap.get(comment.commentId)!.length}</span>
                                                    <span>条回复</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* 回复输入框 */}
                                        {replyingTo?.commentId === comment.commentId && (
                                            <div className="mt-3 space-y-2">
                                                <Textarea
                                                    placeholder={`回复 ${replyingTo.userName}...`}
                                                    value={replyContent}
                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                    rows={2}
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleSubmit(comment.commentId)}
                                                        disabled={submitting || !replyContent.trim()}
                                                        size="sm"
                                                    >
                                                        {submitting ? '发送中...' : '发送'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleCancelReply}
                                                    >
                                                        取消
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 回复评论列表 */}
                                {repliesMap.get(comment.commentId) && repliesMap.get(comment.commentId)!.length > 0 && !collapsedReplies.has(comment.commentId) && (
                                    <div className="mt-4 ml-12 space-y-4 border-l-2 border-muted pl-4">
                                        {repliesMap.get(comment.commentId)!.map((reply) => {
                                            const repliedUser = reply.parentCommentId ? commentMap.get(reply.parentCommentId) : null
                                            const repliedUserName = repliedUser?.nickname || repliedUser?.username || '用户'

                                            return (
                                                <div key={reply.commentId} className="flex gap-3">
                                                    <Link href={`/u/${reply.username}`}>
                                                        <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                                                            <AvatarImage src={reply.avatar} />
                                                            <AvatarFallback className="text-xs">
                                                                {reply.nickname?.charAt(0) || reply.username?.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </Link>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <span className="font-medium text-sm">
                                                                    {reply.nickname || reply.username}
                                                                </span>
                                                                {reply.parentCommentId && (
                                                                    <span className="text-xs text-muted-foreground ml-1">
                                                                        回复 <span className="text-primary">{repliedUserName}</span>
                                                                    </span>
                                                                )}
                                                                <span className="text-xs text-muted-foreground ml-2">
                                                                    {formatRelativeTime(reply.createdAt)}
                                                                </span>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleReply(reply)}
                                                                    className="text-xs"
                                                                >
                                                                    回复
                                                                </Button>
                                                                {isAuthor(reply) && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteComment(reply.commentId)}
                                                                        className="text-destructive hover:text-destructive text-xs"
                                                                    >
                                                                        删除
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm mb-2">{reply.content}</p>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                            <button
                                                                onClick={() => handleLikeComment(reply.commentId)}
                                                                className={`flex items-center gap-1 hover:text-foreground ${
                                                                    reply.isLiked ? 'text-red-500' : ''
                                                                }`}
                                                            >
                                                                <Heart
                                                                    className={`w-3 h-3 ${reply.isLiked ? 'fill-current' : ''}`}
                                                                />
                                                                <span>{reply.likeCount || 0}</span>
                                                            </button>
                                                        </div>

                                                        {/* 回复输入框 */}
                                                        {replyingTo?.commentId === reply.commentId && (
                                                            <div className="mt-3 space-y-2">
                                                                <Textarea
                                                                    placeholder={`回复 ${replyingTo.userName}...`}
                                                                    value={replyContent}
                                                                    onChange={(e) => setReplyContent(e.target.value)}
                                                                    rows={2}
                                                                />
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        onClick={() => handleSubmit(reply.commentId)}
                                                                        disabled={submitting || !replyContent.trim()}
                                                                        size="sm"
                                                                    >
                                                                        {submitting ? '发送中...' : '发送'}
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={handleCancelReply}
                                                                    >
                                                                        取消
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* 加载更多指示器 */}
                        {hasMore && (
                            <div ref={loadMoreRef} className="flex justify-center py-4">
                                {isLoadingMore ? (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        <span>加载更多...</span>
                                    </div>
                                ) : (
                                    <div className="text-muted-foreground text-sm">
                                        下滑加载更多评论
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 没有更多评论 */}
                        {!hasMore && allComments.length > 0 && (
                            <div className="text-center py-4 text-muted-foreground text-sm">
                                没有更多评论了
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
