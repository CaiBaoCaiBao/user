import { request } from '@/config/axios'

// ==================== 类型定义 ====================

export interface Travel {
    id: number
    title: string
    description?: string
    coverImage?: string
    images?: string[]
    userId?: number
    userName?: string
    userAvatar?: string
    destinationId?: number
    destinationName?: string
    spotIds?: number[]
    days?: number
    budget?: number
    startDate?: string
    endDate?: string
    tags?: string[]
    viewCount?: number
    likeCount?: number
    collectCount?: number
    isLiked?: boolean
    isCollected?: boolean
    createdAt?: string
    updatedAt?: string
}

export interface TravelListParams {
    page?: number
    pageSize?: number
    userId?: number
    destinationId?: number
    keyword?: string
    tags?: string[]
    sortBy?: 'latest' | 'popular' | 'recommended'
}

export interface CreateTravelDTO {
    title: string
    description?: string
    coverImage?: string
    images?: string[]
    destinationId?: number
    spotIds?: number[]
    days?: number
    budget?: number
    startDate?: string
    endDate?: string
    tags?: string[]
}

export interface UpdateTravelDTO extends Partial<CreateTravelDTO> {}

// ==================== 旅行攻略 API ====================

const TravelApi = {
    /**
     * 获取旅行攻略列表
     */
    getTravels: async (params?: TravelListParams) => {
        return request.get<{ data: Travel[]; total: number }>('/travel/api/list', { params })
    },

    /**
     * 获取旅行攻略详情
     */
    getTravelById: async (id: number) => {
        return request.get<{ data: Travel }>(`/travel/api/${id}`)
    },

    /**
     * 创建旅行攻略
     */
    createTravel: async (data: CreateTravelDTO) => {
        return request.post<{ data: Travel }>('/travel/api/create', data)
    },

    /**
     * 更新旅行攻略
     */
    updateTravel: async (id: number, data: UpdateTravelDTO) => {
        return request.put<{ data: Travel }>(`/travel/api/${id}`, data)
    },

    /**
     * 删除旅行攻略
     */
    deleteTravel: async (id: number) => {
        return request.delete(`/travel/api/${id}`)
    },

    /**
     * 获取我的旅行攻略
     */
    getMyTravels: async (page = 1, pageSize = 20) => {
        return request.get<{ data: Travel[]; total: number }>('/travel/api/my', {
            params: { page, pageSize }
        })
    },

    /**
     * 获取用户的旅行攻略
     */
    getUserTravels: async (userId: number, page = 1, pageSize = 20) => {
        return request.get<{ data: Travel[]; total: number }>(`/travel/api/user/${userId}`, {
            params: { page, pageSize }
        })
    },

    /**
     * 搜索旅行攻略
     */
    searchTravels: async (keyword: string, page = 1, pageSize = 20) => {
        return request.get<{ data: Travel[]; total: number }>('/travel/api/search', {
            params: { keyword, page, pageSize }
        })
    },

    /**
     * 获取热门旅行攻略
     */
    getHotTravels: async (limit = 10) => {
        return request.get<{ data: Travel[] }>('/travel/api/hot', {
            params: { limit }
        })
    },

    /**
     * 获取推荐旅行攻略
     */
    getRecommendedTravels: async (limit = 10) => {
        return request.get<{ data: Travel[] }>('/travel/api/recommended', {
            params: { limit }
        })
    },
}

export default TravelApi
