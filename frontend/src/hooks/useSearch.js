import { useMemo } from "react";


export const useSearch = (items = [], searchTerm = "", searchKeys = []) => {
    return useMemo(() => {
        if (!searchTerm.trim()) {
            return items;
        }

        const termLower = searchTerm.toLowerCase().trim();

        return items.filter((item) => {
            // Si no hay keys especificadas, buscar en todas las propiedades string
            if (searchKeys.length === 0) {
                return Object.values(item).some((value) => {
                    if (typeof value === "string") {
                        return value.toLowerCase().includes(termLower);
                    }
                    return false;
                });
            }

            // Buscar en las keys especificadas
            return searchKeys.some((key) => {
                const value = item[key];
                if (typeof value === "string") {
                    return value.toLowerCase().includes(termLower);
                }
                if (typeof value === "number") {
                    return value.toString().includes(termLower);
                }
                return false;
            });
        });
    }, [items, searchTerm, searchKeys]);
};
