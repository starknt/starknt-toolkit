import { WechatPayClient } from '@starknt/wechat-pay-sdk'
import { Err } from '@starknt/utils'
import { beforeAll, describe, expect, it } from 'vitest'
import dotenv from 'dotenv'

beforeAll(() => {
  dotenv.config({
    path: '.env',
  })
})

describe('sdk', () => {
  it('decrypt paydata [API KEY not matched]', () => {
    const associated_data = 'transaction'
    const nonce = 'gZiqzlfayUu2'
    const ciphertext = 'pCidqdiS5IIj5f9Pw9j69zuzu8l8IxcPCkfsTBKzna4gqZztNAqTMUY/Ai0rtj8qhaX0naYZF3a2lRid/ofK/83MNv+Neb5+w/0+UOO9nLNJvIFy3oFeMf2PTbp6tgDE35T5AoP9iKQ+1VkXTiUdRxzFoRx6/LfBzHmeuVEDHKScRqjrf6NdxuDDD0ciCQaiHmb18Y0BRZdfNxWTAC83Rar5yTX2NNZPBtGdFDG3yAK2I3Vp7ZKLeMa92ecExNGwHrdJ+HxWw66IIdwVqJLlNmTG0c5zUpSc8yovnaJi1Wv/TC7Tm5NzcwdHsdRE110tIWFbvNmIzIIb+3P33JFWmaXXb1VVDC43DqtlplttYwL6H3kU0ABgHMMbccTwYmP4cSY8BCAL01754nqipxWogEC/la9iQiw85+rLRo/Ny9k3mp8n35D6bDNtS1LiaslbLM92ZbfKeglTg54F/R1l5xWolAVpx8iTz8Oc+XJClXdWr8j5poyh8zK2/RrXPRfr+8s2/oGeGvdaqJbN/LviYcCMDbXU9pKDScWlSi4akxfJu0EatPDvFEbn5DYRQnn5v6wCeesYkEL+wiFCAIs='
    const wechatPay = WechatPayClient.fromEnv().unwrap()
    const data = wechatPay.decryptPayData(ciphertext, nonce, associated_data)
    expect(data).toEqual(Err('Unsupported state or unable to authenticate data'))
  })

  /// 把微信支付平台证书序列号转换成16进制字符串
  /// ```text
  /// -----BEGIN CERTIFICATE-----
  /// xxxxasdfaskd内容fjalskdfjasdf
  /// -----END CERTIFICATE-----
  /// ```
  it('decrypt certificates [API KEY not matched]', () => {
    const associated_data = 'certificate'
    const nonce = 'bf003ed52d71'
    const ciphertext = 'HE9tL+x8Mag2627GPRXBmaQxZPVhAm3f2UoxgHvVW+m6eN0vq6ggFf4UsaQ8ifeGKwjhj9M6ObREHNogrT5JlEDV4Mfg8pAcLNvKUnbQZeBFKtp8kXPy0KFGhfSWcMZ4+HyfAUkgqLpdRUuNpG3gSJptnfrbJktdtYifkDOcei+1ncq8x+aWCXkFw8l9xBSN8MVSf66TiKyuPD/QCKYbD92HHfmDHk2b8J+BKyISDlQTlKjpb9M01EnuPsIXi4Rww1YzZP8XDruRTFxxDxGmk74tu1cjGXzTIcNmFu85eHbLWENvoLttl/4cKLJ8w49PuCyrREACz1YeAOscEHsqYHaQ0VE2N/8J0wCBuQa+AVD6ra59lmCxRJOVfgQNTShxonA6uCfaPGtyg+5qlwYTESnSdIy2ODlXaOfzMT5N7/actJsEf2C7RJXTPWn79M5slVfE3gOh9aR3mJaEMFM9KZywqv4OT0OI9mpLqRLAV/QCkJ0q2SKCcZyIuLa+VAPVS5Rh2feQkP40iizvVPN68YMOAmVgMBYLaxehGnetT2UylTlqsov35hsbfKOEN5ArSr7y4xoTjW5BV4S0s2IDzHTHWQpMlTxJ59/sgMoq8+m8vezJ0W4AZubwG/iSQ+/tzv1CXAVUgMO8ZqEALpGiROVq+9hdD5a0UB6cGuOTw9OiQHLSn1M4zV2jWDLQSZ+Q8KFhTpMibnvdLFmC09k26K75VcACsNPSa9U+nvP9sp3H7a39Y9BXjIz8/Yd707Y8h76MpEWLsVTn7FvRWwaCi4vxZN/LMRh9KTLNffQcb5amoDYKVSr5BTshdM7EosNwQmGenNnAFlNE/mabXSIz+FC3gMlDbxVvaoB5vOLB/YHrqfoLMEtYGm2HGqjppLmkbNM/R/6NIDFe+jaXZPWh9Bt8F4blihJnbEsZlC/w0/2OylTUsjRipG443XhOLEZJgD54KOnQdpqDah+AW2tPq5V9528ePK5xJzZ33MB3kjgnmljaF5cVbgUcCp5e8N+zvFVoyltsYMNNrtOan0Zfpsj9hNPnUVKLEnsjGXyfpBazRKoOOrPK5MImLUt/JblT+PFZ1oSrQE1IRRfF88yaUYwY2qk3pTrqBY676hOIUesWwuN4CSm28lLu/VarJaY0iLKuoGF0eikGFnAae1BIuFxvDUc3C+vC4GXUFn9jr3PZQcGJuI3MbEk8xGFWcU8UBU2wWhRu5lIgFSX5krbe+FWmRSjl6Rc3s7HZi5Xa8RiRuN1bOcnhVYkNYXy1fg7lXoopWJJPgtMO/+DDTNGQe8G0UgQxy+OK0urlhtzGQjVhF838i0heG4JV+OWUKj/Qvoj/dxVVfIbfroupkg8GvMmn0Cq+nAuo0D0fvhQshDmRsL/a006piEiLthruMn/gymk8cccMVvzn+DxYfYH/WX2UKZ235hPynVLUo8FBBedVTQK3JuJHCT4Kz0lL28KRLpE+lW3/bzG9s0Bly7/h1BF5Xunv4TWYhMFseWGMRIiKR7HxMSXbD4Q1PQJrZt/DtP3JbPURfc6fuYPIb7iuka0kDkPGSCV2uCpzjVHZXYQWrDhFv7LWi4SUw+2mCZLsLR6kesexb5bBOMVRxnA/5WmYVp73WzXar28CW3l0WCccGL/EdVdhrx09RoW5GSy9zcjbyGhwZQuzZECbf/wCpd26YlMTzFP0bqfL/QJ4g32TX8XweyhTPRI7FX1Bg8x85GJYG/bvecR40lDj4A0WKGnVbic3e7LQpDi/BP9adDBxx3Nl0iCN9BUlMx6ypNmrQWHwQXgmPwapyByK0FHjmf0u7hExZ7+xMa9/DPo2YPJdAY6zuHlNUIXLEVa9/VrclsYbyGkeohFGsMgY5MIA0ZF5FFxEOQ31gtNgQiGIVywSGJS8L+qB3tDc07O8hMxCY9wKPP2ua0MkkKQ7O6cr3W1DxNsd9NCbENDW4zNHzT+4pafS1TFaEy0nHI/wIQEyJlXD'
    const wechat_pay = WechatPayClient.fromEnv().unwrap()
    const data = wechat_pay
      .decryptBytes(ciphertext, nonce, associated_data)
    expect(data).toEqual(Err('Unsupported state or unable to authenticate data'))
  })
})
