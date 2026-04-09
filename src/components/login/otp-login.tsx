'use client'
import * as React from "react"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldContent,
    FieldTitle
} from "@/components/ui/field";
import { Button } from "../ui/button"
import { Input } from "@/components/ui/input";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox";

import { useCountDownData } from "@/hooks/count-down/useCountDownData";
import { useSendOTP } from "@/hooks/use-send-otp";

interface OtpLoginProps {
    form: any
    otpReg: string
}

export function OtpLogin({
    form,
    otpReg
}: OtpLoginProps) {
    const { countDown, isCounting, startCountDown } = useCountDownData()
    const { sendOTP } = useSendOTP()
    const handleSendOTP = async () => {
        const email = form.getFieldValue("email")
        if (!email) {
            toast.error("请先输入邮箱地址")
            return
        }
        const succcess = await sendOTP(email, { template: 'login' })
        if (!succcess) return
        startCountDown(60) // 1分钟倒计时
    }
    return (<>
        <form id="otp-login-form" onSubmit={async (e) => {
            e.preventDefault()
            try {
                const values = form.state.values
                await form.validators?.onSubmit?.({ value: values })
                if (form.options.onSubmit) {
                    await form.options.onSubmit({ value: values })
                }
            } catch (error) {
                console.error('表单提交失败:', error)
            }
        }}>
            <FieldGroup>
                <form.Field
                    name="email"
                    children={(field: any) => {
                        const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid
                        return (<>
                            <Field data-invalid={isInvalid}>
                                <div className="flex justify-between items-center">
                                    <FieldLabel htmlFor={field.name}>邮箱<span className="text-destructive">*</span></FieldLabel>
                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                </div>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    aria-invalid={isInvalid}
                                    placeholder="example@example.com"
                                    autoComplete="off" />
                            </Field>
                        </>)
                    }}
                />
                <form.Field
                    name="key"
                    children={(field: any) => {
                        const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid
                        return (<>
                            <Field data-invalid={isInvalid}>
                                <div className="flex justify-between">
                                    <FieldLabel htmlFor={field.name}>验证码<span className="text-destructive">*</span></FieldLabel>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="cursor-pointer"
                                        onClick={handleSendOTP}
                                        disabled={isCounting}
                                        size="sm"
                                    >
                                        {isCounting ? `${countDown}秒后重新获取` : '获取验证码'}
                                    </Button>
                                </div>
                                <InputOTP maxLength={6}
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(value) => field.handleChange(value)}
                                    aria-invalid={isInvalid}
                                    autoComplete="off"
                                    pattern={otpReg}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                                <FieldDescription>5分钟内有效</FieldDescription>
                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                            </Field>
                        </>)
                    }}
                />
                <form.Field
                    name="rememberMe"
                    children={(field: any) => {
                        const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid
                        return (<>
                            <Field orientation="horizontal">
                                <Checkbox
                                    id="remember-me-otp"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) => field.handleChange(checked)}
                                />
                                <FieldContent>
                                    <FieldLabel htmlFor="remember-me-otp">七天内免登录</FieldLabel>
                                </FieldContent>
                            </Field>
                        </>)
                    }}
                />
            </FieldGroup>
        </form>
    </>)
}