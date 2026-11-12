<template>
  <div class="ge-side">
    <div class="ge-brand" @click="goHome">
      <img :src="logo" alt="Grupo Endor" class="ge-brand-logo">
      <div class="ge-brand-text" v-show="!collapsed">
        <strong>Grupo Endor</strong>
        <span>{{ T('AccessRemote') }}</span>
      </div>
    </div>
    <el-scrollbar class="ge-side-scroll">
      <menus></menus>
    </el-scrollbar>
    <div class="ge-side-footer">
      <button class="ge-collapse" @click="appStore.sideCollapse()" :title="collapsed ? 'Expandir' : 'Recolher'">
        <el-icon>
          <el-icon-expand v-if="collapsed"></el-icon-expand>
          <el-icon-fold v-else></el-icon-fold>
        </el-icon>
      </button>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import Menus from '@/layout/components/menu/index.vue'
  import { useAppStore } from '@/store/app'
  import { T } from '@/utils/i18n'
  import logo from '@/assets/logo.png'

  const appStore = useAppStore()
  const router = useRouter()
  const collapsed = computed(() => appStore.setting.sideIsCollapse)
  const goHome = () => router.push('/')
</script>

<style scoped lang="scss">
.ge-side {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.ge-brand {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  cursor: pointer;
  border-bottom: 1px solid var(--ge-border);
  flex-shrink: 0;

  .ge-brand-logo {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
  }

  .ge-brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
    white-space: nowrap;

    strong {
      font-size: 15px;
      font-weight: 700;
      color: var(--ge-brand);
      letter-spacing: -0.01em;
    }

    span {
      font-size: 11px;
      color: var(--ge-text-3);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 2px;
    }
  }
}

.ge-side-scroll {
  flex: 1;
  padding: 12px 0;
}

.ge-side-footer {
  padding: 12px;
  border-top: 1px solid var(--ge-border);
  flex-shrink: 0;
}

.ge-collapse {
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--ge-border);
  border-radius: 8px;
  background: transparent;
  color: var(--ge-text-2);
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background: var(--ge-sidebar-active-bg);
    color: var(--ge-sidebar-active-text);
  }
}
</style>
