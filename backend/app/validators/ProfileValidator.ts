import vine from '@vinejs/vine'

export const createProfileValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2),
    phone: vine.string().trim().regex(/^[0-9]{10}$/),
    pickupAddress: vine.string().trim().minLength(5)
  })
)

export const updateProfileValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).optional(),
    phone: vine.string().trim().regex(/^[0-9]{10}$/).optional(),
    pickupAddress: vine.string().trim().minLength(5).optional()
  })
) 