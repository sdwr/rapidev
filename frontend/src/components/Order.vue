<template>
  <div class="order-form">
    <!-- Pickup Address Selection -->
    <div class="form-group">
      <label for="pickupAddress">Pickup Address</label>
      
      <div class="address-input-container">
        <!-- Back button when creating a new address -->
        <button 
          v-if="isCreatingNewPickupAddress" 
          type="button" 
          @click="cancelNewPickupAddress" 
          class="back-btn"
          aria-label="Cancel new pickup address"
        >
          ←
        </button>
        
        <!-- Dropdown when not creating a new address -->
        <select 
          v-if="!isCreatingNewPickupAddress"
          id="pickupAddress" 
          v-model="selectedPickupOption" 
          class="address-select"
          required
        >
          <option value="" disabled>Select a pickup address</option>
          <option value="new">+ Create new address</option>
          <option 
            v-for="address in addresses" 
            :key="address.id" 
            :value="address.id"
          >
            {{ address.name }} - {{ address.address }}
          </option>
        </select>
        
        <!-- Text input when creating a new address -->
        <input
          v-else
          type="text"
          v-model="orderData.pickupAddress"
          placeholder="Enter new pickup address"
          required
          class="new-address-input"
        />
        
        <!-- Confirm button for new address -->
        <button 
          v-if="isCreatingNewPickupAddress && orderData.pickupAddress" 
          type="button" 
          @click="confirmNewPickupAddress" 
          class="confirm-btn"
          aria-label="Confirm new pickup address"
        >
          ✓
        </button>
      </div>
    </div>

    <!-- Spacer -->
    <div class="spacer"></div>

    <!-- Delivery Address -->
    <div class="form-group">
      <label for="deliveryAddress">Delivery Address</label>
      
      <div class="address-input-container">
        <!-- Back button when creating a new address -->
        <button 
          v-if="isCreatingNewDeliveryAddress" 
          type="button" 
          @click="cancelNewDeliveryAddress" 
          class="back-btn"
          aria-label="Cancel new delivery address"
        >
          ←
        </button>
        
        <!-- Dropdown when not creating a new address -->
        <select 
          v-if="!isCreatingNewDeliveryAddress"
          id="deliveryAddress" 
          v-model="selectedDeliveryOption" 
          class="address-select"
          required
        >
          <option value="" disabled>Select a delivery address</option>
          <option value="new">+ Create new address</option>
          <option 
            v-for="address in addresses" 
            :key="address.id" 
            :value="address.id"
          >
            {{ address.name }} - {{ address.address }}
          </option>
        </select>
        
        <!-- Text input when creating a new address -->
        <input
          v-else
          type="text"
          v-model="orderData.deliveryAddress"
          placeholder="Enter new delivery address"
          required
          class="new-address-input"
        />
        
        <!-- Confirm button for new address -->
        <button 
          v-if="isCreatingNewDeliveryAddress && orderData.deliveryAddress" 
          type="button" 
          @click="confirmNewDeliveryAddress" 
          class="confirm-btn"
          aria-label="Confirm new delivery address"
        >
          ✓
        </button>
      </div>
    </div>

    <!-- Delivery Notes -->
    <div class="form-group">
      <label for="deliveryNotes">Delivery Notes</label>
      <textarea 
        id="deliveryNotes" 
        v-model="orderData.deliveryNotes" 
        placeholder="Add any special instructions for the delivery"
        class="delivery-notes"
      ></textarea>
      
      <button 
        type="button" 
        @click="addItem" 
        class="add-item-btn"
      >
        + Add Item
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
import { ref, computed, watch } from 'vue'
import { useUserStore } from '../stores/userStore'

const emit = defineEmits(['order-created'])
const userStore = useUserStore()

// Mock addresses for the dropdown
const addresses = ref([
  { id: '1', name: 'Home', address: '123 Main St, Anytown, USA' },
  { id: '2', name: 'Work', address: '456 Business Ave, Commerce City, USA' },
  { id: '3', name: 'Gym', address: '789 Fitness Blvd, Healthville, USA' }
])

const selectedPickupOption = ref('')
const selectedDeliveryOption = ref('')
const isCreatingNewPickupAddress = ref(false)
const isCreatingNewDeliveryAddress = ref(false)

const orderData = ref({
  pickupAddress: '',
  deliveryAddress: '',
  deliveryNotes: '',
  items: [
    { description: '', quantity: 1, size: 'MEDIUM' }
  ]
})

