
const express = require("express")
const { USC } = require("./db")

const router = express.Router()

router.use(express.urlencoded({extended : true}))


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


module.exports = router

