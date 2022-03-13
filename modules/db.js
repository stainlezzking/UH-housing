

const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/UH", function(err, data){
    console.log("DB connected successfully")
})



const user = new mongoose.Schema({
    name :{
        type : String,
        required : true
    },
    username : {
        type : String,
        lowercase : true,
        unique : true,
        required : [true, "the username field is empty"]
    },
    email : {
        type : String,
        lowercase: true,
        unique : true,
       required : [true, "the email field is empty"]

    },
    password : {
        type : String,
        required : [true, "the password field is empty"]
    },
    number : {
        type : Number,
        required : [true, "the phone number field is empty"]
    },
    agent :{
        level : {
            type : Number,
            default : 0
        }
        
    },
    spaces : [
        {
            id : String,
        }
    ],
    favouriteSpaces : [
        {
            id : String,
        }
    ]
}, {
    minimize : false,
    timestamps: true
})



const USC = mongoose.model("User", user)

const registerUser = async function(req,res,next){
    // make sure that all datas are filled
    const newUser = req.body
    try{
        if(Object.keys(newUser).length !== 5 ){
            throw "details required isn't complete, please report this problem"
        }
        for(props in newUser){
          if(!newUser[props]){
            throw "Make sure all inputs are filled"
          }
        }
        // check if user exists
         const usn =  await USC.findOne({username : req.body.username})
         const em = await USC.findOne({email : req.body.email})
        if(usn) {throw "this username isn't available"}
        if(em) {throw " this email isn't available"}
        return  USC.create(req.body).then((data, err)=>{
            if(err){
                throw "an error occured saving your data, report this problem"
            }else{
               return next()
            }
         })
    }catch(err){
        req.flash("error", err) 
        console.log(err)
        return res.redirect("/register")    
    }
}



module.exports = {
    USC,
    registerUser
}

