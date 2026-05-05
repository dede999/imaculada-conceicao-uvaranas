<script setup lang="ts">
interface BeholdPost {
  id: string
  mediaUrl: string
  thumbnailUrl?: string
  permalink: string
  caption?: string
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  timestamp: string
}

const config = useRuntimeConfig()
const feedId = config.public.beholdFeedId as string
const instagramHandle = (config.public.parishInstagram as string).replace('@', '')

const { data: posts } = await useAsyncData<BeholdPost[] | null>('instagram-feed', async () => {
  if (!feedId) return null
  const data = await $fetch<BeholdPost[]>(`https://feeds.behold.so/${feedId}`)
  return data.slice(0, 9)
})

const instagramUrl = instagramHandle ? `https://instagram.com/${instagramHandle}` : null
</script>

<template>
  <div class="instagram-feed">
    <!-- ── Live feed ──────────────────────────────────────────── -->
    <template v-if="posts?.length">
      <div class="feed-grid">
        <a
          v-for="post in posts"
          :key="post.id"
          :href="post.permalink"
          target="_blank"
          rel="noopener"
          class="feed-item"
          :aria-label="post.caption?.slice(0, 80) ?? 'Post no Instagram'"
        >
          <img
            :src="post.thumbnailUrl ?? post.mediaUrl"
            :alt="post.caption?.slice(0, 120) ?? ''"
            class="feed-image"
            loading="lazy"
          />
          <div class="feed-overlay" aria-hidden="true">
            <span v-if="post.mediaType === 'VIDEO'" class="feed-type-icon">▶</span>
            <span v-else-if="post.mediaType === 'CAROUSEL_ALBUM'" class="feed-type-icon">⊞</span>
          </div>
        </a>
      </div>

      <a
        v-if="instagramUrl"
        :href="instagramUrl"
        target="_blank"
        rel="noopener"
        class="feed-profile-link"
      >
        {{ config.public.parishInstagram }}
      </a>
    </template>

    <!-- ── Placeholder ───────────────────────────────────────── -->
    <template v-else>
      <div class="feed-placeholder">
        <p class="placeholder-text">{{ $t('home.instagram.placeholder') }}</p>
        <a
          v-if="instagramUrl"
          :href="instagramUrl"
          target="_blank"
          rel="noopener"
          class="feed-profile-link"
        >
          {{ config.public.parishInstagram }}
        </a>
      </div>
    </template>
  </div>
</template>

<style scoped>
.instagram-feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
  height: 100%;
}

/* ── Grid (desktop) ─────────────────────────────────────────────── */

.feed-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.feed-item {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  display: block;
}

.feed-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.2s;
}

.feed-item:hover .feed-image {
  transform: scale(1.04);
}

.feed-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0);
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feed-item:hover .feed-overlay {
  background: rgba(0, 0, 0, 0.2);
}

.feed-type-icon {
  color: white;
  font-size: var(--text-lg);
  opacity: 0;
  transition: opacity 0.15s;
}

.feed-item:hover .feed-type-icon {
  opacity: 1;
}

/* ── Profile link ───────────────────────────────────────────────── */

.feed-profile-link {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--fr-600);
  text-decoration: none;
  align-self: flex-start;
}

.feed-profile-link:hover { text-decoration: underline; }

/* ── Placeholder ────────────────────────────────────────────────── */

.feed-placeholder {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
  flex: 1;
  justify-content: center;
}

.placeholder-text {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0;
}

/* ── Mobile carousel ────────────────────────────────────────────── */

@media (max-width: 767px) {
  .feed-grid {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 4px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .feed-grid::-webkit-scrollbar { display: none; }

  .feed-item {
    flex: 0 0 72vw;
    scroll-snap-align: start;
  }
}
</style>
