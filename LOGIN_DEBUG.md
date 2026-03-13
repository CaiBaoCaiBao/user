# 登录后立即重定向问题排查

## 问题描述
用户登录后立即被重定向回登录页面。

## 已发现的问题

### 1. Token 数据结构不匹配 ✅ 已修复

**问题位置**: `src/hooks/login/useLoginData.ts`

**问题描述**:
后端返回的数据结构是：
```json
{
  "code": 200,
  "success": true,
  "message": "登录成功",
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  },
  "timestamp": "..."
}
```

但前端代码检查的是 `response.data?.accessToken`，实际应该是 `response.data?.data?.accessToken`。

**修复方案**:
```typescript
// 修复前
if (response.data?.accessToken) {
    tokenService.setAccessToken(response.data.accessToken)
}

// 修复后
if (response.data?.data?.accessToken) {
    tokenService.setAccessToken(response.data.data.accessToken)
}
```

### 2. 响应拦截器未处理业务错误 ✅ 已修复

**问题位置**: `src/config/axios.ts`

**问题描述**:
响应拦截器没有检查后端返回的 `success` 字段，即使后端返回 `success: false`，前端也会认为请求成功。

**修复方案**:
```typescript
request.interceptors.response.use(
    (response: AxiosResponse) => {
        const data = response.data as any;

        // 检查后端返回的业务状态码
        if (data && data.success === false) {
            const message = data.message || '请求失败';
            toast.error(message);
            return Promise.reject(new Error(message));
        }

        return response;
    },
    // ...
);
```

### 3. 缺少 API 方法 ✅ 已修复

**问题位置**: `src/api/travel/index.ts`

**问题描述**:
`travels/index.tsx` 组件调用了 `TravelApi.getMyTravels()` 和 `TravelApi.getHotTravels()`，但这两个方法在 API 中不存在，导致 404 错误。

**修复方案**:
添加缺失的 API 方法：
```typescript
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
```

## 可能导致重定向的其他原因

### 1. 401 错误自动跳转

**位置**: `src/config/axios.ts`

当任何请求返回 401 状态码时，axios 拦截器会自动跳转到登录页：

```typescript
if (error.response.status === 401) {
    // ...
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
    return Promise.reject(error);
}
```

**可能触发 401 的场景**:
- Token 未正确保存到 localStorage
- Token 已过期
- Token 格式错误
- Gateway JWT 验证失败
- 后端服务 JWT 验证失败

### 2. 页面加载时的认证请求

**位置**: `src/components/travels/index.tsx`

当用户访问首页时，如果 `activeTab === 'my'`，会调用 `getMyTravels()`，这个请求需要 JWT 认证。如果此时 Token 有问题，会触发 401 错误并跳转到登录页。

### 3. SSR/CSR 状态不一致

Next.js 的服务端渲染和客户端渲染可能导致状态不一致：
- 服务端渲染时无法访问 localStorage
- 客户端渲染时才能读取 Token
- Zustand persist 中间件可能导致状态不同步

## 调试步骤

### 1. 检查 Token 是否正确保存

在浏览器控制台执行：
```javascript
console.log('Access Token:', localStorage.getItem('access_token'))
console.log('Refresh Token:', localStorage.getItem('refresh_token'))
```

### 2. 检查登录响应

在 `useLoginData.ts` 的 `onSubmit` 中添加日志：
```typescript
console.log('登录响应:', response.data)
console.log('Access Token:', response.data?.data?.accessToken)
console.log('Refresh Token:', response.data?.data?.refreshToken)
```

### 3. 检查用户信息响应

```typescript
console.log('用户信息响应:', userResponse.data)
console.log('用户数据:', userResponse.data?.data)
```

### 4. 检查网络请求

打开浏览器开发者工具的 Network 标签：
- 检查 `/auth/api/login` 请求的响应
- 检查 `/user/api/my-profile` 请求的响应
- 检查是否有 401 错误
- 检查请求头中是否包含 `Authorization: Bearer <token>`

### 5. 检查 Gateway 日志

查看 Gateway 的日志输出：
```
JWT User Info - sub: xxx, userName: xxx, email: xxx
```

### 6. 检查后端服务日志

查看 users 服务的日志：
```
用户登录成功: xxx 登录方式: password
```

## 建议的修复方案

### 1. 添加登录状态检查

在需要认证的页面添加登录状态检查：

```typescript
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/store/userStore'
import { tokenService } from '@/config/axios'

export function useAuthGuard() {
  const router = useRouter()
  const currentUser = useCurrentUser()

  useEffect(() => {
    const token = tokenService.getAccessToken()

    if (!token || !currentUser) {
      router.push('/login')
    }
  }, [currentUser, router])
}
```

### 2. 优化错误处理

在 axios 拦截器中添加更详细的错误日志：

```typescript
console.error('请求失败:', {
  url: originalRequest.url,
  status: error.response.status,
  data: error.response.data,
  message: error.message
})
```

### 3. 添加 Token 验证

在保存 Token 后验证其有效性：

```typescript
if (response.data?.data?.accessToken) {
    tokenService.setAccessToken(response.data.data.accessToken)
    // 验证 Token 是否正确保存
    const savedToken = tokenService.getAccessToken()
    console.log('Token 已保存:', !!savedToken)
}
```

### 4. 延迟跳转

在登录成功后添加短暂延迟，确保状态更新完成：

```typescript
toast.success("登录成功")
setTimeout(() => {
    router.push('/')
}, 100)
```

## 后续需要检查的内容

1. ✅ Token 数据结构是否正确
2. ✅ 响应拦截器是否处理业务错误
3. ✅ 缺失的 API 方法是否已添加
4. ⏳ Gateway JWT 验证配置是否正确
5. ⏳ 后端服务 JWT 验证配置是否正确
6. ⏳ 公钥/私钥是否匹配
7. ⏳ Token 过期时间配置是否合理
8. ⏳ 是否存在其他页面在加载时触发认证请求

## 测试建议

1. 清除浏览器 localStorage 和 cookies
2. 打开浏览器开发者工具的 Console 和 Network 标签
3. 尝试登录
4. 观察控制台输出和网络请求
5. 检查 Token 是否正确保存
6. 检查是否有 401 错误
7. 检查是否自动跳转到登录页
