import { User } from './User'
import { ProfileTypeEnum } from '../enums/ProfileEnums'

export interface Profile {
  id: number
  userId: number
  address: string
  profileType: ProfileTypeEnum
  createdAt: string
  updatedAt: string
  
  // Related entities
  user?: User
} 