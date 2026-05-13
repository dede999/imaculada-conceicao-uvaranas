<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const route = useRoute()

const drawerOpen = ref(false)
watch(() => route.fullPath, () => { drawerOpen.value = false })

async function signOut() {
  await supabase.auth.signOut()
  await navigateTo('/admin/login')
}

const { open: confirmOpen, message: confirmMsg, onConfirm, onCancel } = useAdminConfirm()

const changePwOpen = ref(false)

const { phase, secondsLeft, dismiss } = useIdleTimeout()

const timeLeft = computed(() => {
  const m = Math.floor(secondsLeft.value / 60)
  const s = secondsLeft.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

const reAuthPassword = ref('')
const reAuthError    = ref('')
const reAuthLoading  = ref(false)

async function reAuthenticate() {
  reAuthLoading.value = true
  reAuthError.value   = ''
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email:    user.value?.email ?? '',
      password: reAuthPassword.value,
    })
    if (error) throw error
    reAuthPassword.value = ''
    dismiss()
  } catch {
    reAuthError.value = 'Senha incorreta. Tente novamente.'
  } finally {
    reAuthLoading.value = false
  }
}
</script>

<template>
  <div class="admin-shell">

    <!-- ── Top bar ─────────────────────────────────────────────── -->
    <header class="admin-topbar">
      <button
        class="topbar-menu"
        :aria-expanded="drawerOpen"
        aria-label="Abrir menu"
        @click="drawerOpen = !drawerOpen"
      >
        <Icon name="lucide:menu" />
      </button>

      <div class="topbar-brand">
        <span class="brand-tau">τ</span>
        <span class="brand-name">Painel</span>
      </div>

      <div class="topbar-actions">
        <span class="topbar-email">{{ user?.email }}</span>
        <button class="topbar-changepw" @click="changePwOpen = true">Alterar senha</button>
        <button class="topbar-signout" @click="signOut">Sair</button>
      </div>
    </header>

    <!-- ── Drawer backdrop ─────────────────────────────────────── -->
    <Transition name="drawer-backdrop">
      <div
        v-if="drawerOpen"
        class="drawer-backdrop"
        aria-hidden="true"
        @click="drawerOpen = false"
      />
    </Transition>

    <!-- ── Drawer panel ────────────────────────────────────────── -->
    <Transition name="drawer-slide">
      <aside v-if="drawerOpen" class="admin-drawer" role="dialog" aria-modal="true" aria-label="Menu de navegação">
        <div class="drawer-header">
          <span class="brand-tau">τ</span>
          <span class="brand-name">Painel</span>
          <button class="drawer-close" aria-label="Fechar menu" @click="drawerOpen = false">
            <Icon name="lucide:x" />
          </button>
        </div>

        <nav class="drawer-nav">
          <NuxtLink to="/admin/dashboard" class="drawer-link">
            <Icon name="lucide:layout-dashboard" />
            Painel
          </NuxtLink>
          <NuxtLink to="/admin/noticias" class="drawer-link">
            <Icon name="lucide:newspaper" />
            Notícias
          </NuxtLink>
          <NuxtLink to="/admin/eventos" class="drawer-link">
            <Icon name="lucide:calendar" />
            Eventos
          </NuxtLink>
          <NuxtLink to="/admin/capelas" class="drawer-link">
            <Icon name="lucide:church" />
            Capelas
          </NuxtLink>
          <NuxtLink to="/admin/missas" class="drawer-link">
            <Icon name="lucide:clock" />
            Missas
          </NuxtLink>
          <NuxtLink to="/admin/pastorais" class="drawer-link">
            <Icon name="lucide:heart-handshake" />
            Pastorais
          </NuxtLink>
          <NuxtLink to="/admin/usuarios" class="drawer-link">
            <Icon name="lucide:users" />
            Usuários
          </NuxtLink>
          <NuxtLink to="/admin/log" class="drawer-link">
            <Icon name="lucide:scroll-text" />
            Auditoria
          </NuxtLink>
          <NuxtLink to="/admin/configuracoes/aparencia" class="drawer-link">
            <Icon name="lucide:palette" />
            Aparência
          </NuxtLink>
          <NuxtLink to="/admin/configuracoes/rodape" class="drawer-link">
            <Icon name="lucide:panel-bottom" />
            Rodapé
          </NuxtLink>
        </nav>

        <div class="drawer-footer">
          <span class="drawer-user">{{ user?.email }}</span>
          <button class="drawer-changepw" @click="changePwOpen = true; drawerOpen = false">Alterar senha</button>
          <button class="drawer-signout" @click="signOut">Sair</button>
        </div>
      </aside>
    </Transition>

    <!-- ── Main ───────────────────────────────────────────────── -->
    <main class="admin-main">
      <slot />
    </main>

    <AdminConfirmModal :open="confirmOpen" :message="confirmMsg" @confirm="onConfirm" @cancel="onCancel" />
    <AdminChangePasswordModal :open="changePwOpen" @close="changePwOpen = false" />

    <Transition name="idle-fade">
      <div v-if="phase !== 'idle'" class="idle-overlay" role="alertdialog" aria-modal="true" aria-labelledby="idle-title">

        <!-- Warning: session about to expire -->
        <div v-if="phase === 'warn'" class="idle-card">
          <p class="idle-icon" aria-hidden="true">⏱</p>
          <h2 id="idle-title" class="idle-title">Sessão prestes a expirar</h2>
          <p class="idle-body">Por inatividade, você será desconectado em</p>
          <p class="idle-countdown">{{ timeLeft }}</p>
          <button class="idle-btn" @click="dismiss">Continuar sessão</button>
          <button class="idle-btn-ghost" @click="signOut">Sair agora</button>
        </div>

        <!-- Expired: offer inline re-auth to preserve unsaved changes -->
        <div v-else class="idle-card">
          <p class="idle-icon" aria-hidden="true">🔒</p>
          <h2 id="idle-title" class="idle-title">Sessão expirada</h2>
          <p class="idle-body">Digite sua senha para continuar de onde parou.</p>
          <form class="reauth-form" @submit.prevent="reAuthenticate">
            <input type="email" :value="user?.email" readonly class="reauth-input reauth-email" autocomplete="username" />
            <input
              v-model="reAuthPassword"
              type="password"
              placeholder="Senha"
              class="reauth-input"
              :disabled="reAuthLoading"
              autofocus
              autocomplete="current-password"
            />
            <p v-if="reAuthError" class="reauth-error">{{ reAuthError }}</p>
            <button type="submit" class="idle-btn" :disabled="reAuthLoading || !reAuthPassword">
              {{ reAuthLoading ? 'Entrando…' : 'Continuar' }}
            </button>
            <button type="button" class="idle-btn-ghost" @click="signOut">Sair e descartar alterações</button>
          </form>
        </div>

      </div>
    </Transition>
  </div>
