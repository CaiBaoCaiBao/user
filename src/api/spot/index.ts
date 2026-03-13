import { request } from '@/config/axios'

// ==================== 类型定义 ====================

export interface Spot {
    id: number
    aid: string
    destinationId: string
    name: string
    images?: string
    address?: string
    phone?: string
    longitude?: number
    latitude?: number
    description?: string
    viewCount?: number
    status?: number
    sortOrder?: number
    realTimeSyncFlag?: boolean
    createdAt?: string
    updatedAt?: string
}

export interface SpotListParams {
    page?: number
    pageSize?: number
    aid?: string
    destinationId?: string
    name?: string
    status?: number
}

export interface SpotDetailParams {
    aid: string
}

// ==================== 景点 API ====================

const SpotApi = {
    /**
     * 获取景点列表
     */
    getSpots: async (params?: SpotListParams) => {
        return request.get<{ data: Spot[]; total: number }>('/attraction/api/list', { params })
    },

    /**
     * 获取景点详情
     */
    getSpotById: async (aid: string) => {
        return request.get<{ data: Spot }>('/attraction/api/detail', {
            params: { aid }
        })
    },

    /**
     * 根据目的地获取景点
     */
    getSpotsByDestination: async (destinationId: string, page = 1, pageSize = 20) => {
        return request.get<{ data: Spot[]; total: number }>('/attraction/api/list', {
            params: { destinationId, page, pageSize }
        })
    },

    /**
     * 创建景点（管理员功能）
     */
    createSpot: async (data: any) => {
        return request.post('/attraction/api/create', data)
    },

    /**
     * 更新景点（管理员功能）
     */
    updateSpot: async (data: any) => {
        return request.post('/attraction/api/update', data)
    },

    /**
     * 删除景点（管理员功能）
     */
    deleteSpot: async (data: any) => {
        return request.delete('/attraction/api/delete', { data })
    },
}

export default SpotApi
