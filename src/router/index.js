import { createRouter, createWebHashHistory } from 'vue-router'

const constantRoutes = [
  {
    // Grupo Endor: destino decidido em permission.js (admin -> Início, técnico -> perfil)
    path: '/',
    name: 'Root',
    meta: { title: 'Dashboard' },
    component: { render: () => null },
  },
  {
    path: '/login',
    name: 'Login',
    meta: { title: 'Login' },
    component: () => import('@/views/login/login.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    meta: { title: 'Register' },
    component: () => import('@/views/register/index.vue'),
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404.vue'),
    hidden: true,
  },
  {
    path: '/oauth/:code',
    meta: { title: 'OauthLogin' },
    component: () => import('@/views/oauth/login.vue'),
    hidden: true,
  },
  {
    path: '/oauth/bind/:code',
    meta: { title: 'OauthBind' },
    component: () => import('@/views/oauth/bind.vue'),
    hidden: true,
  },
]

const Layout = () => import('@/layout/index.vue')

// Grupo Endor: menu agrupado por assunto. Os "name" das rotas são os mesmos do
// projeto original, pois o backend libera as telas por nome (admin = "*").
export const asyncRoutes = [
  {
    path: '/inicio',
    name: 'Home',
    meta: { title: 'MenuHome', icon: 'House' },
    component: Layout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        meta: { title: 'Dashboard', icon: 'House' },
        component: () => import('@/views/dashboard/index.vue'),
      },
    ],
  },
  {
    path: '/dispositivos',
    name: 'Devices',
    meta: { title: 'MenuDevices', icon: 'Monitor' },
    component: Layout,
    children: [
      {
        path: '',
        name: 'Peer',
        meta: { title: 'PeerManage', icon: 'Monitor' },
        component: () => import('@/views/peer/index.vue'),
      },
    ],
  },
  {
    path: '/clientes',
    name: 'Clients',
    meta: { title: 'MenuClients', icon: 'OfficeBuilding' },
    component: Layout,
    children: [
      {
        path: '',
        name: 'DeviceGroup',
        meta: { title: 'Clients', icon: 'OfficeBuilding' },
        component: () => import('@/views/clients/index.vue'),
      },
    ],
  },
  {
    path: '/acessos',
    name: 'Access',
    meta: { title: 'MenuAccess', icon: 'DataLine' },
    component: Layout,
    children: [
      {
        path: 'conexoes',
        name: 'AuditConn',
        meta: { title: 'AuditConnLog', icon: 'Tickets' },
        component: () => import('@/views/audit/connList.vue'),
      },
      {
        path: 'arquivos',
        name: 'AuditFile',
        meta: { title: 'AuditFileLog', icon: 'Files' },
        component: () => import('@/views/audit/fileList.vue'),
      },
      {
        path: 'logins',
        name: 'LoginLog',
        meta: { title: 'LoginLog', icon: 'List' },
        component: () => import('@/views/login/log.vue'),
      },
      {
        path: 'compartilhamentos',
        name: 'ShareRecord',
        meta: { title: 'ShareRecord', icon: 'Share' },
        component: () => import('@/views/share_record/index.vue'),
      },
    ],
  },
  {
    path: '/user',
    name: 'User',
    redirect: '/user/index',
    meta: { title: 'MenuTeam', icon: 'UserFilled' },
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'UserList',
        meta: { title: 'UserManage', icon: 'User' },
        component: () => import('@/views/user/index.vue'),
      },
      {
        path: 'add',
        name: 'UserAdd',
        meta: { title: 'UserAdd', hide: true },
        component: () => import('@/views/user/edit.vue'),
      },
      {
        path: 'edit/:id',
        name: 'UserEdit',
        meta: { title: 'UserEdit', hide: true },
        component: () => import('@/views/user/edit.vue'),
      },
      {
        path: 'group',
        name: 'UserGroup',
        meta: { title: 'GroupManage', icon: 'ChatRound' },
        component: () => import('@/views/group/index.vue'),
      },
      {
        path: 'sessoes',
        name: 'UserToken',
        meta: { title: 'UserToken', icon: 'Ticket' },
        component: () => import('@/views/user/token.vue'),
      },
    ],
  },
  {
    path: '/catalogo',
    name: 'AddressBookRoot',
    meta: { title: 'MenuAddressBook', icon: 'Notebook' },
    component: Layout,
    children: [
      {
        path: 'catalogos',
        name: 'UserAddressBookName',
        meta: { title: 'AddressBookNameManage', icon: 'Collection' },
        component: () => import('@/views/address_book/collection.vue'),
      },
      {
        path: 'enderecos',
        name: 'UserAddressBook',
        meta: { title: 'AddressBookManage', icon: 'Notebook' },
        component: () => import('@/views/address_book/index.vue'),
      },
      {
        path: 'etiquetas',
        name: 'UserTag',
        meta: { title: 'TagsManage', icon: 'CollectionTag' },
        component: () => import('@/views/tag/index.vue'),
      },
    ],
  },
  {
    path: '/servidor',
    name: 'Server',
    meta: { title: 'MenuServer', icon: 'Setting' },
    component: Layout,
    children: [
      {
        path: 'controle',
        name: 'ServerCmd',
        meta: { title: 'ServerCmd', icon: 'Tools' },
        component: () => import('@/views/rustdesk/control.vue'),
      },
      {
        path: 'oauth',
        name: 'Oauth',
        meta: { title: 'OauthManage', icon: 'Link' },
        component: () => import('@/views/oauth/index.vue'),
      },
    ],
  },
  {
    path: '/my',
    name: 'My',
    redirect: '/my/perfil',
    meta: { title: 'MenuMyAccount', icon: 'Avatar' },
    component: Layout,
    children: [
      {
        path: 'perfil',
        name: 'MyInfo',
        meta: { title: 'Userinfo', icon: 'User' },
        component: () => import('@/views/my/info.vue'),
      },
      {
        path: 'peer',
        name: 'MyPeer',
        meta: { title: 'MyPeer', icon: 'Monitor' },
        component: () => import('@/views/my/peer/index.vue'),
      },
      {
        path: 'address_book_collection',
        name: 'MyAddressBookCollection',
        meta: { title: 'AddressBookName', icon: 'Collection' },
        component: () => import('@/views/my/address_book/collection.vue'),
      },
      {
        path: 'address_book',
        name: 'MyAddressBookList',
        meta: { title: 'AddressBooks', icon: 'Notebook' },
        component: () => import('@/views/my/address_book/index.vue'),
      },
      {
        path: 'tag',
        name: 'MyTagList',
        meta: { title: 'Tags', icon: 'CollectionTag' },
        component: () => import('@/views/my/tag/index.vue'),
      },
      {
        path: 'shareRecord',
        name: 'MyShareRecordList',
        meta: { title: 'ShareRecord', icon: 'Share' },
        component: () => import('@/views/my/share_record/index.vue'),
      },
      {
        path: 'loginLog',
        name: 'MyLoginLog',
        meta: { title: 'LoginLog', icon: 'List' },
        component: () => import('@/views/my/login_log/index.vue'),
      },
    ],
  },
]
export const lastRoutes = [
  { path: '/:catchAll(.*)', redirect: '/404', meta: { hide: true } },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
})
