"use client";

import Image from 'next/image';

interface AvatarProps {
    src?: string | null;
    name?: string;
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Avatar({ src, name, className = '', size = 'md' }: AvatarProps) {
    const initials = name?.trim().slice(0, 1).toUpperCase() || '?';

    const sizeMap = {
        xs: 'w-4 h-4 text-[8px]',
        sm: 'w-6 h-6 text-[10px]',
        md: 'w-8 h-8 text-xs',
        lg: 'w-10 h-10 text-sm',
        xl: 'w-12 h-12 text-base',
        '2xl': 'w-16 h-16 text-lg'
    };

    return (
        <div 
            className={`
                relative 
                ${sizeMap[size]} 
                rounded-md 
                overflow-hidden 
                border 
                border-border 
                bg-secondary 
                flex 
                items-center 
                justify-center 
                shrink-0 
                select-none
                ${className}
            `.trim()}
        >
            {src ? (
                <Image
                    src={src}
                    alt={name || 'User avatar'}
                    fill
                    className="object-cover"
                    sizes={
                        size === 'xs' ? '16px' :
                        size === 'sm' ? '24px' :
                        size === 'md' ? '32px' :
                        size === 'lg' ? '40px' :
                        size === 'xl' ? '48px' : '64px'
                    }
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <span className="font-semibold text-secondary-foreground/90 tracking-tight leading-none">
                        {initials}
                    </span>
                </div>
            )}
        </div>
    );
}