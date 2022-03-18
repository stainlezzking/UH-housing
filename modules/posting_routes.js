
const express = require("express")
const flash = require("express-flash")
const fs = require("fs")
const { USC, IMG , SPC} = require("./db")
let { UserRoomateuploadMiddleWare } = require("./multerSetup")
const router = express.Router()
const crypto = require("crypto")


router.use(express.urlencoded({extended : true}))
router.use(function(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
})
router.use(flash())


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
router.post("/postSpace",UserRoomateuploadMiddleWare, async function(req,res){
  //   req.body contains [Object : null prototype ]
  let prefix = crypto.randomBytes(12).toString("hex") ;
    req.body = JSON.parse(JSON.stringify(req.body))
    // if one amenities is selected, will convert it to array 
    Array.isArray(req.body.amenities) && req.body.amenities ? null : req.body.amenities = req.body.amenities.split()
    req.body.user = req.user.username ;
    req.body.type = "roomate"
    const images =  req.files.map(image=> {
        // putting this prefix in that multer filename fnx will generate diff prefix for each image
        image.filename = prefix +"-"+ image.filename ;
        image.blob = fs.readFileSync(image.path)
         return image
     })
    IMG.create({Picturepost : images, prefix})

    .then((data)=>{
        // have a function that will unlink files everytime an error occurs
        req.body.images = JSON.parse(JSON.stringify(data._id))
        SPC.create(req.body)
        .then(()=> {
            req.flash("error", "your space has been added has been successfully uploaded")
              return res.redirect("/postSpace")
        })
        .catch(err=> {
            console.log("an  error occured trying t0 save your files", err)
            req.flash("error", "there was an error saving your file, please report this to us")
            // redirect them to the details of the space
            return res.redirect("/postSpace")
        })
    })
    .catch(err=> {
        console.log("an  error occured trying tosave your files", err)
        req.flash("error", "there was an error saving your file, please report this to us")
        return res.redirect("/postSpace")
    })

})



module.exports = router

