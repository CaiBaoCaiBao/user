# 用户端游记功能说明

## 功能概述

用户端游记模块提供了完整的游记创建、浏览、编辑、删除、评论、点赞、收藏等功能。

## 页面结构

### 1. 游记列表页 (`/travels`)
**文件位置**: `user/src/app/(main)/travels/page.tsx`

**功能**:
- 查看全部游记
- 查看热门游记
- 查看我的游记（需要登录）
- 搜索游记（按标题）
- 筛选游记（按目的地）
- 分页浏览
- 快速跳转到创建、编辑、删除

**组件**:
- `TravelSearch` - 搜索和筛选组件
- `TravelCard` - 游记卡片组件

### 2. 创建游记页 (`/travels/create`)
**文件位置**: `user/src/app/(main)/travels/create/page.tsx`

**功能**:
- 填写游记标题
- 选择目的地
- 上传封面图片
- 上传图片列表
- 填写游玩天数
- 填写预算
- 填写游记内容
- 提交创建

**表单字段**:
- `title` - 游记标题（必填）
- `destinationId` - 目的地ID（必填）
- `coverImg` - 封面图片URL
- `images` - 图片列表（数组）
- `travelDays` - 游玩天数
- `budget` - 预算
- `content` - 游记内容（必填）

### 3. 游记详情页 (`/travels/[id]`)
**文件位置**: `user/src/app/(main)/travels/[id]/page.tsx`

**功能**:
- 查看游记完整信息
- 查看作者信息
- 查看统计数据（浏览、点赞、评论）
- 查看图片轮播
- 查看关联景点
- 点赞/取消点赞
- 收藏/取消收藏
- 分享游记
- 编辑游记（仅作者）
- 删除游记（仅作者）
- 查看和发表评论

**组件**:
- `TravelComments` - 评论组件
- `TravelShare` - 分享组件

### 4. 编辑游记页 (`/travels/[id]/edit`)
**文件位置**: `user/src/app/(main)/travels/[id]/edit/page.tsx`

**功能**:
- 编辑游记信息
- 更新封面图片
- 更新图片列表
- 更新其他字段
- 提交更新

## 组件说明

### TravelCard
**文件位置**: `user/src/components/travels/travel-card.tsx`

**Props**:
```typescript
interface TravelCardProps {
    travel: TravelInfo        // 游记信息
    showAuthor?: boolean      // 是否显示作者信息（默认true）
    showActions?: boolean     // 是否显示操作按钮（默认false）
}
```

**功能**:
- 显示游记封面图
- 显示游记标题
- 显示游记内容预览
- 显示作者信息
- 显示游玩天数
- 显示统计数据
- 点击跳转到详情页

### TravelSearch
**文件位置**: `user/src/components/travels/travel-search.tsx`

**Props**:
```typescript
interface TravelSearchProps {
    onSearch: (params: any) => void  // 搜索回调
    loading?: boolean                  // 加载状态
}
```

**功能**:
- 按标题搜索
- 按目的地筛选
- 重置筛选条件

### TravelComments
**文件位置**: `user/src/components/travels/comments.tsx`

**Props**:
```typescript
interface TravelCommentsProps {
    noteId: string          // 游记ID
    commentCount?: number    // 评论数量
}
```

**功能**:
- 显示评论列表
- 发表评论（需要登录）
- 点赞评论
- 删除评论（仅作者）
- 分页浏览评论

### TravelShare
**文件位置**: `user/src/components/travels/share.tsx`

**Props**:
```typescript
interface TravelShareProps {
    noteId: string      // 游记ID
    title: string      // 游记标题
}
```

**功能**:
- 复制分享链接
- 分享到微博
- 分享到QQ
- 分享到QQ空间

## API 接口

### TravelApi
**文件位置**: `user/src/api/travel/index.ts`

**方法**:
```typescript
// 获取游记列表
getTravels(params?: TravelListParams)

// 获取游记详情
getTravelById(noteId: string)

// 创建游记
createTravel(data: CreateTravelDTO)

// 更新游记
updateTravel(data: UpdateTravelDTO)

// 删除游记
deleteTravel(data: { noteIds: string[] })

// 获取我的游记
getMyTravels(page: number, pageSize: number, userId?: string)

// 获取热门游记
getHotTravels(pageSize: number)
```

