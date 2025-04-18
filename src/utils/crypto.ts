
// Simulated cryptographic operations for visualization purposes

// Simulates AES encryption/decryption for the UI
export const simulateAESEncryption = (data: string): string => {
  // In a real app, we'd do actual encryption here
  return `AES_${data}_ENCRYPTED`;
};

export const simulateAESDecryption = (encryptedData: string): string => {
  // In a real app, we'd do actual decryption here
  return encryptedData.replace('AES_', '').replace('_ENCRYPTED', '');
};

// Simulates RSA encryption/decryption for the UI
export const simulateRSAEncryption = (data: string): string => {
  // In a real app, we'd do actual encryption here
  return `RSA_${data}_ENCRYPTED`;
};

export const simulateRSADecryption = (encryptedData: string): string => {
  // In a real app, we'd do actual decryption here
  return encryptedData.replace('RSA_', '').replace('_ENCRYPTED', '');
};

// Simulates hash computation for data integrity checks
export const simulateSHA256Hash = (data: string): string => {
  // In a real app, we'd compute an actual SHA-256 hash
  let hash = '';
  const characters = 'abcdef0123456789';
  const stringToHash = JSON.stringify(data);
  
  // Generate a predictable "hash" based on the input
  for (let i = 0; i < 64; i++) {
    const charIndex = (stringToHash.charCodeAt(i % stringToHash.length) + i) % characters.length;
    hash += characters[charIndex];
  }
  
  return hash;
};

// Generates a random encryption key (for UI purposes)
export const generateEncryptionKey = (): string => {
  let key = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (let i = 0; i < 32; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return key;
};

// Simulates key exchange for DKMS (Dynamic Key Management System)
export const simulateKeyExchange = (nodeIds: string[]): Record<string, string> => {
  const keys: Record<string, string> = {};
  
  nodeIds.forEach(nodeId => {
    keys[nodeId] = generateEncryptionKey();
  });
  
  return keys;
};
