import { request } from '@/config/axios'

// ==================== 类型定义 ====================

export interface Spot {
    id: number
    name: string
    description?: string
    coverImage?: string
    images?: string[]
    destinationId?: number
    destinationName?: string
    address?: string
    latitude?: number
    longitude?: number
    rating?: number
    reviewCount?: number
    price?: number
    openingHours?: string
    tags?: string[]
    createdAt?: string
    updatedAt?: string
}

export interface SpotListParams {
    page?: number
    pageSize?: number
    destinationId?: number
    keyword?: string
    minPrice?: number
    maxPrice?: number
    minRating?: number
    tags?: string[]
}

// ==================== 景点 API ====================

const SpotApi = {
    /**
     * 获取景点列表
     */
    getSpots: async (params?: SpotListParams) => {
        return request.get<{ data: Spot[]; total: number }>('/spot/api/list', { params })
    },

    /**
     * 获取景点详情
     */
    getSpotById: async (id: number) => {
        return request.get<{ data: Spot }>(`/spot/api/${id}`)
    },

    /**
     * 根据目的地获取景点
     */
    getSpotsByDestination: async (destinationId: number, page = 1, pageSize = 20) => {
        return request.get<{ data: Spot[]; total: number }>('/spot/api/by-destination', {
            params: { destinationId, page, pageSize }
        })
    },

    /**
     * 搜索景点
     */
    searchSpots: async (keyword: string, page = 1, pageSize = 20) => {
        return request.get<{ data: Spot[]; total: number }>('/spot/api/search', {
            params: { keyword, page, pageSize }
        })
    },

    /**
     * 获取热门景点
     */
    getHotSpots: async (limit = 10) => {
        return request.get<{ data: Spot[] }>('/spot/api/hot', {
            params: { limit }
        })
    },

    /**
     * 获取推荐景点
     */
    getRecommendedSpots: async (limit = 10) => {
        return request.get<{ data: Spot[] }>('/spot/api/recommended', {
            params: { limit }
        })
    },
}

export default SpotApi
