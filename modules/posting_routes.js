
const express = require("express")
const flash = require("express-flash")
const fs = require("fs")
const { USC, IMG , SPC} = require("./db")
let { uploadMiddleWare } = require("./multerSetup")
const router = express.Router()
const crypto = require("crypto")


router.use(express.urlencoded({extended : true}))
const isAuth = function(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}
router.use(flash())

const createSpace = function(req,res, route){
    SPC.create(req.body)
    .then(()=> {
        req.flash("error", "your space has been uploaded been uploaded")
          return res.redirect(route)
    })
    .catch(err=> {
        console.log("an  error occured trying t0 save your files", err)
        req.flash("error", "there was an error saving your file, please report this to us")
        // redirect them to the details of the space
        return res.redirect(route)
    })
}

router.post("/changeDetails",isAuth, function(req,res){
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
router.post("/uploadRoomate",isAuth,uploadMiddleWare("/uploadRoomate", [{name : "pictures",maxCount: 5}]), async function(req,res){
  //   req.body contains [Object : null prototype ]
  let prefix = crypto.randomBytes(12).toString("hex") ;
    req.body = JSON.parse(JSON.stringify(req.body))
    // if one amenities is selected, will convert it to array 
    Array.isArray(req.body.amenities) && req.body.amenities ? null : req.body.amenities = req.body.amenities.split()
    req.body.poster = req.user.username ;
    req.body.type = "roomate"
    const images = req.files.pictures.map(image=> {
        // putting this prefix in that multer filename fnx will generate diff prefix for each image
        image.filename = prefix +"-"+ image.filename ;
        image.blob = fs.readFileSync(image.path)
         return image
     })

    IMG.create({Picturepost : images, prefix})
    .then((data)=>{
        // have a function that will unlink files everytime an error occurs
        req.body.imagesID = JSON.parse(JSON.stringify(data._id))
        req.body.price = {initial : req.body.price, sub : null}
       return createSpace(req,res,"/uploadRoomate")
    })
    .catch(err=> {
        console.log("an  error occured trying tosave your files", err)
        req.flash("error", "there was an error saving your file, please report this to us")
        return res.redirect("/uploadRoomate")
    })

})

router.post("/uploadRoom",isAuth,uploadMiddleWare("/uploadRoom", 
[{name : "pictures", maxCount: 5},{name : "lodgeBuilding", maxCount: 3}]), 
function(req,res){
    if(req.user.agent.level){
        console.log(req.body)
        let prefix = crypto.randomBytes(12).toString("hex") ;
        req.body = JSON.parse(JSON.stringify(req.body))
        req.body.price = {initial : req.body.initial, sub : req.body.sub}
        Array.isArray(req.body.amenities) && req.body.amenities ? null : req.body.amenities = req.body.amenities.split()
        req.body.poster = req.user.username ; 
        req.body.type = "room"
        const images = req.files.pictures.map(image=> {
            // putting this prefix in that multer filename fnx will generate diff prefix for each image
            image.filename = prefix +"-"+ image.filename ;
            image.blob = fs.readFileSync(image.path)
             return image
         })
         const lodgeBuilding = req.files.lodgeBuilding.map(image=> {
            // putting this prefix in that multer filename fnx will generate diff prefix for each image
            image.filename = prefix +"-"+ image.filename ;
            image.building = true
            image.blob = fs.readFileSync(image.path)
             return image
         })
        IMG.create({Picturepost : images.concat(lodgeBuilding), prefix})
        .then(data=>{
            req.body.imagesID = JSON.parse(JSON.stringify(data._id))  
            return createSpace(req,res,"/uploadRoom")
        })
        .catch(err=> {
            console.log("an  error occured trying tosave your files", err)
            req.flash("error", "there was an error saving your file, please report this to us")
            return res.redirect("/uploadRoom")
        })
    }else{
        res.send("unauthorized request")
        res.end()
    }

})


module.exports = router

