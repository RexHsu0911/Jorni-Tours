// Node 提供原生模組 fs 處理檔案
const fs = require('fs').promises
// 串接 imgur API 網路相簿服務，並上傳到指定相簿
const { ImgurClient } = require('imgur')
const client = new ImgurClient({
  clientId: process.env.IMGUR_CLIENTID,
  clientSecret: process.env.IMGUR_CLIENT_SECRET,
  refreshToken: process.env.IMGUR_REFRESH_TOKEN
})

// 本地伺服器處理圖片(開發階段)
// file 是 multer 處理完的檔案
const localFileHandler = async (file) => {
  try {
    if (!file) return null

    // 複製檔案到 upload 資料夾
    // multer 提供 file 查找文件
    const fileName = `upload/${file.originalname}`

    // fs 提供 fs.promises 非同步處理文件內容
    const data = await fs.readFile(file.path) // file.path 檔案路徑

    await fs.writeFile(fileName, data)

    // 回傳存儲檔案路徑
    return `/${fileName}`
  } catch (err) {
    console.log(err)
    throw err
  }
}

const imgurFileHandler = async (file) => {
  try {
    if (!file) return null

    const img = await client.upload({
      image: fs.createReadStream(file.path),
      type: 'stream',
      album: process.env.IMGUR_ALBUM_ID
    })

    return img.data?.link || null
  } catch (err) {
    console.log(err)
    throw err
  }
}

module.exports = {
  localFileHandler,
  imgurFileHandler
}
