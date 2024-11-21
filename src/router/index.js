import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/baslineHome.vue';

const routes = [
  {
    path: "/",
    name: "baslineHome",
    component: Home,
  },
  // 可以新增其他路徑，例如 About, Services 等等
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;