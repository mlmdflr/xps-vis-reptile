import { RouteRecordRaw } from 'vue-router';

const Route: RouteRecordRaw[] = [
  {
    path: '/main',
    name: 'Main',
    component: () => import('@/renderer/views/pages/main/index.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/renderer/views/pages/about/index.vue')
  }
];

export default Route;
