import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import styles from './Toast.module.css';

const ToastContext = createContext(null);

let nextId = 1;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const notify = useCallback(({ message, type = 'success', duration = 5000 }) => {
        const id = nextId++;
        setToasts((t) => [...t, { id, message, type }]);
        // auto remover
        setTimeout(() => {
            setToasts((t) => t.filter((x) => x.id !== id));
        }, duration);
    }, []);

    const remove = useCallback((id) => {
        setToasts((t) => t.filter((x) => x.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ notify }}>
            {children}
            <div className={styles['toasts__container']} aria-live="polite">
                {toasts.map((t) => (
                    <div key={t.id} className={`${styles['toasts__item']} ${t.type === 'error' ? styles['toasts__item--error'] : styles['toasts__item--success']}`}>
                        <div className={styles['toasts__message']}>{t.message}</div>
                        <button className={styles['toasts__close']} onClick={() => remove(t.id)} aria-label="Cerrar">×</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
};

export default ToastProvider;
