
const multer = require("multer")
const path = require("path")

function fileFilter (req, file, cb) {
    if(!file.mimetype.includes('image')){
        return  cb(new Error('file must be an image'), false)
      }
      return cb(null, true)
      
  }


  let loc = path.join(__dirname,'../uploads')
  const storage = multer.diskStorage({
    destination: loc ,
    filename: function (req, file, cb) {
        // i can prepend the user ID on the image, so when ever ever i can get the user
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null,  uniqueSuffix+ "-" + path.extname(file.originalname))
    }
  })

const limits = {
    fileSize : 5000000
}
  const upload = multer({ storage,limits, fileFilter})


  module.exports = {upload, multer}
