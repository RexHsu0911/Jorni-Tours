const multer = require('multer')
const upload = multer({ dest: 'temp/' }) // 暫存到 temp 臨時資料夾

module.exports = upload
