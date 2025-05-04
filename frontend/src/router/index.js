import { createRouter, createWebHistory } from 'vue-router'
import ClientView from '../views/ClientView.vue'
import AdminView from '../views/AdminView.vue'
import CourierView from '../views/CourierView.vue'
import DebugView from '../views/DebugView.vue'
import LoginView from '../views/LoginView.vue'
import DeliveriesMapView from '../views/DeliveriesMapView.vue'
import { useUserStore } from '../stores/userStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: to => {
        const userStore = useUserStore()
        if (!userStore.user) return { path: '/login' }
        
        // Redirect based on user type
        switch(userStore.user.userType) {
          case 'CLIENT': return { path: '/client' }
          case 'COURIER': return { path: '/courier' }
          case 'ADMIN': return { path: '/admin' }
          default: return { path: '/login' }
        }
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { allowUnauthenticated: true }
    },
    {
      path: '/client',
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
    },
    {
      path: '/map',
      name: 'map',
      component: DeliveriesMapView
    }
  ]
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = !!userStore.user
  const allowUnauthenticated = to.meta.allowUnauthenticated
  
  // Allow login page for unauthenticated users
  if (!isLoggedIn && !allowUnauthenticated) {
    next('/login')
    return
  }
  
  // If logged in and trying to access login page, redirect to appropriate view
  if (isLoggedIn && to.path === '/login') {
    switch(userStore.user.userType) {
      case 'CLIENT': next('/client'); break;
      case 'COURIER': next('/courier'); break;
      case 'ADMIN': next('/admin'); break;
      default: next('/login');
    }
    return
  }
  
  next()
})

export default router
