import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Courier from '#models/courier'
import { randomUUID } from 'node:crypto'

export default class UserController {
  /**
   * Create a new user with associated profile (client or courier)
   */
  async createUser({ request, response }: HttpContext) {
    const { username, password, userType, profile } = request.body()
    
    try {
      // Check if email already exists
      const existingUser = await User.findBy('username', username)
      if (existingUser) {
        return response.status(400).json({ 
          error: 'Username already exists' 
        })
      }
      
      // Create the user with auto-generated ID
      const user = await User.create({
        username,
        password,
        userType
      })
    
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user.toJSON()
      return response.status(201).json(userWithoutPassword)
    } catch (error) {
      return response.status(400).json({ 
        error: error.message 
      })
    }
  }
  
  /**
   * Load user by ID
   */
  async loadUser({ params, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user.toJSON()
      return response.json(userWithoutPassword)
    } catch (error) {
      return response.status(404).json({ 
        error: 'User not found' 
      })
    }
  }
  
  /**
   * Load user's client profile
   */
  async loadUserProfile({ params, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      
      
      return response.json(user)
    } catch (error) {
      return response.status(404).json({ 
        error: 'User not found' 
      })
    }
  }
  
  /**
   * Load user's courier profile
   */
  async loadUserCourier({ params, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)
      
      if (user.userType !== 'courier') {
        return response.status(400).json({ 
          error: 'User is not a courier' 
        })
      }
      
      const courier = await Courier.findBy('userId', user.id)
      if (!courier) {
        return response.status(404).json({ 
          error: 'Courier profile not found' 
        })
      }
      
      return response.json(courier)
    } catch (error) {
      return response.status(404).json({ 
        error: 'User not found' 
      })
    }
  }
  
  /**
   * Authenticate a user
   */
  async login({ request, response }: HttpContext) {
    const { username, password, userType } = request.body()
    
    try {
      // Find user by username
      let user = await User.findBy('username', username)
      
      // If user doesn't exist, create a new one
      if (!user) {
        // Create the user
        user = await User.create({
          id: randomUUID(),
          username,
          password,
          userType,
          email: `${username}@example.com` // Generate a dummy email
        })
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user.toJSON()
      return response.json(userWithoutPassword)
    } catch (error) {
      return response.status(400).json({ 
        error: error.message 
      })
    }
  }
  
  async register({ request, response }: HttpContext) {
    const { username, password, userType } = request.body()
    const user = await User.create({ username, password, userType })
    return response.json(user)
  }

  async getAllUsers({ response }: HttpContext) {
    const users = await User.all()
    return response.json(users)
  }

  async getUser({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return response.json(user)
  }

  async updateUser({ params, request, response }: HttpContext) {
    const { username, password, userType } = request.body()
    const user = await User.findOrFail(params.id)
    user.username = username
    user.password = password
    user.userType = userType
    await user.save()
    return response.json(user)
  }

  async deleteUser({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await user.delete()
    return response.json({ message: 'User deleted' })
  } 
}
