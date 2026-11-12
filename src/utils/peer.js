// Grupo Endor: o cliente envia heartbeat a cada 15 s; sem sinal há 60 s = offline
export const ONLINE_WINDOW_SECONDS = 60
export const isOnline = (lastOnlineTime) => {
  if (!lastOnlineTime) return false
  return Date.now() / 1000 - lastOnlineTime < ONLINE_WINDOW_SECONDS
}

// Datas do backend chegam como "2026-11-12 10:51:37" (horário do servidor)
export const parseServerTime = (value) => {
  if (!value) return null
  const d = new Date(String(value).replace(' ', 'T'))
  return isNaN(d.getTime()) ? null : d
}

export const connectByClient = (id) => {
  //不新开窗口打开url protocol ,格式是 rustdesk://<id>
  // window.open(`rustdesk://${row.id}`)
  let a = document.createElement('a')
  // Grupo Endor: o cliente registra o protocolo grupoendor://
  a.href = `grupoendor://${id}`
  a.target = '_self'
  a.click()

}
