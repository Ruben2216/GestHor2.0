import { useState } from 'react';
import styles from './PasswordInput.module.css';


const PasswordInput = ({ 
    id, 
    value, 
    onChange, 
    placeholder = "Ingresa tu contraseña",
    required = false,
    label = "Contraseña"
}) => {
    const [mostrarPassword, setMostrarPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setMostrarPassword(!mostrarPassword);
    };

    return (
        <div className={styles['password-input']}>
            {label && <label htmlFor={id} className={styles['password-input__label']}>{label}</label>}
            <div className={styles['password-input__wrapper']}>
                <input
                    type={mostrarPassword ? "text" : "password"}
                    id={id}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={styles['password-input__field']}
                    placeholder={placeholder}
                />
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className={styles['password-input__toggle']}
                    aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    tabIndex="-1"
                >
                    {mostrarPassword ? (
                        // Icono de ojo cerrado
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                    ) : (
                        // Icono de ojo abierto
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
};

export default PasswordInput;
