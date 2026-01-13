/**
 * TypeScript types for sales copy
 * Exported from sales-copy.schema.ts (single source of truth)
 */
import type { z } from 'zod'
import type { SalesCopyDataSchema, SalesCopyFileSchema } from '../schemas/sales-copy.schema.js'

export type SalesCopyData = z.infer<typeof SalesCopyDataSchema>
export type SalesCopyFile = z.infer<typeof SalesCopyFileSchema>
