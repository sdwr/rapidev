import vine from '@vinejs/vine'

export const createProfileValidator = vine.compile(
  vine.object({
    address: vine.string().trim(),
    userId: vine.number(),
  })
)

export const updateProfileValidator = vine.compile(
  vine.object({
    address: vine.string().trim().optional(),
    userId: vine.number().optional(),
  })
) 