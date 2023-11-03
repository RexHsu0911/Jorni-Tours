// Node 提供原生模組 fs 處理檔案
const fs = require('fs')

// 本地伺服器處理圖片(開發階段)
const localFileHandler = file => { // file 是 multer 處理完的檔案
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)

    // 複製檔案到 upload 資料夾
    // multer 提供 file 查找文件
    const fileName = `upload/${file.originalname}`
    // fs 提供 fs.promises 非同步處理文件內容
    return fs.promises.readFile(file.path) // file.path 檔案路徑
      .then(data => fs.promises.writeFile(fileName, data))
      .then(() => resolve(`/${fileName}`)) // 回傳存儲檔案路徑
      .catch(err => reject(err))
  })
}

module.exports = {
  localFileHandler
}
