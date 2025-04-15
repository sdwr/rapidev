import type { HttpContext } from '@adonisjs/core/http'
import { createProfileValidator, updateProfileValidator } from '#validators/ProfileValidator'
import Profile from '#models/profile'
import { randomUUID } from 'node:crypto'

export class ProfileController {
  /**
   * Get a profile by ID
   */
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

  /**
   * Get all profiles
   */
  async getAllProfiles({ response }: HttpContext) {
    const profiles = await Profile.all()
    return response.json(profiles)
  }

  /**
   * Get profile by user ID
   */
  async getProfileByUserId({ request, response }: HttpContext) {
    const userId = request.param('userId')
    
    try {
      const profile = await Profile.findBy('userId', userId)
      return response.json({ profile })
    } catch (error) {
      return response.status(400).json({ 
        error: error.message 
      })
    }
  }

  /**
   * Create or update a profile
   */
  async upsertProfile({ request, response }: HttpContext) {
    const data = request.body()
    
    try {
      // First try to find an existing profile for this user
      const existingProfile = await Profile.findBy('userId', data.userId)
      
      if (existingProfile) {
        // Update existing profile
        await updateProfileValidator.validate(data)
        existingProfile.merge(data)
        await existingProfile.save()
        return response.json(existingProfile)
      } else {
        // Create new profile
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

  /**
   * Delete a profile
   */
  async deleteProfile({ request, response }: HttpContext) {
    const id = request.param('id')
    
    try {
      const profile = await Profile.findOrFail(id)
      await profile.delete()
      return response.json({ 
        message: 'Profile deleted successfully' 
      })
    } catch (error) {
      return response.status(404).json({ 
        error: 'Profile not found' 
      })
    }
  }
} 