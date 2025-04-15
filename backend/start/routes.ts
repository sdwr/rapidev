/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { ClientController } from '#controllers/ClientController'
import { OrderController } from '#controllers/OrderController'
import UserController from '#controllers/UserController'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

// User routes
router.post('/api/users/login', [UserController, 'login'])
router.post('/api/users/register', [UserController, 'register'])
router.get('/api/users/all', [UserController, 'getAllUsers'])
router.get('/api/users/:id', [UserController, 'getUser'])
router.put('/api/users/:id', [UserController, 'updateUser'])
router.delete('/api/users/:id', [UserController, 'deleteUser'])

router.post('/api/clients/profile', [ClientController, 'upsertProfile'])
router.get('/api/clients/all', [ClientController, 'getAllProfiles'])
router.get('/api/clients/:id/profile', [ClientController, 'getProfile'])
// Order routes
router.post('/api/orders', [OrderController, 'createOrder'])
router.get('/api/orders/all', [OrderController, 'getAllOrders'])
router.get('/api/orders/client/:clientId', [OrderController, 'getClientOrders'])
router.get('/api/orderstatuses', [OrderController, 'getAllOrderStatuses'])
