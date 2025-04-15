export interface User {
  id: string
  username: string
  userType: 'client' | 'courier' | 'admin'
  profile?: {
    id: string
    name: string
    email: string
    phone: string
    address: string
  }
} 