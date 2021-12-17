import { RouteRecordRaw } from 'vue-router';

const Route: RouteRecordRaw[] = [
  {
    path: '/main',
    name: 'Main',
    component: () => import('@/renderer/views/pages/main/index.vue')
  },
  {
    path: '/img',
    name: 'Img',
    component: () => import('@/renderer/views/pages/imgtab/index.vue')
  }
];

export default Route;
