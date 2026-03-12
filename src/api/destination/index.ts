import { request } from '@/config/axios'

// ==================== 类型定义 ====================

export interface Destination {
    id: number
    name: string
    description?: string
    coverImage?: string
    country?: string
    province?: string
    city?: string
    spotCount?: number
    createdAt?: string
    updatedAt?: string
}

export interface DestinationListParams {
    page?: number
    pageSize?: number
    country?: string
    province?: string
    city?: string
    keyword?: string
}

// ==================== 目的地 API ====================

const DestinationApi = {
    /**
     * 获取目的地列表
     */
    getDestinations: async (params?: DestinationListParams) => {
        return request.get<{ data: Destination[]; total: number }>('/destination/api/list', { params })
    },

    /**
     * 获取目的地详情
     */
    getDestinationById: async (id: number) => {
        return request.get<{ data: Destination }>(`/destination/api/${id}`)
    },

    /**
     * 搜索目的地
     */
    searchDestinations: async (keyword: string, page = 1, pageSize = 20) => {
        return request.get<{ data: Destination[]; total: number }>('/destination/api/search', {
            params: { keyword, page, pageSize }
        })
    },

    /**
     * 获取热门目的地
     */
    getHotDestinations: async (limit = 10) => {
        return request.get<{ data: Destination[] }>('/destination/api/hot', {
            params: { limit }
        })
    },
}

export default DestinationApi
