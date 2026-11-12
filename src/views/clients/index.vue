<template>
  <div>
    <div class="ge-page-header">
      <div>
        <h1>{{ T('Clients') }}</h1>
        <p>{{ T('ClientsHint') }}</p>
      </div>
      <div class="actions">
        <el-input v-model="search" :placeholder="T('Name')" clearable :prefix-icon="Search" class="search"/>
        <el-button type="primary" :icon="Plus" @click="toAdd">{{ T('NewClient') }}</el-button>
      </div>
    </div>

    <div v-loading="loading" class="ge-clients">
      <div v-for="c in cards" :key="c.id" class="ge-client" :class="{unassigned: !c.id}">
        <div class="client-top">
          <div class="client-avatar" :style="{background: c.id ? colorFor(c.name) : undefined}">
            <el-icon v-if="!c.id"><QuestionFilled/></el-icon>
            <span v-else>{{ initials(c.name) }}</span>
          </div>
          <div class="client-name">
            <strong :title="c.name">{{ c.name }}</strong>
            <span>{{ c.total }} {{ T('Devices') }}</span>
          </div>
          <el-dropdown v-if="c.id" trigger="click">
            <el-button text :icon="MoreFilled" class="more"/>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="toEdit(c)">{{ T('Edit') }}</el-dropdown-item>
                <el-dropdown-item @click="del(c)">
                  <span class="danger">{{ T('Delete') }}</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="client-stats">
          <span class="ge-status online">{{ c.online }} {{ T('Online').toLowerCase() }}</span>
          <span class="ge-status offline">{{ c.total - c.online }} {{ T('Offline').toLowerCase() }}</span>
        </div>
        <el-button class="client-open" @click="openDevices(c)" :disabled="!c.total">
          {{ T('ViewDevices') }}
          <el-icon class="el-icon--right"><ArrowRight/></el-icon>
        </el-button>
      </div>
      <div v-if="!loading && !cards.length" class="ge-empty">{{ T('NoData') }}</div>
    </div>

    <el-dialog v-model="formVisible" :title="formData.id ? T('Edit') : T('NewClient')" width="440">
      <el-form :model="formData" label-position="top" @submit.prevent="submit">
        <el-form-item :label="T('ClientName')" required>
          <el-input v-model="formData.name" maxlength="80" autofocus/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">{{ T('Cancel') }}</el-button>
        <el-button type="primary" @click="submit" :disabled="!formData.name.trim()">{{ T('Save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { computed, onActivated, onMounted, reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { ArrowRight, MoreFilled, Plus, QuestionFilled, Search } from '@element-plus/icons'
  import { create, list as groupList, remove, update } from '@/api/device_group'
  import { list as peerList } from '@/api/peer'
  import { T } from '@/utils/i18n'
  import { isOnline } from '@/utils/peer'

  const router = useRouter()
  const loading = ref(false)
  const groups = ref([])
  const peers = ref([])
  const search = ref('')

  const load = async () => {
    loading.value = true
    const [g, p] = await Promise.all([
      groupList({ page: 1, page_size: 999 }).catch(_ => false),
      peerList({ page: 1, page_size: 2000 }).catch(_ => false),
    ])
    groups.value = g?.data?.list || []
    peers.value = p?.data?.list || []
    loading.value = false
  }
  onMounted(load)
  onActivated(load)

  const cards = computed(() => {
    const term = search.value.trim().toLowerCase()
    const known = new Set(groups.value.map(g => g.id))
    const statsFor = (match) => {
      const list = peers.value.filter(match)
      return { total: list.length, online: list.filter(p => isOnline(p.last_online_time)).length }
    }
    const result = groups.value
      .filter(g => !term || g.name.toLowerCase().includes(term))
      .map(g => ({ id: g.id, name: g.name, ...statsFor(p => p.group_id === g.id) }))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    const unassigned = statsFor(p => !p.group_id || !known.has(p.group_id))
    if (unassigned.total && !term) {
      result.push({ id: 0, name: T('NoClient'), ...unassigned })
    }
    return result
  })

  const initials = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const palette = ['#1f5f8b', '#0e7490', '#7c3aed', '#b45309', '#be185d', '#15803d', '#4338ca', '#0f766e']
  const colorFor = (name) => palette[[...name].reduce((s, ch) => s + ch.charCodeAt(0), 0) % palette.length]

  const openDevices = (c) => router.push({ name: 'Peer', query: { group_id: c.id } })

  const formVisible = ref(false)
  const formData = reactive({ id: 0, name: '', type: 1 })
  const toAdd = () => {
    Object.assign(formData, { id: 0, name: '', type: 1 })
    formVisible.value = true
  }
  const toEdit = (c) => {
    const g = groups.value.find(x => x.id === c.id)
    Object.assign(formData, { id: c.id, name: c.name, type: g?.type || 1 })
    formVisible.value = true
  }
  const submit = async () => {
    if (!formData.name.trim()) return
    const api = formData.id ? update : create
    const res = await api({ ...formData, name: formData.name.trim() }).catch(_ => false)
    if (res) {
      ElMessage.success(T('OperationSuccess'))
      formVisible.value = false
      load()
    }
  }
  const del = async (c) => {
    const ok = await ElMessageBox.confirm(T('Confirm?', { param: `${T('Delete')} "${c.name}"` }), {
      confirmButtonText: T('Confirm'),
      cancelButtonText: T('Cancel'),
      type: 'warning',
    }).catch(_ => false)
    if (!ok) return
    const res = await remove({ id: c.id }).catch(_ => false)
    if (res) {
      ElMessage.success(T('OperationSuccess'))
      load()
    }
  }
</script>

<style scoped lang="scss">
.actions {
  display: flex;
  gap: 10px;

  .search {
    width: 240px;
  }
}

.ge-clients {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  min-height: 120px;
}

.ge-client {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  background: var(--ge-surface);
  border: 1px solid var(--ge-border);
  border-radius: var(--ge-radius);
  box-shadow: var(--ge-shadow);
  transition: border-color 0.15s, box-shadow 0.15s;

  &:hover {
    border-color: var(--el-color-primary-light-7);
    box-shadow: var(--ge-shadow-lg);
  }

  &.unassigned {
    border-style: dashed;
    background: var(--ge-surface-2);
  }
}

.client-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.client-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  background: var(--ge-text-3);
  flex-shrink: 0;
}

.client-name {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;

  strong {
    font-size: 15px;
    font-weight: 650;
    color: var(--ge-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    font-size: 12px;
    color: var(--ge-text-3);
  }
}

.client-stats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.client-open {
  width: 100%;
}

.danger {
  color: var(--ge-danger);
}
</style>
