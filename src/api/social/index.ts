import { request } from '@/config/axios'

// ==================== 类型定义 ====================

export interface Comment {
    commentId: string
    userId: string
    username?: string
    nickname?: string
    avatar?: string
    targetType: string
    targetId: string
    parentCommentId?: string
    content: string
    likeCount?: number
    isLiked?: boolean
    createdAt?: string
}

export interface CreateCommentDTO {
    targetType: string
    targetId: string
    parentCommentId?: string
    content: string
}

export interface CommentListParams {
    page?: number
    pageSize?: number
    commentId?: string
    userId?: string
    targetType?: string
    targetId?: string
    parentCommentId?: string
}

// ==================== 评论 API ====================

const CommentApi = {
    /**
     * 获取评论列表
     */
    getComments: async (params?: CommentListParams) => {
        return request.get<{ records: Comment[]; total: number }>('/comment/api/list', { params })
    },

    /**
     * 创建评论
     */
    createComment: async (data: CreateCommentDTO) => {
        
        return request.post('/comment/api/create', data)
    },

    /**
     * 删除评论
     */
    deleteComment: async (data: { commentIds: string[] }) => {
        return request.post('/comment/api/delete', data)
    },

    /**
     * 获取评论总数
     */
    getCommentCount: async () => {
        return request.get('/comment/api/count')
    },
}

export interface Like {
    id?: number
    likeId: string
    userId: string
    targetType: string
    targetId: string
    targetTitle?: string
    targetCover?: string
    targetContent?: string
    authorId?: string
    authorName?: string
    authorAvatar?: string
    viewCount?: number
    commentCount?: number
    likeCount?: number
    collectionCount?: number
    createdAt?: string
    updatedAt?: string
}

export interface LikeStatusVO {
    isLiked: boolean
}

export interface LikeListParams {
    page?: number
    pageSize?: number
    likeId?: string
    userId?: string
    targetType?: string
    targetId?: string
}

export interface QueryLikeListDTO {
    page?: number
    pageSize?: number
    userId?: string
    targetType?: string
    targetId?: string
}

export interface ToggleLikeDTO {
    targetType: string
    targetId: string
}

export interface CheckLikeStatusDTO {
    targetType: string
    targetId: string
}

export interface GetLikeCountDTO {
    targetType: string
    targetId: string
}

// ==================== 点赞 API ====================

const LikeApi = {
    /**
     * 点赞/取消点赞
     */
    toggleLike: async (data: ToggleLikeDTO) => {
        return request.post('/like/api/toggle', data)
    },

    /**
     * 检查点赞状态
     */
    checkLikeStatus: async (params: CheckLikeStatusDTO) => {
        return request.get<{ data: LikeStatusVO }>('/like/api/status', { params })
    },

    /**
     * 获取点赞数
     */
    getLikeCount: async (params: GetLikeCountDTO) => {
        return request.get<{ data: number }>('/like/api/count', { params })
    },

    /**
     * 查询点赞列表
     */
    getLikeList: async (params?: QueryLikeListDTO) => {
        return request.get<{ data: { records: Like[]; total: number; size: number; current: number } }>('/like/api/list', { params })
    },
}

export interface Collect {
    id: number
    collectionId: string
    userId: string
    targetType: string
    targetId: string
    createdAt?: string
    updatedAt?: string
}

export interface CollectionStatusVO {
    isCollected: boolean
}

export interface CollectionListParams {
    page?: number
    pageSize?: number
    collectionId?: string
    userId?: string
    targetType?: string
    targetId?: string
}

export interface ToggleCollectionDTO {
    targetType: string
    targetId: string
}

export interface CheckCollectionStatusDTO {
    targetType: string
    targetId: string
}

// ==================== 收藏 API ====================

const CollectionApi = {
    /**
     * 收藏/取消收藏
     */
    toggleCollection: async (data: ToggleCollectionDTO) => {
        return request.post('/collection/api/toggle', data)
    },

    /**
     * 检查收藏状态
     */
    checkCollectionStatus: async (params: CheckCollectionStatusDTO) => {
        return request.get<{ data: CollectionStatusVO }>('/collection/api/status', { params })
    },

    /**
     * 查询收藏列表
     */
    getCollectionList: async (params?: CollectionListParams) => {
        return request.get<{ data: Collect[]; total: number }>('/collection/api/list', { params })
    },
}

// ==================== 社交 API 统一导出 ====================

const SocialApi = {
    ...CommentApi,
    ...LikeApi,
    ...CollectionApi,
}

export { CommentApi, LikeApi, CollectionApi }
export default SocialApi
