export const formatDate = (date?: string | Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};
