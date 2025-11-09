/**
 * Shared utilities for Glacier
 * @author Glacier
 */

import { keccak256, toUtf8Bytes } from 'ethers';

// ========================================
// Hash and Cryptography Utilities
// ========================================

/**
 * Generates a Keccak256 hash of a string
 */
export function hashString(input: string): `0x${string}` {
  return keccak256(toUtf8Bytes(input)) as `0x${string}`;
}

/**
 * Generates a unique nullifier hash to prevent double voting
 */
export function generateNullifierHash(
  identitySecret: string, 
  electionId: string
): `0x${string}` {
  const combined = `${identitySecret}:${electionId}`;
  return hashString(combined);
}

/**
 * Generates a random identity secret
 */
export function generateIdentitySecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a random nonce
 */
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

// ========================================
// Format Utilities
// ========================================

/**
 * Formats an Ethereum address for display
 */
export function formatAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`;
}

/**
 * Formats a transaction hash
 */
export function formatTxHash(hash: string, chars = 6): string {
  return formatAddress(hash, chars);
}

/**
 * Formats timestamp to readable date
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString();
}

/**
 * Formatea timestamp a fecha y hora legible
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

/**
 * Calcula tiempo restante desde timestamp
 */
export function getTimeRemaining(endTime: number): {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
} {
  const now = Math.floor(Date.now() / 1000);
  const total = endTime - now;
  
  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  
  return {
    total,
    days: Math.floor(total / (24 * 60 * 60)),
    hours: Math.floor((total % (24 * 60 * 60)) / (60 * 60)),
    minutes: Math.floor((total % (60 * 60)) / 60),
    seconds: total % 60,
    expired: false
  };
}

// ========================================
// Utilidades de Validación
// ========================================

/**
 * Valida si una dirección Ethereum es válida
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Valida si un hash es válido (32 bytes)
 */
export function isValidHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Valida si un chain ID es soportado
 */
export function isSupportedChain(chainId: number): boolean {
  return chainId === 43113 || chainId === 43114 || chainId === 31337; // Fuji, Mainnet, Local
}

// ========================================
// Utilidades de Conversión
// ========================================

/**
 * Convierte BigInt a string
 */
export function bigIntToString(value: bigint): string {
  return value.toString();
}

/**
 * Convierte string a BigInt de forma segura
 */
export function stringToBigInt(value: string): bigint {
  try {
    return BigInt(value);
  } catch {
    return BigInt(0);
  }
}

/**
 * Convierte bytes a hex string
 */
export function bytesToHex(bytes: Uint8Array): `0x${string}` {
  return `0x${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}` as `0x${string}`;
}

/**
 * Convierte hex string a bytes
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  return new Uint8Array(cleanHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
}

// ========================================
// Utilidades de URL
// ========================================

/**
 * Genera URL del explorer para una transacción
 */
export function getExplorerTxUrl(txHash: string, chainId: number): string {
  switch (chainId) {
    case 43113: // Fuji
      return `https://testnet.snowtrace.io/tx/${txHash}`;
    case 43114: // Mainnet
      return `https://snowtrace.io/tx/${txHash}`;
    default:
      return '#';
  }
}

/**
 * Genera URL del explorer para una dirección
 */
export function getExplorerAddressUrl(address: string, chainId: number): string {
  switch (chainId) {
    case 43113: // Fuji
      return `https://testnet.snowtrace.io/address/${address}`;
    case 43114: // Mainnet
      return `https://snowtrace.io/address/${address}`;
    default:
      return '#';
  }
}

// ========================================
// Utilidades de Error
// ========================================

/**
 * Crea un error tipado de Glacier
 */
export function createGlacierError(
  code: string, 
  message: string, 
  details?: any
): Error {
  const error = new Error(message);
  (error as any).code = code;
  (error as any).details = details;
  return error;
}

/**
 * Verifica si un error es de tipo Glacier
 */
export function isGlacierError(error: any): boolean {
  return error && typeof error.code === 'string';
}

// ========================================
// Utilidades de Almacenamiento Local
// ========================================

/**
 * Guarda datos en localStorage de forma segura
 */
export function saveToStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

/**
 * Carga datos de localStorage de forma segura
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to load from localStorage:', error);
    return defaultValue;
  }
}

/**
 * Elimina datos de localStorage
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
  }
}

// ========================================
// Utilidades de Delay
// ========================================

/**
 * Crea una pausa async
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry con backoff exponencial
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delayMs = baseDelay * Math.pow(2, i);
      await delay(delayMs);
    }
  }
  
  throw new Error('Max retries exceeded');
}