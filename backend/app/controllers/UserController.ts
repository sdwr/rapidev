import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { UserTypeEnum } from '#shared/enums/UserEnums'
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

      await user.load('profiles')
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user.toJSON()
      return response.status(201).json(userWithoutPassword)
    } catch (error) {
      return response.status(error.status || 400).json({ 
        error: error.message 
      })
    }
  }

  async getUser({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    return response.json(user)
  }

  async getAllUsers({ response }: HttpContext) {
    const users = await User.query()
      .preload('profiles')
    return response.json(users)
  }

  async deleteAllUsers({ response }: HttpContext) {
    await User.query().delete()
    return response.json({ message: 'All users deleted' })
  }

  async getAllUsersByType({ params, response }: HttpContext) {
    const { type } = params
    const users = await User.query()
      .where('user_type', type)
      .preload('profiles')
    return response.json(users)
  }

  async updateUser({ params, request, response }: HttpContext) {
    const { email, password, userType, name, phone } = request.body()
    const user = await User.findOrFail(params.id)
    user.email = email
    user.password = password
    user.userType = userType
    user.name = name
    user.phone = phone
    await user.save()
    return response.json(user)
  }

  async deleteUser({ params, response }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await user.delete()
    return response.json({ message: 'User deleted' })
  }

  async loginOrRegister({ request, response }: HttpContext) {
    const { email, password, userType } = request.body()
    
    try {
      // Find user by email
      let user = await User.findBy('email', email)
      if (!user) {
        // Check if this is a dev user
        const isDevUser = email.startsWith('dev-') && email.endsWith('@test.com')
        
        // Create user with dev data if applicable
        const userData: any = {
          email,
          password,
          userType: userType as UserTypeEnum
        }
        
        // Add dummy data for dev users
        if (isDevUser) {
          switch(userType) {
            case 'CLIENT':
              userData.name = 'Dev Client User'
              userData.phone = '5551234567'
              break
            case 'COURIER':
              userData.name = 'Dev Courier User'
              userData.phone = '5552345678'
              break
            case 'ADMIN':
              userData.name = 'Dev Admin User'
              userData.phone = '5553456789'
              break
          }
        }
        
        user = await User.create(userData)
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
