export interface User {
  id: string
  username: string
  userType: 'CLIENT' | 'COURIER' | 'ADMIN'
  profile?: {
    id: string
    name: string
    email: string
    phone: string
    address: string
  }
} 