</template>

<style scoped>
.admin-shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: #f5f5f0;
}

/* ── Top bar ─────────────────────────────────────────────────── */

.admin-topbar {
  position: sticky;
  top: 0;
  z-index: 150;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  background: var(--fr-950);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.topbar-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  border-radius: 6px;
  color: #c8baa0;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.1s, color 0.1s;
}
.topbar-menu:hover { background: rgba(255,255,255,0.07); color: #fff; }

.topbar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.brand-tau {
  font-size: 22px;
  font-weight: 700;
  color: var(--fr-200);
  line-height: 1;
}

.brand-name {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #c8baa0;
}

.topbar-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.topbar-email {
  font-family: var(--font-sans);
  font-size: 12px;
  color: #8a7a60;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-changepw {
  background: none;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  color: #8a7a60;
  font-family: var(--font-sans);
  font-size: 12px;
  padding: 4px 10px;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
  white-space: nowrap;
}
.topbar-changepw:hover { background: rgba(255,255,255,0.07); color: #c8baa0; }

.topbar-signout {
  background: none;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 4px;
  color: #c8baa0;
  font-family: var(--font-sans);
  font-size: 13px;
  padding: 5px 10px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.1s;
}
.topbar-signout:hover { background: rgba(255,255,255,0.07); }

/* ── Drawer backdrop ─────────────────────────────────────────── */

.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 199;
}

.drawer-backdrop-enter-active,
.drawer-backdrop-leave-active { transition: opacity 0.22s ease; }
.drawer-backdrop-enter-from,
.drawer-backdrop-leave-to { opacity: 0; }

/* ── Drawer panel ────────────────────────────────────────────── */

.admin-drawer {
  position: fixed;
  top: 0;
  left: 0;
  width: 260px;
  height: 100dvh;
  z-index: 200;
  display: flex;
  flex-direction: column;
  background: var(--fr-950);
  color: #e8dcc8;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active { transition: transform 0.24s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-slide-enter-from,
.drawer-slide-leave-to { transform: translateX(-100%); }

.drawer-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.drawer-close {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: none;
  border: none;
  border-radius: 5px;
  color: #8a7a60;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}
.drawer-close:hover { background: rgba(255,255,255,0.07); color: #c8baa0; }

.drawer-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  gap: 2px;
  overflow-y: auto;
}

.drawer-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: #c8baa0;
  text-decoration: none;
  transition: background 0.1s, color 0.1s;
}
.drawer-link:hover,
.drawer-link.router-link-active {
  background: rgba(255, 255, 255, 0.07);
  color: #fff;
}
.drawer-link.router-link-active {
  border-left: 3px solid var(--fr-200);
  padding-left: 17px;
}

.drawer-footer {
  padding: 14px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.drawer-user {
  font-family: var(--font-sans);
  font-size: 12px;
  color: #8a7a60;
  word-break: break-all;
}

.drawer-changepw {
  background: none;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  color: #8a7a60;
  font-family: var(--font-sans);
  font-size: 12px;
  padding: 4px 10px;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s, color 0.1s;
}
.drawer-changepw:hover { background: rgba(255,255,255,0.07); color: #c8baa0; }

.drawer-signout {
  background: none;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 4px;
  color: #c8baa0;
  font-family: var(--font-sans);
  font-size: 13px;
  padding: 5px 10px;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}
.drawer-signout:hover { background: rgba(255,255,255,0.07); }

/* ── Main ────────────────────────────────────────────────────── */

.admin-main {
  flex: 1;
  min-width: 0;
  padding: 32px;
}

@media (max-width: 767px) {
  .topbar-email,
  .topbar-changepw { display: none; }

  .admin-main { padding: 20px 16px; }
}

/* ── Idle timeout overlay ────────────────────────────────────── */

.idle-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.idle-card {
  background: #fff;
  border-radius: 12px;
  padding: 36px 40px;
  max-width: 380px;
  width: 90%;
  text-align: center;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25);
}

.idle-icon {
  font-size: 32px;
  margin: 0 0 12px;
  line-height: 1;
}

.idle-title {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--fr-950);
  margin: 0 0 8px;
}

.idle-body {
  font-family: var(--font-sans);
  font-size: 13px;
  color: #6b6b5e;
  margin: 0 0 4px;
}

.idle-countdown {
  font-family: var(--font-sans);
  font-size: 36px;
  font-weight: 700;
  color: #b91c1c;
  margin: 0 0 24px;
  letter-spacing: 0.05em;
  font-variant-numeric: tabular-nums;
}

.idle-btn {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background: var(--fr-600);
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  cursor: pointer;
  transition: background 0.1s;
  width: 100%;
}

.idle-btn:hover { background: var(--fr-800); }

.idle-btn-ghost {
  font-family: var(--font-sans);
  font-size: 13px;
  color: #6b6b5e;
  background: none;
  border: none;
  padding: 6px 0 0;
  cursor: pointer;
  width: 100%;
  text-align: center;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.reauth-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

.reauth-input {
  font-family: var(--font-sans);
  font-size: 13px;
  border: 1px solid #d4c9b8;
  border-radius: 5px;
  padding: 8px 10px;
  outline: none;
  transition: border-color 0.1s;
  width: 100%;
  box-sizing: border-box;
}

.reauth-input:focus { border-color: var(--fr-400); }

.reauth-email {
  color: #8a7a60;
  background: #f5f5f0;
}

.reauth-error {
  font-family: var(--font-sans);
  font-size: 12px;
  color: #b91c1c;
  margin: 0;
}

.idle-fade-enter-active,
.idle-fade-leave-active { transition: opacity 0.2s; }
.idle-fade-enter-from,
.idle-fade-leave-to { opacity: 0; }
</style>
