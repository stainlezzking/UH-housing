const express = require("express")
const bodyParser = require("body-parser")
const passport = require("passport")
const session = require("express-session")
const flash = require("express-flash")
const localStrategy = require("passport-local").Strategy
const postingRoutes = require("./modules/posting_routes")
const fs = require("fs")
const {Readable} = require("stream")



// local modules
const {USC, IMG, registerUser} = require("./modules/db")


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
       res.locals.url = req.url
       next()
    }else{
        res.locals.user = null
        res.locals.url = req.url
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

app.get("/roomspace", (req,res)=>{
    res.render("FindRoom")
})

app.get("/roomateSpace", (req,res)=>{
    res.render("findRoomMate")
})

// make /space something or redirect to somewhere maybe home page
app.get("/space/:id", (req,res)=>{
    res.render("details")
})

app.get("/login", (req,res)=>{
    // if user is already logged in
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
app.get("/uploadRoomate",isAuthMiddleWare, (req,res)=>{
    if(req.user.agent.level){
        res.render("post-roomate-space")
    }else{
        res.writeHead(401, "apply for an agent to be able to access this page")
        res.send("not authorized")
    }
})

app.get("/uploadRoom",isAuthMiddleWare, (req,res)=>{
    res.render("post-room")
})

app.get("/images/:url", function(req,res){
    let url = req.params.url.split("-")
//     console.log(url)
//     //  so only readStreams can be sent back to image tags
//     // so i'll make my buffer readable and then send back to img

    IMG.findOne({prefix : url[0]}, function(err,data){
        console.log(req.params.url)
        if(data){
            let pic = data.Picturepost.filter(pict => pict.filename == req.params.url)[0]
            let html = `
            <img src="data:${pic.mimetype};base64,${Buffer.from(pic.blob).toString("base64")}" >`
            res.send(html)
            // res.send(`data:${pic.mimetype};base64,${Buffer.from(pic.blob).toString("base64")}`)
            return res.end()
        }else{
            res.send("404, no file found")
        }

    })
//     fs.readFile(__dirname +"/uploads/5155c9001ac535b110617267491685913-1647584315612-622e5577bc8c6286c715ddf3-.jpg",
//     function(err,data){
//         // fs.createReadStream(data)
//         // .pipe(res)
//         Readable.from(data.toString("base64"))
//     })
    
})

// posting routes 
app.use(postingRoutes)

app.get("*", function(req,res){
    res.send("redirect this later t0 404 page or the home page")
})


// ADD BURGER ANIMATION ON ALL PAGE
// INDEX SPACE.TYPE
// ADD ACTIVE ON NAVBAR -- 
// POSTED ROUTES
// PRODUCT PAGE
// FAVOURITE ROUTE
// UPLOAD ROOMATE {USER} --
// UPLOAD ROOM {AGENT}
// UPLOAD ROOMATE {AGENT}   --
// EDITING SOACE {AGENT}
// DELETING POST {BOSS}
// TEM HIDING POST {AGENT} 
// MAKE USER AGENT {ADMIN}//later on

app.listen(3000, ()=>{
    console.log("server runnning on port 3000")
})