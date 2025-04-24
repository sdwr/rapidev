/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { OrderController } from '#controllers/OrderController'
import { ProfileController } from '#controllers/ProfileController'
import UserController from '#controllers/UserController'
import { ReceiptController } from '#controllers/ReceiptController'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// User routes
router.post('/api/users/login', [UserController, 'login'])
router.post('/api/users/register', [UserController, 'createUser'])
router.get('/api/users/all', [UserController, 'getAllUsers'])
router.get('/api/users/all/:type', [UserController, 'getAllUsersByType'])
router.delete('/api/users/all', [UserController, 'deleteAllUsers'])
router.get('/api/users/:id', [UserController, 'loadUser'])
router.put('/api/users/:id', [UserController, 'updateUser'])
router.delete('/api/users/:id', [UserController, 'deleteUser'])

// Profile routes
router.post('/api/profiles', [ProfileController, 'createProfile'])
router.get('/api/profiles', [ProfileController, 'getAllProfiles'])
router.delete('/api/profiles/all', [ProfileController, 'deleteAllProfiles'])
router.get('/api/profiles/:id', [ProfileController, 'getProfile'])
router.get('/api/profiles/user/:userId/:profileType', [ProfileController, 'getProfilesByUserIdAndProfileType'])
router.delete('/api/profiles/:id', [ProfileController, 'deleteProfile'])

// Order routes
router.get('/api/orders/all', [OrderController, 'getAllOrders'])
router.delete('/api/orders/all', [OrderController, 'deleteAllOrders'])
router.get('/api/orders/all-with-history', [OrderController, 'getAllOrdersWithHistory'])
router.get('/api/orders/client/:clientId', [OrderController, 'getClientOrders'])
router.get('/api/orders/courier/:courierId', [OrderController, 'getCourierOrders'])
router.get('/api/orders/:id/statuses', [OrderController, 'getOrderStatuses'])
router.get('/api/orders/:id', [OrderController, 'getOrder'])
router.post('/api/orders', [OrderController, 'createOrder'])
router.put('/api/orders/:id', [OrderController, 'updateOrder'])

router.get('/api/orders/item/:id', [OrderController, 'getOrderItem'])

//order status modifications
router.put('/api/orders/item/:id/courier', [OrderController, 'assignCourier'])
router.put('/api/orders/item/:id/unassign-courier', [OrderController, 'unassignCourier'])
router.put('/api/orders/item/:id/status', [OrderController, 'updateOrderItemStatus'])

//order deletion
router.delete('/api/orders/:id', [OrderController, 'deleteOrder'])

// Receipt routes
router.get('/api/receipts', [ReceiptController, 'getAllReceipts'])
router.delete('/api/receipts/all', [ReceiptController, 'deleteAllReceipts'])
router.get('/api/receipts/:id', [ReceiptController, 'getReceipt'])
router.get('/api/orders/:orderId/receipt', [ReceiptController, 'getReceiptByOrderId'])
router.post('/api/receipts', [ReceiptController, 'createReceipt'])
router.put('/api/receipts/:id', [ReceiptController, 'updateReceipt'])
router.post('/api/receipts/:id/payment', [ReceiptController, 'payReceipt'])
router.post('/api/receipts/:id/refund', [ReceiptController, 'refundReceipt'])
router.post('/api/receipts/:id/cancel', [ReceiptController, 'cancelReceipt'])
