<template>
  <div class="order-form">
    <h2>New Order</h2>
    <form @submit.prevent="submitOrder">
      <div class="form-group">
        <label for="deliveryAddress">Delivery Address</label>
        <textarea
          id="deliveryAddress"
          v-model="orderData.deliveryAddress"
          placeholder="Enter delivery address"
          rows="3"
          required
        ></textarea>
      </div>

      <div class="items-section">
        <h3>Items</h3>
        <div v-for="(item, index) in orderData.items" :key="index" class="item-entry">
          <div class="form-group">
            <label :for="'item-desc-'+index">Description</label>
            <input
              :id="'item-desc-'+index"
              type="text"
              v-model="item.description"
              placeholder="Item description"
              required
            >
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label :for="'item-qty-'+index">Quantity</label>
              <input
                :id="'item-qty-'+index"
                type="number"
                v-model="item.quantity"
                min="1"
                required
              >
            </div>
            
            <div class="form-group">
              <label :for="'item-size-'+index">Size</label>
              <select :id="'item-size-'+index" v-model="item.size" required>
                <option v-for="size in sizes" :key="size" :value="size">
                  {{ size }}
                </option>
              </select>
            </div>
          </div>
          
          <button 
            type="button" 
            class="remove-item" 
            @click="removeItem(index)"
            v-if="orderData.items.length > 1"
          >
            Remove Item
          </button>
        </div>

        <button type="button" class="add-item" @click="addItem">
          Add Another Item
        </button>
      </div>

      <button type="submit" class="submit-order">Create Order</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Size, OrderStatus } from '@/models/Order'

const emit = defineEmits(['order-created'])

const sizes = Object.values(Size)

const orderData = ref({
  deliveryAddress: '',
  items: [{
    description: '',
    quantity: 1,
    size: Size.SMALL
  }]
})

const addItem = () => {
  orderData.value.items.push({
    description: '',
    quantity: 1,
    size: Size.SMALL
  })
}

const removeItem = (index) => {
  orderData.value.items.splice(index, 1)
}

const submitOrder = () => {
  const order = {
    ...orderData.value,
    status: OrderStatus.DRAFT,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  console.log('Submitting order:', order)
  emit('order-created', order)
}
</script>

<style scoped>
.order-form {
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.items-section {
  margin: 1.5rem 0;
}

.item-entry {
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input, textarea, select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
}

.add-item {
  background: #2196F3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
}

.remove-item {
  background: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.5rem;
}

.submit-order {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  width: 100%;
  margin-top: 1rem;
  transition: background-color 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.submit-order:hover {
  background: #45a049;
}

.submit-order:active {
  transform: translateY(1px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style> 