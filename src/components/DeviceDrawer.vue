<template>
  <el-drawer v-model="visible" :size="drawerSize" :with-header="false" class="ge-device-drawer" destroy-on-close>
    <div v-if="peer" class="dd">
      <!-- Cabeçalho -->
      <header class="dd-head">
        <div class="dd-icon"><el-icon><Monitor/></el-icon></div>
        <div class="dd-title">
          <h2 :title="peer.hostname">{{ peer.hostname || peer.id }}</h2>
          <div class="dd-sub">
            <span class="dd-id">ID {{ peer.id }}
              <el-icon class="copy" @click="copy(peer.id, $event)"><CopyDocument/></el-icon>
            </span>
            <span v-if="online" class="ge-status online">{{ T('Online') }}</span>
            <span v-else class="ge-status offline">{{ T('Offline') }}</span>
          </div>
        </div>
        <el-button text :icon="Close" @click="visible = false" class="dd-close"/>
      </header>

      <div class="dd-actions">
        <el-button type="primary" :icon="Position" @click="connectByClient(peer.id)">{{ T('Connect') }}</el-button>
        <el-button :icon="Refresh" @click="loadAudits" :loading="loadingAudits">{{ T('Refresh') }}</el-button>
      </div>

      <el-alert v-if="staleDays !== null" type="warning" :closable="false" show-icon class="dd-alert"
                :title="T('StaleDeviceAlert', { param: staleDays })"/>

      <!-- Cadastro editável -->
      <section class="dd-card">
        <h3>{{ T('Registration') }}</h3>
        <el-form label-position="top" class="dd-form">
          <div class="dd-form-row">
            <el-form-item :label="T('Client')">
              <el-select v-model="form.group_id" clearable :placeholder="T('NoClient')">
                <el-option v-for="g in groups" :key="g.id" :label="g.name" :value="g.id"/>
              </el-select>
            </el-form-item>
            <el-form-item :label="T('Inventory')">
              <el-input v-model="form.alias" maxlength="60" :placeholder="T('InventoryPlaceholder')"/>
            </el-form-item>
          </div>
          <el-button type="primary" plain :disabled="!dirty" :loading="saving" @click="save">{{ T('Save') }}</el-button>
        </el-form>
      </section>

      <!-- Detalhes -->
      <section class="dd-card">
        <h3>{{ T('Details') }}</h3>
        <dl class="dd-grid">
          <div><dt>{{ T('Os') }}</dt><dd>{{ peer.os || '-' }}</dd></div>
          <div><dt>CPU</dt><dd>{{ peer.cpu || '-' }}</dd></div>
          <div><dt>{{ T('Memory') }}</dt><dd>{{ peer.memory || '-' }}</dd></div>
          <div><dt>{{ T('Username') }}</dt><dd>{{ peer.username || '-' }}</dd></div>
          <div><dt>{{ T('Version') }}</dt><dd>{{ peer.version || '-' }}</dd></div>
          <div><dt>{{ T('LastOnlineIp') }}</dt><dd>{{ peer.last_online_ip || '-' }}</dd></div>
          <div><dt>{{ T('LastOnlineTime') }}</dt><dd>{{ lastSeen }}</dd></div>
          <div><dt>{{ T('CreatedAt') }}</dt><dd>{{ peer.created_at || '-' }}</dd></div>
        </dl>
      </section>

      <!-- Histórico -->
      <section class="dd-card">
        <div class="dd-card-head">
          <h3>{{ T('AccessHistory') }}</h3>
          <el-segmented v-model="historyTab" :options="historyOptions" size="small"/>
        </div>
        <div v-loading="loadingAudits">
          <div v-if="historyRows.length" class="dd-history">
            <div v-for="a in historyRows" :key="a.id" class="dd-h-item">
              <div class="dd-h-main">
                <strong v-if="historyTab === 'in'">{{ a.from_name || a.from_peer || '-' }}</strong>
                <strong v-else>{{ a.peer_id }}</strong>
                <span>
                  <template v-if="historyTab === 'in'">{{ a.from_peer }} · </template>{{ a.ip }}
                  <el-tag v-if="a.type === 1" size="small" type="warning">{{ T('File') }}</el-tag>
                </span>
              </div>
              <div class="dd-h-time">
                <span>{{ a.created_at }}</span>
                <span class="muted">{{ duration(a) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="ge-empty">{{ T('NoData') }}</div>
        </div>
      </section>
    </div>
  </el-drawer>
</template>

<script setup>
  import { computed, reactive, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Close, CopyDocument, Monitor, Position, Refresh } from '@element-plus/icons'
  import { update } from '@/api/peer'
  import { list as auditList } from '@/api/audit'
  import { T } from '@/utils/i18n'
  import { timeAgo } from '@/utils/time'
  import { connectByClient, isOnline, parseServerTime, STALE_DAYS } from '@/utils/peer'
  import { handleClipboard } from '@/utils/clipboard'

  const props = defineProps({
    modelValue: { type: Boolean, default: false },
    peer: { type: Object, default: null },
    groups: { type: Array, default: () => [] },
  })
  const emit = defineEmits(['update:modelValue', 'saved'])

  const visible = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v),
  })
  const drawerSize = computed(() => (window.innerWidth < 720 ? '100%' : '560px'))

  const online = computed(() => isOnline(props.peer?.last_online_time))
  const lastSeen = computed(() => {
    const t = props.peer?.last_online_time
    return t ? `${timeAgo(t * 1000)} (${new Date(t * 1000).toLocaleString('pt-BR')})` : '-'
  })
  const staleDays = computed(() => {
    const t = props.peer?.last_online_time
    if (!t || online.value) return null
    const days = Math.floor((Date.now() / 1000 - t) / 86400)
    return days >= STALE_DAYS ? days : null
  })

  const form = reactive({ group_id: null, alias: '' })
  const dirty = computed(() => props.peer && ((form.group_id || 0) !== (props.peer.group_id || 0) || form.alias !== (props.peer.alias || '')))
  const saving = ref(false)
  const save = async () => {
    const fields = ['row_id', 'id', 'cpu', 'hostname', 'memory', 'os', 'username', 'uuid', 'version']
    const data = {}
    fields.forEach(k => { data[k] = props.peer[k] })
    data.group_id = form.group_id || 0
    data.alias = form.alias.trim()
    saving.value = true
    const res = await update(data).catch(_ => false)
    saving.value = false
    if (res) {
      ElMessage.success(T('OperationSuccess'))
      emit('saved', { ...props.peer, group_id: data.group_id, alias: data.alias })
    }
  }

  const historyTab = ref('in')
  const historyOptions = computed(() => [
    { label: T('AccessesReceived'), value: 'in' },
    { label: T('AccessesMade'), value: 'out' },
  ])
  const received = ref([])
  const made = ref([])
  const loadingAudits = ref(false)
  const byNewest = (a, b) => (parseServerTime(b.created_at)?.getTime() || 0) - (parseServerTime(a.created_at)?.getTime() || 0)
  const loadAudits = async () => {
    if (!props.peer?.id) return
    loadingAudits.value = true
    const id = props.peer.id
    const [r, m] = await Promise.all([
      auditList({ page: 1, page_size: 30, peer_id: id }).catch(_ => false),
      auditList({ page: 1, page_size: 30, from_peer: id }).catch(_ => false),
    ])
    // a API filtra com LIKE: manter só o ID exato
    received.value = (r?.data?.list || []).filter(a => a.peer_id === id).sort(byNewest)
    made.value = (m?.data?.list || []).filter(a => a.from_peer === id).sort(byNewest)
    loadingAudits.value = false
  }
  const historyRows = computed(() => (historyTab.value === 'in' ? received.value : made.value).slice(0, 15))

  const duration = (a) => {
    const start = parseServerTime(a.created_at)
    if (!start) return ''
    if (!a.close_time) return T('InProgress')
    const end = typeof a.close_time === 'number' ? new Date(a.close_time * 1000) : parseServerTime(a.close_time)
    if (!end) return ''
    const min = Math.max(0, Math.round((end - start) / 60000))
    return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`
  }

  const copy = (text, e) => handleClipboard(text, e)

  watch(() => [props.modelValue, props.peer?.row_id], ([open]) => {
    if (open && props.peer) {
      form.group_id = props.peer.group_id || null
      form.alias = props.peer.alias || ''
      historyTab.value = 'in'
      loadAudits()
    }
  }, { immediate: true })
</script>

<style scoped lang="scss">
.dd {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dd-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.dd-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--ge-accent-soft);
  color: var(--ge-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.dd-title {
  flex: 1;
  min-width: 0;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--ge-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.dd-sub {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  flex-wrap: wrap;
}

.dd-id {
  font-size: 13px;
  color: var(--ge-text-2);
  font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .copy {
    cursor: pointer;
    color: var(--ge-text-3);

    &:hover {
      color: var(--el-color-primary);
    }
  }
}

.dd-close {
  font-size: 18px;
}

.dd-actions {
  display: flex;
  gap: 8px;
}

.dd-alert {
  border-radius: 10px;
}

.dd-card {
  border: 1px solid var(--ge-border);
  border-radius: var(--ge-radius);
  padding: 16px 18px;
  background: var(--ge-surface);

  h3 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 650;
    color: var(--ge-text);
  }
}

.dd-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;

  h3 {
    margin: 0;
  }
}

.dd-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  :deep(.el-select) {
    width: 100%;
  }
}

.dd-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 18px;
  margin: 0;

  dt {
    font-size: 12px;
    color: var(--ge-text-3);
    margin-bottom: 2px;
  }

  dd {
    margin: 0;
    font-size: 13px;
    color: var(--ge-text);
    word-break: break-word;
  }
}

.dd-history {
  display: flex;
  flex-direction: column;
}

.dd-h-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--ge-border);

  &:last-child {
    border-bottom: none;
  }
}

.dd-h-main {
  min-width: 0;
  display: flex;
  flex-direction: column;

  strong {
    font-size: 13px;
    font-weight: 600;
  }

  span {
    font-size: 12px;
    color: var(--ge-text-3);
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }
}

.dd-h-time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 12px;
  color: var(--ge-text-2);
  white-space: nowrap;
}

.muted {
  color: var(--ge-text-3);
}

@media (max-width: 520px) {
  .dd-form-row,
  .dd-grid {
    grid-template-columns: 1fr;
  }
}
</style>
