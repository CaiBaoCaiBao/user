import { request } from '@/config/axios'

// ==================== 类型定义 ====================

export interface UserInfo {
    id?: number
    uuid: string
    userName: string
    email?: string
    role: string
    status: string
    nickName?: string
    avatar?: string
    bio?: string
    phone?: string
    birthday?: string
    createdAt?: string
    updatedAt?: string
}

export interface UserProfile {
    id?: number
    uuid?: string
    nickName?: string
    idCard?: string
    phone?: string
    avatar?: string
    bio?: string
    birthday?: string
    createdAt?: string
    updatedAt?: string
}

export interface UpdateUserDTO {
    userName?: string
    email?: string
    role?: string
    status?: string
}

export interface UpdateUserProfileDTO {
    uuid?: string
    nickName?: string
    idCard?: string
    phone?: string
    avatar?: string
    bio?: string
    birthday?: string
}

// ==================== 用户 API ====================

const UserApi = {
    /**
     * 获取当前用户信息
     */
    getCurrentUser: async () => {
        return request.get<{ data: UserInfo }>('/user/api/my-profile')
    },

    /**
     * 根据用户ID获取用户信息
     */
    getUserById: async (uid: string) => {
        return request.get<{ data: UserInfo }>('/user/api/info', { params: { uid } })
    },

    /**
     * 根据用户名获取用户信息
     */
    getUserByUserName: async (userName: string) => {
        return request.get<{ data: UserInfo }>('/user/api/info', { params: { userName } })
    },

    /**
     * 获取用户资料（支持 uid 或 userName）
     */
    getUserProfile: async (uid?: string, userName?: string) => {
        const params: any = {}
        if (uid) params.uid = uid
        if (userName) params.userName = userName
        return request.get<{ data: UserProfile }>('/user/api/info', { params })
    },

    /**
     * 更新用户信息
     * 注意：此接口需要后端实现
     */
    updateUser: async (data: UpdateUserDTO) => {
        return request.post('/user/api/update', data)
    },

    /**
     * 更新用户资料
     */
    updateUserProfile: async (data: UpdateUserProfileDTO) => {
        return request.post('/user/api/update', data)
    },

    /**
     * 上传头像
     */
    uploadAvatar: async (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        return request.post<{ data: { url: string } }>('/file/api/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
    },
}

export default UserApi
