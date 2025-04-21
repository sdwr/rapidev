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

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// User routes
router.post('/api/users/login', [UserController, 'login'])
router.post('/api/users/register', [UserController, 'createUser'])
router.get('/api/users/all', [UserController, 'getAllUsers'])
router.delete('/api/users/all', [UserController, 'deleteAllUsers'])
router.get('/api/users/:id', [UserController, 'loadUser'])
router.put('/api/users/:id', [UserController, 'updateUser'])
router.delete('/api/users/:id', [UserController, 'deleteUser'])

// Profile routes
router.post('/api/profiles', [ProfileController, 'upsertProfile'])
router.get('/api/profiles', [ProfileController, 'getAllProfiles'])
router.delete('/api/profiles/all', [ProfileController, 'deleteAllProfiles'])
router.get('/api/profiles/:id', [ProfileController, 'getProfile'])
router.get('/api/profiles/user/:userId', [ProfileController, 'getProfileByUserId'])
router.delete('/api/profiles/:id', [ProfileController, 'deleteProfile'])

// Order routes
router.get('/api/orders/all', [OrderController, 'getAllOrders'])
router.delete('/api/orders/all', [OrderController, 'deleteAllOrders'])
router.get('/api/orders/all-with-history', [OrderController, 'getAllOrdersWithHistory'])
router.get('/api/orders/client/:clientId', [OrderController, 'getClientOrders'])
router.get('/api/orders/courier/:courierId', [OrderController, 'getCourierOrders'])
router.get('/api/orders/:id/statuses', [OrderController, 'getOrderStatuses'])
router.post('/api/orders', [OrderController, 'createOrder'])
router.put('/api/orders', [OrderController, 'upsertOrder'])

//order status modifications
router.put('/api/orders/:id/courier', [OrderController, 'assignCourier'])
router.put('/api/orders/:id/unassign-courier', [OrderController, 'unassignCourier'])
router.put('/api/orders/:id/status', [OrderController, 'updateStatus'])

//order deletion
router.delete('/api/orders/:id', [OrderController, 'deleteOrder'])
