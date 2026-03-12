import { request } from '@/config/axios'

// ==================== 类型定义 ====================

export interface Comment {
    id: number
    content: string
    userId: number
    userName: string
    userAvatar?: string
    targetType: 'spot' | 'travel'
    targetId: number
    parentId?: number
    replyToUserId?: number
    replyToUserName?: string
    likeCount?: number
    isLiked?: boolean
    createdAt?: string
    updatedAt?: string
    children?: Comment[]
}

export interface CreateCommentDTO {
    content: string
    targetType: 'spot' | 'travel'
    targetId: number
    parentId?: number
    replyToUserId?: number
}

export interface Like {
    id: number
    userId: number
    targetType: 'spot' | 'travel' | 'comment'
    targetId: number
    createdAt?: string
}

export interface Collect {
    id: number
    userId: number
    targetType: 'spot' | 'travel'
    targetId: number
    createdAt?: string
}

// ==================== 社交 API ====================

const SocialApi = {
    // ==================== 评论相关 ====================

    /**
     * 获取评论列表
     */
    getComments: async (targetType: 'spot' | 'travel', targetId: number, page = 1, pageSize = 20) => {
        return request.get<{ data: Comment[]; total: number }>('/social/api/comments', {
            params: { targetType, targetId, page, pageSize }
        })
    },

    /**
     * 创建评论
     */
    createComment: async (data: CreateCommentDTO) => {
        return request.post<{ data: Comment }>('/social/api/comment', data)
    },

    /**
     * 删除评论
     */
    deleteComment: async (id: number) => {
        return request.delete(`/social/api/comment/${id}`)
    },

    /**
     * 点赞评论
     */
    likeComment: async (commentId: number) => {
        return request.post(`/social/api/comment/${commentId}/like`)
    },

    /**
     * 取消点赞评论
     */
    unlikeComment: async (commentId: number) => {
        return request.delete(`/social/api/comment/${commentId}/like`)
    },

    // ==================== 点赞相关 ====================

    /**
     * 点赞
     */
    like: async (targetType: 'spot' | 'travel', targetId: number) => {
        return request.post('/social/api/like', { targetType, targetId })
    },

    /**
     * 取消点赞
     */
    unlike: async (targetType: 'spot' | 'travel', targetId: number) => {
        return request.delete('/social/api/like', { data: { targetType, targetId } })
    },

    /**
     * 检查是否已点赞
     */
    checkLike: async (targetType: 'spot' | 'travel', targetId: number) => {
        return request.get<{ data: { isLiked: boolean } }>('/social/api/like/check', {
            params: { targetType, targetId }
        })
    },

    /**
     * 获取我的点赞列表
     */
    getMyLikes: async (page = 1, pageSize = 20) => {
        return request.get<{ data: Like[]; total: number }>('/social/api/likes/my', {
            params: { page, pageSize }
        })
    },

    // ==================== 收藏相关 ====================

    /**
     * 收藏
     */
    collect: async (targetType: 'spot' | 'travel', targetId: number) => {
        return request.post('/social/api/collect', { targetType, targetId })
    },

    /**
     * 取消收藏
     */
    uncollect: async (targetType: 'spot' | 'travel', targetId: number) => {
        return request.delete('/social/api/collect', { data: { targetType, targetId } })
    },

    /**
     * 检查是否已收藏
     */
    checkCollect: async (targetType: 'spot' | 'travel', targetId: number) => {
        return request.get<{ data: { isCollected: boolean } }>('/social/api/collect/check', {
            params: { targetType, targetId }
        })
    },

    /**
     * 获取我的收藏列表
     */
    getMyCollects: async (page = 1, pageSize = 20) => {
        return request.get<{ data: Collect[]; total: number }>('/social/api/collects/my', {
            params: { page, pageSize }
        })
    },
}

export default SocialApi
