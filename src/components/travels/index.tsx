'use client'

import { useState, useEffect } from 'react'
import { TravelApi, UserApi } from '@/api'
import type { TravelInfo } from '@/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Edit, Trash2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/store/userStore'
import { toast } from 'sonner'
import TravelCard from './travel-card'
import TravelSearch from './travel-search'

interface TravelsProps {
    initialKeyword?: string
}

export default function Travels({ initialKeyword = '' }: TravelsProps) {
    const router = useRouter()
    const currentUser = useCurrentUser()
    const [travels, setTravels] = useState<TravelInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [keyword, setKeyword] = useState(initialKeyword)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [activeTab, setActiveTab] = useState<'all' | 'hot'>('all')
    const pageSize = 12

    // 当initialKeyword变化时更新keyword
    useEffect(() => {
        if (initialKeyword !== keyword) {
            setKeyword(initialKeyword)
            setPage(1)
        }
    }, [initialKeyword])

    // 获取旅行攻略列表
    const fetchTravels = async (searchParams?: any) => {
        try {
            setLoading(true)
            let response

            if (activeTab === 'hot') {
                response = await TravelApi.getHotTravels(pageSize)
                const pageData = response.data.data
                const travelData = pageData?.records || []
                console.log('热门游记数据:', travelData)
                setTravels(Array.isArray(travelData) ? travelData : [])
                setTotal(pageData?.total || 0)
                setLoading(false)
                return
            } else {
                response = await TravelApi.getTravels({
                    pageNum: page,
                    pageSize,
                    ...searchParams,
                })
            }

            const pageData = response.data.data
            let travelData = pageData?.records || []
            console.log('游记列表数据:', travelData)
            if (travelData.length > 0) {
                console.log('第一条游记:', travelData[0])
                console.log('第一条游记的作者信息:', {
                    userId: travelData[0].userId,
                    userName: travelData[0].userName,
                    nickName: travelData[0].nickName
                })
            }

            // 前端排序（如果后端不支持）
            if (searchParams?.sortBy && searchParams?.sortOrder === 'desc') {
                travelData = [...travelData].sort((a, b) => {
                    const aValue = a[searchParams.sortBy] || 0
                    const bValue = b[searchParams.sortBy] || 0
                    return bValue - aValue
                })
            }

            // 如果后端没有返回用户信息，则前端单独获取
            if (travelData.length > 0 && travelData.some(t => !t.userName && !t.nickName)) {
                console.log('后端未返回用户信息，前端单独获取')
                const userIds = [...new Set(travelData.map(t => t.userId))]
                console.log('需要获取用户信息的用户ID列表:', userIds)

                try {
                    // 批量获取用户信息
                    const userPromises = userIds.map(async (userId) => {
                        try {
                            const userResponse = await UserApi.getUserById(userId)
                            return {
                                userId,
                                userName: userResponse.data.data?.userName,
                                nickName: userResponse.data.data?.nickName
                            }
                        } catch (error) {
                            console.error('获取用户信息失败:', userId, error)
                            return { userId, userName: null, nickName: null }
                        }
                    })

                    const userInfoList = await Promise.all(userPromises)
                    console.log('获取到的用户信息列表:', userInfoList)

                    // 创建用户信息映射
                    const userInfoMap = new Map(userInfoList.map(info => [info.userId, info]))

                    // 为每个游记设置用户信息
                    const updatedTravels = travelData.map(travel => {
                        const userInfo = userInfoMap.get(travel.userId)
                        return {
                            ...travel,
                            userName: userInfo?.userName || travel.userName,
                            nickName: userInfo?.nickName || travel.nickName
                        }
                    })

                    console.log('更新后的游记列表:', updatedTravels)
                    setTravels(updatedTravels)
                } catch (error) {
                    console.error('批量获取用户信息失败:', error)
                    setTravels(travelData)
                }
            } else {
                setTravels(Array.isArray(travelData) ? travelData : [])
            }

            setTotal(pageData?.total || 0)
        } catch (error) {
            console.error('获取旅行攻略失败:', error)
            setTravels([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTravels()
    }, [page, activeTab])

    // 搜索
    const handleSearch = (params?: any) => {
        setPage(1)
        fetchTravels(params)
    }

    // 跳转编辑
    const goToEdit = (noteId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        router.push(`/travels/${noteId}/edit`)
    }

    // 删除游记
    const handleDelete = async (noteId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (confirm('确定要删除这篇游记吗？')) {
            try {
                await TravelApi.deleteTravel({ noteIds: [noteId] })
                toast.success('删除成功')
                fetchTravels()
            } catch (error) {
                console.error('删除失败:', error)
                toast.error('删除失败')
            }
        }
    }

    // 检查是否是作者
    const isAuthor = (travel: TravelInfo) => travel.userId === currentUser?.uuid

    // 更新游记数据（用于点赞和收藏）
    const handleTravelUpdate = (noteId: string, updates: Partial<TravelInfo>) => {
        setTravels(prevTravels =>
            prevTravels.map(travel =>
                travel.noteId === noteId ? { ...travel, ...updates } : travel
            )
        )
    }

    // 跳转创建
    const goToCreate = () => {
        router.push('/travels/create')
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* 搜索组件 */}
            <div className="mb-6">
                <TravelSearch onSearch={handleSearch} loading={loading} initialKeyword={keyword} />
            </div>

            {/* 标签页 */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mb-6">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                    <TabsTrigger value="all">全部攻略</TabsTrigger>
                    <TabsTrigger value="hot">热门攻略</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* 旅行攻略列表 */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="h-96 animate-pulse" />
                    ))}
                </div>
            ) : travels.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    暂无攻略数据
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {travels.map((travel) => (
                            <div key={travel.noteId} className="relative">
                                <TravelCard
                                    travel={travel}
                                    showAuthor={true}
                                    showActions={false}
                                    onTravelUpdate={handleTravelUpdate}
                                />
                                {/* 作者操作菜单 */}
                                {isAuthor(travel) && (
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={(e) => goToEdit(travel.noteId, e)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={(e) => handleDelete(travel.noteId, e)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
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
