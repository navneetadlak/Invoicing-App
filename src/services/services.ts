import api from "./api";

// AUTH 
export const AuthAPI = {
  login: (email: string, password: string, rememberMe = false) =>
    api.post("/Auth/Login", { email, password, rememberMe }),

  signup: (formData: FormData) =>
    api.post("/Auth/Signup", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  getCompanyLogo: (companyId: number) =>
    api.get(`/Auth/GetCompanyLogoUrl/${companyId}`),

  getCompanyLogoThumb: (companyId: number) =>
    api.get(`/Auth/GetCompanyLogoThumbnailUrl/${companyId}`),
};
