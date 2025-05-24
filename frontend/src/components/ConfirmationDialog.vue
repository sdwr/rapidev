<template>
  <div v-if="show" class="dialog-overlay">
    <div class="dialog-container">
      <div class="dialog-header">
        <h3>{{ dialogTitle }}</h3>
        <button class="close-button" @click="handleCancel">×</button>
      </div>
      
      <div class="dialog-content">
        <p>{{ dialogDescription }}</p>
        
        <!-- Optional Notes Input -->
        <div v-if="showNotes" class="dialog-notes">
          <label for="notes">{{ noteLabel }}</label>
          <textarea 
            id="notes" 
            v-model="notes" 
            placeholder="Add any relevant details here..."
            rows="3"
          ></textarea>
        </div>
        
        <!-- Optional Picture Upload -->
        <div v-if="showPicture" class="dialog-picture">
          <label for="picture">Upload Picture:</label>
          <div class="picture-upload-container">
            <input 
              type="file" 
              id="picture" 
              ref="fileInput"
              accept="image/*"
              @change="handleFileChange" 
              class="file-input"
            />
            <button class="upload-button" @click="triggerFileInput">
              Select Image
            </button>
            <span class="file-name">{{ fileName || 'No file selected' }}</span>
          </div>
          
          <!-- Image Preview -->
          <div v-if="imagePreview" class="image-preview">
            <img :src="imagePreview" alt="Preview" />
          </div>
        </div>
      </div>
      
      <div class="dialog-actions">
        <button class="cancel-button" @click="handleCancel">Cancel</button>
        <button 
          class="confirm-button" 
          :disabled="isConfirmDisabled || isProcessing"
          @click="handleConfirmAction"
        >
          {{ isProcessing ? 'Processing...' : dialogConfirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { toast } from 'vue3-toastify';
import { updateOrderItemStatus } from '../api/api';
import { OrderItemStatusEnum } from '../shared/enums/OrderItemEnums';
const props = defineProps({
  orderItem: {
    type: Object,
    default: null
  },
  show: {
    type: Boolean,
    default: false
  },
  action: {
    type: String,
    default: OrderItemStatusEnum.PICKED_UP, // PICKUP, DELIVERY, PROBLEM
    validator: (value) => [OrderItemStatusEnum.PICKED_UP, OrderItemStatusEnum.DELIVERED, OrderItemStatusEnum.PROBLEM].includes(value)
  }
});

const emit = defineEmits(['update:show', 'success', 'error']);

// Form state
const noteLabel = computed(() => {
  switch (props.action) {
    case OrderItemStatusEnum.PICKED_UP: return 'Pickup Notes:';
    case OrderItemStatusEnum.DELIVERED: return 'Delivery Notes:';
    case OrderItemStatusEnum.PROBLEM: return 'Problem Notes:';
  }
});
const notes = ref('');
const imageFile = ref(null);
const imagePreview = ref('');
const fileName = ref('');
const fileInput = ref(null);
const isProcessing = ref(false);

// Dialog configuration based on action
const dialogTitle = computed(() => {
  switch (props.action) {
    case OrderItemStatusEnum.PICKED_UP: return 'Confirm Pickup';
    case OrderItemStatusEnum.DELIVERED: return 'Confirm Delivery';
    case OrderItemStatusEnum.PROBLEM: return 'Report Problem';
    default: return 'Confirm Action';
  }
});

const dialogDescription = computed(() => {
  if (!props.orderItem) return '';
  switch (props.action) {
    case OrderItemStatusEnum.PICKED_UP: 
      return `Are you sure you want to mark the pickup from ${props.orderItem.address} as picked up?`;
    case OrderItemStatusEnum.DELIVERED: 
      return `Are you sure you want to mark the delivery to ${props.orderItem.address} as delivered?`;
    case OrderItemStatusEnum.PROBLEM: 
      return `Report a problem at ${props.orderItem.address}, and mark the order as incomplete`;
    default: 
      return 'Please confirm this action';
  }
});

const dialogConfirmLabel = computed(() => {
  switch (props.action) {
    case OrderItemStatusEnum.PICKED_UP: return 'Confirm Pickup';
    case OrderItemStatusEnum.DELIVERED: return 'Confirm Delivery';
    case OrderItemStatusEnum.PROBLEM: return 'Cancel Order';
    default: return 'Confirm';
  }
});

const showNotes = computed(() => true); // Always show notes for now

const showPicture = computed(() => {
  return props.action === OrderItemStatusEnum.DELIVERED;
});

const requirePicture = computed(() => {
  return props.action === OrderItemStatusEnum.DELIVERED; // Only require picture for delivery
});

// Reset state when dialog is closed
watch(() => props.show, (newVal) => {
  if (!newVal) {
    resetState();
  }
});

// Helper to check if confirm should be disabled
const isConfirmDisabled = computed(() => {
  if (showPicture.value && requirePicture.value && !imageFile.value) {
    return true;
  }
  return false;
});

// Handle file selection
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    imageFile.value = file;
    fileName.value = file.name;
    
    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    imageFile.value = null;
    fileName.value = '';
    imagePreview.value = '';
  }
};

