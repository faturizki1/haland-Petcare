export const ROLES = {
  OWNER: 'owner' as const,
  DOKTER: 'dokter' as const,
  STAFF: 'staff' as const,
  CUSTOMER: 'customer' as const,
} as const

export type UserRole = (typeof ROLES)[keyof typeof ROLES]

export const APPOINTMENT_STATUS = {
  MENUNGGU: 'menunggu',
  BERLANGSUNG: 'berlangsung',
  SELESAI: 'selesai',
  BATAL: 'batal',
} as const

export const INPATIENT_STATUS = {
  RAWAT: 'rawat',
  PULANG: 'pulang',
} as const

export const MUTATION_TYPE = {
  MASUK: 'masuk',
  KELUAR: 'keluar',
  ADJUSTMENT: 'adjustment',
} as const

export const PAYMENT_METHOD = {
  TUNAI: 'tunai',
  QRIS: 'qris',
} as const

export const TRANSACTION_STATUS = {
  SELESAI: 'selesai',
  BATAL: 'batal',
} as const

export const BOOKING_STATUS = {
  MENUNGGU: 'menunggu',
  DIKONFIRMASI: 'dikonfirmasi',
  DITOLAK: 'ditolak',
} as const

export const LOG_CONDITION = {
  STABIL: 'stabil',
  PERLU_PERHATIAN: 'perlu_perhatian',
  KRITIS: 'kritis',
} as const