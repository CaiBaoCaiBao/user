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
import { ArrowLeft, Camera, Save, User, Mail, Calendar, MapPin, Link as LinkIcon } from 'lucide-react'
import { useCurrentUser, useUserActions } from '@/store/userStore'

export default function EditProfilePage() {
    const router = useRouter()
    const currentUser = useCurrentUser()
    const { updateUser } = useUserActions()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
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

    // 检测是否有修改
    useEffect(() => {
        const originalProfile = {
            nickName: currentUser?.nickName || '',
            avatar: currentUser?.avatar || '',
            bio: currentUser?.bio || '',
            phone: currentUser?.phone || '',
            birthday: currentUser?.birthday || '',
        }
        const hasChanged = Object.keys(profile).some(
            key => profile[key as keyof UserProfile] !== originalProfile[key as keyof UserProfile]
        )
        setHasChanges(hasChanged)
    }, [profile, currentUser])

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
            const response = await UserApi.uploadAvatar(file)
            console.log("response",response)
            if (response.data.success) {
                setProfile({ ...profile, avatar: response.data.data })
                toast.success('头像上传成功')
            } else {
                toast.error(response.data.message || '头像上传失败')
            }
        } catch (error) {
            console.error('上传头像失败:', error)
            toast.error('上传头像失败')
        } finally {
            setUploading(false)
        }
    }

    // 验证表单
    const validateForm = (): boolean => {
        // 验证昵称
        if (!profile.nickName || profile.nickName.trim().length === 0) {
            toast.error('请输入昵称')
            return false
        }

        if (profile.nickName.length > 50) {
            toast.error('昵称不能超过50个字符')
            return false
        }

        // 验证手机号（如果填写了）
        if (profile.phone && profile.phone.trim().length > 0) {
            const phoneRegex = /^1[3-9]\d{9}$/
            if (!phoneRegex.test(profile.phone)) {
                toast.error('请输入正确的手机号')
                return false
            }
        }

        // 验证生日（如果填写了）
        if (profile.birthday) {
            const birthDate = new Date(profile.birthday)
            const now = new Date()
            const age = now.getFullYear() - birthDate.getFullYear()
            if (age < 0 || age > 150) {
                toast.error('请输入有效的生日')
                return false
            }
        }

        return true
    }

    // 保存资料
    const handleSave = async () => {
        if (!validateForm()) {
            return
        }

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
                // 更新用户状态
                updateUser({
                    nickName: profile.nickName,
                    avatar: profile.avatar,
                    bio: profile.bio,
                    phone: profile.phone,
                    birthday: profile.birthday,
                })
                toast.success('资料更新成功')
                setHasChanges(false)
                // 返回上一页
                setTimeout(() => {
                    router.back()
                }, 1000)
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
        if (hasChanges) {
            if (confirm('您有未保存的修改，确定要离开吗？')) {
                router.back()
            }
        } else {
            router.back()
        }
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
                            <Avatar className="h-24 w-24 border-4 border-background">
                                <AvatarImage src={profile.avatar} alt={displayName} />
                                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                    {displayName?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <label
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
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
                            {uploading && (
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
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

            {/* 账号信息卡片（只读） */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>账号信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">用户名</p>
                            <p className="font-medium">{currentUser?.userName}</p>
                        </div>
                    </div>
                    {currentUser?.email && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">邮箱</p>
                                <p className="font-medium">{currentUser.email}</p>
                            </div>
                        </div>
                    )}
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
                        <Label htmlFor="nickname" className="flex items-center gap-2">
                            昵称 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="nickname"
                            placeholder="请输入昵称"
                            value={profile.nickName}
                            onChange={(e) => setProfile({ ...profile, nickName: e.target.value })}
                            maxLength={50}
                        />
                        <div className="flex justify-between">
                            <p className="text-xs text-muted-foreground">
                                最多 50 个字符
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {profile.nickName.length}/50
                            </p>
                        </div>
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
                            className="resize-none"
                        />
                        <div className="flex justify-between">
                            <p className="text-xs text-muted-foreground">
                                让其他人更好地了解你
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {profile.bio.length}/200
                            </p>
                        </div>
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
                        <Label htmlFor="phone" className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            手机号
                        </Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="请输入手机号（选填）"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            maxLength={11}
                        />
                        <p className="text-xs text-muted-foreground">
                            用于接收重要通知，选填
                        </p>
                    </div>

                    {/* 生日 */}
                    <div className="space-y-2">
                        <Label htmlFor="birthday" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            生日
                        </Label>
                        <Input
                            id="birthday"
                            type="date"
                            value={profile.birthday}
                            onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                        />
                        <p className="text-xs text-muted-foreground">
                            我们会在你生日时送上祝福，选填
                        </p>
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
                    disabled={loading || !hasChanges}
                    className="flex-1"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? '保存中...' : '保存'}
                </Button>
            </div>
        </div>
    )
}
