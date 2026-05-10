const IDLE_MS = 25 * 60 * 1000  // 25 min idle → show warning
const WARN_MS =  5 * 60 * 1000  // 5 min warning → expire

export function useIdleTimeout() {
  const phase       = ref<'idle' | 'warn' | 'expired'>('idle')
  const secondsLeft = ref(WARN_MS / 1000)

  let idleTimer:  ReturnType<typeof setTimeout>  | null = null
  let warnTimer:  ReturnType<typeof setTimeout>  | null = null
  let countTimer: ReturnType<typeof setInterval> | null = null

  const EVENTS = ['mousemove', 'keydown', 'pointerdown', 'scroll', 'touchstart'] as const

  function clearTimers() {
    if (idleTimer)  clearTimeout(idleTimer)
    if (warnTimer)  clearTimeout(warnTimer)
    if (countTimer) clearInterval(countTimer)
    idleTimer = warnTimer = countTimer = null
  }

  function schedule() {
    clearTimers()
    phase.value       = 'idle'
    secondsLeft.value = WARN_MS / 1000

    idleTimer = setTimeout(() => {
      phase.value       = 'warn'
      secondsLeft.value = WARN_MS / 1000

      countTimer = setInterval(() => {
        secondsLeft.value -= 1
        if (secondsLeft.value <= 0) clearInterval(countTimer!)
      }, 1000)

      warnTimer = setTimeout(() => {
        clearTimers()
        EVENTS.forEach(e => window.removeEventListener(e, onActivity))
        phase.value = 'expired'
      }, WARN_MS)
    }, IDLE_MS)
  }

  function onActivity() {
    if (phase.value === 'expired') return
    schedule()
  }

  // Call after user clicks "Continuar" (warn) or after successful re-auth (expired)
  function dismiss() {
    EVENTS.forEach(e => {
      window.removeEventListener(e, onActivity)
      window.addEventListener(e, onActivity, { passive: true })
    })
    schedule()
  }

  onMounted(() => {
    schedule()
    EVENTS.forEach(e => window.addEventListener(e, onActivity, { passive: true }))
  })

  onUnmounted(() => {
    clearTimers()
    EVENTS.forEach(e => window.removeEventListener(e, onActivity))
  })

  return { phase, secondsLeft, dismiss }
}
