export interface User {
  id: string
  username: string
  userType: 'CLIENT' | 'COURIER' | 'ADMIN'