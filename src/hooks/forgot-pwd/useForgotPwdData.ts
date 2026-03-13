import * as React from "react"
import * as z from "zod"
import { useForm } from "@tanstack/react-form"
import AuthApi from '@/api/auth'
import * as AuthInit from '@/api/auth/init'
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const forgotPwdShema = z.object({
    email: z.email({ message: "请输入正确的邮箱地址" }),
    newPassword: z.string()
        .min(6, { message: "长度不能少于6位" })
        .refine((val) => /[a-zA-Z]/.test(val), { message: "必须包含字母" })
        .refine((val) => /[0-9]/.test(val), { message: "必须包含数字" })
        .refine((val) => /^[a-zA-Z0-9._\-]+$/.test(val), { message: "只能包含字母、数字和符号 . _ -" }),
    otp: z.string().length(6, { message: "验证码长度为6位" }),
})

export function useForgotPwdData() {
    const router = useRouter()
    const REGEXP_NUMERIC = "^[a-zA-Z0-9]+$";

    const forgotPwdForm = useForm({
        defaultValues: { ...AuthInit.initForgotPasswordDTO },
        validators: {
            onSubmit: forgotPwdShema,
        },
        onSubmit: async (values) => {
            try {
                const response = await AuthApi.forgotPassword(values.value)

                toast.success("密码重置成功，请使用新密码登录")
                router.replace("/login")
            } catch (error: any) {
                const message = error?.response?.data?.message || "密码重置失败，请稍后重试"
                toast.error(message)
            }
        }
    })

    return {
        forgotPwdForm,
        REGEXP_NUMERIC
    }
}
