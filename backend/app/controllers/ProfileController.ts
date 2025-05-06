import type { HttpContext } from '@adonisjs/core/http'
import { createProfileValidator } from '#validators/ProfileValidator'
import Profile from '#models/profile'

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

  async deleteAllProfiles({ response }: HttpContext) {
    await Profile.query().delete()
    return response.json({ message: 'All profiles deleted' })
  }

  /**
   * Get profile by user ID
   */
  async getProfilesByUserIdAndProfileType({ request, response }: HttpContext) {
    const userId = request.param('userId')
    const profileType = request.param('profileType')
    
    try {
      const profiles = await Profile.query().where('userId', userId).where('profileType', profileType)
      return response.json(profiles)
    } catch (error) {
      return response.status(400).json({ 
        error: error.message 
      })
    }
  }

  /**
   * Create or update a profile
   */
  async createProfile({ request, response }: HttpContext) {
    const data = request.body()
    
    try {
      // Create new profile
      await createProfileValidator.validate(data)

      //check if the profile already exists, and if it does, update it
      const existingProfile = await Profile.query().where('userId', data.userId).where('profileType', data.profileType).first()
      if (existingProfile) {
        await existingProfile.merge(data).save()
        return response.json(existingProfile)
      } else {
        const profile = await Profile.create(data)
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