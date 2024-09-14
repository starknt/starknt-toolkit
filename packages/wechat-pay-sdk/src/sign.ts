import type { KeyLike } from 'node:crypto'
import crypto from 'node:crypto'
import { Buffer } from 'node:buffer'
import type { Result } from '@starknt/utils'
import { Err, Ok, format, parseJSON } from '@starknt/utils'
import type { WechatPayDecodeData } from './model'

export function sha256Sign(privateKey: KeyLike, content: string) {
  return crypto.createSign('RSA-SHA256', { defaultEncoding: 'utf8' })
    .update(content)
    .sign(privateKey, 'base64')
}

export function verifySignature(publicKey: KeyLike, timestamp: string, nonce: string, signature: string, body: string | Record<string, any>) {
  const message = format(
    '{}\n{}\n{}\n',
    timestamp,
    nonce,
    typeof body === 'string' ? body : JSON.stringify(body),
  )

  return crypto.createVerify('RSA-SHA256')
    .update(message)
    .verify(publicKey, signature, 'base64')
}

export function decryptPayData(ciphertext: string, nonce: string, associatedData: string, v3Key: string): Result<WechatPayDecodeData, string> {
  const plaintext = decryptBytes(ciphertext, nonce, associatedData, v3Key)
  const data = parseJSON<WechatPayDecodeData, string>(plaintext)
  return data
}

export function decryptBytes(
  ciphertext: string,
  nonce: string,
  associatedData: string,
  v3Key: string,
): Result<string, 'nonce length must be 12' | 'Unsupported state or unable to authenticate data'> {
  if (nonce.length !== 12)
    return Err('nonce length must be 12')

  const _ciphertext = Buffer.from(ciphertext, 'base64')
  const auth = _ciphertext.subarray(_ciphertext.length - 16)
  const data = _ciphertext.subarray(0, _ciphertext.length - 16)
  const cipher = crypto.createDecipheriv('aes-256-gcm', v3Key, nonce)
  cipher.setAuthTag(auth)
  cipher.setAAD(Buffer.from(associatedData))
  try {
    const plaintext = Buffer.concat([
      cipher.update(data),
      cipher.final(),
    ])
    return Ok(plaintext.toString('utf8'))
  }
  catch {
    return Err('Unsupported state or unable to authenticate data')
  }
}
