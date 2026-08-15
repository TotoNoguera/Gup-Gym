import { MembershipStatus, getStatusText, getDaysRemaining } from '@/lib/format';

interface StatusBadgeProps {
  status: MembershipStatus;
  expirationDate?: Date | null;
  className?: string;
}

export default function StatusBadge({
  status,
  expirationDate,
  className = '',
}: StatusBadgeProps) {
  const { label, color } = getStatusText(status);
  const daysRemaining = expirationDate ? getDaysRemaining(expirationDate) : null;

  let detailText = '';
  if (status === 'expiring-soon' && daysRemaining !== null) {
    detailText = `Vence en ${daysRemaining} día${daysRemaining === 1 ? '' : 's'}`;
  } else if (status === 'expired' && daysRemaining !== null) {
    const daysExpired = Math.abs(daysRemaining);
    detailText = `Venció hace ${daysExpired} día${daysExpired === 1 ? '' : 's'}`;
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold w-fit ${color}`}>
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            status === 'active'
              ? 'bg-green-600'
              : status === 'expiring-soon'
                ? 'bg-orange-600'
                : status === 'expired'
                  ? 'bg-red-600'
                  : 'bg-gray-400'
          }`}
        />
        {label}
      </div>
      {detailText && <p className="text-xs text-gray-600">{detailText}</p>}
    </div>
  );
}
