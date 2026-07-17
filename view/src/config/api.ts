const fallbackApi =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api'
    : 'https://api.admys.cn/api'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || fallbackApi
