/**
 * API 统一导出
 */

// 认证相关
export { default as AuthApi } from './auth'
export type { RegisterDTO, LoginDTO, ForgotPasswordDTO } from './auth'

// 用户相关
export { default as UserApi } from './user'
export type { UserInfo, UpdateUserDTO } from './user'

// 目的地相关
export { default as DestinationApi } from './destination'
export type { Destination as DestinationInfo, DestinationListParams } from './destination'

// 景点相关
export { default as SpotApi } from './spot'
export type { Spot as SpotInfo, SpotListParams } from './spot'

// 旅行攻略相关
export { default as TravelApi } from './travel'
export type {
    Travel as TravelInfo,
    TravelListParams,
    CreateTravelDTO,
    UpdateTravelDTO,
} from './travel'

// 社交相关
export { default as SocialApi } from './social'
export type {
    Comment,
    CreateCommentDTO,
    Like,
    Collect,
} from './social'

// 搜索相关
export { default as SearchApi } from './search'
export type {
    SearchResult,
    SearchParams,
    AllSearchResult,
} from './search'

// 文件上传相关
export { default as FileApi } from './file'
export type { UploadResponse, UploadProgress } from './file'
