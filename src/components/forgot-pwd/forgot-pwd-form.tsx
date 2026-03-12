"use client"
import * as React from "react"

import { Button } from "../ui/button"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    InputGroupInput,
} from "@/components/ui/input-group"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { IconEyeClosed, IconEye } from "@tabler/icons-react";
import { useCountDownData } from "@/hooks/count-down/useCountDownData";
import { useSendOTP } from "@/hooks/use-send-otp";
import { toast } from "sonner"
interface ForgotPwdFormProps {
    form: any,
    otpReg: string
}
export default function ForgotPwdForm({
    form,
    otpReg
}: ForgotPwdFormProps) {
    const [showPassword, setShowPassword] = React.useState(false)
    const { countDown, isCounting, startCountDown } = useCountDownData()
    const { sendOTP } = useSendOTP()
    const handleSendOTP = async () => {
        const email = form.getFieldValue("email")
        if (!email) {
            toast.error("请先输入邮箱地址")
            return
        }
        const succcess = await sendOTP(email, { template: 'forgot-password' })
        if (!succcess) return
        startCountDown(60) // 1分钟倒计时
    }

    return (<>
        <form id="register-form">
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
                    name="newPassword"
                    children={(field: any) => {
                        const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid
                        return (<>
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>新密码<span className="text-destructive">*</span></FieldLabel>
                                <InputGroup>
                                    <InputGroupInput
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="off"
                                        maxLength={20}
                                    />
                                    <InputGroupAddon align="inline-end">
                                        <InputGroupText className="tabular-nums text-sm!">
                                            {field.state.value.length}/20
                                        </InputGroupText>
                                    </InputGroupAddon>
                                    <InputGroupAddon align="inline-end">
                                        <Button
                                            type="button"
                                            size="icon-sm"
                                            variant="ghost"
                                            className="cursor-pointer"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <IconEye /> : <IconEyeClosed />}
                                        </Button>
                                    </InputGroupAddon>
                                </InputGroup>
                                {isInvalid ? <FieldError errors={field.state.meta.errors} /> : <FieldDescription>长度限制在6-20个字符</FieldDescription>}
                            </Field>
                        </>)
                    }}
                />
                <form.Field
                    name="otp"
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
            </FieldGroup>
        </form>
    </>)
}