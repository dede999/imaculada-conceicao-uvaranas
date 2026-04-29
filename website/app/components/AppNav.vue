<script setup lang="ts">
import tauRaw from '~/assets/tau.svg?raw'

const { t } = useI18n()
const config = useRuntimeConfig()
const parishShortName = config.public.parishShortName as string

const navOpen = ref(false)
const route = useRoute()

watch(() => route.fullPath, () => { navOpen.value = false })

const links = [
  { to: '/',             label: 'nav.home',         exact: true },
  { to: '/capelas',      label: 'nav.chapels',       exact: false },
  { to: '/eventos',      label: 'nav.events',        exact: false },
  { to: '/noticias',     label: 'nav.news',          exact: false },
  { to: '/pastorais',    label: 'nav.ministries',    exact: false },
  { to: '/transparencia',label: 'nav.transparency',  exact: false },
]
</script>

<template>
  <header class="app-nav">
    <div class="nav-inner">

      <NuxtLink to="/" class="nav-brand">
        <span class="nav-tau" v-html="tauRaw" aria-hidden="true" />
        <span class="nav-name">{{ parishShortName }}</span>
      </NuxtLink>

      <nav class="nav-links" aria-label="Navegação principal">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          :exact-active-class="link.exact ? 'nav-link--active' : undefined"
          :active-class="!link.exact ? 'nav-link--active' : undefined"
        >
          {{ t(link.label) }}
        </NuxtLink>
      </nav>

      <button
        class="nav-burger"
        :aria-expanded="navOpen"
        aria-label="Menu"
        @click="navOpen = !navOpen"
      >
        <span class="burger-bar" :class="{ 'bar--top-open': navOpen }" />
        <span class="burger-bar" :class="{ 'bar--mid-open': navOpen }" />
        <span class="burger-bar" :class="{ 'bar--bot-open': navOpen }" />
      </button>

    </div>

    <nav v-if="navOpen" class="nav-drawer" aria-label="Menu principal">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="drawer-link"
        :exact-active-class="link.exact ? 'drawer-link--active' : undefined"
        :active-class="!link.exact ? 'drawer-link--active' : undefined"
      >
        {{ t(link.label) }}
      </NuxtLink>
    </nav>
  </header>
</template>

<style scoped>
/* ── Shell ──────────────────────────────────────────────────────── */

.app-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--fr-50);
  border-bottom: 1px solid var(--fr-200);
}

.nav-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-24);
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-24);
}

/* ── Brand ──────────────────────────────────────────────────────── */

.nav-brand {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  text-decoration: none;
  flex-shrink: 0;
}

.nav-tau {
  display: block;
  width: 16px;
  height: 22px;
  color: var(--fr-400);
  flex-shrink: 0;
}

.nav-tau :deep(svg) { width: 100%; height: 100%; }

.nav-name {
  font-family: var(--font-serif);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--fr-950);
  white-space: nowrap;
}

/* ── Desktop links ──────────────────────────────────────────────── */

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.nav-link {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--fr-800);
  text-decoration: none;
  padding: var(--space-4) var(--space-12);
  border-radius: var(--radius-sm);
  transition: background-color 0.1s, color 0.1s;
}

.nav-link:hover {
  background-color: var(--fr-100);
  color: var(--fr-950);
}

.nav-link--active {
  color: var(--fr-950);
  background-color: var(--fr-200);
}

/* ── Hamburger ──────────────────────────────────────────────────── */

.nav-burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  padding: var(--space-8);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  flex-shrink: 0;
}

.nav-burger:hover { background-color: var(--fr-100); }

.burger-bar {
  display: block;
  width: 18px;
  height: 2px;
  background-color: var(--fr-950);
  border-radius: 1px;
  transition: transform 0.2s, opacity 0.2s;
}

.bar--top-open { transform: translateY(7px) rotate(45deg); }
.bar--mid-open { opacity: 0; }
.bar--bot-open { transform: translateY(-7px) rotate(-45deg); }

/* ── Mobile drawer ──────────────────────────────────────────────── */

.nav-drawer {
  display: flex;
  flex-direction: column;
  padding: var(--space-8) var(--space-24) var(--space-16);
  border-top: 1px solid var(--fr-200);
  gap: 2px;
}

.drawer-link {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 500;
  color: var(--fr-800);
  text-decoration: none;
  padding: var(--space-12) var(--space-8);
  border-radius: var(--radius-sm);
  border-bottom: 1px solid var(--fr-100);
  transition: background-color 0.1s;
}

.drawer-link:last-child { border-bottom: none; }

.drawer-link:hover { background-color: var(--fr-100); }

.drawer-link--active { color: var(--fr-950); font-weight: 600; }

/* ── Responsive ─────────────────────────────────────────────────── */

@media (max-width: 767px) {
  .nav-links { display: none; }
  .nav-burger { display: flex; }
}
</style>
