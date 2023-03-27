import { STATUSES } from 'helpers'

export function getActiveTransfer(rescue) {
  if (!rescue) return null
  let activeTransfer = null
  for (const transfer of rescue.transfers) {
    if (
      transfer.status !== STATUSES.CANCELLED &&
      transfer.status !== STATUSES.COMPLETED
    ) {
      activeTransfer = transfer
      break
    }
  }

  return activeTransfer
}

export function statusIcon(status) {
  return status === 'cancelled'
    ? '❌'
    : status === 'scheduled'
    ? '🗓'
    : status === 'active'
    ? '⏩'
    : '✅'
}
