export interface User {
  id: string
  email: string
  password: string
  name?: string
  phone?: string
  userType: 'CLIENT' | 'COURIER' | 'ADMIN'
}
