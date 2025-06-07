import { CDILogo } from '../assets/cdi-logo';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <CDILogo className={sizeClasses[size]} />
      {showText && (
        <span className={`font-semibold text-foreground ${textSizeClasses[size]}`}>
          产业集群发展潜力评估系统
        </span>
      )}
    </div>
  );
}