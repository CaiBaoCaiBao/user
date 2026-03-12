import type * as AuthType from './index'
export {
    initRegisterDTO,
    initLoginDTO,
    initForgotPasswordDTO
}

const initRegisterDTO: AuthType.RegisterDTO = {
    userName: '',
    password: '',
    email: '',
    otp: ''
}

const initLoginDTO: AuthType.LoginDTO = {
    userName: '',
    key: '',
    loginMethod: "password",
    rememberMe: false
}

const initForgotPasswordDTO: AuthType.ForgotPasswordDTO = {
    email: '',
    otp: '',
    newPassword: ''
}