import * as z from "zod"
import AuthApi from '@/api/auth'
import { toast } from "sonner"

const otpEmailSchema = z.object({
    email: z.email({ message: "请输入正确的邮箱地址" }),
})

interface SendOTPOptions {
    template?: 'register' | 'login' | 'forgot-password'
}

export function useSendOTP() {

    const sendOTP = async (email: string, options: SendOTPOptions = {}) => {
        // 1. 验证邮箱格式
        const result = otpEmailSchema.safeParse({ email })
        if (!result.success) {
            const errorMessage = result.error.issues[0]?.message || "邮箱格式不正确"
            toast.error(errorMessage)
            return false
        }

        // 2. 调用后端API发送OTP
        try {
            const { template = 'register' } = options
            const res = await AuthApi.sendOTP({ email, template })

            if (!res.data?.success) {
                toast.error(res.data?.message || "验证码获取失败")
                return false
            }

            toast.success("验证码已发送到您的邮箱")
            return true
        } catch (error: any) {
            // 处理不同类型的错误
            const message = error?.response?.data?.message || "发送失败，请稍后重试"
            toast.error(message)
            return false
        }
    }

    return {
        sendOTP
    }
}
