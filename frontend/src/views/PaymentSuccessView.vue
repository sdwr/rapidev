<template>
  <div class="payment-success">
    <div class="success-container">
      <div class="success-icon">✓</div>
      <h2>Payment Successful!</h2>
      <p>Your order has been placed successfully.</p>
      <p v-if="order">Order #: {{ order.id }}</p>
      <p>Thank you for your order!</p>
      <button @click="goToOrders" class="btn-primary">View My Orders</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCheckoutSession } from '../services/paymentService';
import { getOrder } from '../api/api';

const route = useRoute();
const router = useRouter();
const order = ref(null);

onMounted(async () => {
  try {
    const sessionId = route.query.session_id;
    if (!sessionId) return;
    
    // Get session details
    const session = await getCheckoutSession(sessionId);
    
    // If session has orderId in metadata, fetch the order
    if (session.metadata?.orderId) {
      order.value = await getOrder(session.metadata.orderId);
    }
  } catch (error) {
    console.error('Error loading payment details:', error);
  }
});

const goToOrders = () => {
  router.push('/client');
};
</script>

<style scoped>
.payment-success {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.success-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 2rem;
  text-align: center;
  max-width: 90%;
  width: 500px;
}

.success-icon {
  background: #4CAF50;
  color: white;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin: 0 auto 1.5rem;
}

h2 {
  color: #333;
  margin-bottom: 1rem;
}

p {
  margin-bottom: 0.5rem;
  color: #666;
}

.btn-primary {
  background: var(--color-primary, #3498db);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  margin-top: 1.5rem;
  cursor: pointer;
  font-size: 1rem;
}
</style> 