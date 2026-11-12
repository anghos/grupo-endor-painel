<template>
  <div class="ge-dashboard">
    <div class="ge-page-header">
      <div>
        <h1>{{ T('Welcome', { param: userStore.username }) }}</h1>
        <p>{{ T('WelcomeSub') }} · <span class="muted">{{ T('UpdatedEvery30s') }}</span></p>
      </div>
      <el-button :icon="Refresh" @click="load" :loading="loading">{{ T('Refresh') }}</el-button>
    </div>

    <!-- Indicadores -->
    <div class="ge-kpis">
      <div class="ge-kpi" @click="go('Peer')">
        <div class="kpi-icon brand"><el-icon><Monitor/></el-icon></div>
        <div class="kpi-body">
          <span class="kpi-label">{{ T('DevicesTotal') }}</span>
          <strong class="kpi-value">{{ stats.total }}</strong>
        </div>
      </div>
      <div class="ge-kpi" @click="go('Peer', { online: 1 })">
        <div class="kpi-icon success"><el-icon><Connection/></el-icon></div>
        <div class="kpi-body">
          <span class="kpi-label">{{ T('DevicesOnline') }}</span>
          <strong class="kpi-value">{{ stats.online }}</strong>
          <span class="kpi-foot">{{ stats.offline }} {{ T('DevicesOffline').toLowerCase() }}</span>
        </div>
      </div>
      <div class="ge-kpi" @click="go('AuditConn')">
        <div class="kpi-icon info"><el-icon><DataLine/></el-icon></div>
        <div class="kpi-body">
          <span class="kpi-label">{{ T('AccessesToday') }}</span>
          <strong class="kpi-value">{{ stats.accessesToday }}</strong>
        </div>
      </div>
      <div class="ge-kpi" @click="go('DeviceGroup')">
        <div class="kpi-icon warning"><el-icon><OfficeBuilding/></el-icon></div>
        <div class="kpi-body">
          <span class="kpi-label">{{ T('Clients') }}</span>
          <strong class="kpi-value">{{ stats.clients }}</strong>
        </div>
      </div>
      <div class="ge-kpi" @click="go('UserList')">
        <div class="kpi-icon violet"><el-icon><UserFilled/></el-icon></div>
        <div class="kpi-body">
          <span class="kpi-label">{{ T('Technicians') }}</span>
          <strong class="kpi-value">{{ stats.users }}</strong>
          <span class="kpi-foot">{{ stats.loginsToday }} {{ T('LoginsToday').toLowerCase() }}</span>
        </div>
      </div>
    </div>

    <div class="ge-grid">
      <!-- Gráfico de acessos -->
      <section class="ge-panel span-2">
        <header>
          <h3>{{ T('AccessesLast7Days') }}</h3>
          <span class="muted">{{ chartTotal }}</span>
        </header>
        <div class="ge-chart">
          <div v-for="d in chart" :key="d.key" class="bar-col">
            <span class="bar-value">{{ d.count || '' }}</span>
            <div class="bar-track">
              <div class="bar" :style="{height: barHeight(d.count)}" :class="{today: d.today}"></div>
            </div>
            <span class="bar-label" :class="{today: d.today}">{{ d.label }}</span>
          </div>
        </div>
      </section>

      <!-- Dispositivos online -->
      <section class="ge-panel">
        <header>
          <h3>{{ T('OnlineDevices') }}</h3>
          <el-button link type="primary" @click="go('Peer', { online: 1 })">{{ T('SeeAll') }}</el-button>
        </header>
        <div v-if="onlineList.length" class="ge-list">
          <div v-for="p in onlineList" :key="p.row_id" class="ge-list-item">
            <div class="li-main">
              <strong>{{ p.hostname || p.id }}</strong>
              <span>{{ p.id }} · {{ groupName(p.group_id) }}<template v-if="p.alias"> · {{ T('Inventory') }} {{ p.alias }}</template></span>
            </div>
            <el-tooltip :content="T('ConnectHint')" placement="left">
              <el-button size="small" type="primary" plain @click="connectByClient(p.id)">{{ T('Connect') }}</el-button>
            </el-tooltip>
          </div>
        </div>
        <div v-else class="ge-empty">{{ T('NoData') }}</div>
      </section>

      <!-- Últimos acessos -->
      <section class="ge-panel span-2">
        <header>
          <h3>{{ T('RecentAccesses') }}</h3>
          <el-button link type="primary" @click="go('AuditConn')">{{ T('SeeAll') }}</el-button>
        </header>
        <el-table v-if="recentAccesses.length" :data="recentAccesses" size="small">
          <el-table-column :label="T('Device')" min-width="170">
            <template #default="{row}">
              <div class="cell-2">
                <strong>{{ peerName(row.peer_id) }}</strong>
                <span>{{ row.peer_id }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="T('FromName')" min-width="150">
            <template #default="{row}">
              <div class="cell-2">
                <strong>{{ row.from_name || '-' }}</strong>
                <span>{{ row.from_peer }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="T('Ip')" prop="ip" min-width="120"/>
          <el-table-column :label="T('CreatedAt')" min-width="140">
            <template #default="{row}">{{ relTime(row.created_at) }}</template>
          </el-table-column>
        </el-table>
        <div v-else class="ge-empty">{{ T('NoData') }}</div>
      </section>

      <!-- Últimos logins -->
      <section class="ge-panel">
        <header>
          <h3>{{ T('RecentLogins') }}</h3>
          <el-button link type="primary" @click="go('LoginLog')">{{ T('SeeAll') }}</el-button>
        </header>
        <div v-if="recentLogins.length" class="ge-list">
          <div v-for="l in recentLogins" :key="l.id" class="ge-list-item">
            <span class="ge-avatar-sm">{{ (userName(l.user_id) || '?').slice(0, 2).toUpperCase() }}</span>
            <div class="li-main">
              <strong>{{ userName(l.user_id) }}</strong>
              <span>{{ l.client }} · {{ l.ip }}</span>
            </div>
            <span class="muted small">{{ relTime(l.created_at) }}</span>
          </div>
        </div>
        <div v-else class="ge-empty">{{ T('NoData') }}</div>
      </section>
    </div>
  </div>
</template>

<script setup>
  import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { Connection, DataLine, Monitor, OfficeBuilding, Refresh, UserFilled } from '@element-plus/icons'
  import { list as peerList } from '@/api/peer'
  import { list as groupList } from '@/api/device_group'
  import { list as auditList } from '@/api/audit'
  import { list as loginLogList } from '@/api/login_log'
  import { list as userList } from '@/api/user'
  import { T } from '@/utils/i18n'
  import { timeAgo } from '@/utils/time'
  import { connectByClient, isOnline, parseServerTime } from '@/utils/peer'
  import { useUserStore } from '@/store/user'

  const router = useRouter()
  const userStore = useUserStore()
  const loading = ref(false)

  const peers = ref([])
  const groups = ref([])
  const users = ref([])
  const audits = ref([])
  const logins = ref([])

  const isToday = (d) => {
    if (!d) return false
    const n = new Date()
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
  }

  const stats = computed(() => {
    const online = peers.value.filter(p => isOnline(p.last_online_time)).length
    return {
      total: peers.value.length,
      online,
      offline: peers.value.length - online,
      clients: groups.value.length,
      users: users.value.length,
      accessesToday: audits.value.filter(a => isToday(parseServerTime(a.created_at))).length,
      loginsToday: logins.value.filter(l => isToday(parseServerTime(l.created_at))).length,
    }
  })

  const weekday = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
  const chart = computed(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      days.push({
        key: d.toDateString(),
        label: i === 0 ? 'hoje' : `${weekday[d.getDay()]} ${d.getDate()}`,
        today: i === 0,
        count: 0,
      })
    }
    for (const a of audits.value) {
      const d = parseServerTime(a.created_at)
      if (!d) continue
      const day = days.find(x => x.key === new Date(d.getFullYear(), d.getMonth(), d.getDate()).toDateString())
      if (day) day.count++
    }
    return days
  })
  const chartMax = computed(() => Math.max(1, ...chart.value.map(d => d.count)))
  const chartTotal = computed(() => {
    const total = chart.value.reduce((s, d) => s + d.count, 0)
    return `${total} ${total === 1 ? 'acesso' : 'acessos'}`
  })
  const barHeight = (count) => `${Math.max(count ? 6 : 2, (count / chartMax.value) * 100)}%`

  const byNewest = (a, b) => (parseServerTime(b.created_at)?.getTime() || 0) - (parseServerTime(a.created_at)?.getTime() || 0)
  const recentAccesses = computed(() => [...audits.value].sort(byNewest).slice(0, 8))
  const recentLogins = computed(() => [...logins.value].sort(byNewest).slice(0, 6))
  const onlineList = computed(() => peers.value
    .filter(p => isOnline(p.last_online_time))
    .sort((a, b) => b.last_online_time - a.last_online_time)
    .slice(0, 8))

  const peerName = (id) => {
    const p = peers.value.find(x => x.id === id)
    return p ? (p.hostname || id) : id
  }
  const groupName = (gid) => groups.value.find(g => g.id === gid)?.name || T('NoClient')
  const userName = (uid) => users.value.find(u => u.id === uid)?.username || `#${uid}`
  const relTime = (v) => {
    const d = parseServerTime(v)
    return d ? timeAgo(d.getTime()) : '-'
  }

  const go = (name, query) => router.push({ name, query })

  const fetchList = async (fn, params) => {
    const res = await fn(params).catch(_ => false)
    return res?.data?.list || []
  }

  const load = async () => {
    loading.value = true
    const [p, g, u, a, l] = await Promise.all([
      fetchList(peerList, { page: 1, page_size: 2000 }),
      fetchList(groupList, { page: 1, page_size: 999 }),
      fetchList(userList, { page: 1, page_size: 999 }),
      fetchList(auditList, { page: 1, page_size: 500 }),
      fetchList(loginLogList, { page: 1, page_size: 200 }),
    ])
    peers.value = p
    groups.value = g
    users.value = u
    audits.value = a
    logins.value = l
    loading.value = false
  }

  let timer = null
  const start = () => {
    stop()
    load()
    timer = setInterval(load, 30000)
  }
  const stop = () => {
    if (timer) clearInterval(timer)
    timer = null
  }
  onMounted(start)
  onActivated(start)
  onDeactivated(stop)
  onBeforeUnmount(stop)
