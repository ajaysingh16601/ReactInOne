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

export const encrypt = (data: any): string => {
  const text = JSON.stringify(data); // Serialize the object to a string
  const iv = CryptoJS.lib.WordArray.random(IV_LENGTH);
  const cipherText = CryptoJS.AES.encrypt(text, CryptoJS.enc.Hex.parse(getEncryptionKeyHashed()), {
    iv,
  }).toString();
  return `${iv.toString()}:${cipherText}`;
};

// Decrypt function
export const decrypt = (text: string): any => { // Changed return type to any
  const [ivHex, cipherText] = text.split(':');
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const decryptedBytes = CryptoJS.AES.decrypt(cipherText, CryptoJS.enc.Hex.parse(getEncryptionKeyHashed()), {
    iv,
  });
  const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
  try {
    return JSON.parse(decryptedText); // Parse the string back to an object
  } catch (e) {
    // Handle potential JSON parsing errors
    console.error("Error parsing decrypted JSON:", e);
    return decryptedText; // Or handle the error as needed
  }
};