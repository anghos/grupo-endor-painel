<template>
  <div class="ge-header-inner">
    <div class="ge-title">
      <span class="ge-section" v-if="section">{{ section }}</span>
      <span class="ge-sep" v-if="section">/</span>
      <span class="ge-page">{{ pageTitle }}</span>
    </div>
    <Setting></Setting>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import Setting from '@/layout/components/setting/index.vue'
  import { T } from '@/utils/i18n'

  const route = useRoute()
  const pageTitle = computed(() => T(route.meta?.title || route.name))
  const section = computed(() => {
    const parent = route.matched.length > 1 ? route.matched[0] : null
    if (!parent || !parent.meta?.title) return ''
    const visibleChildren = (parent.children || []).filter(c => !c.meta?.hide)
    return visibleChildren.length > 1 ? T(parent.meta.title) : ''
  })
</script>

<style scoped lang="scss">
.ge-header-inner {
  display: flex;
  align-items: center;
  width: 100%;
}

.ge-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  min-width: 0;

  .ge-section {
    color: var(--ge-text-3);
    font-weight: 500;
  }

  .ge-sep {
    color: var(--ge-border);
  }

  .ge-page {
    color: var(--ge-text);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
