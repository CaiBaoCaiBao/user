import * as React from "react"
import * as z from "zod"
import { useForm } from "@tanstack/react-form"
import AuthApi from '@/api/auth'
import { LoginDTO } from "@/api/auth"
import { toast } from "sonner"
import { tokenService } from "@/config/axios"
import { useRouter } from "next/navigation"
import { useUserActions } from "@/store/userStore"

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

export const useLoginData = () => {
    const [loginMethod, setLoginMethod] = React.useState<'password' | 'otp'>('password')
    const router = useRouter()
    const { setUser } = useUserActions()
    const REGEXP_NUMERIC = "^[a-zA-Z0-9]+$";

    const loginForm = useForm({
        defaultValues: {
            email: "",
            key: "",
            rememberMe: false,
            loginMethod: loginMethod
        },
        validators: {
            onSubmit: async ({ value }) => {
                console.log('========== 开始验证表单数据 ==========')
                console.log('表单值:', value)
                console.log('当前 loginMethod 状态:', loginMethod)
                console.log('表单中的 loginMethod 字段:', value.loginMethod)
                // 根据当前 loginMethod 动态选择验证 schema
                const schema = loginMethod === 'password' ? passwordSchema : otpSchema
                console.log('使用的 schema:', loginMethod === 'password' ? 'passwordSchema' : 'otpSchema')
                const result = await schema.parseAsync(value)
                console.log('验证通过:', result)
                console.log('========== 验证完成 ==========')
                return result
            },
        },
        onSubmit: async (values) => {
            console.log('开始提交登录请求:', values)
            try {
                const data: LoginDTO = {
                    userName: values.value.email,
                    key: values.value.key,
                    rememberMe: values.value.rememberMe,
                    loginMethod: values.value.loginMethod
                }
                console.log('请求数据:', data)
                const response = await AuthApi.login(data)

                console.log('登录响应:', response.data)

                // 保存 Token - 后端返回结构是 { code, success, message, data, timestamp }
                if (response.data?.data?.accessToken) {
                    tokenService.setAccessToken(response.data.data.accessToken)
                }
                if (response.data?.data?.refreshToken) {
                    tokenService.setRefreshToken(response.data.data.refreshToken)
                }

                // 登录成功后获取用户信息
                try {
                    const userResponse = await AuthApi.getMyProfile()
                    console.log('用户信息响应:', userResponse.data)
                    if (userResponse.data?.data) {
                        setUser(userResponse.data.data)
                    }
                } catch (userError) {
                    console.error('获取用户信息失败:', userError)
                }

                toast.success("登录成功")
                router.push('/')
            } catch (error: any) {
                console.error('登录错误:', error)
                const message = error?.response?.data?.message || "登录失败"
                toast.error(message)
            }
        }
    })

    // 当 loginMethod 改变时，同步更新表单的 loginMethod 字段
    React.useEffect(() => {
        loginForm.setFieldValue('loginMethod', loginMethod)
        // 清空 key 字段，避免切换登录方式时保留之前的输入
        loginForm.setFieldValue('key', '')
    }, [loginMethod, loginForm])

    return {
        loginForm,
        setLoginMethod,
        loginMethod,
        REGEXP_NUMERIC
    }
}
