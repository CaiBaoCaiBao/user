import Loading from "@/components/forgot-pwd/loading"
import ForgotPwd from "@/components/forgot-pwd"
import { Suspense } from 'react'
export default function ForgotPwdPage() {
    return (<>
        <Suspense fallback={<Loading />}>
            <ForgotPwd />
        </Suspense>
    </>)
}