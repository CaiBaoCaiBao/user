# 前端API迁移说明

## 📋 概述

本文档记录了前端API从自定义接口规范迁移到后端微服务接口规范的修改内容。

---

## 🔧 修改的文件列表

1. `user/src/api/destination/index.ts` - 目的地API
2. `user/src/api/spot/index.ts` - 景点API（改为attraction）
3. `user/src/api/travel/index.ts` - 旅行攻略API（改为travel-note）
4. `user/src/api/social/index.ts` - 社交API（拆分为comment/like/collection）
5. `user/src/api/search/index.ts` - 搜索API
6. `user/src/api/user/index.ts` - 用户API
7. `user/src/api/index.ts` - 统一导出

---

## 📊 API路径对照表

### 认证相关 (Auth)

| 前端旧路径 | 前端新路径 | 后端路径 | 状态 |
|-----------|-----------|---------|------|
| `/auth/api/login` | `/auth/api/login` | `/auth/api/login` | ✅ 匹配 |
| `/auth/api/register` | `/auth/api/register` | `/auth/api/register` | ✅ 匹配 |
| `/auth/api/forgot-password` | `/auth/api/forgot-password` | `/auth/api/forgot-password` | ✅ 匹配 |

### 目的地相关 (Destination)

| 前端旧路径 | 前端新路径 | 后端路径 | 状态 |
|-----------|-----------|---------|------|
| `/destination/api/list` | `/destination/api/list` | `/destination/api/list` | ✅ 匹配 |
| `/destination/api/{id}` | `/destination/api/detail` | `/destination/api/detail` | ✅ 修改 |
| `/destination/api/search` | ❌ 删除 | ❌ 需后端实现 | ⚠️ 待实现 |
| `/destination/api/hot` | ❌ 删除 | ❌ 需后端实现 | ⚠️ 待实现 |
| `/destination/api/create` | `/destination/api/create` | `/destination/api/create` | ✅ 新增 |
| `/destination/api/update` | `/destination/api/update` | `/destination/api/update` | ✅ 新增 |
| `/destination/api/delete` | `/destination/api/delete` | `/destination/api/delete` | ✅ 新增 |

### 景点相关 (Spot → Attraction)

| 前端旧路径 | 前端新路径 | 后端路径 | 状态 |
|-----------|-----------|---------|------|
| `/spot/api/list` | `/attraction/api/list` | `/attraction/api/list` | ✅ 修改 |
| `/spot/api/{id}` | `/attraction/api/detail` | `/attraction/api/detail` | ✅ 修改 |
| `/spot/api/by-destination` | `/attraction/api/list` | `/attraction/api/list` | ✅ 修改 |
| `/spot/api/search` | ❌ 删除 | ❌ 需后端实现 | ⚠️ 待实现 |
| `/spot/api/hot` | ❌ 删除 | ❌ 需后端实现 | ⚠️ 待实现 |
| `/spot/api/recommended` | ❌ 删除 | ❌ 需后端实现 | ⚠️ 待实现 |
| `/spot/api/create` | `/attraction/api/create` | `/attraction/api/create` | ✅ 新增 |
| `/spot/api/update` | `/attraction/api/update` | `/attraction/api/update` | ✅ 新增 |
| `/spot/api/delete` | `/attraction/api/delete` | `/attraction/api/delete` | ✅ 新增 |

### 旅行攻略相关 (Travel → TravelNote)

| 前端旧路径 | 前端新路径 | 后端路径 | 状态 |
|-----------|-----------|---------|------|
| `/travel/api/list` | `/travel-note/api/list` | `/travel-note/api/list` | ✅ 修改 |
| `/travel/api/{id}` | `/travel-note/api/detail` | `/travel-note/api/detail` | ✅ 修改 |
| `/travel/api/create` | `/travel-note/api/create` | `/travel-note/api/create` | ✅ 修改 |
| `/travel/api/update` | `/travel-note/api/update` | `/travel-note/api/update` | ✅ 修改 |
| `/travel/api/{id}` | `/travel-note/api/delete` | `/travel-note/api/delete` | ✅ 修改 |
| `/travel/api/my` | ❌ 删除 | ❌ 需后端实现 | ⚠️ 待实现 |
| `/travel/api/user/{id}` | ❌ 删除 | ❌ 需后端实现 | ⚠️ 待实现 |
| `/travel/api/search` | ❌ 删除 | ❌ 需后端实现 | ⚠️ 待实现 |
| `/travel/api/hot` | ❌ 删除 | ❌ 需后端实现 | ⚠️ 待实现 |
| `/travel/api/recommended` | ❌ 删除 | ❌ 需后端实现 | ⚠️ 待实现 |
| `/travel-note/api/batch-detail` | `/travel-note/api/batch-detail` | `/travel-note/api/batch-detail` | ✅ 新增 |

### 评论相关 (Comment)

