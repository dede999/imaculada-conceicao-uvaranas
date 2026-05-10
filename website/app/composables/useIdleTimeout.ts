const IDLE_MS  = 25 * 60 * 1000  // 25 min → show warning
const WARN_MS  =  5 * 60 * 1000  // 5 min after warning → sign out

export function useIdleTimeout(onExpire: () => void) {
  const warning = ref(false)
  const secondsLeft = ref(WARN_MS / 1000)

  let idleTimer:  ReturnType<typeof setTimeout> | null = null
  let warnTimer:  ReturnType<typeof setTimeout> | null = null
  let countTimer: ReturnType<typeof setInterval> | null = null

  function clearAll() {
    if (idleTimer)  clearTimeout(idleTimer)
    if (warnTimer)  clearTimeout(warnTimer)
    if (countTimer) clearInterval(countTimer)
  }

  function startCountdown() {
    secondsLeft.value = WARN_MS / 1000
    countTimer = setInterval(() => {
      secondsLeft.value -= 1
      if (secondsLeft.value <= 0) clearInterval(countTimer!)
    }, 1000)
  }

  function reset() {
    clearAll()
    warning.value = false

    idleTimer = setTimeout(() => {
      warning.value = true
      startCountdown()
      warnTimer = setTimeout(() => {
        onExpire()
      }, WARN_MS)
    }, IDLE_MS)
  }

  function dismiss() {
    reset()
  }

  const events = ['mousemove', 'keydown', 'pointerdown', 'scroll', 'touchstart']

  onMounted(() => {
    reset()
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))
  })

  onUnmounted(() => {
    clearAll()
    events.forEach(e => window.removeEventListener(e, reset))
  })

  return { warning, secondsLeft, dismiss }
}
