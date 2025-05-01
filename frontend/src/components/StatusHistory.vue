<template>
  <div v-if="statuses && statuses.length" class="status-history">
    <div class="status-history-header" @click="toggleStatusHistory">
      <h4>Status History:</h4>
      <span class="toggle-icon">{{ isStatusHistoryExpanded ? '▼' : '▶' }}</span>
    </div>
    <div v-if="isStatusHistoryExpanded" class="status-timeline">
      <div 
        v-for="(status, index) in statuses" 
        :key="index"
        class="status-item"
      >
        <div class="status-dot" :class="getStatusClass(status.status)"></div>
        <div class="status-details">
          <div class="status-name">{{ status.status }}</div>
          <div class="status-time">{{ formatDate(status.createdAt) }}</div>
          <div v-if="status.notes" class="status-notes">{{ status.notes }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue'

const props = defineProps({
  statuses: {
    type: Array,
    default: () => []
  }
})

const isStatusHistoryExpanded = ref(false)

const toggleStatusHistory = () => {
  isStatusHistoryExpanded.value = !isStatusHistoryExpanded.value
}

const getCurrentStatus = () => {
  return props.statuses[props.statuses.length - 1].status
}

const getCurrentStatusTimestamp = () => {
  return props.statuses[props.statuses.length - 1].createdAt
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'DRAFT': return 'draft'
    case 'PAID': return 'paid'
    case 'ACCEPTED': return 'accepted'
    case 'ASSIGNED': return 'assigned'
    case 'CONFIRMED_BY_COURIER': return 'confirmed'
    case 'PICKED_UP': return 'picked-up'
    case 'DELIVERED': return 'delivered'
    case 'CANCELLED': return 'cancelled'
    default: return ''
  }
}
</script>

<style scoped>
.status-history {
  margin-top: 1rem;
}

.status-history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0.5rem;
  background: var(--color-background);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.status-history-header h4 {
  margin: 0;
}

.toggle-icon {
  font-size: 0.875rem;
  color: var(--color-text);
}

.current-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background: var(--color-background);
  border-radius: 4px;
}

.current-status-name {
  font-weight: 500;
}

.current-status-time .current-status-name {
  color: var(--color-text-soft);
  font-size: 0.9rem;
}

.status-timeline {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-left: 1rem;
  border-left: 2px solid var(--color-border);
}

.status-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  position: relative;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-left: -1.45rem;
  margin-top: 0.25rem;
}

.status-details {
  flex: 1;
}

.status-name {
  font-weight: 500;
}

.status-time {
  font-size: 0.8rem;
  color: var(--color-text-light);
}

.status-notes {
  font-size: 0.9rem;
  font-style: italic;
  margin-top: 0.25rem;
}

/* Status colors */
.draft {
  background-color: #6c757d;
}

.paid {
  background-color: #17a2b8;
}

.accepted {
  background-color: #28a745;
}

.assigned {
  background-color: #fd7e14;
}

.confirmed {
  background-color: #007bff;
}

.picked-up {
  background-color: #6f42c1;
}

.delivered {
  background-color: #28a745;
}

.cancelled {
  background-color: #dc3545;
}
</style> 