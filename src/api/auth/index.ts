import { request } from "@/config/axios"

// ==================== 类型定义 ====================

export interface RegisterDTO {
    userName: string
    email: string
    password: string
    otp: string
}

export interface LoginDTO {
    userName: string
    key: string
    loginMethod: 'password' | 'otp'
    rememberMe: boolean
}

export interface ForgotPasswordDTO {
    email: string
    newPassword: string
    otp: string
}

export interface SendOTPDTO {
    email: string
    template: 'register' | 'login' | 'forgot-password'
}

// ==================== API 接口 ====================

const AuthApi = {
    /**
     * 用户注册
     */
    register: async (data: RegisterDTO) => {
        return await request.post('/auth/api/register', data)
    },

    /**
     * 用户登录
     */
    login: async (data: LoginDTO) => {
        return await request.post('/auth/api/login', data)
    },

    /**
     * 忘记密码
     */
    forgotPassword: async (data: ForgotPasswordDTO) => {
        return await request.post('/auth/api/forgot-password', data)
    },

    /**
     * 发送验证码
     */
    sendOTP: async (data: SendOTPDTO) => {
        return await request.post('/users/mail/api/sendOtp', data)
    },

    /**
     * 获取当前用户个人资料详情
     */
    getMyProfile: async () => {
        return await request.get('/user/api/my-profile')
    },

    /**
     * 测试接口
     */
    test: async () => {
        return await request.get('/auth/api/test')
    }
}

export default AuthApi