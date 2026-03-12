import Register from "@/components/register"
import Loading from "@/components/register/loading"
import { Suspense } from 'react'
export default function RegisterPage() {
    return (<>
        <Suspense fallback={<Loading/>}>
            <Register/>
        </Suspense>

    </>)
}