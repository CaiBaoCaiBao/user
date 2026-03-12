import Loading from "@/components/login/loading"
import Login from "@/components/login"
import { Suspense } from 'react'
export default function LoginPage() {
    return (<>
        <Suspense fallback={<Loading />}>
            <Login />
        </Suspense>
    </>)
}