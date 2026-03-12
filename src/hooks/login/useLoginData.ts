import * as React from "react"
import * as z from "zod"
import { useForm } from "@tanstack/react-form"
import AuthApi from '@/api/auth'
import { LoginDTO } from "@/api/auth"
import { toast } from "sonner"
import { tokenService } from "@/config/axios"
import { useRouter } from "next/navigation"

// 基础字段
const baseSchema = z.object({
    email: z.email({ message: "请输入正确的邮箱地址" }),
    rememberMe: z.boolean(),
    loginMethod: z.enum(['password', 'otp']),
})

// 密码登录
const passwordSchema = baseSchema.extend({
    loginMethod: z.literal('password'),
    key: z.string()
        .min(6, { message: "长度不能少于6位" })
        .refine((val) => /[a-zA-Z]/.test(val), { message: "必须包含字母" })
        .refine((val) => /[0-9]/.test(val), { message: "必须包含数字" })
        .refine((val) => /^[a-zA-Z0-9._\-]+$/.test(val), { message: "只能包含字母、数字和符号 . _ -" }),
})

// OTP 登录
const otpSchema = baseSchema.extend({
    loginMethod: z.literal('otp'),
    key: z.string().length(6, { message: "验证码长度为6位" }),
})

// 联合类型
export const loginSchema = z.discriminatedUnion('loginMethod', [
    passwordSchema,
    otpSchema,
])

// 类型导出
export type LoginFormData = z.infer<typeof loginSchema>

export const useLoginData = () => {
    const [loginMethod, setLoginMethod] = React.useState<'password' | 'otp'>('password')
    const router = useRouter()
    const REGEXP_NUMERIC = "^[a-zA-Z0-9]+$";
    const loginForm = useForm({
        defaultValues: {
            email: "",
            key: "",
            rememberMe: false,
            loginMethod: loginMethod
        },
        validators: {
            onSubmit: loginSchema,
        },
        onSubmit: async (values) => {
            try {
                const data: LoginDTO = {
                    userName: values.value.email,
                    key: values.value.key,
                    rememberMe: values.value.rememberMe,
                    loginMethod:loginMethod
                }
                const response = await AuthApi.login(data)
                
                // 保存 Token
                if (response.data?.accessToken) {
                    tokenService.setAccessToken(response.data.accessToken)
                }
                if (response.data?.refreshToken) {
                    tokenService.setRefreshToken(response.data.refreshToken)
                }
                
                toast.success("登录成功")
                router.push('/')
            } catch (error) {
                toast.error("登录失败")
            }
        }
    })

    return {
        loginForm,
        setLoginMethod,
        loginMethod,
        REGEXP_NUMERIC
    }
}
