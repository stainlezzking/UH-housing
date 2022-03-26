

const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/UH", function(err, data){
    console.log("DB connected successfully")
})

const Space = new mongoose.Schema({
    name : String,
    sex : String,
    number : String,
    poster: String, 
    type :  String,
    lodgeName : String,
    imagesID : String,
    junction : String,
    location : String,
    amenities : [String],
    settings : String,
    description : String,
    careTname : String,
    careTnum : Number,
    price : {initial : Number, sub : Number},
    Available : {type : Boolean, default : true},
    show : {type : Boolean, default : true}
},{
    minimize: false,
    timestamps : true,
})

// images
// price - initial & sub
// junction
// amenities
// description
// lodgeName
// image_building
// caretakersName
// caretakersNumber
// location

// maybe use another server to be serving up images as blob, reduce workload
const images = new mongoose.Schema({
    prefix : String,
    Picturepost : [{
        filename: String,
        blob : Buffer,
        mimetype : String,
        show : {type : Boolean, default : true},
        building : {type : Boolean, default : false}
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
            default : 0,
            index : true
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

const fetchSpace = function(req,res,next){
    console.log(req.params.id)
    SPC.findById(req.params.id)
    .then((data)=>{
        console.log(data)
        if(data){
           IMG.findById(data.imagesID)
            .then(image => {
                res.locals.space = data
                res.locals.images = image
                    next()
            })
        }else{
            res.send("can't find space 404 PAGE")
            res.end()
        }
    }).catch(err=>{
        console.log("error couldn't complete search for product", err)
        res.send("an error occured")
    })
}

// I learnt that forEach is not good with async fxns in them

const fetchAllSpace = function(query, projections){
    let arr = []
    return function(req,res,next){
    SPC.find(query, projections).sort({createdAt : -1})
    .then(async function(data){
        for await(let space of data){
            const image = await IMG.findById(space.imagesID, "Picturepost.filename")
            console.log(image.Picturepost[0])
            arr.push(image.Picturepost[0])
        }
        res.locals.spaces = data
        res.locals.urls = arr
        console.log(arr)
        next()
    }).catch(err=>{
        console.log("the erro that occured in /home route ",err)
        return res.send("an error occured, please report this")
    })
}
}

module.exports = {
    USC,
    registerUser,
    IMG,
    SPC, 
    fetchSpace,
    fetchAllSpace,
}

