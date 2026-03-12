'use client'
import RegisterForm from "@/components/register/register-form";
import { useRegisterData } from "@/hooks/register/useRegisterData"
import { FieldDescription } from "../ui/field";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card"
import { Button } from "../ui/button";
export default function Register() {
    const { registerForm, REGEXP_NUMERIC } = useRegisterData()
    return (<>
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <Card className="w-full max-w-sm ring-0">
                <CardHeader className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-xl font-bold">创建Trip账户</h1>
                    <FieldDescription>
                        已经有了账户？ <a href="/login">登录</a>
                    </FieldDescription>
                </CardHeader>
                <CardContent>
                    <RegisterForm otpReg={REGEXP_NUMERIC} form={registerForm} />
                </CardContent>
                <CardFooter className="bg-transparent border-0" >
                    <Button
                        type="button"
                        form="register-form"
                        className="w-full cursor-pointer"
                        onClick={registerForm.handleSubmit}
                    >
                        创建账户
                    </Button>
                </CardFooter>
                <FieldDescription className="px-6 text-center">
                    创建账户即表示您同意我们的<a href="#">服务条款</a>{" "}
                    和 <a href="#">隐私政策</a>。
                </FieldDescription>
            </Card>
        </div>
    </>)
}