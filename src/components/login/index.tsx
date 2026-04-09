'use client'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs"
import { FieldDescription } from "../ui/field";
import { Button } from "../ui/button";

import PasswordLogin from "./password-login";
import { OtpLogin } from "./otp-login";

import { useLoginData } from "@/hooks/login/useLoginData"

export default function Login() {
    const { loginMethod, setLoginMethod, loginForm, REGEXP_NUMERIC } = useLoginData()
    return (<>
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <Card className="w-full max-w-sm ring-0">
                <CardHeader className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-xl font-bold">登录Trip账户</h1>
                    <FieldDescription>
                        还没有账户？ <a href="/register">注册</a>
                    </FieldDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue={loginMethod} onValueChange={(value) => setLoginMethod(value as "password" | "otp")}  >
                        <TabsList>
                            <TabsTrigger value="password">密码登录</TabsTrigger>
                            <TabsTrigger value="otp">验证码登录</TabsTrigger>
                        </TabsList>
                        <TabsContent value="password">
                            <PasswordLogin form={loginForm} />
                        </TabsContent>
                        <TabsContent value="otp">
                            <OtpLogin form={loginForm} otpReg={REGEXP_NUMERIC} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
                <CardFooter className="bg-transparent border-0" >
                    <Button
                        type="submit"
                        form={loginMethod === 'password' ? 'password-login-form' : 'otp-login-form'}
                        className="w-full cursor-pointer"
                    >
                        登录账户
                    </Button>
                </CardFooter>
                <FieldDescription className="px-6 text-center">
                    登录账户即表示您同意我们的<a href="#">服务条款</a>{" "}
                    和 <a href="#">隐私政策</a>。
                </FieldDescription>
            </Card>
        </div>
    </>)
}