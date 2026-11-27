declare const __SITE_ENV__: Record<string, string | undefined>

interface DialogTrackTurnstile {
  render(container: HTMLElement, options: {
    sitekey: string
    language: string
    action: string
    appearance: string
    callback: (token: string) => void
    'expired-callback': () => void
    'error-callback': () => void
    'timeout-callback': () => void
  }): string
  remove(widget: string): void
}

interface Window {
  turnstile?: DialogTrackTurnstile
}
