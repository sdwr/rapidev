<template>
  <div class="address-selector">
    <div class="address-input-container">
      <!-- Back button when creating a new address -->
      <button 
        v-if="isCreatingNewAddress" 
        type="button" 
        @click="cancelNewAddress" 
        class="back-btn"
        :aria-label="`Cancel new ${label.toLowerCase()} address`"
      >
        ←
      </button>
      
      <!-- Dropdown when not creating a new address -->
      <select 
        v-if="!isCreatingNewAddress"
        :id="id" 
        v-model="selectedOption" 
        class="address-select"
        required
      >
        <option value="" disabled>Select a {{ label.toLowerCase() }} address</option>
        <option value="new">+ Create new address</option>
        <option 
          v-for="address in addresses" 
          :key="address.id" 
          :value="address.id"
        >
          {{ address.address }}
        </option>
      </select>
      
      <!-- Text input when creating a new address -->
      <form @submit.prevent="confirmNewAddress" v-if="isCreatingNewAddress">
        <input
          ref="addressInput"
          type="text"
          v-model="addressValue"
          :placeholder="`Enter new ${label.toLowerCase()} address`"
          required
          class="new-address-input"
          @keydown.esc="cancelNewAddress"
        />
      </form>
      
      <!-- Confirm button for new address -->
      <button 
        v-if="isCreatingNewAddress && addressValue" 
        type="button" 
        @click="confirmNewAddress" 
        class="confirm-btn"
        :aria-label="`Confirm new ${label.toLowerCase()} address`"
      >
        ✓
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  label: {
    type: String,
    default: 'Address'
  },
  addresses: {
    type: Array,
    required: true
  },
  selectedAddressId: {
    type: Number,
    default: 0
  },
  profileType: {
    type: String,
    required: true
  },
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'address-added', 'address-selected'])

const selectedOption = ref('')
const isCreatingNewAddress = ref(false)
const addressValue = ref('')
const addressInput = ref(null)

// Watch for changes to selectedOption
watch(selectedOption, (newValue) => {
  if (newValue === 'new') {
    isCreatingNewAddress.value = true
    addressValue.value = ''
    emit('update:modelValue', '')
    
    // Focus the input field after the DOM updates
    nextTick(() => {
      if (addressInput.value) {
        addressInput.value.focus()
      }
    })
  } else if (newValue) {
    isCreatingNewAddress.value = false
    const selectedAddress = props.addresses.find(a => a.id === newValue)
    if (selectedAddress) {
      emit('update:modelValue', selectedAddress.address)
      emit('address-selected', selectedAddress)
    }
  }
})

// Watch for changes to isCreatingNewAddress
watch(isCreatingNewAddress, (newValue) => {
  if (newValue) {
    // Focus the input field after the DOM updates
    nextTick(() => {
      if (addressInput.value) {
        addressInput.value.focus()
      }
    })
  }
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (!isCreatingNewAddress.value) {
    addressValue.value = newValue
  }
})

// Watch for changes to selectedAddressId
watch(() => props.selectedAddressId, (newValue) => {
  if (newValue && !isCreatingNewAddress.value) {
    selectedOption.value = newValue.toString()
    
    // Find the address and update the model value
    const selectedAddress = props.addresses.find(a => a.id === newValue)
    if (selectedAddress) {
      emit('update:modelValue', selectedAddress.address)
    }
  }
})

// Watch for changes to addresses array
watch(() => props.addresses, (newAddresses) => {
  // If we have a selectedAddressId, make sure it's selected
  if (props.selectedAddressId && !isCreatingNewAddress.value) {
    selectedOption.value = props.selectedAddressId.toString()
    
    // Find the address and update the model value
    const selectedAddress = newAddresses.find(a => a.id === props.selectedAddressId)
    if (selectedAddress) {
      emit('update:modelValue', selectedAddress.address)
    }
  }
}, { deep: true })

const cancelNewAddress = () => {
  isCreatingNewAddress.value = false
  selectedOption.value = ''
  addressValue.value = ''
  emit('update:modelValue', '')
}

const confirmNewAddress = () => {
  // Don't proceed if the address is empty
  if (!addressValue.value.trim()) return
  
  // Emit event to add the address to the parent's list
  emit('address-added', addressValue.value, props.profileType)

  //the new address will be selected by the parent component once returned from the api
  isCreatingNewAddress.value = false
  emit('update:modelValue', addressValue.value)
}

onMounted(() => {
  // Initialize the selected option if we have a selectedAddressId
  if (props.selectedAddressId && props.addresses.length > 0) {
    selectedOption.value = props.selectedAddressId.toString()
    
    // Find the address and update the model value
    const selectedAddress = props.addresses.find(a => a.id === props.selectedAddressId)
    if (selectedAddress) {
      emit('update:modelValue', selectedAddress.address)
    }
  }
})
</script>

<style scoped>
.address-selector {
  width: 100%;
}

.address-input-container {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
}

form {
  width: 100%;
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
  padding: 0.75rem;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
}

.address-select {
  cursor: pointer;
}
</style> 