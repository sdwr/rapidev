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
import { ProfileController } from '#controllers/ProfileController'
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

// Profile routes
router.post('/api/profiles', [ProfileController, 'upsertProfile'])
router.get('/api/profiles', [ProfileController, 'getAllProfiles'])
router.get('/api/profiles/:id', [ProfileController, 'getProfile'])
router.get('/api/profiles/user/:userId', [ProfileController, 'getProfileByUserId'])
router.delete('/api/profiles/:id', [ProfileController, 'deleteProfile'])

// Client routes
router.get('/api/clients/all', [ClientController, 'getAllProfiles'])

// Order routes
router.post('/api/orders', [OrderController, 'createOrder'])
router.get('/api/orders/all', [OrderController, 'getAllOrders'])
router.get('/api/orders/client/:clientId', [OrderController, 'getClientOrders'])
router.get('/api/orderstatuses', [OrderController, 'getAllOrderStatuses'])
