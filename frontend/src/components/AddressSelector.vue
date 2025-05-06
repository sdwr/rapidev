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
          :id="`new-${id}`" 
          v-model="newAddress" 
          class="new-address-input"
          :placeholder="`Enter ${label.toLowerCase()} address`"
          @input="searchAddresses"
          required
          autocomplete="off"
        />
        
        <!-- Address suggestions dropdown -->
        <div v-if="addressSuggestions.length > 0" class="address-suggestions">
          <div 
            v-for="suggestion in addressSuggestions" 
            :key="suggestion.place_id"
            @click="selectSuggestion(suggestion)"
            class="suggestion-item"
          >
            {{ suggestion.description }}
          </div>
        </div>

        <button type="submit" class="confirm-btn">
          ✓
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { getPlacePredictions, getPlaceDetails } from '../services/googleMapsService'

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
const newAddress = ref('')
const addressInput = ref(null)
const addressSuggestions = ref([])
const debounceTimeout = ref(null)

// Watch for changes to selectedOption
watch(selectedOption, (newValue) => {
  if (newValue === 'new') {
    isCreatingNewAddress.value = true
    newAddress.value = ''
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
    newAddress.value = newValue
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
  newAddress.value = ''
  emit('update:modelValue', '')
}

const confirmNewAddress = async () => {
  if (!newAddress.value) return
  
  // Emit event to add the address to the parent's list
  emit('address-added', {
    address: newAddress.value,
    profileType: props.profileType
  })

  // Update the modelValue with the new address
  emit('update:modelValue', newAddress.value)

  // Reset state
  isCreatingNewAddress.value = false
  newAddress.value = ''
  addressSuggestions.value = []
}

// Search for address suggestions
const searchAddresses = () => {
  // Clear previous timeout
  if (debounceTimeout.value) clearTimeout(debounceTimeout.value)
  
  // Set new timeout to prevent too many API calls
  debounceTimeout.value = setTimeout(async () => {
    if (!newAddress.value || newAddress.value.length < 3) {
      addressSuggestions.value = []
      return
    }
    
    try {
      const predictions = await getPlacePredictions(newAddress.value)
      addressSuggestions.value = predictions
    } catch (error) {
      console.error('Error getting place predictions:', error)
      addressSuggestions.value = []
    }
  }, 300)
}

// Select an address suggestion
const selectSuggestion = async (suggestion) => {
  try {
    const placeDetails = await getPlaceDetails(suggestion.place_id)
    newAddress.value = placeDetails.formatted_address
    addressSuggestions.value = []
    
    confirmNewAddress()
  } catch (error) {
    console.error('Error getting place details:', error)
    newAddress.value = suggestion.description
    addressSuggestions.value = []
  }
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
  padding-left: 3.25rem;
  padding-right: 3.25rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.address-select {
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.address-select:after {
  content: "▼";
  position: absolute;
  right: 2.9rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.address-suggestions {
  position: absolute;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  z-index: 100;
  margin-top: 2px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.suggestion-item {
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border-hover);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background-color: var(--color-background-soft);
}
</style> 