import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UserController {
  /**
   * Create a new user with associated profile (client or courier)
   */
  async createUser({ request, response }: HttpContext) {
    const { email, password, userType } = request.body()
    
    try {
      // Check if email already exists
      const existingUser = await User.findBy('email', email)
      if (existingUser) {
        throw new Error('Email already exists')
      }
      
      
      // Create the user with auto-generated ID
      const user = await User.create({
        email,
        password,
        userType
      })

      await user.load('profile')
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user.toJSON()
      return response.status(201).json(userWithoutPassword)
    } catch (error) {
      return response.status(error.status || 400).json({ 
        error: error.message 
      })
    }
  }

  async getAllUsers({ response }: HttpContext) {
    const users = await User.query()
      .preload('profile')
    return response.json(users)
  }

  async deleteAllUsers({ response }: HttpContext) {
    await User.query().delete()
    return response.json({ message: 'All users deleted' })
  }
  
  /**
   * Load user by ID
   */
  async loadUser({ params, response }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)

      await user.load('profile')
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user.toJSON()
      return response.json(userWithoutPassword)
    } catch (error) {
      return response.status(404).json({ 
        error: 'User not found' 
      })
    }
  }

  async updateUser({ params, request, response }: HttpContext) {
    const { email, password, userType } = request.body()
    const user = await User.findOrFail(params.id)
    user.email = email
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

  async login({ request, response }: HttpContext) {
    const { email, password } = request.body()
    
    try {
      // Find user by email
      const user = await User.findBy('email', email)
      if (!user) {
        throw new Error('Invalid credentials')
      }
      
      // Verify password
      const isPasswordValid = user.password === password
      if (!isPasswordValid) {
        throw new Error('Invalid credentials')
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
