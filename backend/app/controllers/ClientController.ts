import type { HttpContext } from '@adonisjs/core/http'
import { createProfileValidator, updateProfileValidator } from '#validators/ProfileValidator'
import Profile from '#models/profile'
import { randomUUID } from 'node:crypto'

export class ClientController {
  async getProfile({ request, response }: HttpContext) {
    const id = request.param('id')
    
    try {
      const profile = await Profile.findOrFail(id)
      return response.json(profile)
    } catch (error) {
      return response.status(404).json({ 
        error: 'Profile not found' 
      })
    }
  }

  async getAllProfiles({ response }: HttpContext) {
    const profiles = await Profile.all()
    return response.json(profiles)
  }

  async upsertProfile({ request, response }: HttpContext) {
    const data = request.body()
    
    try {
      if (data.id) {
        // Update
        await updateProfileValidator.validate(data)
        const profile = await Profile.findOrFail(data.id)
        profile.merge(data)
        await profile.save()
        return response.json(profile)
      } else {
        // Create
        await createProfileValidator.validate(data)
        const profile = await Profile.create({
          id: randomUUID(),
          ...data
        })
        return response.json(profile)
      }
    } catch (error) {
      return response.status(400).json({ 
        error: error.message 
      })
    }
  }

  async getOrders({ request, response }: HttpContext) {
    const id = request.param('id')
    // TODO: Implement database query
    return response.json([])
  }
} 