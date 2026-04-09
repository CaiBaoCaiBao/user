'use client'
import * as React from "react"
import { IconEyeClosed, IconEye } from "@tabler/icons-react";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldContent
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    InputGroupInput,
} from "@/components/ui/input-group"
import { Button } from "../ui/button"
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
interface PasswordLoginProps {
    form: any
}
export default function PasswordLogin({
    form
}: PasswordLoginProps) {
    const [showPassword, setShowPassword] = React.useState(false)
    const router = useRouter()
    const forotPassword = () => {
        router.replace("/forgot-password")
    }
    return (<>
        <form id="password-login-form" onSubmit={async (e) => {
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
                                <div className="flex justify-between items-center">
                                    <FieldLabel htmlFor={field.name}>密码<span className="text-destructive">*</span></FieldLabel>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="link"
                                        onClick={forotPassword}
                                    >
                                        忘记密码
                                    </Button>
                                </div>
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
                    name="rememberMe"
                    children={(field: any) => {
                        const isInvalid =
                            field.state.meta.isTouched && !field.state.meta.isValid
                        return (<>
                            <Field orientation="horizontal">
                                <Checkbox
                                    id="remember-me"
                                    checked={field.state.value}
                                    onCheckedChange={(checked) => field.handleChange(checked)}
                                />
                                <FieldContent>
                                    <FieldLabel htmlFor="remember-me">七天内免登录</FieldLabel>
                                </FieldContent>
                            </Field>
                        </>)
                    }}
                />
            </FieldGroup>
        </form>
    </>)
}