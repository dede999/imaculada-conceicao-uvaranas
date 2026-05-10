<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

async function signOut() {
  await supabase.auth.signOut()
  await navigateTo('/admin/login')
}

const { warning, secondsLeft, dismiss } = useIdleTimeout(signOut)

const timeLeft = computed(() => {
  const m = Math.floor(secondsLeft.value / 60)
  const s = secondsLeft.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="sidebar-brand">
        <span class="brand-tau">τ</span>
        <span class="brand-name">Painel</span>
      </div>

      <nav class="sidebar-nav">
        <NuxtLink to="/admin/dashboard" class="sidebar-link">
          <Icon name="lucide:layout-dashboard" />
          Painel
        </NuxtLink>
        <NuxtLink to="/admin/noticias" class="sidebar-link">
          <Icon name="lucide:newspaper" />
          Notícias
        </NuxtLink>
        <NuxtLink to="/admin/eventos" class="sidebar-link">
          <Icon name="lucide:calendar" />
          Eventos
        </NuxtLink>
        <NuxtLink to="/admin/capelas" class="sidebar-link">
          <Icon name="lucide:church" />
          Capelas
        </NuxtLink>
        <NuxtLink to="/admin/missas" class="sidebar-link">
          <Icon name="lucide:clock" />
          Missas
        </NuxtLink>
        <NuxtLink to="/admin/pastorais" class="sidebar-link">
          <Icon name="lucide:heart-handshake" />
          Pastorais
        </NuxtLink>
        <NuxtLink to="/admin/usuarios" class="sidebar-link">
          <Icon name="lucide:users" />
          Usuários
        </NuxtLink>
        <NuxtLink to="/admin/log" class="sidebar-link">
          <Icon name="lucide:scroll-text" />
          Auditoria
        </NuxtLink>
        <NuxtLink to="/admin/configuracoes/aparencia" class="sidebar-link">
          <Icon name="lucide:palette" />
          Aparência
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <span class="sidebar-user">{{ user?.email }}</span>
        <button class="sidebar-signout" @click="signOut">Sair</button>
      </div>
    </aside>

    <main class="admin-main">
      <slot />
    </main>

    <Transition name="idle-fade">
      <div v-if="warning" class="idle-overlay" role="alertdialog" aria-modal="true" aria-labelledby="idle-title">
        <div class="idle-card">
          <p class="idle-icon" aria-hidden="true">⏱</p>
          <h2 id="idle-title" class="idle-title">Sessão prestes a expirar</h2>
          <p class="idle-body">Por inatividade, você será desconectado em</p>
          <p class="idle-countdown">{{ timeLeft }}</p>
          <button class="idle-btn" @click="dismiss">Continuar sessão</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100dvh;
  background: #f5f5f0;
}

/* ── Sidebar ─────────────────────────────────────────────────── */

.admin-sidebar {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--fr-950);
  color: #e8dcc8;
  padding: 0;
  position: sticky;
  top: 0;
  height: 100dvh;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  gap: 2px;
  overflow-y: auto;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 20px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: #c8baa0;
  text-decoration: none;
  border-radius: 0;
  transition: background 0.1s, color 0.1s;
}

.sidebar-link:hover,
.sidebar-link.router-link-active {
  background: rgba(255, 255, 255, 0.07);
  color: #fff;
}

.sidebar-link.router-link-active {
  border-left: 3px solid var(--fr-200);
  padding-left: 17px;
}

/* ── Footer ──────────────────────────────────────────────────── */

.sidebar-footer {
  padding: 14px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-user {
  font-family: var(--font-sans);
  font-size: 12px;
  color: #8a7a60;
  word-break: break-all;
}

.sidebar-signout {
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  color: #c8baa0;
  font-family: var(--font-sans);
  font-size: 13px;
  padding: 5px 10px;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
}

.sidebar-signout:hover {
  background: rgba(255, 255, 255, 0.07);
}

/* ── Main ────────────────────────────────────────────────────── */

.admin-main {
  flex: 1;
  min-width: 0;
  padding: 32px;
}

/* ── Mobile ──────────────────────────────────────────────────── */

@media (max-width: 767px) {
  .admin-shell {
    flex-direction: column;
  }

  .admin-sidebar {
    width: 100%;
    height: auto;
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    padding: 8px;
  }

  .sidebar-footer {
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .admin-main {
    padding: 20px 16px;
  }
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

.idle-fade-enter-active,
.idle-fade-leave-active { transition: opacity 0.2s; }
.idle-fade-enter-from,
.idle-fade-leave-to { opacity: 0; }
</style>
