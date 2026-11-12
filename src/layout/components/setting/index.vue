<template>
  <div class="setting">
    <el-tooltip :content="isDark ? T('ThemeLight') : T('ThemeDark')" placement="bottom">
      <button class="ge-icon-btn" @click="isDark = !isDark">
        <el-icon>
          <Sunny v-if="isDark"/>
          <Moon v-else/>
        </el-icon>
      </button>
    </el-tooltip>

    <el-dropdown trigger="click">
      <button class="ge-icon-btn" :title="T('ChangeLang')">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="currentColor"
                d="m18.5 10l4.4 11h-2.155l-1.201-3h-4.09l-1.199 3h-2.154L16.5 10h2zM10 2v2h6v2h-1.968a18.222 18.222 0 0 1-3.62 6.301a14.864 14.864 0 0 0 2.336 1.707l-.751 1.878A17.015 17.015 0 0 1 9 13.725a16.676 16.676 0 0 1-6.201 3.548l-.536-1.929a14.7 14.7 0 0 0 5.327-3.042A18.078 18.078 0 0 1 4.767 8h2.24A16.032 16.032 0 0 0 9 10.877a16.165 16.165 0 0 0 2.91-4.876L2 6V4h6V2h2zm7.5 10.885L16.253 16h2.492L17.5 12.885z"></path>
        </svg>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="(v, k) in appStore.setting.langs" @click="changeLang(k)" :key="k">
            <span :class="{'lang-active': k === appStore.setting.lang}">{{ v.name }}</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <el-dropdown trigger="click">
      <button class="ge-user">
        <span class="ge-avatar">{{ initials }}</span>
        <span class="ge-username">{{ user.username }}</span>
        <el-icon>
          <el-icon-arrow-down/>
        </el-icon>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="goProfile">{{ T('Userinfo') }}</el-dropdown-item>
          <el-dropdown-item @click="showChangePwd">{{ T('ChangePassword') }}</el-dropdown-item>
          <el-dropdown-item divided @click="logout">{{ T('Logout') }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <changePwdDialog v-model:visible="changePwdVisible"></changePwdDialog>
  </div>
</template>

<script setup>
  import { useUserStore } from '@/store/user'
  import { useAppStore } from '@/store/app'
  import changePwdDialog from '@/components/changePwdDialog.vue'
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { T } from '@/utils/i18n'
  import { useDark } from '@vueuse/core'
  import { Sunny, Moon } from '@element-plus/icons'

  const userStore = useUserStore()
  const user = userStore
  const appStore = useAppStore()
  const router = useRouter()

  const initials = computed(() => (user.username || '?').slice(0, 2).toUpperCase())

  const logout = () => {
    userStore.logout()
    window.location.reload()
  }

  const changePwdVisible = ref(false)
  const showChangePwd = () => {
    changePwdVisible.value = true
  }
  const goProfile = () => router.push({ name: 'MyInfo' })
  const changeLang = (v) => {
    appStore.changeLang(v)
  }
  const isDark = useDark()
</script>

<style lang="scss" scoped>
.setting {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;

  * {
    outline: none;
  }
}

.ge-icon-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--ge-border);
  border-radius: 10px;
  background: var(--ge-surface);
  color: var(--ge-text-2);
  cursor: pointer;
  font-size: 17px;
  transition: all 0.15s;

  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
  }
}

.ge-user {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 10px 0 4px;
  border: 1px solid var(--ge-border);
  border-radius: 999px;
  background: var(--ge-surface);
  color: var(--ge-text);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;

  &:hover {
    border-color: var(--el-color-primary-light-5);
  }
}

.ge-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--el-color-primary);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.lang-active {
  font-weight: 700;
  color: var(--el-color-primary);
}

@media (max-width: 640px) {
  .ge-username {
    display: none;
  }
}
</style>
