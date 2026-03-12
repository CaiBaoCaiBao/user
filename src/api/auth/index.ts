import { request } from "@/config/axios"
export type {
    RegisterDTO,
    LoginDTO,
    ForgotPasswordDTO
}

interface RegisterDTO {
    userName: string,
    email: string,
    password: string
    otp: string
}

interface LoginDTO {
    userName: string,
    key: string,
    loginMethod: string,
    rememberMe: boolean
}

interface ForgotPasswordDTO{
    email: string
    newPassword: string
    otp: string
}

const AuthApi = {
    register: async (data: RegisterDTO) => {
        return await request.post('/auth/api/register', data);
    },
    login: async (data: LoginDTO) => {
        return await request.post('/auth/api/login', data);
    }
}

export default AuthApi;