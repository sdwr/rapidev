import { createRouter, createWebHistory } from 'vue-router'
import ClientView from '../views/ClientView.vue'
import AdminView from '../views/AdminView.vue'
import CourierView from '../views/CourierView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
    }
  ]
})

export default router
