import * as React from "react"
import * as z from "zod"
import { useForm } from "@tanstack/react-form"
import AuthApi from '@/api/auth'
import * as AuthInit from '@/api/auth/init'
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useUserActions } from "@/store/userStore"
import { tokenService } from "@/config/axios"

const registerFormShema = z.object({
    userName: z.string().min(1, { message: "用户名不能为空" }),
    email: z.email({ message: "请输入正确的邮箱地址" }),
    password: z.string()
    .min(6, { message: "长度不能少于6位" })
    .refine((val) => /[a-zA-Z]/.test(val), { message: "必须包含字母" })
    .refine((val) => /[0-9]/.test(val), { message: "必须包含数字" })
    .refine((val) => /^[a-zA-Z0-9._\-]+$/.test(val), { message: "只能包含字母、数字和符号 . _ -" }),
    otp: z.string().length(6, { message: "验证码长度为6位" }),
})

export function useRegisterData() {
    const router = useRouter()
    const { setUser } = useUserActions()
    const REGEXP_NUMERIC = "^[a-zA-Z0-9]+$";

    const registerForm = useForm({
        defaultValues: { ...AuthInit.initRegisterDTO },
        validators: {
            onSubmit: registerFormShema,
        },
        onSubmit: async (values) => {
            try {
                const response = await AuthApi.register(values.value)

                toast.success("注册成功，请登录")
                router.push('/login')
            } catch (error: any) {
                const message = error?.response?.data?.message || "注册失败，请稍后重试"
                toast.error(message)
            }
        }
    })

    return {
        REGEXP_NUMERIC,
        registerForm
    }
}
