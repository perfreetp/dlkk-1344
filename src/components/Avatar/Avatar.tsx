import { User, UserCircle } from 'lucide-react';

interface AvatarProps {
  name: string;
  avatar?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  gender?: 'male' | 'female';
}

const Avatar = ({ name, avatar, size = 'md', gender = 'male' }: AvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-24 h-24 text-4xl',
  };

  const bgColors = {
    male: 'bg-sky-100 text-sky-600',
    female: 'bg-sakura-100 text-sakura-500',
  };

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-md`}
      />
    );
  }

  const initial = name?.charAt(0) || '?';
  const colorClass = bgColors[gender];

  return (
    <div
      className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center font-bold shadow-md`}
    >
      {initial}
    </div>
  );
};

export default Avatar;
