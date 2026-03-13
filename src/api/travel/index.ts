import { request } from '@/config/axios'

// ==================== 类型定义 ====================

export interface Travel {
    id: number
    noteId: string
    userId: string
    destinationId: string
    title: string
    coverImg?: string
    images?: string
    content: string
    travelDays?: number
    budget?: number
    viewCount?: number
    likeCount?: number
    commentCount?: number
    status?: number
    sortOrder?: number
    createdAt?: string
    updatedAt?: string
}

export interface TravelListParams {
    page?: number
    pageSize?: number
    noteId?: string
    userId?: string
    destinationId?: string
    title?: string
    status?: number
}

export interface TravelDetailParams {
    noteId: string
}

export interface CreateTravelDTO {
    destinationId: string
    attractionIds?: string[]
    title: string
    coverImg?: string
    images?: string[]
    content: string
    travelDays?: number
    budget?: number
}

export interface UpdateTravelDTO extends Partial<CreateTravelDTO> {}

// ==================== 旅行攻略 API ====================

const TravelApi = {
    /**
     * 获取旅行攻略列表
     */
    getTravels: async (params?: TravelListParams) => {
        return request.get<{ data: Travel[]; total: number }>('/travel-note/api/list', { params })
    },

    /**
     * 获取旅行攻略详情
     */
    getTravelById: async (noteId: string) => {
        return request.get<{ data: Travel }>('/travel-note/api/detail', {
            params: { noteId }
        })
    },

    /**
     * 创建旅行攻略
     */
    createTravel: async (data: CreateTravelDTO) => {
        return request.post('/travel-note/api/create', data)
    },

    /**
     * 更新旅行攻略
     */
    updateTravel: async (data: UpdateTravelDTO) => {
        return request.post('/travel-note/api/update', data)
    },

    /**
     * 删除旅行攻略
     */
    deleteTravel: async (data: any) => {
        return request.delete('/travel-note/api/delete', { data })
    },

    /**
     * 批量获取游记详情
     */
    getBatchTravelDetail: async (noteIds: string[]) => {
        return request.get('/travel-note/api/batch-detail', {
            params: { noteIds }
        })
    },

    /**
     * 获取我的游记列表
     */
    getMyTravels: async (page: number = 1, pageSize: number = 10) => {
        return request.get('/user/api/my-travel-notes', {
            params: { pageNum: page, pageSize }
        })
    },

    /**
     * 获取热门游记
     */
    getHotTravels: async (pageSize: number = 10) => {
        return request.get('/travel-note/api/list', {
            params: { pageNum: 1, pageSize, status: 1 }
        })
    },
}

export default TravelApi
