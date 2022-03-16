
const express = require("express")
const flash = require("express-flash")
const { USC } = require("./db")
let { upload,multer } = require("./multerSetup")
const router = express.Router()

router.use(express.urlencoded({extended : true}))
router.use(function(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
})
router.use(flash())

upload = upload.array("pictures", 5)

router.post("/changeDetails", function(req,res){
    console.log(req.body)
    const {number, password} = req.body
    console.log(number,password)
    if(number && password){
        USC.updateOne({username : req.user.username},{number, password},
             function(err, data){
                if(err){
                    throw "an error occured, please report this error to us"
                }
                console.log("the docs has been successfully updated")
                req.flash("error", "your info was successfully changed")
               return res.redirect("/profile")
        })
    }else{
        req.flash("error","your inputs cannot be empty")
        return  res.redirect("/profile")
    }
})

router.post("/postSpace", function(req,res){
    upload(req,res, function(err){
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
          console.log("successfully uploaded that sht")
          req.flash("error", "your space has been added has been successfully uploaded")
          console.log(req.body)
        //   redirect them to the details of the space
          return res.redirect("/postSpace")
        //   BEFORE YOU UPLOAD THIS IMAGE TO S3 BUCKET, MAKE SURE THE USER EXIST B4 SOME1 USES SOMETHING LIKE POSTMAN
        // INFACT ADD ISAUTHENTIFICATED FUNTION TO ALL POST ROUTES
    })
})

module.exports = router

