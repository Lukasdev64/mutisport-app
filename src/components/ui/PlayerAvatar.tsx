import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PlayerAvatarProps {
  src?: string;
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export function PlayerAvatar({ src, name, className, fallbackClassName }: PlayerAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate a consistent color based on the name
  const getColor = (name: string) => {
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
      'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
      'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500', 
      'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (!src || hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center rounded-full text-white font-bold text-xs select-none",
          getColor(name),
          className,
          fallbackClassName
        )}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={cn("object-cover rounded-full bg-slate-800", className)}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}
