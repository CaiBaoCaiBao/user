'use client'

import { useState, useEffect } from 'react'
import { SocialApi } from '@/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, Heart, Send } from 'lucide-react'
import { useCurrentUser } from '@/store/userStore'
import { toast } from 'sonner'
import type { Comment } from '@/api'

interface TravelCommentsProps {
    noteId: string
    commentCount?: number
}

export default function TravelComments({ noteId, commentCount = 0 }: TravelCommentsProps) {
    const currentUser = useCurrentUser()
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [content, setContent] = useState('')
    const [replyContent, setReplyContent] = useState('')
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const pageSize = 10

    // 获取评论列表
    const fetchComments = async () => {
        try {
            setLoading(true)
            const response = await SocialApi.getComments({
                targetType: 'travel_note',
                targetId: noteId,
                page,
                pageSize,
            })
            const result = response.data.data as any
            setComments(result.list || [])
            setTotal(result.total || 0)
        } catch (error) {
            console.error('获取评论失败:', error)
            toast.error('获取评论失败')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchComments()
    }, [noteId, page])

    // 提交评论
    const handleSubmit = async (parentCommentId?: string) => {
        if (!currentUser?.uuid) {
            toast.error('请先登录')
            return
        }
        const commentContent = parentCommentId ? replyContent : content
        if (!commentContent.trim()) {
            toast.error('请输入评论内容')
            return
        }

        setSubmitting(true)
        try {
            await SocialApi.createComment({
                targetType: 'travel_note',
                targetId: noteId,
                parentCommentId,
                content: commentContent.trim(),
            })
            toast.success(parentCommentId ? '回复成功' : '评论成功')
            setContent('')
            setReplyContent('')
            setReplyingTo(null)
            setPage(1)
            fetchComments()
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
            await SocialApi.toggleLike({
                targetType: 'comment',
                targetId: commentId,
            })
            fetchComments()
        } catch (error) {
            console.error('点赞失败:', error)
            toast.error('点赞失败')
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
            fetchComments()
        } catch (error) {
            console.error('删除失败:', error)
            toast.error('删除失败')
        }
    }

    // 检查是否是作者
    const isAuthor = (comment: Comment) => comment.userId === currentUser?.uuid

    // 开始回复
    const handleReply = (comment: Comment) => {
        setReplyingTo(comment.commentId)
        setReplyContent('')
    }

    // 取消回复
    const handleCancelReply = () => {
        setReplyingTo(null)
        setReplyContent('')
    }

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
                                        onClick={handleSubmit}
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
                {loading ? (
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
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        还没有评论，快来抢沙发吧！
                    </div>
                ) : (
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div key={comment.commentId} className="flex gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={comment.avatar} />
                                    <AvatarFallback>
                                        {comment.nickname?.charAt(0) || comment.username?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <span className="font-medium">
                                                {comment.nickname || comment.username}
                                            </span>
                                            <span className="text-sm text-muted-foreground ml-2">
                                                {comment.createdAt
                                                    ? new Date(comment.createdAt).toLocaleString('zh-CN')
                                                    : ''}
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
                                    </div>

                                    {/* 回复输入框 */}
                                    {replyingTo === comment.commentId && (
                                        <div className="mt-3 space-y-2">
                                            <Textarea
                                                placeholder={`回复 ${comment.nickname || comment.username}...`}
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
                        ))}
                    </div>
                )}

                {/* 分页 */}
                {total > pageSize && (
                    <div className="flex justify-center gap-2 mt-6">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            上一页
                        </Button>
                        <span className="flex items-center text-sm text-muted-foreground">
                            第 {page} 页
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page * pageSize >= total}
                        >
                            下一页
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
