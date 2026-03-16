/**
 * API 统一导出
 */

// 认证相关
export { default as AuthApi } from './auth'
export type { RegisterDTO, LoginDTO, ForgotPasswordDTO } from './auth'

// 用户相关
export { default as UserApi } from './user'
export type { UserInfo, UserProfile, UpdateUserDTO, UpdateUserProfileDTO } from './user'

// 目的地相关
export { default as DestinationApi } from './destination'
export type { Destination as DestinationInfo, DestinationListParams, DestinationDetailParams } from './destination'

// 景点相关（后端使用 attraction）
export { default as SpotApi } from './spot'
export type { Spot as SpotInfo, SpotListParams, SpotDetailParams } from './spot'

// 旅行攻略相关（后端使用 travel-note）
export { default as TravelApi } from './travel'
export type {
    Travel as TravelInfo,
    TravelDetail,
    TravelListParams,
    TravelDetailParams,
    CreateTravelDTO,
    UpdateTravelDTO,
    AttractionSimple,
} from './travel'

// 社交相关
export { default as SocialApi, CommentApi, LikeApi, CollectionApi } from './social'
export type {
    Comment,
    CreateCommentDTO,
    CommentListParams,
    Like,
    LikeStatusVO,
    LikeListParams,
    ToggleLikeDTO,
    CheckLikeStatusDTO,
    GetLikeCountDTO,
    QueryLikeListDTO,
    Collect,
    CollectionStatusVO,
    CollectionListParams,
    ToggleCollectionDTO,
    CheckCollectionStatusDTO,
} from './social'

// 搜索相关
export { default as SearchApi } from './search'
export type {
    SearchResult,
    SearchParams,
    AllSearchResult,
    Destination as SearchDestination,
    Attraction as SearchAttraction,
    TravelNote as SearchTravelNote,
} from './search'

// 文件上传相关
export { default as FileApi } from './file'
export type { UploadResponse, UploadProgress } from './file'
