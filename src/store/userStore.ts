import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { tokenService } from '@/config/axios'

// ==================== 类型定义 ====================

export interface UserInfo {
    id: number
    userName: string
    email: string
    avatar?: string
    phone?: string
    bio?: string
    createdAt?: string
    updatedAt?: string
}

export interface UserState {
    // 用户信息
    user: UserInfo | null
    isLoggedIn: boolean
    
    // Actions
    setUser: (user: UserInfo) => void
    clearUser: () => void
    logout: () => void
    updateUser: (updates: Partial<UserInfo>) => void
}

// ==================== 用户 Store ====================

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            // 初始状态
            user: null,
            isLoggedIn: false,

            // 设置用户信息
            setUser: (user) => {
                set({ user, isLoggedIn: true })
            },

            // 清除用户信息
            clearUser: () => {
                set({ user: null, isLoggedIn: false })
            },

            // 退出登录
            logout: () => {
                // 清除 Token
                tokenService.clearAll()
                // 清除用户状态
                set({ user: null, isLoggedIn: false })
                // 跳转登录页
                if (typeof window !== 'undefined') {
                    window.location.href = '/login'
                }
            },

            // 更新用户信息
            updateUser: (updates) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...updates } : null
                }))
            },
        }),
        {
            name: 'user-storage', // localStorage key
            partialize: (state) => ({
                user: state.user,
                isLoggedIn: state.isLoggedIn,
            }),
        }
    )
)

// ==================== 便捷 Hooks ====================

/**
 * 获取当前登录用户
 */
export const useCurrentUser = () => {
    return useUserStore((state) => state.user)
}

/**
 * 获取登录状态
 */
export const useIsLoggedIn = () => {
    return useUserStore((state) => state.isLoggedIn)
}

/**
 * 获取用户操作方法
 */
export const useUserActions = () => {
    return useUserStore((state) => ({
        setUser: state.setUser,
        clearUser: state.clearUser,
        logout: state.logout,
        updateUser: state.updateUser,
    }))
}
