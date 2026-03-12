import { request } from '@/config/axios'

// ==================== 类型定义 ====================

export interface UserInfo {
    id: number
    userName: string
    email: string
    avatar?: string
    phone?: string
    bio?: string
    createdAt?: string
    updatedAt?: string
}

export interface UpdateUserDTO {
    userName?: string
    avatar?: string
    phone?: string
    bio?: string
}

// ==================== 用户 API ====================

const UserApi = {
    /**
     * 获取当前用户信息
     */
    getCurrentUser: async () => {
        return request.get<{ data: UserInfo }>('/user/api/current')
    },

    /**
     * 根据ID获取用户信息
     */
    getUserById: async (id: number) => {
        return request.get<{ data: UserInfo }>(`/user/api/${id}`)
    },

    /**
     * 更新用户信息
     */
    updateUser: async (data: UpdateUserDTO) => {
        return request.put<{ data: UserInfo }>('/user/api/update', data)
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
