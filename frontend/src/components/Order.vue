<template>
  <div class="order-form">
    <!-- Pickup Address Selection -->
    <div class="form-group">
      <label class="form-label" for="pickupAddress">Pickup Address</label>
      <AddressSelector
        id="pickupAddress"
        label="Pickup"
        :addresses="addresses"
        v-model="orderData.pickupAddress"
        @address-added="addAddress"
        @address-selected="handlePickupAddressSelected"
      />
    </div>

    <!-- Spacer -->
    <div class="spacer"></div>

    <!-- Delivery Items -->
    <div class="delivery-items-container">
      <label class="form-label" for="deliveries">Deliveries</label>
      
      <div 
        v-for="(item, index) in orderData.deliveryItems" 
        :key="index"
        class="delivery-item"
      >
        <div class="delivery-item-header">
          <h4>Item {{ index + 1 }}</h4>
          <button 
            type="button" 
            @click="removeDeliveryItem(index)" 
            class="remove-item-btn"
            v-if="orderData.deliveryItems.length > 1"
          >
            ✕
          </button>
        </div>
        
        <div class="form-group">
          <AddressSelector
            :id="`deliveryAddress-${index}`"
            label="Delivery"
            :addresses="addresses"
            v-model="item.deliveryAddress"
            @address-added="addAddress"
            @address-selected="(address) => handleDeliveryAddressSelected(index, address)"
          />
        </div>
        
        <div class="form-group">
          <input 
            :id="`deliveryPhone-${index}`" 
            v-model="item.deliveryPhone" 
            placeholder="Enter delivery phone number"
            required
          />
        </div>
        
        <div class="form-group">
          <textarea 
            :id="`deliveryNotes-${index}`" 
            v-model="item.deliveryNotes" 
            placeholder="Add any special instructions for this delivery"
            class="delivery-notes"
          ></textarea>
        </div>
      </div>
      
      <button 
        type="button" 
        @click="addDeliveryItem" 
        class="add-item-btn"
      >
        + Add Delivery Item
      </button>
    </div>

    <!-- Submit Button -->
    <button 
      type="submit" 
      @click.prevent="submitOrder" 
      class="submit-btn" 
      :disabled="!isFormValid || isSubmitting"
    >
      {{ isSubmitting ? 'Placing Order...' : 'Place Order' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/userStore'
import AddressSelector from './AddressSelector.vue'

const emit = defineEmits(['order-created'])
const userStore = useUserStore()

// Mock addresses for the dropdown
const addresses = ref([
  { id: '1', name: 'Home', address: '123 Main St, Anytown, USA' },
  { id: '2', name: 'Work', address: '456 Business Ave, Commerce City, USA' },
  { id: '3', name: 'Gym', address: '789 Fitness Blvd, Healthville, USA' }
])

const orderData = ref({
  pickupAddress: '',
  deliveryItems: [
    {
      deliveryAddress: '',
      deliveryPhone: '',
      deliveryNotes: '',
      selectedAddressId: ''
    }
  ]
})

const isSubmitting = ref(false)

const addAddress = (newAddress) => {
  addresses.value.push(newAddress)
}

const handlePickupAddressSelected = (address) => {
  // Store the selected address ID for reference
  orderData.value.selectedPickupAddressId = address.id
}

const handleDeliveryAddressSelected = (index, address) => {
  // Store the selected address ID for reference
  orderData.value.deliveryItems[index].selectedAddressId = address.id
}

const isFormValid = computed(() => {
  // Basic validation
  if (!orderData.value.pickupAddress) return false
  
  // Check if all delivery items have required fields
  const allItemsValid = orderData.value.deliveryItems.every(item => {
    return !!item.deliveryAddress && !!item.deliveryPhone;
  });
  
  return allItemsValid;
})

const addDeliveryItem = () => {
  orderData.value.deliveryItems.push({
    deliveryAddress: '',
    deliveryPhone: '',
    deliveryNotes: '',
    selectedAddressId: ''
  })
}

const removeDeliveryItem = (index) => {
  if (orderData.value.deliveryItems.length > 1) {
    orderData.value.deliveryItems.splice(index, 1)
  }
}

const submitOrder = async () => {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    // In a real implementation, we would call an API here
    console.log('Submitting order:', orderData.value)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Emit the created order
    emit('order-created', orderData.value)
    
    // Reset the form
    orderData.value = {
      pickupAddress: '',
      deliveryItems: [
        {
          deliveryAddress: '',
          deliveryPhone: '',
          deliveryNotes: '',
          selectedAddressId: ''
        }
      ]
    }
    
  } catch (error) {
    console.error('Error creating order:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.order-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0.5rem 0;
}

.form-label {
  font-weight: normal;
  font-size: 1.2rem;
}

.spacer {
  height: 20px;
  background-color: var(--color-background);
}

.delivery-items-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.delivery-item {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: var(--color-background-soft);
}

.delivery-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.5rem;
}

.delivery-item-header h4 {
  margin: 0;
  font-size: 1.1rem;
}

label {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

input, textarea {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
}

.delivery-notes {
  min-height: 80px;
  resize: vertical;
}

.remove-item-btn {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.875rem;
}

.add-item-btn {
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem;
  cursor: pointer;
  font-weight: bold;
  margin-top: 0.5rem;
  font-size: 1rem;
}

.submit-btn {
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 1rem;
  font-size: 1.125rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background: #45a049;
}

.submit-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}
</style> 