import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { decryptField, encryptField } from '../src/services/fieldEncryptionService.js';

const TEST_KEY = Buffer.from('clave-de-prueba-para-aes-256-gcm').toString('base64');
const originalKey = process.env.APP_ENCRYPTION_KEY_B64;

beforeEach(() => {
  process.env.APP_ENCRYPTION_KEY_B64 = TEST_KEY;
});

afterEach(() => {
  if (originalKey === undefined) {
    delete process.env.APP_ENCRYPTION_KEY_B64;
  } else {
    process.env.APP_ENCRYPTION_KEY_B64 = originalKey;
  }
});

describe('fieldEncryptionService', () => {
  it('cifra y descifra el texto original', () => {
    const text = 'Preferencia de horario: martes por la mañana';
    const encrypted = encryptField(text);

    expect(encrypted).not.toContain(text);
    expect(decryptField(encrypted)).toBe(text);
  });

  it('genera un valor distinto al cifrar dos veces el mismo texto', () => {
    const text = 'Comentario de prueba';

    expect(encryptField(text)).not.toBe(encryptField(text));
  });

  it('detecta alteraciones del ciphertext y del tag de autenticación', () => {
    const encrypted = encryptField('Texto que debe autenticarse');
    const components = encrypted.split(':');
    const changedTag = `${components[2][0] === '0' ? '1' : '0'}${components[2].slice(1)}`;

    const alteredCiphertext = `${encrypted.slice(0, -1)}${encrypted.endsWith('0') ? '1' : '0'}`;
    const alteredTagValue = [components[0], components[1], changedTag, components[3]].join(':');

    expect(() => decryptField(alteredCiphertext)).toThrow();
    expect(() => decryptField(alteredTagValue)).toThrow();
  });

  it('rechaza valores incompletos, versiones desconocidas y ciphertext mal formado', () => {
    expect(() => decryptField('v1:00:00:')).toThrow(/formato|incompleto/i);
    expect(() => decryptField('v2:000000000000000000000000:00000000000000000000000000000000:')).toThrow(/formato/i);
    expect(() => decryptField('v1:000000000000000000000000:00000000000000000000000000000000:xyz')).toThrow(/incompleto/i);
  });

  it('conserva null y cifra la cadena vacía como un valor no nulo', () => {
    expect(encryptField(null)).toBeNull();
    expect(decryptField(null)).toBeNull();

    const encryptedEmpty = encryptField('');
    expect(encryptedEmpty).not.toBeNull();
    expect(decryptField(encryptedEmpty)).toBe('');
  });

  it.each([
    ['ausente', undefined],
    ['Base64 mal formado', 'esto-no-es-base64'],
    ['tamaño incorrecto', Buffer.from('clave-corta').toString('base64')],
  ])('rechaza una clave %s sin revelar su valor', (_description, key) => {
    if (key === undefined) {
      delete process.env.APP_ENCRYPTION_KEY_B64;
    } else {
      process.env.APP_ENCRYPTION_KEY_B64 = key;
    }

    expect(() => encryptField('texto')).toThrow(/APP_ENCRYPTION_KEY_B64/);
    if (key !== undefined) {
      try {
        encryptField('texto');
      } catch (error) {
        expect(error.message).not.toContain(key);
      }
    }
  });

  it('falla al descifrar con una clave diferente', () => {
    const encrypted = encryptField('Texto secreto');
    process.env.APP_ENCRYPTION_KEY_B64 = Buffer.from('otra-clave-de-prueba-aes-256-gcm').toString('base64');

    expect(() => decryptField(encrypted)).toThrow();
  });

  it('descifra con la misma clave tras volver a cargar el módulo', async () => {
    const encrypted = encryptField('Persistencia entre cargas');
    const reloadedService = await import(`../src/services/fieldEncryptionService.js?reload=${Date.now()}`);

    expect(reloadedService.decryptField(encrypted)).toBe('Persistencia entre cargas');
  });

  it('rechaza valores que no sean texto o null', () => {
    expect(() => encryptField(123)).toThrow(TypeError);
    expect(() => decryptField({})).toThrow(TypeError);
  });
});
