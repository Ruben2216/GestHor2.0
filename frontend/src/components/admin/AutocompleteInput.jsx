import { useState, useEffect } from "react";
import styles from "./AutocompleteInput.module.css";

export default function AutocompleteInput({
    items,
    onSelect,
    placeholder = "Buscar...",
    disabled = false,
    getItemKey,
    getItemLabel,
    onSearchChange = null // Nueva prop para búsqueda dinámica
}) {
    const [busqueda, setBusqueda] = useState("");
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

    useEffect(() => {
        if (onSearchChange && busqueda) {
            const timer = setTimeout(() => {
                onSearchChange(busqueda);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [busqueda, onSearchChange]);

    const itemsFiltrados = onSearchChange
        ? items
        : items.filter(item =>
            getItemLabel(item).toLowerCase().includes(busqueda.toLowerCase())
          );

    const handleSelect = (item) => {
        onSelect(item);
        try {
            setBusqueda(getItemLabel(item));
        } catch (e) {
            setBusqueda("");
        }
        setMostrarSugerencias(false);
    };

    const inputClass = `${styles["autocomplete-input__input"]} ${disabled ? styles["autocomplete-input__input--disabled"] : ""}`.trim();

    return (
        <div className={styles["autocomplete-input"]}>
            <input
                className={`${inputClass} input`}
                placeholder={placeholder}
                value={busqueda}
                onChange={(e) => {
                    setBusqueda(e.target.value);
                    setMostrarSugerencias(e.target.value.length > 0);
                }}
                onFocus={() => busqueda.length > 0 && setMostrarSugerencias(true)}
                disabled={disabled}
            />

            {mostrarSugerencias && busqueda && (
                <div className={styles["autocomplete-input__list"]}>
                    {itemsFiltrados.length === 0 ? (
                        <div className={styles["autocomplete-input__no-results"]}>
                            {busqueda.length < 2
                                ? "Escribe al menos 2 caracteres..."
                                : `No se encontraron resultados con "${busqueda}"`
                            }
                        </div>
                    ) : (
                        itemsFiltrados.map((item) => (
                            <div
                                key={getItemKey(item)}
                                onClick={() => handleSelect(item)}
                                className={styles["autocomplete-input__item"]}
                            >
                                {getItemLabel(item)}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
