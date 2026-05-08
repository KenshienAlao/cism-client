export function getRelativeTime(date: string | Date): string {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export function getTimeGroup(date: string | Date): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    const isToday = now.toDateString() === then.toDateString();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.toDateString() === then.toDateString();

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const isThisWeek = then >= weekAgo;

    if (diffMinutes < 5) return 'Just now';
    if (isToday) return 'Earlier today';
    if (isYesterday) return 'Yesterday';
    if (isThisWeek) return 'This week';
    return 'Older';
}

export function groupByTime<T extends { time: string | Date }>(
    items: T[]
): { label: string; items: T[] }[] {
    const ORDER = ['Just now', 'Earlier today', 'Yesterday', 'This week', 'Older'];
    const groups: Record<string, T[]> = {};

    items.forEach(item => {
        const label = getTimeGroup(item.time);
        if (!groups[label]) groups[label] = [];
        groups[label].push(item);
    });

    return ORDER
        .filter(label => groups[label]?.length > 0)
        .map(label => ({ label, items: groups[label] }));
}
