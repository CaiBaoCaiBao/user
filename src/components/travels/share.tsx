'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Share2, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

interface TravelShareProps {
    noteId: string
    title: string
}

export default function TravelShare({ noteId, title }: TravelShareProps) {
    const [open, setOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/travels/${noteId}` : ''

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            toast.success('链接已复制到剪贴板')
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            toast.error('复制失败，请手动复制')
        }
    }

    const handleShare = async (platform: string) => {
        const url = encodeURIComponent(shareUrl)
        const text = encodeURIComponent(`分享一篇游记：${title}`)
        let shareLink = ''

        switch (platform) {
            case 'weibo':
                shareLink = `https://service.weibo.com/share/share.php?url=${url}&title=${text}`
                break
            case 'qq':
                shareLink = `https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${text}`
                break
            case 'qzone':
                shareLink = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${url}&title=${text}`
                break
            default:
                return
        }

        window.open(shareLink, '_blank', 'width=600,height=400')
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    分享
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>分享游记</DialogTitle>
                    <DialogDescription>
                        分享这篇游记给更多朋友
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {/* 复制链接 */}
                    <div className="flex gap-2">
                        <Input
                            value={shareUrl}
                            readOnly
                            className="flex-1"
                        />
                        <Button onClick={handleCopy} variant="outline">
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    已复制
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    复制
                                </>
                            )}
                        </Button>
                    </div>

                    {/* 社交平台分享 */}
                    <div>
                        <p className="text-sm text-muted-foreground mb-3">分享到社交平台</p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => handleShare('weibo')}
                                className="flex-1"
                            >
                                微博
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleShare('qq')}
                                className="flex-1"
                            >
                                QQ
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleShare('qzone')}
                                className="flex-1"
                            >
                                QQ空间
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
