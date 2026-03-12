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
import { useForgotPwdData } from "@/hooks/forgot-pwd/useForgotPwdData";
import ForgotPwdForm from "./forgot-pwd-form";
export default function ForgotPwd() {
    const { forgotPwdForm, REGEXP_NUMERIC } = useForgotPwdData()
    return (<>
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <Card className="w-full max-w-sm ring-0">
                <CardHeader className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-xl font-bold">忘记账户密码</h1>
                    <FieldDescription>
                        其实没有忘记密码甚至还没创建账户？
                    </FieldDescription>
                    <FieldDescription>
                        哦~调皮的小宝宝，去{" "}<a href="/login">登录</a>{" "}或{" "}<a href="/register">注册</a>{" "}吧
                    </FieldDescription>
                </CardHeader>
                <CardContent>
                    <ForgotPwdForm otpReg={REGEXP_NUMERIC} form={forgotPwdForm} />
                </CardContent>
                <CardFooter className="bg-transparent border-0" >
                    <Button
                        type="button"
                        form="register-form"
                        className="w-full cursor-pointer"
                        onClick={forgotPwdForm.handleSubmit}
                    >
                        忘记密码
                    </Button>
                </CardFooter>
                <FieldDescription className="text-center">
                    点击忘记密码后，您必须使用您的新密码进行登录
                </FieldDescription>
                <FieldDescription className="text-center">
                    你必须拥有一个账户才能使用此功能
                </FieldDescription>
            </Card>
        </div>
    </>)
}