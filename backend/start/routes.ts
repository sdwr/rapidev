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

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.post('api/clients/profile', [ClientController, 'upsertProfile'])
router.get('api/clients/all', [ClientController, 'getAllProfiles'])
router.get('api/clients/:id/profile', [ClientController, 'getProfile'])
