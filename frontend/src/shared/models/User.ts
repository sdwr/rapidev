import { Profile } from './Profile'
import { Order } from './Order'
import { UserTypeEnum } from '../enums/UserEnums'

export interface User {
  id: number
  email: string
  password?: string
  name: string
  phone: string
  userType: UserTypeEnum
  createdAt: string
  updatedAt: string | null
  
  // Related entities
  profiles?: Profile[]
  orders?: Order[]
} 