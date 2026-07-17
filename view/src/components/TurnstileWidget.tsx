import { useEffect, useId, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (target: string | HTMLElement, options: Record<string, unknown>) => string
      remove: (widgetId: string) => void
    }
  }
}

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
const SCRIPT_ID = 'cloudflare-turnstile-script'

interface Props {
  action: 'member-register' | 'contact-message'
  onToken: (token: string) => void
  resetKey?: number
}

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Turnstile 加载失败')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Turnstile 加载失败'))
    document.head.appendChild(script)
  })
}

function TurnstileWidget({ action, onToken, resetKey = 0 }: Props) {
  const reactId = useId().replace(/:/g, '')
  const containerRef = useRef<HTMLDivElement>(null)
  const callbackRef = useRef(onToken)
  callbackRef.current = onToken

  useEffect(() => {
    let widgetId = ''
    callbackRef.current('')
    if (!SITE_KEY || !containerRef.current) return

    loadScript().then(() => {
      if (!containerRef.current || !window.turnstile) return
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        action,
        theme: 'light',
        language: 'zh-cn',
        callback: (token: string) => callbackRef.current(token),
        'expired-callback': () => callbackRef.current(''),
        'error-callback': () => callbackRef.current(''),
      })
    }).catch(() => callbackRef.current(''))

    return () => {
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
    }
  }, [action, reactId, resetKey])

  if (!SITE_KEY) {
    return <p className="turnstile-config-error" role="alert">人机验证尚未配置，请联系管理员。</p>
  }
  return <div id={`turnstile-${reactId}`} ref={containerRef} className="turnstile-widget" />
}

export default TurnstileWidget
