import { request } from '@/config/axios'

// ==================== 类型定义 ====================

export interface Spot {
    id: number
    aid: string
    destinationId: string
    name: string
    images?: string | string[]
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

export interface SpotDetail extends Spot {
    destinationName?: string
    tags?: TagVO[]
    tickets?: TicketVO[]
    playItems?: PlayItemVO[]
    openTimeRules?: OpenTimeRuleVO[]
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

export interface TicketVO {
    id: number
    tid: string
    ticketName: string
    ticketCode?: string
    ticketType?: string
    price?: number
    discountPrice?: number
    stock?: number
    validDays?: number
    description?: string
    sortOrder?: number
}

export interface PlayItemVO {
    id: number
    aid: string
    name: string
    images?: string[]
    description?: string
    duration?: number
    maxPerson?: number
    minPerson?: number
    minAge?: number
    maxAge?: number
    price?: number
    discountPrice?: number
}

export interface OpenTimeRuleVO {
    id: number
    otrId: string
    openTimeName: string
    scheduleType?: string
    priority?: number
    startDate?: string
    endDate?: string
    dayOfWeek?: string
    timeSlots?: TimeSlotVO[]
    description?: string
    holidayFollowFlag?: boolean
}

export interface TimeSlotVO {
    start: string
    end: string
}

export interface SpotListParams {
    page?: number
    pageSize?: number
    aid?: string
    destinationId?: string
    name?: string
    keyword?: string
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
        return request.get<{ data: { records: Spot[]; total: number } }>('/attraction/api/list', { params })
    },

    /**
     * 获取景点详情
     */
    getSpotById: async (aid: string) => {
        return request.get<{ data: SpotDetail }>('/attraction/api/detail', {
            params: { aid }
        })
    },

    /**
     * 根据目的地获取景点
     */
    getSpotsByDestination: async (destinationId: string, page = 1, pageSize = 20) => {
        return request.get<{ data: { records: Spot[]; total: number } }>('/attraction/api/list', {
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

    /**
     * 增加景点浏览数
     */
    incrementViewCount: async (aid: string) => {
        return request.post('/attraction/api/increment-view', { aid })
    },
}

export default SpotApi
