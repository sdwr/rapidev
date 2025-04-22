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
      <input
        v-else
        type="text"
        v-model="addressValue"
        :placeholder="`Enter new ${label.toLowerCase()} address`"
        required
        class="new-address-input"
      />
      
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
import { ref, watch } from 'vue'

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

// Watch for changes to selectedOption
watch(selectedOption, (newValue) => {
  if (newValue === 'new') {
    isCreatingNewAddress.value = true
    addressValue.value = ''
    emit('update:modelValue', '')
  } else if (newValue) {
    isCreatingNewAddress.value = false
    const selectedAddress = props.addresses.find(a => a.id === newValue)
    if (selectedAddress) {
      emit('update:modelValue', selectedAddress.address)
      emit('address-selected', selectedAddress)
    }
  }
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (!isCreatingNewAddress.value) {
    addressValue.value = newValue
  }
})

const cancelNewAddress = () => {
  isCreatingNewAddress.value = false
  selectedOption.value = ''
  addressValue.value = ''
  emit('update:modelValue', '')
}

const confirmNewAddress = () => {
  
  // Emit event to add the address to the parent's list
  emit('address-added', addressValue.value, props.profileType)

  //the new address will be selected by the parent component once returned from the api
  
  isCreatingNewAddress.value = false
  emit('update:modelValue', addressValue.value)
}
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