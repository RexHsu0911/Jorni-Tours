// NewebPay API
const crypto = require('crypto') // 加密

const URL = process.env.URL
const MerchantID = process.env.MERCHANT_ID
const HashKey = process.env.HASH_KEY
const HashIV = process.env.HASH_IV

const PayGateWay = 'https://ccore.spgateway.com/MPG/mpg_gateway'
const ReturnURL = URL + '/spgateway/callback?from=ReturnURL'
const NotifyURL = URL + '/spgateway/callback?from=NotifyURL'
const ClientBackURL = URL + '/order'

// Step1: 生成請求字串
function genDataChain (TradeInfo) {
  const results = []
  for (const kv of Object.entries(TradeInfo)) {
    results.push(`${kv[0]}=${kv[1]}`)
  }
  return results.join('&')
}

// Step2: 將請求字串加密(AES)
function createAesEncrypt (TradeInfo) {
  const encrypt = crypto.createCipheriv('aes-256-cbc', HashKey, HashIV)
  const enc = encrypt.update(genDataChain(TradeInfo), 'utf8', 'hex')
  return enc + encrypt.final('hex')
}

// Step3: 將 AES 加密字串產生檢查碼(SHA)
function createShaEncrypt (TradeInfo) {
  const sha = crypto.createHash('sha256')
  const plainText = `HashKey=${HashKey}&${TradeInfo}&HashIV=${HashIV}`

  return sha
    .update(plainText)
    .digest('hex')
    .toUpperCase()
}

// Step4: 發布請求(Form Post)

// Step5: 完成支付後，透過 NotifyURL 回傳加密字串

// Step6: 將加密字串進行解密(AES)
function createAesDecrypt (TradeInfo) {
  const decrypt = crypto.createDecipheriv('aes256', HashKey, HashIV)
  decrypt.setAutoPadding(false)
  const text = decrypt.update(TradeInfo, 'hex', 'utf8')
  const plainText = text + decrypt.final('utf8')
  const result = plainText.replace(/[\x00-\x20]+/g, '')
  return result
}

function getTradeInfo (Amt, Desc, email) {
  console.log(Amt, Desc, email)

  // 使用 Unix Timestamp 作為訂單編號（金流也需要加入時間戳記）
  const TimeStamp = Math.round(new Date().getTime() / 1000)

  const data = {
    MerchantID, // 商店代號
    RespondType: 'JSON', // 回傳格式
    TimeStamp, // 時間戳記
    Version: 2.0, // 串接程式版本
    MerchantOrderNo: TimeStamp, // 商店訂單編號
    LoginType: 0, // 智付通會員
    Amt, // 訂單金額
    ItemDesc: Desc, // 商品資訊
    Email: email, // 付款人電子信箱
    ReturnURL, // 支付完成返回商店網址
    NotifyURL, // 支付通知網址/每期授權結果通知
    ClientBackURL // 支付取消返回商店網址
  }
  console.log('data:', data)

  // 進行訂單加密
  // 加密第一段字串，此段主要是提供交易內容給予藍新金流
  const aesEncrypt = createAesEncrypt(data)
  // 使用 HASH 再次 SHA 加密字串，作為驗證使用
  const shaEncrypt = createShaEncrypt(aesEncrypt)

  console.log('aesEncrypt:', aesEncrypt)
  console.log('shaEncrypt:', shaEncrypt)

  const tradeInfo = {
    MerchantID, // 商店代號
    TradeInfo: aesEncrypt, // 加密後參數
    TradeSha: shaEncrypt,
    Version: 2.0, // 串接程式版本
    PayGateWay,
    MerchantOrderNo: data.MerchantOrderNo
  }
  console.log('tradeInfo:', tradeInfo)

  return tradeInfo
}

module.exports = {
  getTradeInfo,
  createAesDecrypt
}
