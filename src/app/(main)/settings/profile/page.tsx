'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserApi } from '@/api'
import type { UserProfile } from '@/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { ArrowLeft, Camera, Save } from 'lucide-react'
import { useCurrentUser, useUserActions } from '@/store/userStore'

export default function EditProfilePage() {
    const router = useRouter()
    const currentUser = useCurrentUser()
    const { updateUser } = useUserActions()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [profile, setProfile] = useState<Partial<UserProfile>>({
        nickName: '',
        avatar: '',
        bio: '',
        phone: '',
        birthday: '',
    })

    // 获取当前用户资料
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await UserApi.getCurrentUser()
                const userData = response.data.data
                setProfile({
                    nickName: userData.nickName || '',
                    avatar: userData.avatar || '',
                    bio: userData.bio || '',
                    phone: userData.phone || '',
                    birthday: userData.birthday || '',
                })
            } catch (error) {
                console.error('获取用户资料失败:', error)
                toast.error('获取用户资料失败')
            }
        }
        fetchProfile()
    }, [])

    // 处理头像上传
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            toast.error('请选择图片文件')
            return
        }

        // 验证文件大小（5MB）
        if (file.size > 5 * 1024 * 1024) {
            toast.error('图片大小不能超过5MB')
            return
        }

        try {
            setUploading(true)
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/file/trip-api/upload-img', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (result.success) {
                setProfile({ ...profile, avatar: result.data })
                toast.success('头像上传成功')
            } else {
                toast.error(result.message || '头像上传失败')
            }
        } catch (error) {
            console.error('上传头像失败:', error)
            toast.error('上传头像失败')
        } finally {
            setUploading(false)
        }
    }

    // 保存资料
    const handleSave = async () => {
        try {
            setLoading(true)
            const response = await UserApi.updateUserProfile({
                nickName: profile.nickName,
                avatar: profile.avatar,
                bio: profile.bio,
                phone: profile.phone,
                birthday: profile.birthday,
            })

            if (response.data.success) {
                // 如果返回了新的 accessToken，更新本地存储
                if (response.data.data?.accessToken) {
                    localStorage.setItem('accessToken', response.data.data.accessToken)
                }
                // 更新用户状态
                updateUser({
                    nickName: profile.nickName,
                    avatar: profile.avatar,
                    bio: profile.bio,
                    phone: profile.phone,
                    birthday: profile.birthday,
                })
                toast.success('资料更新成功')
                // 返回上一页
                router.back()
            } else {
                toast.error(response.data.message || '更新失败')
            }
        } catch (error) {
            console.error('更新资料失败:', error)
            toast.error('更新资料失败')
        } finally {
            setLoading(false)
        }
    }

    // 返回上一页
    const handleBack = () => {
        router.back()
    }

    const displayName = profile.nickName || currentUser?.userName || ''

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            {/* 头部 */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold">编辑资料</h1>
            </div>

            {/* 头像卡片 */}
            <Card className="mb-6">
                <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={profile.avatar} alt={displayName} />
                                <AvatarFallback className="text-2xl">
                                    {displayName?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <label
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                            >
                                <Camera className="h-4 w-4" />
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">头像</h3>
                            <p className="text-sm text-muted-foreground">
                                {uploading ? '上传中...' : '点击相机图标更换头像'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                支持 JPG、PNG 格式，大小不超过 5MB
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 基本信息卡片 */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>基本信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* 昵称 */}
                    <div className="space-y-2">
                        <Label htmlFor="nickname">昵称</Label>
                        <Input
                            id="nickname"
                            placeholder="请输入昵称"
                            value={profile.nickName}
                            onChange={(e) => setProfile({ ...profile, nickName: e.target.value })}
                            maxLength={50}
                        />
                        <p className="text-xs text-muted-foreground">
                            最多 50 个字符
                        </p>
                    </div>

                    {/* 个人简介 */}
                    <div className="space-y-2">
                        <Label htmlFor="bio">个人简介</Label>
                        <Textarea
                            id="bio"
                            placeholder="介绍一下自己吧..."
                            value={profile.bio}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            maxLength={200}
                            rows={4}
                        />
                        <p className="text-xs text-muted-foreground">
                            最多 200 个字符
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* 联系方式卡片 */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>联系方式</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* 手机号 */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">手机号</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="请输入手机号"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            maxLength={11}
                        />
                    </div>

                    {/* 生日 */}
                    <div className="space-y-2">
                        <Label htmlFor="birthday">生日</Label>
                        <Input
                            id="birthday"
                            type="date"
                            value={profile.birthday}
                            onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex gap-4">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1"
                >
                    取消
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? '保存中...' : '保存'}
                </Button>
            </div>
        </div>
    )
}
