import sodium from 'libsodium-wrappers';

class EncryptionService {
  private initialized = false;
  private keyPair: { publicKey: Uint8Array; privateKey: Uint8Array } | null = null;

  async initialize() {
    if (this.initialized) return;
    await sodium.ready;
    this.initialized = true;
  }

  generateKeyPair() {
    const keyPair = sodium.crypto_box_keypair();
    this.keyPair = keyPair;
    return {
      publicKey: sodium.to_base64(keyPair.publicKey),
      privateKey: sodium.to_base64(keyPair.privateKey),
    };
  }

  loadKeyPair(publicKey: string, privateKey: string) {
    this.keyPair = {
      publicKey: sodium.from_base64(publicKey),
      privateKey: sodium.from_base64(privateKey),
    };
  }

  encrypt(message: string, recipientPublicKey: string): string {
    if (!this.keyPair) throw new Error('Key pair not loaded');
    
    const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
    const encrypted = sodium.crypto_box_easy(
      message,
      nonce,
      sodium.from_base64(recipientPublicKey),
      this.keyPair.privateKey
    );

    return JSON.stringify({
      nonce: sodium.to_base64(nonce),
      encrypted: sodium.to_base64(encrypted),
    });
  }

  decrypt(encryptedData: string, senderPublicKey: string): string {
    if (!this.keyPair) throw new Error('Key pair not loaded');

    const { nonce, encrypted } = JSON.parse(encryptedData);
    const decrypted = sodium.crypto_box_open_easy(
      sodium.from_base64(encrypted),
      sodium.from_base64(nonce),
      sodium.from_base64(senderPublicKey),
      this.keyPair.privateKey
    );

    return sodium.to_string(decrypted);
  }

  getPublicKey(): string | null {
    return this.keyPair ? sodium.to_base64(this.keyPair.publicKey) : null;
  }
}

export const encryptionService = new EncryptionService();
