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

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.post('api/clients/profile', [ClientController, 'upsertProfile'])
router.get('api/clients/all', [ClientController, 'getAllProfiles'])
router.get('api/clients/:id/profile', [ClientController, 'getProfile'])

// Order routes
router.post('api/orders', [OrderController, 'createOrder'])
router.get('api/orders', [OrderController, 'getAllOrders'])
router.get('api/orders/client/:clientId', [OrderController, 'getClientOrders'])
