export const prepareFormData = <T extends Record<string, any>>(entity: T): FormData => {
    const formData = new FormData();

    Object.entries(entity).forEach(([key, value]) => {
        if (value instanceof File) {
            formData.append(key, value);
            return;
        }
        if (value === null || value === undefined) return;
        formData.append(key, String(value));
    });


    return formData;
};

