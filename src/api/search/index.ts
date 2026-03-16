import { request } from '@/config/axios'

// ==================== 类型定义 ====================

export interface SearchResult<T> {
    items: T[]
    total: number
}

export interface SearchParams {
    keyword: string
    type?: 'all' | 'destination' | 'travel_note' | 'attraction'
    pageNum?: number
    pageSize?: number
}

export interface Destination {
    destinationId: string
    name: string
    description?: string
    coverImg?: string
    province?: string
    city?: string
    attractionCount?: number
    travelNoteCount?: number
    createdAt?: string
}

export interface TravelNote {
    noteId: string
    title: string
    coverImg?: string
    summary?: string
    userId?: string
    userName?: string
    userAvatar?: string
    viewCount?: number
    likeCount?: number
    commentCount?: number
    createdAt?: string
}

export interface Attraction {
    aid: string
    destinationId: string
    name: string
    images?: string[]
    address?: string
    phone?: string
    description?: string
    longitude?: number
    latitude?: number
    viewCount?: number
    createdAt?: string
}

export interface AllSearchResult {
    destinations: Destination[]
    travelNotes: TravelNote[]
    attractions: Attraction[]
    travelNoteTotal?: number
    destinationTotal?: number
    attractionTotal?: number
}

// ==================== 搜索 API ====================

const SearchApi = {
    /**
     * 综合搜索
     */
    searchAll: async (keyword: string, pageNum = 1, pageSize = 10) => {
        return request.get<{ data: AllSearchResult }>('/search/api/search', {
            params: { keyword, type: 'all', pageNum, pageSize }
        })
    },

    /**
     * 搜索目的地
     */
    searchDestinations: async (keyword: string, pageNum = 1, pageSize = 20) => {
        return request.get<{ data: SearchResult<Destination> }>('/search/api/search', {
            params: { keyword, type: 'destination', pageNum, pageSize }
        })
    },

    /**
     * 搜索旅行攻略
     */
    searchTravelNotes: async (keyword: string, pageNum = 1, pageSize = 20) => {
        return request.get<{ data: SearchResult<TravelNote> }>('/search/api/search', {
            params: { keyword, type: 'travel_note', pageNum, pageSize }
        })
    },

    /**
     * 获取搜索建议
     * 注意：此接口需要后端实现
     */
    getSuggestions: async (keyword: string, limit = 10) => {
        return request.get<{ data: string[] }>('/search/api/suggestions', {
            params: { keyword, limit }
        })
    },

    /**
     * 获取热门搜索词
     * 注意：此接口需要后端实现
     */
    getHotKeywords: async (limit = 10) => {
        return request.get<{ data: string[] }>('/search/api/hot-keywords', {
            params: { limit }
        })
    },
}

export default SearchApi
