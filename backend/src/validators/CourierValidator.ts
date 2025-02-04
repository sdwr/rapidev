import vine from '@vinejs/vine'

export const createCourierValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2),
    status: vine.enum(['AVAILABLE', 'BUSY', 'OFFLINE'])
  })
)

export const updateCourierStatusValidator = vine.compile(
  vine.object({
    status: vine.enum(['AVAILABLE', 'BUSY', 'OFFLINE'])
  })
)

export const assignOrderValidator = vine.compile(
  vine.object({
    courierId: vine.string().trim()
  })
) 