const isSubmitting = ref(false)

// Watch for changes to selectedPickupOption
watch(selectedPickupOption, (newValue) => {
  if (newValue === 'new') {
    isCreatingNewPickupAddress.value = true
    orderData.value.pickupAddress = ''
  } else if (newValue) {
    isCreatingNewPickupAddress.value = false
    const selectedAddress = addresses.value.find(a => a.id === newValue)
    if (selectedAddress) {
      orderData.value.pickupAddress = selectedAddress.address
    }
  }
})

// Watch for changes to selectedDeliveryOption
watch(selectedDeliveryOption, (newValue) => {
  if (newValue === 'new') {
    isCreatingNewDeliveryAddress.value = true
    orderData.value.deliveryAddress = ''
  } else if (newValue) {
    isCreatingNewDeliveryAddress.value = false
    const selectedAddress = addresses.value.find(a => a.id === newValue)
    if (selectedAddress) {
      orderData.value.deliveryAddress = selectedAddress.address
    }
  }
})

const cancelNewPickupAddress = () => {
  isCreatingNewPickupAddress.value = false
  selectedPickupOption.value = ''
  orderData.value.pickupAddress = ''
}

const cancelNewDeliveryAddress = () => {
  isCreatingNewDeliveryAddress.value = false
  selectedDeliveryOption.value = ''
  orderData.value.deliveryAddress = ''
}

const confirmNewPickupAddress = () => {
  // In a real implementation, we would save this address to the user's profile
  // For now, just add it to the addresses list
  const newId = `new-${Date.now()}`
  const newAddress = {
    id: newId,
    name: 'New Address',
    address: orderData.value.pickupAddress
  }
  
  addresses.value.push(newAddress)
  selectedPickupOption.value = newId
  isCreatingNewPickupAddress.value = false
}

const confirmNewDeliveryAddress = () => {
  // In a real implementation, we would save this address to the user's profile
  // For now, just add it to the addresses list
  const newId = `new-${Date.now() + 1}`
  const newAddress = {
    id: newId,
    name: 'New Address',
    address: orderData.value.deliveryAddress
  }
  
  addresses.value.push(newAddress)
  selectedDeliveryOption.value = newId
  isCreatingNewDeliveryAddress.value = false
}

const isFormValid = computed(() => {
  // Basic validation
  if (!isCreatingNewPickupAddress.value && !selectedPickupOption.value) return false
  if (isCreatingNewPickupAddress.value && !orderData.value.pickupAddress) return false
  
  if (!isCreatingNewDeliveryAddress.value && !selectedDeliveryOption.value) return false
  if (isCreatingNewDeliveryAddress.value && !orderData.value.deliveryAddress) return false
  
  // Check if all items have a description
  const allItemsValid = orderData.value.items.every(
    item => item.description && item.quantity > 0 && item.size
  )
  
  return allItemsValid
})

const addItem = () => {
  // Add a new item with the delivery address as description
  orderData.value.items.push({
    description: orderData.value.deliveryAddress || 'Delivery item',
    quantity: 1,
    size: 'MEDIUM'
  })
}

const removeItem = (index: number) => {
  if (orderData.value.items.length > 1) {
    orderData.value.items.splice(index, 1)
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
      deliveryAddress: '',
      deliveryNotes: '',
      items: [{ description: '', quantity: 1, size: 'MEDIUM' }]
    }
    selectedPickupOption.value = ''
    selectedDeliveryOption.value = ''
    isCreatingNewPickupAddress.value = false
    isCreatingNewDeliveryAddress.value = false
    
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
  gap: 0.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  margin: 10px 0;
}

.spacer {
  height: 20px;
  background-color: #000;
  margin: 0 0;
  opacity: 0.2;
}

.address-input-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.back-btn {
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: bold;
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

.confirm-btn {
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: bold;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

.address-select, .new-address-input {
  width: 100%;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
}

label {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

input, textarea, select {
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

textarea {
  min-height: 100px;
  resize: vertical;
}

.address-select {
  cursor: pointer;
}

.order-item {
  margin-bottom: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.75rem;
  background: var(--color-background);
}

.item-row {
  display: grid;
  grid-template-columns: 1fr 120px 80px 40px;
  gap: 0.75rem;
  align-items: center;
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
  padding: 0.5rem;
  cursor: pointer;
  font-weight: bold;
  margin-top: 0.5rem;
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
  margin-top: 1rem;
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