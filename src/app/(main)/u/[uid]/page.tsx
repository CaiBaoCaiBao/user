'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { UserApi, TravelApi } from '@/api'
import type { UserInfo, TravelInfo } from '@/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Calendar, Eye, Heart, Bookmark, FileText, Settings } from 'lucide-react'
import { useCurrentUser } from '@/store/userStore'

export default function UserPage({ params }: { params: Promise<{ uid: string }> }) {
    const router = useRouter()
    const currentUser = useCurrentUser()
    const { uid } = use(params)
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [travels, setTravels] = useState<TravelInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'travels' | 'likes' | 'collections'>('travels')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const pageSize = 12

    // 获取用户信息（包含资料）
    const fetchUserInfo = async () => {
        try {
            const response = await UserApi.getUserById(uid)
            setUserInfo(response.data.data)
        } catch (error) {
            console.error('获取用户信息失败:', error)
        }
    }

    // 获取用户游记
    const fetchUserTravels = async () => {
        try {
            setLoading(true)
            const response = await TravelApi.getTravels({
                page,
                pageSize,
                userId: uid,
                status: 1,
            })
            console.log('游记响应:', response.data)
            const travelData = response.data.data
            setTravels(Array.isArray(travelData) ? travelData : [])
            setTotal(response.data.total || 0)
        } catch (error) {
            console.error('获取用户游记失败:', error)
            setTravels([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUserInfo()
        fetchUserTravels()
    }, [uid, page])

    // 跳转游记详情
    const goToTravelDetail = (noteId: string) => {
        router.push(`/travels/${noteId}`)
    }

    // 跳转编辑资料
    const goToEditProfile = () => {
        router.push('/settings/profile')
    }

    // 判断是否是当前用户
    const isCurrentUser = currentUser?.userName === uid

    // 使用用户信息中的资料字段
    const displayName = userInfo?.nickName || userInfo?.userName || ''
    const avatar = userInfo?.avatar || ''

    return (
        <div className="container mx-auto px-4 py-8">
            {/* 用户信息卡片 */}
            {userInfo && (
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                            {/* 头像 */}
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={avatar} alt={displayName} />
                                <AvatarFallback className="text-2xl">
                                    {displayName?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {/* 用户信息 */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h1 className="text-2xl font-bold">
                                        {displayName}
                                    </h1>
                                    {isCurrentUser && (
                                        <Button variant="outline" size="sm" onClick={goToEditProfile}>
                                            <Settings className="w-4 h-4 mr-2" />
                                            编辑资料
                                        </Button>
                                    )}
                                </div>
                                <p className="text-muted-foreground mb-4">@{userInfo.userName}</p>

                                {/* 统计信息 */}
                                <div className="flex gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        <span>{total} 篇游记</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        <span>浏览 {travels.reduce((sum, t) => sum + (t.viewCount || 0), 0)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Heart className="w-4 h-4" />
                                        <span>获赞 {travels.reduce((sum, t) => sum + (t.likeCount || 0), 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 标签页 */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
                <TabsList>
                    <TabsTrigger value="travels">游记</TabsTrigger>
                    <TabsTrigger value="likes">喜欢</TabsTrigger>
                    <TabsTrigger value="collections">收藏</TabsTrigger>
                </TabsList>
            </Tabs>

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
                        <div className="text-center py-20 text-muted-foreground">
                            {isCurrentUser ? '还没有发布游记，快去创建吧！' : '该用户还没有发布游记'}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {travels.map((travel) => (
                                    <Card
                                        key={travel.noteId}
                                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                                        onClick={() => goToTravelDetail(travel.noteId)}
                                    >
                                        {/* 封面图 */}
                                        {travel.coverImg && (
                                            <div className="h-48 bg-muted overflow-hidden">
                                                <img
                                                    src={travel.coverImg}
                                                    alt={travel.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        <CardContent className="p-4">
                                            <h3 className="text-lg font-semibold mb-2">
                                                {travel.title}
                                            </h3>
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
                                                <div className="flex items-center gap-1">
                                                    <Heart className="w-4 h-4" />
                                                    <span>{travel.likeCount || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Bookmark className="w-4 h-4" />
                                                    <span>{travel.commentCount || 0}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
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
                <div className="text-center py-20 text-muted-foreground">
                    功能开发中...
                </div>
            )}

            {/* 收藏列表 */}
            {activeTab === 'collections' && (
                <div className="text-center py-20 text-muted-foreground">
                    功能开发中...
                </div>
            )}
        </div>
    )
}