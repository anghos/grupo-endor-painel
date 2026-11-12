<template>
  <el-menu
      class="ge-menu"
      :collapse="isCollapse"
      :collapse-transition="false"
      :default-active="activeIndex"
      :default-openeds="openeds"
      router
  >
    <menu-item v-for="route in routes" :key="route.name" :route="route"></menu-item>
  </el-menu>
</template>

<script>
  import { defineComponent, ref, computed } from 'vue'
  import { useRouteStore } from '@/store/router'
  import MenuItem from '@/layout/components/menu/item.vue'
  import { useRoute } from 'vue-router'
  import { useAppStore } from '@/store/app'

  export default defineComponent({
    name: 'Menu',
    components: { MenuItem },
    setup () {
      const routes = ref([])
      const route = useRoute()
      const app = useAppStore()
      const isCollapse = computed(() => app.setting.sideIsCollapse)
      const activeIndex = computed(() => route.name)

      routes.value = useRouteStore().routes
      // Grupo Endor: seções do menu abertas por padrão
      const openeds = routes.value
        .filter(r => r.children && r.children.filter(c => !c.meta?.hide).length > 1)
        .map(r => r.name)
      return {
        routes,
        activeIndex,
        isCollapse,
        openeds,
      }
    },
  })
</script>

<style lang="scss" scoped>
.ge-menu {
  border-right: none;
  background: transparent;
  --el-menu-bg-color: transparent;
  --el-menu-hover-bg-color: var(--ge-sidebar-active-bg);
  --el-menu-text-color: var(--ge-sidebar-text);
  --el-menu-active-color: var(--ge-sidebar-active-text);
  --el-menu-item-height: 40px;
  --el-menu-sub-item-height: 38px;
  --el-menu-base-level-padding: 18px;
  --el-menu-level-padding: 14px;

  &:not(.el-menu--collapse) {
    width: var(--sideBarWidth);
  }

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    margin: 2px 10px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
  }

  :deep(.el-sub-menu__title) {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--ge-text-3);
    height: 34px;
    line-height: 34px;

    .el-icon {
      display: none;
    }
  }

  &.el-menu--collapse :deep(.el-sub-menu__title .el-icon) {
    display: inline-flex;
  }

  :deep(.el-sub-menu .el-menu-item) {
    padding-left: 18px !important;
  }

  :deep(.el-menu-item.is-active) {
    background: var(--ge-sidebar-active-bg);
    font-weight: 600;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: -10px;
      top: 8px;
      bottom: 8px;
      width: 3px;
      border-radius: 0 3px 3px 0;
      background: var(--el-color-primary);
    }
  }

  :deep(.el-sub-menu__icon-arrow) {
    font-size: 11px;
  }
}
</style>
