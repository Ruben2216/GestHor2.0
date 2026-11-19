import { describe, expect, it } from '@jest/globals';
import { generateRecoveryCode, hashPassword, comparePassword } from '../src/utils/crypto.js';
import { validateResetPassword } from '../src/validators/authValidator.js';

describe('recuperación de contraseña con código', () => {
  it('genera códigos numéricos de exactamente seis dígitos', () => {
    for (let index = 0; index < 20; index += 1) {
      expect(generateRecoveryCode()).toMatch(/^\d{6}$/);
    }
  });

  it('valida el correo, el código de seis dígitos y la nueva contraseña', () => {
    expect(validateResetPassword('persona@example.com', '004281', 'NuevaPass1!')).toEqual({
      email: 'persona@example.com',
      code: '004281',
      newPassword: 'NuevaPass1!',
    });
  });

  it('rechaza códigos con longitud incorrecta o caracteres no numéricos', () => {
    for (const code of ['12345', '1234567', '12a456']) {
      expect(() => validateResetPassword('persona@example.com', code, 'NuevaPass1!')).toThrow();
    }
  });

  it('permite verificar el código contra un hash sin almacenarlo en claro', async () => {
    const code = generateRecoveryCode();
    const codeHash = await hashPassword(code);

    expect(codeHash).not.toBe(code);
    expect(await comparePassword(code, codeHash)).toBe(true);
    expect(await comparePassword(`${code}x`, codeHash)).toBe(false);
  });
});
