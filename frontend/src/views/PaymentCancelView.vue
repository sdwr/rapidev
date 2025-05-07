<template>
  <div class="payment-cancel">
    <div class="cancel-container">
      <div class="cancel-icon">✕</div>
      <h2>Payment Cancelled</h2>
      <p>Your payment was cancelled and no charges were made.</p>
      <p>You can try again or contact customer support if you need assistance.</p>
      <div class="buttons">
        <button @click="tryAgain" class="btn-primary">Try Again</button>
        <button @click="goHome" class="btn-secondary">Go Home</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const tryAgain = () => {
  // Go back to the order creation page
  router.push('/client');
};

const goHome = () => {
  // Go to the home page
  router.push('/');
};
</script>

<style scoped>
.payment-cancel {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.cancel-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 2rem;
  text-align: center;
  max-width: 90%;
  width: 500px;
}

.cancel-icon {
  background: #f44336;
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

.buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.btn-primary {
  background: var(--color-primary, #3498db);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-secondary {
  background: #f7f7f7;
  color: #333;
  border: 1px solid #ccc;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
</style> 