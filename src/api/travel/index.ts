import { request } from '@/config/axios'

// ==================== 类型定义 ====================

export interface Travel {
    id: number
    noteId: string
    userId: string
    userName?: string
    nickName?: string
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
    collectionCount?: number
    status?: number
    sortOrder?: number
    createdAt?: string
    updatedAt?: string
}

export interface TravelDetail {
    id: number
    noteId: string
    userId: string
    userName?: string
    nickName?: string
    userAvatar?: string
    destinationId: string
    destinationName?: string
    title: string
    coverImg?: string
    images?: string[]
    content: string
    travelDays?: number
    budget?: number
    viewCount?: number
    likeCount?: number
    commentCount?: number
    collectionCount?: number
    status?: number
    sortOrder?: number
    createdAt?: string
    updatedAt?: string
    attractions?: AttractionSimple[]
}

export interface AttractionSimple {
    id: number
    aid: string
    name: string
    coverImg?: string
    description?: string
}

export interface TravelListParams {
    pageNum?: number
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
    userId: string
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

export interface SetTopDTO {
    noteId: string
    isTop: boolean
}

// ==================== 旅行攻略 API ====================

const TravelApi = {
    /**
     * 获取旅行攻略列表
     */
    getTravels: async (params?: TravelListParams) => {
        return request.get<{ data: { records: Travel[]; total: number; size: number; current: number } }>('/travel-note/api/list', { params })
    },

    /**
     * 获取旅行攻略详情
     */
    getTravelById: async (noteId: string) => {
        return request.get<{ data: TravelDetail }>('/travel-note/api/detail', {
            params: { noteId }
        })
    },

    /**
     * 获取我的旅行攻略详情（可访问自己的草稿）
     */
    getMyTravelById: async (noteId: string) => {
        return request.get<{ data: TravelDetail }>('/travel-note/api/my-detail', {
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
        return request.get<{ data: Travel[] }>('/travel-note/api/batch-detail', {
            params: { noteIds }
        })
    },

    /**
     * 获取我的游记列表（需要登录，可查看所有状态的游记）
     */
    getMyTravels: async (params?: TravelListParams) => {
        return request.get<{ data: { records: Travel[]; total: number; size: number; current: number } }>('/travel-note/api/my-list', { params })
    },

    /**
     * 获取热门游记
     */
    getHotTravels: async (pageSize: number = 10) => {
        return request.get<{ data: { records: Travel[]; total: number; size: number; current: number } }>('/travel-note/api/hot', {
            params: { pageNum: 1, pageSize }
        })
    },

    /**
     * 保存游记草稿
     */
    saveDraft: async (data: CreateTravelDTO) => {
        return request.post('/travel-note/api/save-draft', data)
    },

    /**
     * 发布草稿
     */
    publishDraft: async (data: UpdateTravelDTO) => {
        return request.post('/travel-note/api/publish-draft', data)
    },

    /**
     * 获取我的草稿列表
     */
    getMyDrafts: async (page: number = 1, pageSize: number = 10, userId?: string) => {
        return request.get<{ data: { records: Travel[]; total: number; size: number; current: number } }>('/travel-note/api/list', {
            params: { pageNum: page, pageSize, userId, status: -1 }
        })
    },

    /**
     * 增加游记浏览数
     */
    incrementViewCount: async (noteId: string) => {
        return request.post('/travel-note/api/increment-view', { noteId })
    },

    /**
     * 置顶/取消置顶游记
     */
    setTop: async (data: SetTopDTO) => {
        return request.post('/travel-note/api/set-top', data)
    },
}

export default TravelApi
