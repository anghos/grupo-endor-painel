<template>
  <el-config-provider :locale="appStore.setting.locale.value">
    <div class="ge-shell" :style="{'--sideBarWidth': sideBarWidth}" :class="{collapsed: appStore.setting.sideIsCollapse}">
      <aside class="ge-aside" :style="{width: leftWidth}">
        <g-aside></g-aside>
      </aside>
      <div class="ge-content">
        <header class="ge-header">
          <g-header></g-header>
        </header>
        <main class="app-main">
          <router-view v-slot="{ Component }">
            <transition mode="out-in" name="ge-fade">
              <keep-alive :include="cachedTags">
                <component :is="Component"/>
              </keep-alive>
            </transition>
          </router-view>
        </main>
      </div>
    </div>
  </el-config-provider>
</template>

<script setup>
  import { useAppStore } from '@/store/app'
  import { useTagsStore } from '@/store/tags'
  import { ref, computed } from 'vue'
  import GAside from '@/layout/components/aside.vue'
  import GHeader from '@/layout/components/header.vue'

  const appStore = useAppStore()
  const tagStore = useTagsStore()
  const sideBarWidth = computed(() => appStore.setting.locale.sideBarWidth)
  const leftWidth = computed(() => appStore.setting.sideIsCollapse ? '72px' : 'var(--sideBarWidth)')

  const cachedTags = ref([])
  cachedTags.value = tagStore.cached
</script>

<style lang="scss" scoped>
.ge-shell {
  display: flex;
  min-height: 100vh;
  background: var(--ge-bg);
}

.ge-aside {
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;
  background: var(--ge-sidebar-bg);
  border-right: 1px solid var(--ge-border);
  transition: width 0.25s ease;
  overflow: hidden;
  z-index: 10;
}

.ge-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.ge-header {
  position: sticky;
  top: 0;
  z-index: 9;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: color-mix(in srgb, var(--ge-surface) 88%, transparent);
  backdrop-filter: saturate(160%) blur(10px);
  border-bottom: 1px solid var(--ge-border);
}

.app-main {
  flex: 1;
  padding: 24px;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.ge-fade-enter-active,
.ge-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.ge-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.ge-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .app-main {
    padding: 16px;
  }
  .ge-header {
    padding: 0 16px;
  }
}
</style>