### SocialApi
**文件位置**: `user/src/api/social/index.ts`

**方法**:
```typescript
// 点赞/取消点赞
LikeApi.toggleLike(data: ToggleLikeDTO)

// 检查点赞状态
LikeApi.checkLikeStatus(data: CheckLikeStatusDTO)

// 收藏/取消收藏
CollectionApi.toggleCollection(data: ToggleCollectionDTO)

// 检查收藏状态
CollectionApi.checkCollectionStatus(data: CheckCollectionStatusDTO)

// 创建评论
CommentApi.createComment(data: CreateCommentDTO)

// 删除评论
CommentApi.deleteComment(data: { commentIds: string[] })

// 获取评论列表
CommentApi.getComments(params: CommentListParams)
```

## 数据类型

### TravelInfo
```typescript
interface TravelInfo {
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
    status?: number
    sortOrder?: number
    createdAt?: string
    updatedAt?: string
}
```

### TravelDetail
```typescript
interface TravelDetail extends TravelInfo {
    userAvatar?: string
    destinationName?: string
    images?: string[]
    attractions?: AttractionSimple[]
}
```

## 使用示例

### 在首页显示游记列表
```tsx
import TravelCard from '@/components/travels/travel-card'

function HomePage() {
    const [travels, setTravels] = useState<TravelInfo[]>([])

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {travels.map(travel => (
                <TravelCard
                    key={travel.noteId}
                    travel={travel}
                    showAuthor={true}
                    showActions={true}
                />
            ))}
        </div>
    )
}
```

### 在目的地详情页显示相关游记
```tsx
import TravelCard from '@/components/travels/travel-card'

function DestinationDetailPage({ destinationId }: { destinationId: string }) {
    const [travels, setTravels] = useState<TravelInfo[]>([])

    useEffect(() => {
        // 获取该目的地的游记
        TravelApi.getTravels({ destinationId }).then(res => {
            setTravels(res.data.data.records)
        })
    }, [destinationId])

    return (
        <div>
            <h2>相关游记</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {travels.map(travel => (
                    <TravelCard
                        key={travel.noteId}
                        travel={travel}
                        showAuthor={true}
                    />
                ))}
            </div>
        </div>
    )
}
```

## 权限说明

### 游记操作权限
- **创建**: 需要登录，账户状态为active
- **编辑**: 仅作者可以编辑
- **删除**: 作者或管理员可以删除
- **查看**: 所有用户可以查看已发布的游记

### 评论操作权限
- **发表评论**: 需要登录，账户状态为active
- **删除评论**: 仅作者或管理员可以删除
- **点赞评论**: 需要登录

### 点赞/收藏权限
- **点赞游记**: 需要登录
- **收藏游记**: 需要登录

## 状态说明

### 游记状态 (status)
- `0` - 已删除
- `1` - 已发布
- `2` - 待审核

### 用户状态
- `active` - 正常
- `disabled` - 禁用

## 注意事项

1. **图片上传**: 使用 `FileApi.uploadImage()` 上传图片，返回图片URL
2. **分页**: 列表接口支持分页，默认每页12条
3. **搜索**: 搜索支持模糊匹配，按标题搜索
4. **权限**: 所有写操作都需要登录验证
5. **状态**: 只有已发布的游记(status=1)才会在列表中显示
6. **审核**: 新创建的游记默认状态为待审核(status=2)

## 后续优化建议

1. **富文本编辑器**: 使用富文本编辑器替代纯文本输入
2. **图片裁剪**: 添加图片裁剪功能
3. **地图集成**: 在游记中添加地图标记
4. **游记模板**: 提供游记模板，方便用户快速创建
5. **草稿功能**: 支持保存游记草稿
6. **游记分类**: 添加游记分类标签
7. **推荐算法**: 基于用户兴趣推荐游记
8. **游记统计**: 添加游记浏览统计和数据分析
