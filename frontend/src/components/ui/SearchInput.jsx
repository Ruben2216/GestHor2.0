import { useState } from "react";
import styles from './SearchInput.module.css';

export default function SearchInput({
    value = "",
    onChange,
    placeholder = " Buscar...",
    disabled = false,
    className = "",
    showClearButton = true
}) {
    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };

    const handleClear = () => {
        if (onChange) {
            onChange("");
        }
    };

    const fieldClass = `${className} input ${styles['search-input__field']} ${showClearButton && value ? styles['search-input__field--with-clear'] : ''}`;

    return (
        <div className={styles['search-input']}>
            <input
                type="text"
                className={fieldClass}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                disabled={disabled}
            />
            {showClearButton && value && !disabled && (
                <button
                    type="button"
                    onClick={handleClear}
                    className={styles['search-input__clear']}
                    title="Limpiar búsqueda"
                >
                    ×
                </button>
            )}
        </div>
    );
}
