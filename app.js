const express = require("express")


const app = express()
app.use(express.static("static"))

app.set("view engine", "ejs")


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

app.get("/register", (req,res)=>{
    res.render("user_register")
})

app.get("/profile", (req,res)=>{
    res.render("user_profile")
})

app.get("/agent/uploadRoom", (req,res)=>{
    res.render("post-room")
})

app.get("/roomspace", (req,res)=>{
    res.render("FindRoom")
})




// make all request come from another module 
// make all 404 links redirect to home page


app.listen(3000, ()=>{
    console.log("server runnning on port 3000")
})