| 前端旧路径 | 前端新路径 | 后端路径 | 状态 |
|-----------|-----------|---------|------|
| `/social/api/comments` | `/comment/api/list` | `/comment/api/list` | ✅ 修改 |
| `/social/api/comment` | `/comment/api/create` | `/comment/api/create` | ✅ 修改 |
| `/social/api/comment/{id}` | `/comment/api/delete` | `/comment/api/delete` | ✅ 修改 |
| `/social/api/comment/{id}/like` | ❌ 删除 | ❌ 需后端实现 | ⚠️ 待实现 |
| `/comment/api/count` | `/comment/api/count` | `/comment/api/count` | ✅ 新增 |

### 点赞相关 (Like)

| 前端旧路径 | 前端新路径 | 后端路径 | 状态 |
|-----------|-----------|---------|------|
| `/social/api/like` | `/like/api/toggle` | `/like/api/toggle` | ✅ 修改 |
| `/social/api/like/check` | `/like/api/status` | `/like/api/status` | ✅ 修改 |
| `/social/api/likes/my` | ❌ 删除 | ❌ 需后端实现 | ⚠️ 待实现 |
| `/like/api/count` | `/like/api/count` | `/like/api/count` | ✅ 新增 |

### 收藏相关 (Collection)

| 前端旧路径 | 前端新路径 | 后端路径 | 状态 |
|-----------|-----------|---------|------|
| `/social/api/collect` | `/collection/api/toggle` | `/collection/api/toggle` | ✅ 修改 |
| `/social/api/collect/check` | `/collection/api/status` | `/collection/api/status` | ✅ 修改 |
| `/social/api/collects/my` | `/collection/api/list` | `/collection/api/list` | ✅ 修改 |

### 搜索相关 (Search)

| 前端旧路径 | 前端新路径 | 后端路径 | 状态 |
|-----------|-----------|---------|------|
| `/search/api/all` | `/search/api/all` | ❌ 需后端实现 | ⚠️ 待实现 |
| `/search/api/destinations` | `/search/api/destinations` | ❌ 需后端实现 | ⚠️ 待实现 |
| `/search/api/spots` | `/search/api/attractions` | ❌ 需后端实现 | ⚠️ 待实现 |
| `/search/api/travels` | `/search/api/travel-notes` | ❌ 需后端实现 | ⚠️ 待实现 |
| `/search/api/suggestions` | `/search/api/suggestions` | ❌ 需后端实现 | ⚠️ 待实现 |
| `/search/api/hot-keywords` | `/search/api/hot-keywords` | ❌ 需后端实现 | ⚠️ 待实现 |

### 用户相关 (User)

| 前端旧路径 | 前端新路径 | 后端路径 | 状态 |
|-----------|-----------|---------|------|
| `/user/api/current` | `/user/api/current` | ❌ 需后端实现 | ⚠️ 待实现 |
| `/user/api/{id}` | `/user/api/{uUid}` | ❌ 需后端实现 | ⚠️ 待实现 |
| `/user/api/update` | `/user/api/update` | ❌ 需后端实现 | ⚠️ 待实现 |
| `/user/api/profile/{uUid}` | `/user/api/profile/{uUid}` | ❌ 需后端实现 | ⚠️ 待实现 |
| `/user/api/profile/update` | `/user/api/profile/update` | ❌ 需后端实现 | ⚠️ 待实现 |

### 文件上传相关 (File)

| 前端旧路径 | 前端新路径 | 后端路径 | 状态 |
|-----------|-----------|---------|------|
| `/file/api/upload` | `/file/api/upload` | `/file/api/upload` | ✅ 匹配 |
| `/file/api/upload/batch` | `/file/api/upload/batch` | ❌ 需后端实现 | ⚠️ 待实现 |
| `/file/api/upload/image` | `/file/api/upload/image` | ❌ 需后端实现 | ⚠️ 待实现 |
| `/file/api/delete` | `/file/api/delete` | ❌ 需后端实现 | ⚠️ 待实现 |

---

## 🔑 类型定义变更

### ID字段变更

| 实体 | 旧ID字段 | 新ID字段 | 说明 |
|-----|---------|---------|------|
| Destination | `id: number` | `destinationId: string` | 使用ULID |
| Spot | `id: number` | `aid: string` | 使用ULID |
| Travel | `id: number` | `noteId: string` | 使用ULID |
| Comment | `id: number` | `commentId: string` | 使用ULID |
| Like | `id: number` | `likeId: string` | 使用ULID |
| Collect | `id: number` | `collectionId: string` | 使用ULID |
| User | `id: number` | `uUid: string` | 使用ULID |

### 字段名变更

