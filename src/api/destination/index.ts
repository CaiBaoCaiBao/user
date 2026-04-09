import { request } from '@/config/axios'

// ==================== 类型定义 ====================

export interface Destination {
    id: number
    destinationId: string
    name: string
    aliasesName?: string
    destCode?: string
    longitude?: number
    latitude?: number
    coverImg?: string
    description?: string
    province?: string
    city?: string
    level?: number
    bestSeason?: string
    travelDays?: number
    viewCount?: number
    status?: string
    sortOrder?: string
    createdAt?: string
    updatedAt?: string
}

export interface DestinationDetail extends Destination {
    tags?: TagVO[]
    attractions?: AttractionSimpleVO[]
}

export interface TagVO {
    id: number
    tid: string
    tagName: string
    tagCode?: string
    iconUrl?: string
    color?: string
    weight?: number
    recommendFlag?: boolean
}

export interface AttractionSimpleVO {
    id: number
    aid: string
    name: string
    coverImg?: string
    description?: string
    viewCount?: number
    sortOrder?: number
}

export interface DestinationListParams {
    page?: number
    pageSize?: number
    destinationId?: string
    name?: string
    province?: string
    city?: string
    level?: number
    status?: string
}

export interface DestinationDetailParams {
    destinationId: string
}

export interface PageResult<T> {
    records: T[]
    total: number
    page: number
    pageSize: number
}

export interface DestinationListResponse {
    data: PageResult<Destination>
}

// ==================== 目的地 API ====================

const DestinationApi = {
    /**
     * 获取目的地列表
     */
    getDestinations: async (params?: DestinationListParams) => {
        return request.get<DestinationListResponse>('/destination/api/list', { params })
    },

    /**
     * 获取目的地详情
     */
    getDestinationById: async (destinationId: string) => {
        return request.get<{ data: DestinationDetail }>('/destination/api/detail', {
            params: { destinationId }
        })
    },

    /**
     * 创建目的地（管理员功能）
     */
    createDestination: async (data: any) => {
        return request.post('/destination/api/create', data)
    },

    /**
     * 更新目的地（管理员功能）
     */
    updateDestination: async (data: any) => {
        return request.post('/destination/api/update', data)
    },

    /**
     * 删除目的地（管理员功能）
     */
    deleteDestination: async (data: any) => {
        return request.delete('/destination/api/delete', { data })
    },

    /**
     * 增加目的地浏览数
     */
    incrementViewCount: async (destinationId: string) => {
        return request.post('/destination/api/increment-view', { destinationId })
    },
}

export default DestinationApi
