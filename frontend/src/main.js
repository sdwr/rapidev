import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Vue3Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const app = createApp(App)

app.use(router)
app.use(Vue3Toastify, {
  autoClose: 3000, // Auto close after 3 seconds
  position: 'top-right', // Position of the toast
  pauseOnFocusLoss: false, // Don't pause when window loses focus
  closeOnClick: true,      // Close when clicked
  pauseOnHover: true       // Pause on hover
})

app.mount('#app')
