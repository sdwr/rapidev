# Delivery App Planning

## Data Transfer Objects (DTOs)

### ProfileInfo
- id: string
- name: string
- phone: string
- pickupAddress: string
- createdAt: Date
- updatedAt: Date

### Order
- id: string
- clientId: string
- status: OrderStatus
- pickupAddress: string
- deliveryAddress: string
- items: OrderItem[]
- createdAt: Date
- updatedAt: Date

### OrderItem
- description: string
- quantity: number
- size: Size

### Courier
- id: string
- name: string
- status: CourierStatus
- currentOrderId?: string
- createdAt: Date
- updatedAt: Date

## Enums

### OrderStatus
- DRAFT
- PENDING
- ACCEPTED
- PICKED_UP
- IN_TRANSIT
- DELIVERED
- CANCELLED

### Size
- SMALL
- MEDIUM
- LARGE
- EXTRA_LARGE

### CourierStatus
- AVAILABLE
- BUSY
- OFFLINE

## User Actions

### Client Actions
1. Profile Management
   - Create profile
   - Update profile information
   - View profile details

2. Order Management
   - Create new order
   - Pay for order
   - View order history
   - Cancel pending order
   - Track active order status

### Admin Actions
1. Order Management
   - View all active orders
   - View order history
   - Accept/reject orders
   - Assign orders to couriers
   - Cancel orders

2. Client Management
   - View all clients
   - View client details
   - Block/unblock clients
   - View client order history

3. Courier Management
   - View all couriers
   - View courier details
   - View courier delivery history
   - Block/unblock couriers
   - Monitor courier status

### Courier Actions
1. Delivery Management
   - View assigned deliveries
   - Update delivery status (picked up, in transit, delivered)
   - View delivery history
   - Report issues with delivery

2. Status Management
   - Update availability status
   - Start/end shift

## API Endpoints (to be implemented)

### Client Endpoints
- GET /api/clients/:id/profile - Get client profile
- PUT /api/clients/:id/profile - Update client profile
- GET /api/clients/:id/orders - Get client orders
- POST /api/orders - Create/update order
- PUT /api/orders/:id/status - Update order status

### Admin Endpoints
- GET /api/clients/all - Get all clients
- GET /api/orders/all - Get all orders
- GET /api/couriers/all - Get all couriers
- PUT /api/orders/:id/assign - Assign order to courier
- PUT /api/orders/reorder - Reorder orders list

### Courier Endpoints
- PUT /api/orders/:id/accept - Accept order

## State Management Requirements
- Real-time order status updates
- Live courier location tracking
- Order assignment notifications
- Delivery status notifications 