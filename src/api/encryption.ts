import * as CryptoJS from 'crypto-js';

const IV_LENGTH = 16;

function getEncryptionKey(): string {
  const key = import.meta.env.VITE_ENCRYPTION_KEY || 'e370d98b6da5477c9a4f222ce8df1e1033f79d85d0b62755c5233704243c6082';
  if (!key) {
    throw new Error("Encryption key is not set in the environment variables.");
  }
  return key;
}

function getEncryptionKeyHashed(): string {
  return CryptoJS.SHA256(getEncryptionKey()).toString(CryptoJS.enc.Hex);
}

export const encrypt = (data: unknown): string => {
  // Validate input
  if (data === null || data === undefined) {
    throw new Error('Cannot encrypt null or undefined data');
  }
  
  const text = JSON.stringify(data); // Serialize the object to a string
  const iv = CryptoJS.lib.WordArray.random(IV_LENGTH);
  const cipherText = CryptoJS.AES.encrypt(text, CryptoJS.enc.Hex.parse(getEncryptionKeyHashed()), {
    iv,
  }).toString();
  return `${iv.toString()}:${cipherText}`;
};

// Decrypt function
export const decrypt = (text: string): unknown => {
  // Validate input
  if (!text || typeof text !== 'string') {
    console.warn('Decrypt called with invalid input:', text);
    return text; // Return as-is if not a valid string
  }

  // Check if text contains colon (encrypted format: ivHex:cipherText)
  if (!text.includes(':')) {
    console.warn('Decrypt called with non-encrypted data, returning as-is');
    return text; // Return as-is if not in encrypted format
  }

  try {
    const [ivHex, cipherText] = text.split(':');
    
    // Validate split result
    if (!ivHex || !cipherText) {
      console.warn('Invalid encrypted format, missing IV or ciphertext');
      return text; // Return as-is if format is invalid
    }

    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const decryptedBytes = CryptoJS.AES.decrypt(cipherText, CryptoJS.enc.Hex.parse(getEncryptionKeyHashed()), {
      iv,
    });
    const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) {
      console.warn('Decryption resulted in empty text, returning original');
      return text;
    }

    try {
      return JSON.parse(decryptedText); // Parse the string back to an object
    } catch (e) {
      // Handle potential JSON parsing errors
      console.error("Error parsing decrypted JSON:", e);
      return decryptedText; // Or handle the error as needed
    }
  } catch (error) {
    console.error('Decryption error:', error);
    return text; // Return original text if decryption fails
  }
};