import Image from 'next/image';

interface AvatarProps {
    src?: string | null;
    name?: string;
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ src, name, className = '', size = 'md' }: AvatarProps) {
    const initials = name?.slice(0, 1).toUpperCase() || '?';

    const sizeMap = {
        xs: 'w-5 h-5 text-[8px]',
        sm: 'w-6 h-6 text-[10px]',
        md: 'w-10 h-10 text-xs',
        lg: 'w-16 h-16 text-base',
        xl: 'w-24 h-24 text-xl'
    };

    const containerClasses = `relative rounded-full overflow-hidden border border-black/5 bg-neutral-50 flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`;

    return (
        <div className={containerClasses}>
            {src ? (
                <Image
                    src={src}
                    alt={name || 'Avatar'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 40px, 64px"
                />
            ) : (
                <div className="h-full w-full bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center">
                    <span className="font-black text-white leading-none uppercase tracking-tighter">
                        {initials}
                    </span>
                </div>
            )}
        </div>
    );
}
