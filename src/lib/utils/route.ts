export function isPathInRoutes(pathname: string, routes: string[]): boolean {
    return routes.some(route => {
        if (route.includes('[id]')) {
            const marker = "___ID_MARKER___";
            const escapedPattern = route
                .split('[id]').join(marker)
                .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                .split(marker).join('[^/]+');

            return new RegExp(`^${escapedPattern}/?$`).test(pathname);
        }
        return route === pathname || route === `${pathname}/` || `${route}/` === pathname;
    });
}
