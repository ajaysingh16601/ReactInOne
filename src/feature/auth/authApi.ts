// src/features/auth/authApi.ts
import { api } from "../../api";

export const authApi = {
    requestRegisterOtp: (email: string) =>
        api.post("/auth/otp/request", { email }).then(res => res.data),

    verifyRegisterOtp: (data: { email: string; otp: string; secret: string }) =>
        api.post("/auth/otp/verify", data).then(res => res.data),

    registerUser: (payload: {
        username: string;
        firstname: string;
        lastname: string;
        password: string;
        registrationToken: string;
    }) => api.post("/auth/register", payload).then(res => res.data),

    loginUser: (payload: { email: string; password: string }) =>
        api.post("/auth/login", payload).then(res => res.data),

    verifyOtp: (payload: { email: string; secret: string; otp: string }) =>
        api.post("/auth/login/verify", payload).then(res => res.data),

    requestForgotOtp: (email: string) =>
        api.post("/auth/forgot-password/request", { email }).then(res => res.data),

    verifyForgotOtp: (data: { email: string; otp: string; secret: string }) =>
        api.post("/auth/forgot-password/verify", data).then(res => res.data),

    resetPassword: (data: {
        newPassword: string;
        confirmPassword: string;
        resetToken: string;
    }) => api.post("/auth/forgot-password/reset", data).then(res => res.data),
};
