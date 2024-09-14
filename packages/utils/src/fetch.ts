import type { Result } from '@starknt/ts-results'
import { Err, Ok } from '@starknt/ts-results'

async function tryImport(module: string): Promise<Result<any, unknown>> {
  try {
    return Ok((await import(module)))
  }
  catch (error) {
    return Err(error)
  }
}

export async function fetch<R = Response, E = TypeError>(url: string, init?: RequestInit | undefined): Promise<Result<R, E>> {
  const undici = await tryImport('undici')

  if (undici.isOk() && typeof globalThis.window === 'undefined') {
    const { default: { _fetch } } = undici.value

    return _fetch(url, init)
      .then((res: Response) => Ok(res as R))
      .catch((err: any) => Err(err as E))
  }

  return globalThis.fetch(url, init)
    .then(res => Ok(res as R))
    .catch(err => Err(err as E))
}
