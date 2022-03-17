

const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/UH", function(err, data){
    console.log("DB connected successfully")
})

const Space = new mongoose.Schema({
    name : String,
    number : String,
    user: String, 
    type : String,
    lodgeName : String,
    images : String,
    price : Number,
    junction : String,
    location : String,
    amenities : [String],
    description : String,
    Available : {type : Boolean, default : true},
    show : {type : Boolean, default : true}
},{
    minimize: false,
    timestamps : true,
})

// maybe use another server to be serving up images as blob, reduce workload
const images = new mongoose.Schema({
    Picturepost : [{
        filename: String,
        blob : Buffer,
        mimetype : String,
        show : {type : Boolean, default : true},
    }]
}, {timestamps: true})

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
const IMG = mongoose.model("images", images)
const SPC = mongoose.model("spaces", Space)


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
    registerUser,
    IMG,
    SPC
}

