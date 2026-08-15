import { getInitials } from '@/lib/format';

interface AvatarProps {
  nombre: string;
  apellido?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl',
};

export default function Avatar({
  nombre,
  apellido,
  size = 'md',
  className = '',
}: AvatarProps) {
  const initials = getInitials(nombre, apellido);

  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
