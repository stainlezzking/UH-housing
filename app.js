const express = require("express")
const bodyParser = require("body-parser")
const passport = require("passport")
const session = require("express-session")
const flash = require("express-flash")
const localStrategy = require("passport-local").Strategy


// local modules
const {USC,registerUser} = require("./modules/db")


const app = express()
app.use("/static",express.static("static"))

app.set("view engine", "ejs")
app.use(express.urlencoded({extended: true}))

app.use(flash())

// session
app.use(session({
    secret : "any fucking string",
    resave : false,
    saveUninitialized : false,
    cookie : {
        maxAge : 1000  * 60 * 60 * 24 
    }
   
}))
app.use(passport.initialize())

app.use(passport.session())

app.use(function(req,res,next){
    if(req.isAuthenticated()){
       res.locals.user = req.user
       next()
    }else{
        res.locals.user = null
        next()
    }
})

passport.serializeUser((user,done)=>{
    done(null,{id :user._id})
})

passport.deserializeUser((user,done)=>{
    USC.findById(user.id)
    .then(user=>{
        if(user){
           return done(null,user)
        }
    })
})

passport.use(new localStrategy(
    (user,password,done)=>{
        USC.findOne({username: user.toLowerCase()},
         function(err,data){
            if(err) { return done(err)}
            if(!data){
                return done(null, false, {message : "no user found, if you don't have an account, register one"})
            }
            if(data){
                // i dont know why but the tutorial used try, catch maybe its to handle the error
                try{
                    if(data.password === password){
                        return done(null,data)
                    }else{
                        return done(null, false, {message : "password incorrect, try again"})
                    }
                }catch(err){
                    done(err)
                }
            }
        })
    })
)

function isAuthMiddleWare(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }else{
        return res.redirect("/login")
        
    }
}



app.get("/", (req, res)=>{
    res.render("home")
})
app.get("/home", (req, res)=>{
    res.render("home")
})

// make /space something or redirect to somewhere maybe home page
app.get("/space/:id", (req,res)=>{
    res.render("details")
})

app.get("/login", (req,res)=>{
    res.render("user_login")
})

app.post("/login",passport.authenticate("local",{
    successRedirect : "/profile",
    failureRedirect : "/login",
    failureFlash : true
}))
    
app.get("/register", function(req,res){
    res.render("user_register")
})

app.post("/register", registerUser,passport.authenticate("local",{
    successRedirect : "/profile",
    failureRedirect : "/register",
    failureFlash : true
}))

app.get("/profile",isAuthMiddleWare, (req,res)=>{
    res.render("user_profile")
})

app.get("/logout", function(req,res){
    req.logOut()
    res.redirect("/home")
})

// there should be a page for create space whre users can chooose if its 
// roomate space or there room they want to sell
app.get("/postSpace", (req,res)=>{
    res.render("user-post-roomate-space")
})
app.get("/agent/uploadRoom", (req,res)=>{
    res.render("post-room")
})
app.get("/roomspace", (req,res)=>{
    // delete the filter search select botton for either room or roomate, since this page is room
    res.render("FindRoom")
})

app.get("/roomateSpace", (req,res)=>{
    // delete the filter search select botton for either room or roomate, since this page is room
    res.render("findRoomMate")
})

app.get("/agent/uploadRoomate", (req,res)=>{
    res.render("agent-upload-roomate")
})





// make all request come from another module 
// make all 404 links redirect to home page


app.listen(3000, ()=>{
    console.log("server runnning on port 3000")
})