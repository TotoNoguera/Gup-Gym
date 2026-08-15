interface GupLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function GupLogo({ size = 'md' }: GupLogoProps) {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  return (
    <svg
      viewBox="0 0 300 120"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      className={`${sizes[size]}`}
    >
      <text
        x="150"
        y="70"
        fontFamily="Arial, sans-serif"
        fontSize="72"
        fontWeight="bold"
        fill="#FF7A00"
        textAnchor="middle"
        letterSpacing="4"
      >
        GUP
      </text>

      <text
        x="150"
        y="105"
        fontFamily="Arial, sans-serif"
        fontSize="18"
        fill="#e8e8e8"
        textAnchor="middle"
        letterSpacing="8"
      >
        II - GYM - II
      </text>
    </svg>
  );
}
