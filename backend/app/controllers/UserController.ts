import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Client from '#models/client'
import Courier from '#models/courier'
import { randomUUID } from 'node:crypto'
import hash from '@adonisjs/core/hash'
import CustomHttpException from '#exceptions/custom_http_exception'

export default class UserController {
  /**
   * Create a new user with associated profile (client or courier)
   */
  async createUser({ request, response }: HttpContext) {
    const { email, password, userType, profile } = request.body()
    
    try {
      // Check if email already exists
      const existingUser = await User.findBy('email', email)
      if (existingUser) {
        throw new CustomHttpException('Email already exists', 400, request.url())
      }
      
      // Hash the password
      const hashedPassword = await hash.make(password)
      
      // Create the user with auto-generated ID
      const user = await User.create({
        email,
        password: hashedPassword,
        userType
      })
    
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user.toJSON()
      return response.status(201).json(userWithoutPassword)
    } catch (error) {
      return response.status(error.status || 400).json({ 
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
      
      if (user.userType !== 'client') {
        return response.status(400).json({ 
          error: 'User is not a client' 
        })
      }
      
      const client = await Client.findBy('userId', user.id)
      if (!client) {
        return response.status(404).json({ 
          error: 'Client profile not found' 
        })
      }
      
      return response.json(client)
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
    const { email, password } = request.body()
    
    try {
      // Find user by email
      const user = await User.findBy('email', email)
      if (!user) {
        throw new CustomHttpException('Invalid credentials', 401, request.url())
      }
      
      // Verify password
      const isPasswordValid = await hash.verify(user.password, password)
      if (!isPasswordValid) {
        throw new CustomHttpException('Invalid credentials', 401, request.url())
      }
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user.toJSON()
      return response.json(userWithoutPassword)
    } catch (error) {
      return response.status(error.status || 401).json({ 
        error: error.message 
      })
    }
  }
}
