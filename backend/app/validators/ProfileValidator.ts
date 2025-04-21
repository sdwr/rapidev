import vine from '@vinejs/vine'

export const createProfileValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2),
    phone: vine.string().trim().regex(/^[0-9]{10}$/),
    address: vine.string().trim().minLength(5),
    userId: vine.number(),
  })
)

export const updateProfileValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).optional(),
    phone: vine.string().trim().regex(/^[0-9]{10}$/).optional(),
    address: vine.string().trim().minLength(5).optional(),
    userId: vine.number().optional(),
  })
) 