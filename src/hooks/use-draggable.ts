import { useState, useCallback, useEffect, RefObject } from 'react';

interface Position {
    x: number;
    y: number;
}

export function useDraggable(ref: RefObject<HTMLElement | null>, storageKey?: string) {
    const [position, setPosition] = useState<Position>(() => {
        if (typeof window !== 'undefined' && storageKey) {
            const saved = localStorage.getItem(storageKey);
            if (saved) return JSON.parse(saved);
        }
        return { x: 0, y: 0 };
    });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
    const [hasMoved, setHasMoved] = useState(false);
    const [isSnapping, setIsSnapping] = useState(false);

    // Save position to localStorage
    useEffect(() => {
        if (storageKey && !isDragging && !isSnapping) {
            localStorage.setItem(storageKey, JSON.stringify(position));
        }
    }, [position, storageKey, isDragging, isSnapping]);

    const handleMouseDown = useCallback((e: MouseEvent | TouchEvent) => {
        if (!ref.current) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        setIsDragging(true);
        setIsSnapping(false);
        setHasMoved(false);
        setDragStart({
            x: clientX - position.x,
            y: clientY - position.y
        });
    }, [position, ref]);

    const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging || !ref.current) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        let newX = clientX - dragStart.x;
        let newY = clientY - dragStart.y;

        const rect = ref.current.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const padding = 16;

        const nextLeft = rect.left + (newX - position.x);
        const nextTop = rect.top + (newY - position.y);
        const nextRight = nextLeft + rect.width;
        const nextBottom = nextTop + rect.height;

        if (nextLeft < padding) newX = position.x - (rect.left - padding);
        else if (nextRight > screenWidth - padding) newX = position.x + (screenWidth - rect.right - padding);

        if (nextTop < padding) newY = position.y - (rect.top - padding);
        else if (nextBottom > screenHeight - padding) newY = position.y + (screenHeight - rect.bottom - padding);

        if (Math.abs(newX - position.x) > 5 || Math.abs(newY - position.y) > 5) setHasMoved(true);
        setPosition({ x: newX, y: newY });
    }, [isDragging, dragStart, position, ref]);

    const handleMouseUp = useCallback(() => {
        if (!isDragging || !ref.current) return;
        setIsDragging(false);

        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const screenWidth = window.innerWidth;

        setIsSnapping(true);

        if (centerX < screenWidth / 2) {
            const targetX = position.x - rect.left + 16;
            setPosition(prev => ({ ...prev, x: targetX }));
        } else {
            const targetX = position.x + (screenWidth - rect.right - 16);
            setPosition(prev => ({ ...prev, x: targetX }));
        }
    }, [isDragging, ref, position]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (!ref.current || isDragging) return;
            const rect = ref.current.getBoundingClientRect();
            const screenWidth = window.innerWidth;
            const padding = 16;

            // Re-snap to closest side on resize
            setIsSnapping(true);
            if (rect.left + rect.width / 2 < screenWidth / 2) {
                setPosition(prev => ({ ...prev, x: prev.x - rect.left + padding }));
            } else {
                setPosition(prev => ({ ...prev, x: prev.x + (screenWidth - rect.right - padding) }));
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [ref, isDragging]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleMouseMove, { passive: false });
            window.addEventListener('touchend', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return {
        position,
        isDragging,
        hasMoved,
        handleMouseDown,
        handleTouchStart: handleMouseDown,
        style: {
            transform: `translate(${position.x}px, ${position.y}px)`,
            cursor: isDragging ? 'grabbing' : 'auto',
            touchAction: 'none',
            transition: isSnapping ? 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)' : 'none',
            zIndex: isDragging ? 100000 : 99999
        }
    };
}
