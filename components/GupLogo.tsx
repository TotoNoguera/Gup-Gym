import Image from 'next/image';

interface GupLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
}

export default function GupLogo({ size = 'md', variant = 'default' }: GupLogoProps) {
  const sizes = {
    sm: { width: 100, height: 100 },
    md: { width: 150, height: 150 },
    lg: { width: 200, height: 200 },
  };

  return (
    <div className={`flex items-center justify-center ${variant === 'white' ? 'bg-white rounded-lg p-4' : ''}`}>
      <Image
        src="/gup-logo.jpg"
        alt="GUP Gym"
        width={sizes[size].width}
        height={sizes[size].height}
        priority
        className="object-contain"
      />
    </div>
  );
}
