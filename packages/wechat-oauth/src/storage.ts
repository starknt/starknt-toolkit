export interface AccessTokenItem {
  access_token: string
  refresh_token: string
  expires_in: number
  openid: string
  scope: string
  unionid?: string
  create_at?: number
}

export abstract class IAccessTokenStorage {
  abstract set(openid: string, item: AccessTokenItem): void
  abstract get(openid: string): AccessTokenItem | undefined
  abstract remove(openid: string): void

  abstract isValid(item: AccessTokenItem): boolean
}

export class AccessTokenStorage extends IAccessTokenStorage {
  private readonly map = new Map<string, AccessTokenItem>()

  set(openid: string, item: AccessTokenItem) {
    this.map.set(openid, { ...item, create_at: Date.now() })
  }

  get(openid: string): AccessTokenItem | undefined {
    return this.map.get(openid)
  }

  remove(openid: string): void {
    this.map.delete(openid)
  }

  isValid(item: AccessTokenItem): boolean {
    if (!item.access_token || !item.expires_in || !item.create_at)
      return false

    return Date.now() < (item.create_at + (item.expires_in * 1000))
  }
}
