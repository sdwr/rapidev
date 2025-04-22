import vine from '@vinejs/vine'

export const createProfileValidator = vine.compile(
  vine.object({
    address: vine.string().trim().minLength(5),
    userId: vine.number(),
  })
)

export const updateProfileValidator = vine.compile(
  vine.object({
    address: vine.string().trim().minLength(5).optional(),
    userId: vine.number().optional(),
  })
) 