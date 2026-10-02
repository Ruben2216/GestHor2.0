import React from 'react';
import { createRoot } from 'react-dom/client';
import styles from './ConfirmModal.module.css';

function Confirm({ message, onCancel, onAccept }) {
    return (
        <div className={styles['confirm-modal__overlay']} onMouseDown={onCancel}>
            <div className={styles['confirm-modal__box']} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <div className={styles['confirm-modal__message']}>{message}</div>
                <div className={styles['confirm-modal__footer']}>
                    <button className={styles['confirm-modal__btn--cancel']} onClick={onCancel}>Cancelar</button>
                    <button className={styles['confirm-modal__btn--accept']} onClick={onAccept}>Aceptar</button>
                </div>
            </div>
        </div>
    );
}

export default function showConfirm(message) {
    return new Promise((resolve) => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);

        const cleanup = (result) => {
            try {
                root.unmount();
            } catch (e) {
                // ignore
            }
            if (container.parentNode) container.parentNode.removeChild(container);
            resolve(result);
        };

        const handleCancel = () => cleanup(false);
        const handleAccept = () => cleanup(true);

        root.render(<Confirm message={message} onCancel={handleCancel} onAccept={handleAccept} />);
    });
}
