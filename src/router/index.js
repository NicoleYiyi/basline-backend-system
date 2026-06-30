import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/baslineHome.vue';
import AuthView from '@/views/baslineAuthView.vue';
import Classlist from '@/views/baslineClasslist.vue';
import ClassCategorylist from '@/views/baslineClassCategorylist.vue'
import Teacherlist from '@/views/baslineTeacherlist.vue';
import Classroomlist from '@/views/baslineClassroomlist.vue';
import Salesmanagement from '@/views/baslineSalesmanagement.vue';
import Memberlist from '@/views/baslineMemberlist.vue';
import Permissionmanagement from '@/views/baslinePermissionmanagement.vue';
import Accountlist from '@/views/baslineAccountlist.vue';
import Notification from '@/views/baslineNotification.vue';
import Plansetting from '@/views/baslinePlansetting.vue';
import Venuesetting from '@/views/baslineVenuesetting.vue';
import Generalsetting from '@/views/baslineGeneralsetting.vue';
import Allclass from '@/views/baslineAllclass.vue';
import Profile from '@/views/baslineProfile.vue'
import Ordermanagement from '@/views/baslineOrdermanagement.vue'


const routes = [
  {
    path: "/",
    name: "baslineHome",
    component: Home,
  },
  {
    path: "/login",
    name: "baslineAuthView",
    component: AuthView,
  },
  {
    path: "/allclass",
    name: "baslineAllclass",
    component: Allclass,
  },
  {
    path: "/classlist",
    name: "baslineClasslist",
    component: Classlist,
  },
  {
    path: "/classcategorylist",
    name: "baslineClassCategorylist",
    component: ClassCategorylist,
  },
  {
    path: "/teacherlist",
    name: "baslineTeacherlist",
    component: Teacherlist,
  },
  {
    path: "/classroomlist",
    name: "baslineClassroomlist",
    component: Classroomlist,
  },
  {
    path: "/salesmanagement",
    name: "baslineSalesmanagement",
    component: Salesmanagement,
  },
  {
    path: "/memberlist",
    name: "baslineMemberlist",
    component: Memberlist,
  },
  {
    path: "/permissionmanagement",
    name: "baslinePermissionmanagement",
    component: Permissionmanagement,
  },
  {
    path: "/accountlist",
    name: "baslineAccountlist",
    component: Accountlist,
  },
  {
    path: "/notification",
    name: "baslineNotification",
    component: Notification,
  },
  {
    path: "/plansetting",
    name: "baslinePlansetting",
    component: Plansetting,
  },
  {
    path: "/venuesetting",
    name: "baslineVenuesetting",
    component: Venuesetting,
  },
  {
    path: "/generalsetting",
    name: "baslineGeneralsetting",
    component: Generalsetting,
  },
  {
    path: "/profile",
    name: "baslineProfile",
    component: Profile,
  },
  {
    path: "/ordermanagement",
    name: "baslineOrdermanagement",
    component: Ordermanagement,
  },
  // 可以新增其他路徑
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to) => {
  const isLoggedIn = Boolean(localStorage.getItem('token'));

  if (to.name === 'baslineAuthView' && isLoggedIn) {
    return { name: 'baslineHome' };
  }

  if (to.name !== 'baslineAuthView' && !isLoggedIn) {
    return {
      name: 'baslineAuthView',
      query: { redirect: to.fullPath },
    };
  }

  return true;
});


export default router;
