import type { Buffer } from 'node:buffer'
import type { Option } from '@starknt/utils'
import { None, Some, isUndefined } from '@starknt/utils'

interface Certificate {
  public_key: string | Buffer
  expires_time: string
}

class CertificateManager {
  #map = new Map<string, Certificate>()

  get(serial_no: string): Option<Certificate> {
    if (this.#map.has(serial_no))
      return None

    return Some(this.#map.get(serial_no)!)
  }

  getLatest(): Option<Certificate> {
    const certificate = Array.from(this.#map.values())
      .sort((a, b) => Date.parse(b.expires_time) - Date.parse(a.expires_time))[0]

    if (isUndefined(certificate))
      return None

    return Some(certificate)
  }

  set(serial_no: string, certificate: Certificate): void
  set(serial_no: string, certificate: Certificate) {
    this.#map.set(serial_no, certificate)
  }
}

export const certificateManager = new CertificateManager()
