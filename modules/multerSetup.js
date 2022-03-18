
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
      const uniqueSuffix =  Math.round(Math.random() * 1E9) + '-' + Date.now() 
      cb(null,  uniqueSuffix + "-" + JSON.parse(JSON.stringify(req.user._id)) +  path.extname(file.originalname))
    }
  })

const limits = {
    fileSize : 5000000
}
  const upload = multer({ storage,limits, fileFilter})

  const UserRoomateuploadMiddleWare = function(req,res, next){
    return upload.array("pictures", 5)(req,res, function(err){
        if (err instanceof multer.MulterError) {
            console.log("an error occured in multer")
            req.flash("error", err.message)
            return res.redirect("/postSpace")
          } else if (err) {
            // An unknown error occurred when uploading.
            req.flash("error", "an error occured trying to upload your file")
            console.log(" error occured while uploading", err)
           return res.redirect("/postSpace")
          }
         return next()
    })
}
  module.exports = {multer, UserRoomateuploadMiddleWare}
