'use client'
import { useRouter } from "next/navigation"
import {
    LogOutIcon,
    SettingsIcon,
    UserIcon,
} from "lucide-react"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUserActions } from "@/store/userStore"
import { toast } from "sonner"

interface NavUserProps {
    nickName: string
    userName: string
    avatar: string
}

export default function NavUser({
    nickName,
    userName,
    avatar,
}: NavUserProps) {
    const router = useRouter()
    const { logout } = useUserActions()

    // 生成头像 fallback（取昵称或用户名的首字母）
    const getAvatarFallback = () => {
        const name = nickName || userName
        return name ? name.charAt(0).toUpperCase() : 'U'
    }

    // 处理菜单项点击
    const handleMenuClick = (action: string) => {
        switch (action) {
            case 'profile':
                router.push(`/u/${userName}`)
                break
            case 'settings':
                toast.info('设置功能开发中...')
                break
            case 'logout':
                logout()
                break
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer">
                <Avatar>
                    <AvatarImage src={avatar} alt={nickName || userName} />
                    <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex space-x-2 items-center">
                    <Avatar>
                        <AvatarImage src={avatar} alt={nickName || userName} />
                        <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{nickName || userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">@{userName}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleMenuClick('profile')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>个人主页</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMenuClick('settings')}>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>设置</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => handleMenuClick('logout')}
                    className="text-destructive focus:text-destructive"
                >
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    <span>退出登录</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}