</script>

<style scoped lang="scss">
.muted {
  color: var(--ge-text-3);
}

.small {
  font-size: 12px;
  white-space: nowrap;
}

.ge-kpis {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.ge-kpi {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: var(--ge-surface);
  border: 1px solid var(--ge-border);
  border-radius: var(--ge-radius);
  box-shadow: var(--ge-shadow);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--ge-shadow-lg);
    border-color: var(--el-color-primary-light-7);
  }
}

.kpi-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 21px;
  flex-shrink: 0;

  &.brand { background: var(--ge-accent-soft); color: var(--ge-accent); }
  &.success { background: var(--ge-success-soft); color: var(--ge-success); }
  &.info { background: color-mix(in srgb, #0ea5e9 14%, transparent); color: #0ea5e9; }
  &.warning { background: color-mix(in srgb, #f59e0b 16%, transparent); color: #d97706; }
  &.violet { background: color-mix(in srgb, #8b5cf6 14%, transparent); color: #8b5cf6; }
}

.kpi-body {
  display: flex;
  flex-direction: column;
  min-width: 0;

  .kpi-label {
    font-size: 12px;
    color: var(--ge-text-2);
    font-weight: 500;
  }

  .kpi-value {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--ge-text);
    letter-spacing: -0.02em;
  }

  .kpi-foot {
    font-size: 11px;
    color: var(--ge-text-3);
  }
}

.ge-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.ge-panel {
  background: var(--ge-surface);
  border: 1px solid var(--ge-border);
  border-radius: var(--ge-radius);
  box-shadow: var(--ge-shadow);
  padding: 18px 20px;
  min-width: 0;

  &.span-2 {
    grid-column: span 2;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;

    h3 {
      margin: 0;
      font-size: 15px;
      font-weight: 650;
      color: var(--ge-text);
    }
  }
}

.ge-chart {
  height: 220px;
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding-top: 8px;

  .bar-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .bar-value {
    font-size: 12px;
    font-weight: 600;
    color: var(--ge-text-2);
    height: 16px;
  }

  .bar-track {
    flex: 1;
    width: 100%;
    max-width: 56px;
    display: flex;
    align-items: flex-end;
    border-bottom: 1px solid var(--ge-border);
  }

  .bar {
    width: 100%;
    border-radius: 8px 8px 0 0;
    background: var(--el-color-primary-light-5);
    transition: height 0.4s ease;

    &.today {
      background: var(--el-color-primary);
    }
  }

  .bar-label {
    font-size: 12px;
    color: var(--ge-text-3);
    white-space: nowrap;

    &.today {
      color: var(--el-color-primary);
      font-weight: 700;
    }
  }
}

.ge-list {
  display: flex;
  flex-direction: column;
}

.ge-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--ge-border);

  &:last-child {
    border-bottom: none;
  }
}

.li-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;

  strong {
    font-size: 13px;
    font-weight: 600;
    color: var(--ge-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    font-size: 12px;
    color: var(--ge-text-3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.ge-avatar-sm {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--ge-accent-soft);
  color: var(--ge-accent);
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

.cell-2 {
  display: flex;
  flex-direction: column;
  line-height: 1.3;

  strong {
    font-weight: 600;
  }

  span {
    font-size: 12px;
    color: var(--ge-text-3);
  }
}

@media (max-width: 1280px) {
  .ge-kpis {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .ge-grid {
    grid-template-columns: 1fr;
  }
  .ge-panel.span-2 {
    grid-column: auto;
  }
}

@media (max-width: 640px) {
  .ge-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
