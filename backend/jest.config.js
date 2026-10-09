/**
 * Jest Configuration for GestHor 2.0 Backend
 * Configurado para ES Modules (ESM) nativo con --experimental-vm-modules
 */
export default {
  testEnvironment: 'node',
  // NO usar transform — dejar que Node.js nativo maneje ESM
  transform: {},
  testMatch: [
    '**/tests/**/*.test.js',
  ],
  // Timeout generoso para tests de integración contra la BD real
  testTimeout: 30000,
  verbose: true,
};