| 实体 | 旧字段名 | 新字段名 | 说明 |
|-----|---------|---------|------|
| Destination | `coverImage` | `coverImg` | 统一命名 |
| Spot | `coverImage` | `coverImg` | 统一命名 |
| Travel | `coverImage` | `coverImg` | 统一命名 |
| Travel | `images` | `images: string` | 改为JSON字符串 |
| Comment | `targetId: number` | `targetId: string` | 使用ULID |
| Comment | `parentId: number` | `parentCommentId: string` | 使用ULID |

---

## ⚠️ 需要后端实现的接口

### 高优先级

1. **用户相关**
   - `GET /user/api/current` - 获取当前用户信息
   - `GET /user/api/{uUid}` - 获取用户信息
   - `POST /user/api/update` - 更新用户信息
   - `GET /user/api/profile/{uUid}` - 获取用户资料
   - `POST /user/api/profile/update` - 更新用户资料

2. **搜索相关**
   - `GET /search/api/all` - 综合搜索
   - `GET /search/api/destinations` - 搜索目的地
   - `GET /search/api/attractions` - 搜索景点
   - `GET /search/api/travel-notes` - 搜索游记
   - `GET /search/api/suggestions` - 搜索建议
   - `GET /search/api/hot-keywords` - 热门搜索词

### 中优先级

3. **内容推荐**
   - `GET /destination/api/hot` - 热门目的地
   - `GET /attraction/api/hot` - 热门景点
   - `GET /attraction/api/recommended` - 推荐景点
   - `GET /travel-note/api/hot` - 热门游记
   - `GET /travel-note/api/recommended` - 推荐游记

4. **用户内容**
   - `GET /travel-note/api/my` - 我的游记
   - `GET /travel-note/api/user/{uUid}` - 用户游记

### 低优先级

5. **文件上传**
   - `POST /file/api/upload/batch` - 批量上传
   - `POST /file/api/upload/image` - 图片上传
   - `DELETE /file/api/delete` - 删除文件

6. **社交功能**
   - `POST /comment/api/{commentId}/like` - 点赞评论
   - `DELETE /comment/api/{commentId}/like` - 取消点赞评论
   - `GET /like/api/my` - 我的点赞列表

---

## 📝 使用示例

### 目的地API

```typescript
import { DestinationApi } from '@/api'

// 获取目的地列表
const destinations = await DestinationApi.getDestinations({
    page: 1,
    pageSize: 20,
    province: '广东省'
})

// 获取目的地详情（使用destinationId）
const destination = await DestinationApi.getDestinationById('01ARZ3NDEKTSV4RRFFQ69G5FAV')
```

### 景点API

```typescript
import { SpotApi } from '@/api'

// 获取景点列表
const spots = await SpotApi.getSpots({
    page: 1,
    pageSize: 20,
    destinationId: '01ARZ3NDEKTSV4RRFFQ69G5FAV'
})

// 获取景点详情（使用aid）
const spot = await SpotApi.getSpotById('01ARZ3NDEKTSV4RRFFQ69G5FAV')
```

### 旅行攻略API

```typescript
import { TravelApi } from '@/api'

// 获取游记列表
const travels = await TravelApi.getTravels({
    page: 1,
    pageSize: 20,
    status: 1
})

// 获取游记详情（使用noteId）
const travel = await TravelApi.getTravelById('01ARZ3NDEKTSV4RRFFQ69G5FAV')
```

### 社交API

```typescript
import { CommentApi, LikeApi, CollectionApi } from '@/api'

// 创建评论
await CommentApi.createComment({
    userId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    targetType: 'travel-note',
    targetId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    content: '很棒的游记！'
})

// 点赞/取消点赞
await LikeApi.toggleLike({
    userId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    targetType: 'travel-note',
    targetId: '01ARZ3NDEKTSV4RRFFQ69G5FAV'
})

// 收藏/取消收藏
await CollectionApi.toggleCollection({
    userId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    targetType: 'travel-note',
    targetId: '01ARZ3NDEKTSV4RRFFQ69G5FAV'
})
```

---

## 🚀 迁移步骤

1. ✅ 修改API文件以匹配后端接口
2. ⏳ 更新前端组件中的API调用
3. ⏳ 处理ID字段类型变更（number → string）
4. ⏳ 处理字段名变更（如 coverImage → coverImg）
5. ⏳ 测试所有API调用
6. ⏳ 后端实现缺失的接口

---

## 📌 注意事项

1. **ID类型变更**：所有ID从 `number` 改为 `string`（ULID）
2. **路径变更**：`/spot` → `/attraction`，`/travel` → `/travel-note`
3. **参数方式**：详情接口从路径参数改为查询参数
4. **删除接口**：部分接口暂时删除，等待后端实现
5. **类型导出**：部分类型重命名以避免冲突

---

## 🔄 后续工作

1. 更新所有使用这些API的组件
2. 处理类型不匹配的问题
3. 添加错误处理和加载状态
4. 实现后端缺失的接口
5. 完善API文档

---

**最后更新时间：** 2026-03-12
**维护者：** 刘俊涛
