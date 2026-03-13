# 登录、注册和忘记密码功能完善文档

## 概述
本文档记录了对用户系统登录、注册和忘记密码功能的完善工作。

## 修改的文件

### 1. API 层 (`src/api/auth/index.ts`)

#### 新增接口
- `getMyProfile()` - 获取当前用户个人资料详情

#### 更新接口
- `sendOTP()` - 更新路径为 `/users/mail/api/sendOtp`

#### 类型定义
```typescript
export interface RegisterDTO {
    userName: string
    email: string
    password: string
    otp: string
}

export interface LoginDTO {
    userName: string
    key: string
    loginMethod: 'password' | 'otp'
    rememberMe: boolean
}

export interface ForgotPasswordDTO {
    email: string
    newPassword: string
    otp: string
}

export interface SendOTPDTO {
    email: string
    template: 'register' | 'login' | 'forgot-password'
}
```

### 2. Hooks 层

#### `src/hooks/use-send-otp.ts`
- 更新 API 调用路径为 `/users/mail/api/sendOtp`
- 使用 `AuthApi.sendOTP()` 替代直接调用 `request.post()`

#### `src/hooks/login/useLoginData.ts`
- 登录成功后调用 `getMyProfile()` 获取用户信息
- 将用户信息保存到 Zustand store
- 改进错误处理，显示后端返回的错误消息
- 移除未使用的 `LoginFormData` 类型导出

#### `src/hooks/register/useRegisterData.ts`
- 实现注册提交逻辑
- 注册成功后跳转到登录页面
- 改进错误处理

#### `src/hooks/forgot-pwd/useForgotPwdData.ts`
- 实现忘记密码提交逻辑
- 密码重置成功后跳转到登录页面
- 改进错误处理

### 3. 组件层

#### `src/components/login/password-login.tsx`
- 修复 `rememberMe` 字段的绑定问题
- 添加 `checked` 和 `onCheckedChange` 属性

#### `src/components/login/otp-login.tsx`
- 修复 `rememberMe` 字段的绑定问题
- 添加 `checked` 和 `onCheckedChange` 属性

### 4. Store 层 (`src/store/userStore.ts`)

#### 更新 UserInfo 类型
```typescript
export interface UserInfo {
    uUid: string          // 用户 ID (ULID)
    userName: string      // 用户名
    nickName?: string     // 昵称
    avatar?: string       // 头像
    role?: string         // 角色
    status?: string       // 状态
    bio?: string          // 简介
    birthday?: string     // 生日
    createdAt?: string   // 创建时间
    updatedAt?: string   // 更新时间
}
```

#### 移除未使用的导出
- 移除 `useIsLoggedIn` hook

### 5. Gateway 配置 (`gateway/config/gateway.config.yml`)

#### 公开接口管道
已包含以下公开接口：
- `/auth/*` - 登录、注册、忘记密码
- `/users/mail/api/sendOtp` - 发送验证码

## 后端接口对接

### 登录接口
- **路径**: `POST /auth/api/login`
- **请求体**:
```json
{
  "userName": "user@example.com",
  "key": "password123",
  "loginMethod": "password",
  "rememberMe": false
}
```
- **响应**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 注册接口
- **路径**: `POST /auth/api/register`
- **请求体**:
```json
{
  "userName": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "otp": "123456"
}
```
- **响应**:
```json
{
  "success": true,
  "message": "注册成功"
}
```

### 忘记密码接口
- **路径**: `POST /auth/api/forgot-password`
- **请求体**:
```json
{
  "email": "user@example.com",
  "newPassword": "newpassword123",
  "otp": "123456"
}
```
- **响应**:
```json
{
  "success": true,
  "message": "忘记密码成功"
}
```

### 发送验证码接口
- **路径**: `POST /users/mail/api/sendOtp`
- **请求体**:
```json
{
  "email": "user@example.com",
  "template": "register"
}
```
- **响应**:
```json
{
  "success": true,
  "message": "验证码已发送"
}
```

### 获取用户信息接口
- **路径**: `GET /user/api/my-profile`
- **请求头**: `Authorization: Bearer <token>`
- **响应**:
```json
{
  "success": true,
  "data": {
    "uUid": "01HZ...",
    "userName": "testuser",
    "nickName": "测试用户",
    "avatar": "https://...",
    "role": "user",
    "status": "active",
    "bio": "个人简介",
    "birthday": "2000-01-01",
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  }
}
```

## 功能流程

### 登录流程
1. 用户输入邮箱和密码/验证码
2. 点击登录按钮
3. 调用 `/auth/api/login` 接口
4. 保存 `accessToken` 和 `refreshToken` 到 localStorage
5. 调用 `/user/api/my-profile` 获取用户信息
6. 将用户信息保存到 Zustand store
7. 跳转到首页

### 注册流程
1. 用户输入用户名、邮箱、密码
2. 点击"获取验证码"按钮
3. 调用 `/users/mail/api/sendOtp` 发送验证码
4. 用户输入验证码
5. 点击"创建账户"按钮
6. 调用 `/auth/api/register` 接口
7. 注册成功后跳转到登录页面

### 忘记密码流程
1. 用户输入邮箱
2. 点击"获取验证码"按钮
3. 调用 `/users/mail/api/sendOtp` 发送验证码
4. 用户输入新密码和验证码
5. 点击"忘记密码"按钮
6. 调用 `/auth/api/forgot-password` 接口
7. 密码重置成功后跳转到登录页面

## 注意事项

1. **JWT Token 管理**
   - Access Token 用于 API 认证
   - Refresh Token 用于刷新 Access Token
   - Token 存储在 localStorage 中

2. **验证码有效期**
   - 注册验证码：5分钟
   - 登录验证码：5分钟
   - 忘记密码验证码：5分钟

3. **密码要求**
   - 长度：6-20个字符
   - 必须包含字母
   - 必须包含数字
   - 只能包含字母、数字和符号 . _ -

4. **用户名要求**
   - 长度：3-20个字符

5. **Remember Me 功能**
   - 未勾选：Refresh Token 有效期为 Access Token 的 2 倍
   - 勾选：Refresh Token 有效期为 7 天

## 待实现功能

1. Token 刷新机制
2. 自动登出（Token 过期）
3. 邮箱验证状态检查
4. 第三方登录（微信、QQ 等）
5. 手机号登录