// Trigger file input click
const triggerFileInput = () => {
  fileInput.value.click();
};

// Handle the appropriate action based on action type
const handleConfirmAction = async () => {
  if (!props.orderItem) {
    toast.error('No order item provided');
    return;
  }
  
  isProcessing.value = true;
  
  try {
    switch (props.action) {
      case OrderItemStatusEnum.PICKED_UP:
        await handlePickupConfirm();
        break;
      case OrderItemStatusEnum.DELIVERED:
        await handleDeliveryConfirm();
        break;
      case OrderItemStatusEnum.PROBLEM:
        await handleProblemConfirm();
        break;
      default:
        throw new Error('Unknown action type');
    }
    
    // Close dialog after successful action
    emit('update:show', false);
    resetState();
  } catch (error) {
    console.error('Error performing action:', error);
    toast.error(`Failed to complete action: ${error.message}`);
    emit('error', error);
  } finally {
    isProcessing.value = false;
  }
};

// Mark item as picked up
const handlePickupConfirm = async () => {
  console.log(props.orderItem)
  console.log('Marking item as picked up:', props.orderItem.orderId, 'Notes:', notes.value);
  
  await updateOrderItemStatus(props.orderItem.orderId, OrderItemStatusEnum.PICKED_UP, notes.value);
  
  toast.success(`Item picked up from ${props.orderItem.address}`);
  emit('success', { action: OrderItemStatusEnum.PICKED_UP, orderItem: props.orderItem, notes: notes.value });
};

// Mark item as delivered
const handleDeliveryConfirm = async () => {
  console.log('Marking item as delivered:', props.orderItem.orderId, 'Notes:', notes.value, 'Image:', imageFile.value);
  
  await updateOrderItemStatus(props.orderItem.orderId, OrderItemStatusEnum.DELIVERED, notes.value);
  
  toast.success(`Item delivered to ${props.orderItem.address}`);
  emit('success', { 
    action: OrderItemStatusEnum.DELIVERED,   
    orderItem: props.orderItem, 
    notes: notes.value, 
    picture: imageFile.value,
    pictureUrl: imagePreview.value
  });
};

// Report a problem with the item
const handleProblemConfirm = async () => {
  console.log('Reporting problem for item:', props.orderItem.orderId, 'Notes:', notes.value, 'Image:', imageFile.value);
  
  await updateOrderItemStatus(props.orderItem.orderId, OrderItemStatusEnum.PROBLEM, notes.value);
    
  toast.info(`Problem reported for order item #${props.orderItem.orderId}`);
  emit('success', { 
    action: OrderItemStatusEnum.PROBLEM, 
    orderItem: props.orderItem, 
    notes: notes.value, 
    picture: imageFile.value,
    pictureUrl: imagePreview.value
  });
};

// Handle cancellation
const handleCancel = () => {
  emit('update:show', false);
  resetState();
};

// Reset form state
const resetState = () => {
  notes.value = '';
  imageFile.value = null;
  imagePreview.value = '';
  fileName.value = '';
  isProcessing.value = false;
};
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  color: #777;
  line-height: 1;
}

.dialog-content {
  padding: 1rem;
  flex-grow: 1;
}

.dialog-notes {
  margin-top: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.dialog-picture {
  margin-top: 1rem;
}

.picture-upload-container {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.file-input {
  display: none;
}

.upload-button {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.file-name {
  margin-left: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.image-preview {
  margin-top: 1rem;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  border-top: 1px solid #eee;
  gap: 0.5rem;
}

.confirm-button, .cancel-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.confirm-button {
  background-color: #4285F4;
  color: white;
}

.confirm-button:disabled {
  background-color: #b1c8f0;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #f1f1f1;
  color: #333;
}
</style> 