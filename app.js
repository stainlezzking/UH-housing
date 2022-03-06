const express = require("express")


const app = express()
app.use("/static",express.static("static/"))

app.set("view engine", "ejs")


app.get("/home", (req, res)=>{
    res.render("home")
})

// make /space something or redirect to somewhere maybe home page
app.get("/space/:id", (req,res)=>{
    res.render("details")
})

// make all request come from another module 
// make all 404 links redirect to home page


app.listen(3000, ()=>{
    console.log("server runnning on port 3000")
})