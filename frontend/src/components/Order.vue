<template>
  <div class="order-form">
    <!-- Pickup Address Selection -->
    <div class="form-group">
      <label class="form-label" for="pickupAddress">Pickup Address</label>
      <AddressSelector
        id="pickupAddress"
        label="Pickup"
        :addresses="pickupAddresses"
        v-model="orderData.pickupAddress"
        :selectedAddressId="selectedPickupAddressId"
        :profileType="'PICKUP'"
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
          <p>${{ getDeliveryFee(index) }}</p>
          <button 
            type="button" 
            @click="removeDeliveryItem(index)" 
            class="remove-item-btn"
            v-if="orderData.deliveryItems.length > 1"
          >
            ✕
          </button>
        </div>
        
        <div class="address-selectors">
          <AddressSelector
            :id="`deliveryAddress-${index}`"
            label="Delivery"
            :addresses="deliveryAddresses"
            :selectedAddressId="selectedDeliveryAddressId"
            :profileType="'DELIVERY'"
            v-model="item.deliveryAddress"
            @address-added="addAddress"
            @address-selected="(address) => handleDeliveryAddressSelected(index, address)"
          />
        </div>
        
        <div class="form-group">
          <input 
            type="tel"
            :id="`deliveryPhone-${index}`" 
            v-model="item.deliveryPhone" 
            placeholder="Enter delivery phone number (10 digits)"
            maxlength="10"
            @input="(event) => onPhoneInput(event, index)"
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

        <!-- Map View - show only when both addresses are selected -->
        <div v-if="item.deliveryAddress && orderData.pickupAddress" class="delivery-map">
          <MapView
            :locations="[
              { address: orderData.pickupAddress, type: 'PICKUP' },
              { address: item.deliveryAddress, type: 'DELIVERY' }
            ]"
            size="inline"
            :showControls="false"
            @routeUpdated="(time) => updateDeliveryFee(index, time)"
          />
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

    <div class="order-summary">
      <p>Delivery Price: ${{ total }}</p>
      <p>Booking Fee: ${{ bookingFee }}</p>
      <p>Total: ${{ total }}</p>
    </div>

    <!-- Submit Button -->
    <button 
      type="submit" 
      @click.prevent="submitOrder" 
      class="submit-btn" 
      :disabled="!isFormValid || isSubmitting"
    >
      {{ isSubmitting ? 'Placing Order...' : 'Pay for Order' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import AddressSelector from './AddressSelector.vue'
import { getOrder,createOrder, createProfile, getProfilesForUserByProfileType, createReceipt } from '../api/api'
import { ReceiptStatusEnum } from '../shared/enums/ReceiptEnums'
import { formatPhoneNumber } from '../utils'
import { createCheckoutSession } from '../services/paymentService'
import { toast } from 'vue3-toastify'
import MapView from './MapView.vue'

const emit = defineEmits(['order-created'])
const userStore = useUserStore()

// Mock addresses for the dropdown
const pickupAddresses = ref([])
const deliveryAddresses = ref([])
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

const selectedPickupAddressId = ref(0)
const selectedDeliveryAddressId = ref(0)

// Modify delivery fee calculation based on drive time
const deliveryFees = ref({})

const updateDeliveryFee = (index, durationInSeconds) => {
  // Base fee of $10
  const baseFee = 10
  // Add $5 for every 15 minutes of driving
  const timeBasedFee = Math.ceil(durationInSeconds / 900) * 5
  deliveryFees.value[index] = baseFee + timeBasedFee
}

const getDeliveryFee = (index) => {
  return deliveryFees.value[index] || 15 // Default fee if route not calculated
}

const bookingFee = 3.99
const total = computed(() => {
  const totalDeliveryFees = Object.values(deliveryFees.value).reduce((sum, fee) => sum + fee, 0)
  return totalDeliveryFees + bookingFee
})

const isSubmitting = ref(false)

// Format and limit phone number as user types
const onPhoneInput = (event, index) => {
  // Format the phone number for the specific delivery item
  const input = event.target;
  orderData.value.deliveryItems[index].deliveryPhone = formatPhoneNumber(input.value);
}

const addAddress = async (newAddress) => {
  newAddress.userId = userStore.user.id
  const profile = await createProfile(newAddress)
  //reload the addresses
  await loadAddresses()

  if (profile.profileType === 'PICKUP') {
    selectedPickupAddressId.value = profile.id
  } else if (profile.profileType === 'DELIVERY') {
    selectedDeliveryAddressId.value = profile.id
  }
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
  try {
    isSubmitting.value = true;
    
    orderData.value.clientId = userStore.user.id
    const order = await createOrder(orderData.value)
    const receiptData = {
      orderId: order.id,
      deliveryFee: total.value,
      bookingFee,
      discount: 0,
      total: total.value,
      amountPaid: total.value,
      receiptStatus: ReceiptStatusEnum.PAID
    }

    const receipt = await createReceipt(receiptData)

    //reload the order
    const updatedOrder = await getOrder(order.id)
    orderData.value = updatedOrder

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
    
    // Create a Stripe checkout session
    const { sessionId, url } = await createCheckoutSession({
      orderId: updatedOrder.id,
      amount: total.value,
      customerEmail: userStore.user.email,
      customerName: userStore.user.name,
      metadata: {
        // Any additional metadata you want to include
      }
    });
    
    // Redirect to Stripe Checkout
    window.location.href = url;
    
  } catch (error) {
    console.error('Error submitting order:', error);
    toast.error('Failed to create order');
    isSubmitting.value = false;
  }
}

onMounted(async () => {
  await loadAddresses()
})

const loadAddresses = async () => {
  const pickupProfiles = await getProfilesForUserByProfileType(userStore.user.id, 'PICKUP')
  pickupAddresses.value = pickupProfiles
  const deliveryProfiles = await getProfilesForUserByProfileType(userStore.user.id, 'DELIVERY')
  deliveryAddresses.value = deliveryProfiles
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

.delivery-map {
  margin: 1rem 0;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}
</style> 