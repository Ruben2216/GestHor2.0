/**
 * TwoFactorForm.jsx
 * Pantalla de verificación de código 2FA
 */
import { useState, useRef, useEffect } from "react";
import styles from "../styles/LoginForm.module.css";
import twoFAStyles from "../styles/TwoFactorForm.module.css";

export default function TwoFactorForm({ userId, email, onSuccess, onCancel }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    // Solo permitir dígitos
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError(null);

    // Avanzar al siguiente input automáticamente
    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || "";
      }
      setDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      inputsRef.current[nextFocus]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Ingresa los 6 dígitos del código");
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        const msg = json.mensaje || json.message || "Código incorrecto";
        setError(msg);
        setDigits(["", "", "", "", "", ""]);
        inputsRef.current[0]?.focus();
        return;
      }

      onSuccess(json.data);
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className={styles.loginBackground}>
      <div className={styles.loginContent}>
        <div className={styles.infoSection}>
          <h1 className={styles.systemTitle}>SISTEMA DE HORARIOS</h1>
          <h3 className={styles.systemSubtitle}>Gestión escolar - UNACH</h3>
          <p className={styles.infoText}>
            Verificación en dos pasos activada.
            <br />
            Revisa tu correo electrónico para obtener el código de acceso.
          </p>
        </div>

        <div className={styles.loginCardwrapper}>
          <div className={styles.loginCard}>
            <h2 className={styles.cardTitle}>VERIFICACIÓN 2FA</h2>
            <p className={styles.cardSubtitle}>
              Ingresa el código de 6 dígitos enviado a
              <br />
              <strong>{email}</strong>
            </p>

            <form onSubmit={handleSubmit} className={twoFAStyles.twoFAForm}>
              <div className={twoFAStyles.digitsRow} onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={twoFAStyles.digitInput}
                    autoComplete="one-time-code"
                    aria-label={`Dígito ${i + 1}`}
                  />
                ))}
              </div>

              {error && <div className={styles.errorMsg}>{error}</div>}

              <button
                type="submit"
                className={styles.loginButton}
                disabled={cargando || digits.some((d) => d === "")}
                style={{ marginTop: "16px" }}
              >
                {cargando ? "VERIFICANDO..." : "VERIFICAR CÓDIGO"}
              </button>

              <button
                type="button"
                onClick={onCancel}
                style={{
                  background: "none",
                  border: "none",
                  color: "#666",
                  cursor: "pointer",
                  marginTop: "12px",
                  fontSize: "0.9rem",
                  textDecoration: "underline",
                }}
              >
                ← Volver al inicio de sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
