'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TravelApi, DestinationApi, FileApi } from '@/api'
import { useCurrentUser } from '@/store/userStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Upload, X } from 'lucide-react'
import type { DestinationInfo } from '@/api'

export default function CreateTravelPage() {
    const router = useRouter()
    const currentUser = useCurrentUser()

    // 表单状态
    const [formData, setFormData] = useState({
        title: '',
        destinationId: '',
        content: '',
        travelDays: '',
        budget: '',
        coverImg: '',
        images: [] as string[],
    })

    // 目的地列表
    const [destinations, setDestinations] = useState<DestinationInfo[]>([])
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [destinationsLoading, setDestinationsLoading] = useState(true)

    // 加载目的地列表
    useEffect(() => {
        console.log('开始加载目的地列表...')
        fetchDestinations()
    }, [])

    const fetchDestinations = async () => {
        setDestinationsLoading(true)
        try {
            console.log('发送目的地列表请求...')
            const response = await DestinationApi.getDestinations({ page: 1, pageSize: 100 })
            console.log('目的地列表响应:', response)
            console.log('响应数据结构:', response.data)
            console.log('响应数据.data:', response.data?.data)
            // 根据实际 API 返回结构获取数据
            const destinationsData = (response.data?.data as any)?.records || (response.data as any)?.records || []
            console.log('解析后的目的地数据:', destinationsData)
            console.log('是否为数组:', Array.isArray(destinationsData))
            console.log('目的地数量:', destinationsData.length)
            setDestinations(Array.isArray(destinationsData) ? destinationsData : [])
        } catch (error) {
            console.error('获取目的地列表失败:', error)
            toast.error('获取目的地列表失败')
            setDestinations([])
        } finally {
            setDestinationsLoading(false)
        }
    }

    // 处理表单输入
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // 处理封面图片上传
    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        console.log('开始上传封面图片:', file.name)
        setUploading(true)
        try {
            const response = await FileApi.uploadImage(file)
            console.log('封面图片上传响应:', response)
            setFormData(prev => ({ ...prev, coverImg: response.data.data }))
            toast.success('封面图片上传成功')
        } catch (error) {
            console.error('上传失败:', error)
            toast.error('上传失败')
        } finally {
            setUploading(false)
        }
    }

    // 处理图片列表上传
    const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return

        console.log('开始上传图片列表:', files.map(f => f.name))
        setUploading(true)
        try {
            const uploadPromises = files.map(async (file) => {
                const response = await FileApi.uploadImage(file)
                console.log('图片上传响应:', response)
                return response.data.data
            })

            const urls = await Promise.all(uploadPromises)
            console.log('图片上传完成:', urls)
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...urls.filter(Boolean)]
            }))
            toast.success(`成功上传 ${urls.length} 张图片`)
        } catch (error) {
            console.error('上传失败:', error)
            toast.error('上传失败')
        } finally {
            setUploading(false)
        }
    }

    // 删除图片
    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    // 提交表单
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // 验证表单
        if (!formData.title.trim()) {
            toast.error('请输入游记标题')
            return
        }
        if (!formData.destinationId) {
            toast.error('请选择目的地')
            return
        }
        if (!formData.content.trim()) {
            toast.error('请输入游记内容')
            return
        }
        console.log('用户:', currentUser)
        if (!currentUser?.uuid) {
            toast.error('请先登录')
            return
        }

        setLoading(true)
        try {
            const createData = {
                userId: currentUser.uuid,
                destinationId: formData.destinationId,
                title: formData.title,
                coverImg: formData.coverImg,
                images: formData.images,
                content: formData.content,
                travelDays: formData.travelDays ? parseInt(formData.travelDays) : undefined,
                budget: formData.budget ? parseFloat(formData.budget) : undefined,
            }

            await TravelApi.createTravel(createData)
            toast.success('游记创建成功，等待审核')
            router.push('/travels')
        } catch (error) {
            console.error('创建游记失败:', error)
            toast.error('创建游记失败')
        } finally {
            setLoading(false)
        }
    }

    // 保存草稿
    const handleSaveDraft = async () => {
        if (!currentUser?.uuid) {
            toast.error('请先登录')
            return
        }

        // 草稿只需要标题
        if (!formData.title.trim()) {
            toast.error('请输入游记标题')
            return
        }

        setLoading(true)
        try {
            const createData = {
                userId: currentUser.uuid,
                destinationId: formData.destinationId,
                title: formData.title,
                coverImg: formData.coverImg,
                images: formData.images,
                content: formData.content,
                travelDays: formData.travelDays ? parseInt(formData.travelDays) : undefined,
                budget: formData.budget ? parseFloat(formData.budget) : undefined,
            }

            await TravelApi.saveDraft(createData)
            toast.success('草稿保存成功')
            router.push('/travels')
        } catch (error) {
            console.error('保存草稿失败:', error)
            toast.error('保存草稿失败')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* 头部 */}
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold">创建游记</h1>
            </div>

            {/* 表单 */}
            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 标题 */}
                        <div className="space-y-2">
                            <Label htmlFor="title">游记标题 *</Label>
                            <Input
                                id="title"
                                placeholder="请输入游记标题"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                            />
                        </div>

                        {/* 目的地 */}
                        <div className="space-y-2">
                            <Label htmlFor="destination">目的地 *</Label>
                            {destinationsLoading ? (
                                <div className="text-sm text-muted-foreground">加载中...</div>
                            ) : (
                                <Select
                                    value={formData.destinationId}
                                    onValueChange={(value) => {
                                        console.log('选择目的地:', value)
                                        handleInputChange('destinationId', value)
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="请选择目的地" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {destinations.length === 0 ? (
                                            <div className="p-2 text-sm text-muted-foreground">
                                                暂无目的地数据
                                            </div>
                                        ) : (
                                            destinations.map((dest) => (
                                                <SelectItem key={dest.destinationId} value={dest.destinationId}>
                                                    {dest.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                            {destinations.length === 0 && !destinationsLoading && (
                                <p className="text-xs text-muted-foreground">
                                    目的地列表为空，请检查网络连接或联系管理员
                                </p>
                            )}
                        </div>

                        {/* 封面图片 */}
                        <div className="space-y-2">
                            <Label>封面图片</Label>
                            <div className="flex items-center gap-4">
                                {formData.coverImg ? (
                                    <div className="relative w-32 h-32">
                                        <img
                                            src={formData.coverImg}
                                            alt="封面"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-6 w-6"
                                            onClick={() => handleInputChange('coverImg', '')}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
                                        <input
                                            id="cover-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleCoverUpload}
                                            disabled={uploading}
                                        />
                                        <button
                                            type="button"
                                            className="flex flex-col items-center gap-2 text-muted-foreground cursor-pointer hover:text-foreground"
                                            onClick={() => document.getElementById('cover-upload')?.click()}
                                            disabled={uploading}
                                        >
                                            <Upload className="h-6 w-6" />
                                            <span className="text-xs">上传封面</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 图片列表 */}
                        <div className="space-y-2">
                            <Label>图片列表</Label>
                            <div className="flex items-center gap-4">
                                <input
                                    id="images-upload"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImagesUpload}
                                    disabled={uploading}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={uploading}
                                    onClick={() => document.getElementById('images-upload')?.click()}
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {uploading ? '上传中...' : '上传图片'}
                                </Button>
                            </div>
                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-4 gap-4 mt-4">
                                    {formData.images.map((img, index) => {
                                        console.log("img:", img)
                                        return (
                                            <div key={index} className="relative">
                                                <img
                                                    src={img}
                                                    alt={`图片 ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6"
                                                    onClick={() => removeImage(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 游玩天数 */}
                        <div className="space-y-2">
                            <Label htmlFor="travelDays">游玩天数</Label>
                            <Input
                                id="travelDays"
                                type="number"
                                placeholder="请输入游玩天数"
                                value={formData.travelDays}
                                onChange={(e) => handleInputChange('travelDays', e.target.value)}
                                min="1"
                            />
                        </div>

                        {/* 预算 */}
                        <div className="space-y-2">
                            <Label htmlFor="budget">预算（元）</Label>
                            <Input
                                id="budget"
                                type="number"
                                placeholder="请输入预算"
                                value={formData.budget}
                                onChange={(e) => handleInputChange('budget', e.target.value)}
                                min="0"
                                step="0.01"
                            />
                        </div>

                        {/* 内容 */}
                        <div className="space-y-2">
                            <Label htmlFor="content">游记内容 *</Label>
                            <Textarea
                                id="content"
                                placeholder="请输入游记内容..."
                                value={formData.content}
                                onChange={(e) => handleInputChange('content', e.target.value)}
                                rows={10}
                            />
                        </div>

                        {/* 提交按钮 */}
                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                取消
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleSaveDraft}
                                disabled={loading || uploading}
                            >
                                {loading ? '保存中...' : '保存草稿'}
                            </Button>
                            <Button type="submit" disabled={loading || uploading}>
                                {loading ? '创建中...' : '发布游记'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
