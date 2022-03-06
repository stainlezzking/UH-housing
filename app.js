const express = require("express")


const app = express()
app.use("/static",express.static("static/"))

app.set("view engine", "ejs")


app.get("/home", (req, res)=>{
    res.render("home")
})



app.listen(3000, ()=>{
    console.log("server runnning on port 3000")
})