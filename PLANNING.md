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
- POST /api/clients - Create new client profile
- PUT /api/clients/:id - Update client profile
- POST /api/orders - Create new order
- GET /api/orders/client/:clientId - Get client's orders

### Admin Endpoints
- GET /api/orders - Get all orders
- PUT /api/orders/:id/status - Update order status
- GET /api/clients - Get all clients
- GET /api/couriers - Get all couriers
- PUT /api/couriers/:id/status - Update courier status

### Courier Endpoints
- GET /api/orders/courier/:courierId - Get courier's assigned deliveries
- PUT /api/orders/:id/delivery-status - Update delivery status
- PUT /api/couriers/:id/availability - Update courier availability

## State Management Requirements
- Real-time order status updates
- Live courier location tracking
- Order assignment notifications
- Delivery status notifications 