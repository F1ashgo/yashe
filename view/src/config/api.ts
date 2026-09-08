const fallbackApi =
  window.location.hostname === 'localhost'
    ? 'http://localhost:8080/api'
    : 'https://api.admys.cn/api'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || fallbackApi
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '')

export function resolveImageUrl(image: string): string {
  if (/^https?:\/\//.test(image)) return image
  if (image.startsWith('/api/uploads/')) return API_ORIGIN + image
  return `${API_ORIGIN}/api/uploads/${image}`
}
