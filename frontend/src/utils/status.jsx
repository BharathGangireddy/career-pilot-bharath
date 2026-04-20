export const STATUS_CONFIG = {
  wishlist:  { label: 'Wishlist',   color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',   dot: 'bg-gray-400' },
  applied:   { label: 'Applied',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',   dot: 'bg-blue-500' },
  interview: { label: 'Interview',  color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', dot: 'bg-yellow-500' },
  offer:     { label: 'Offer',      color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', dot: 'bg-green-500' },
  rejected:  { label: 'Rejected',   color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',       dot: 'bg-red-500' }
}

export const STATUSES = Object.keys(STATUS_CONFIG)

export const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.applied
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
