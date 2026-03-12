import { request } from '@/config/axios'

// ==================== 类型定义 ====================

export interface SearchResult<T> {
    items: T[]
    total: number
}

export interface SearchParams {
    keyword: string
    type?: 'all' | 'destination' | 'spot' | 'travel'
    page?: number
    pageSize?: number
}

export interface Destination {
    id: number
    name: string
    description?: string
    coverImage?: string
    country?: string
    province?: string
    city?: string
}

export interface Spot {
    id: number
    name: string
    description?: string
    coverImage?: string
    destinationId?: number
    destinationName?: string
    rating?: number
    price?: number
}

export interface Travel {
    id: number
    title: string
    description?: string
    coverImage?: string
    userId?: number
    userName?: string
    destinationId?: number
    destinationName?: string
    likeCount?: number
    collectCount?: number
}

export interface AllSearchResult {
    destinations: Destination[]
    spots: Spot[]
    travels: Travel[]
}

// ==================== 搜索 API ====================

const SearchApi = {
    /**
     * 综合搜索
     */
    searchAll: async (keyword: string, page = 1, pageSize = 10) => {
        return request.get<{ data: AllSearchResult }>('/search/api/all', {
            params: { keyword, page, pageSize }
        })
    },

    /**
     * 搜索目的地
     */
    searchDestinations: async (keyword: string, page = 1, pageSize = 20) => {
        return request.get<{ data: SearchResult<Destination> }>('/search/api/destinations', {
            params: { keyword, page, pageSize }
        })
    },

    /**
     * 搜索景点
     */
    searchSpots: async (keyword: string, page = 1, pageSize = 20) => {
        return request.get<{ data: SearchResult<Spot> }>('/search/api/spots', {
            params: { keyword, page, pageSize }
        })
    },

    /**
     * 搜索旅行攻略
     */
    searchTravels: async (keyword: string, page = 1, pageSize = 20) => {
        return request.get<{ data: SearchResult<Travel> }>('/search/api/travels', {
            params: { keyword, page, pageSize }
        })
    },

    /**
     * 获取搜索建议
     */
    getSuggestions: async (keyword: string, limit = 10) => {
        return request.get<{ data: string[] }>('/search/api/suggestions', {
            params: { keyword, limit }
        })
    },

    /**
     * 获取热门搜索词
     */
    getHotKeywords: async (limit = 10) => {
        return request.get<{ data: string[] }>('/search/api/hot-keywords', {
            params: { limit }
        })
    },
}

export default SearchApi
