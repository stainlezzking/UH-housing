const express = require("express")


const app = express()
app.use("/static",express.static("static"))

app.set("view engine", "ejs")


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

app.get("/register", (req,res)=>{
    res.render("user_register")
})

app.get("/profile", (req,res)=>{
    res.render("user_profile")
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

2



// make all request come from another module 
// make all 404 links redirect to home page


app.listen(3000, ()=>{
    console.log("server runnning on port 3000")
})