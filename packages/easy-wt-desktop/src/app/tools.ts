import * as crypto from 'crypto';

const algorithm = 'AES-128-CBC';
// generate 16 bytes of random data
const key = Buffer.from('e43ee68382dc550fbd1d329486febdd4', 'hex');
const iv = Buffer.from('ddffc44a93503156abb36e9bbca876f8', 'hex');

export function encryptedData(data: string) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encryptedData = cipher.update(data, 'utf-8', 'hex');
  encryptedData += cipher.final('hex');
  return encryptedData;
}

export function decryptedData(data: string) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decryptedData = decipher.update(data, 'hex', 'utf-8');
  decryptedData += decipher.final('utf8');
  return decryptedData;
}
