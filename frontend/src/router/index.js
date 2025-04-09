import { createRouter, createWebHistory } from 'vue-router'
import ClientView from '../views/ClientView.vue'
import AdminView from '../views/AdminView.vue'
import CourierView from '../views/CourierView.vue'
import DebugView from '../views/DebugView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/',
      name: 'client',
      component: ClientView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView
    },
    {
      path: '/courier',
      name: 'courier',
      component: CourierView
    },
    {
      path: '/debug',
      name: 'debug',
      component: DebugView
    }
  ]
})

export default router
