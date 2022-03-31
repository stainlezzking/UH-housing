

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
    SPC.findById(req.params.id)
    .then((data)=>{
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

const fetchAllSpace = function(query, projections,page,limit){
    let arr = []
    return function(req,res,next){
    Boolean(res.locals.number) ? page = Number(res.locals.number) : null;
    startIndex = page  * limit;
    SPC.find(query, projections).sort({createdAt : -1}).skip(startIndex).limit(limit)
    .then(async function(data){
        if(data.length){
            for await(let space of data){
                const image = await IMG.findById(space.imagesID, "Picturepost.filename")
                arr.push(image.Picturepost[0])
            }
            total = await SPC.countDocuments(query).then(data=> data)
            .catch(err=> {
                console.log("error counting documents (in fetchAllSPace) :" + err)
            })
            res.locals.spaces = data
            res.locals.urls = arr
            res.locals.paggination = pagination(total, page, limit)
            next();
        }else{
            res.send("couldn't locate page...")
        }

    }).catch(err=>{
        console.log("the erro that occured in /home route ",err)
        return res.send("an error occured, please report this")
    })
}
}
const pagination = function(total, page, limit){
    let arr = [];
        !page ? prev = false :  prev = true ;
        let pages = (total/limit)
        // because page starts from zero
        Math.ceil(total/limit) > page+1 ? next = true : next = false;
        for(i = page -5; i <= page +5; i++){
            if(i >= 0 && i < Math.ceil(total/limit)) arr.push(i);
        }
        startIndex = page * limit;
        return {
            startIndex,
            next,
            prev,
            pagg : arr,
            page
        }

}

const checkParams = function(req,res, next){
    //  plus one so that page zero can pass through
    if(Number(req.params.number) +1){
        res.locals.number = req.params.number
       return next()
    }
    res.send("404, your page could not be located")
}
const concatObjects = (...sources) => {
    const target = {};
    sources.forEach(el => {
       Object.keys(el).forEach(key => target[key] = el[key]);
    });
    return target;
 }
const filterMidd = function(req,res,next){
    // what if page is not a number
    let arr = []
    let query = {};
    let {price, amenities, type, page } = req.query
    price ? query.price = {"price.initial" :{$gt : Number(price)}} : null;
    type ? query.type = {type} : null;
    amenities ? query.amenities = {amenities : {$all : amenities}}: null;
    Number(page) ? null  : page = 0;
    query = concatObjects(...Object.values(query))
    SPC.find(query).sort({"price.initial" : 1}).limit(40)
    .then(async function(data) {
        for await(let space of data){
            const image = await IMG.findById(space.imagesID, "Picturepost.filename")
            arr.push(image.Picturepost[0])
        }
        res.locals.spaces = data
        res.locals.urls = arr
        res.locals.results = req.query
        return next();
    })
    .catch(err=>{
        console.log(err, "error occured in filterMidd function db page")
       return res.send("an error occured trying to filter your docs, please report this problem")
    })
    // query = concatObjects()
}
//  const fs = require("fs")
//  const crypto = require("crypto")
// const postSpaces =  function(){
//     const set = ["FEMALE", "MALE"]
//     let prefix = crypto.randomBytes(12).toString("hex") ;
//     const one = { 
//         blob : fs.readFileSync(__dirname + "/../uploads/one.jpg"),
//         filename : prefix + '-'+ Math.round(Math.random() * 1E9) + '-' + Date.now() + "- 623897c8574cb2abbe782f11 - .jpg",
//     }
//     const four = { 
//         blob : fs.readFileSync(__dirname + "/../uploads/four.jpg"),
//         filename : prefix + '-'+ Math.round(Math.random() * 1E9) + '-' + Date.now() + "- 623897c8574cb2abbe782f11 - .jpg",
//     } 
//     const five = { 
//         blob : fs.readFileSync(__dirname + "/../uploads/five.jpg"),
//         filename : prefix + '-'+ Math.round(Math.random() * 1E9) + '-' + Date.now() + "- 623897c8574cb2abbe782f11 - .jpg",
//     } 
//     IMG.create({
//         prefix,
//         Picturepost : [one,four,five]
//     }).then(data=>{
//         let p =  Math.round(Math.random()*1000000) - 300000
//         space = {
//             poster : "stainlezzking",
//             type : "roomate",
//             lodgeName : "HIS GLORY",
//             imagesID : JSON.parse(JSON.stringify(data._id)),
//             junction : "second market",
//             location : "from school gate take a bike going down to....",
//             amenities : ["Prepaid-Meter", "toilet & bathroom", "running water", "well", "corridor", "kitchen"],
//             sex : `${set[Math.round(Math.random())]}`,
//             description : "Designed and built with all the love in the world by the Bootstrap team with the help of our contributors.",
//             name : "ezeOgb0h",
//             number : 0801900072782,
//             price : {
//                 initial: p,
//                 sub : null
//             }
//         }
//         SPC.create(space)
//         .then(data=> console.log("one space added"))
//         .catch(err=> console.log("an error occured ", err))
//     })
//     .catch(err=> console.log("an error occured ", err))
// }

// for(i = 0; i < 35; i++ ){
//     postSpaces()
//     if(i == 49){
//         console.log("this upload is complete")
//     }
// }

module.exports = {
    USC,
    registerUser,
    IMG,
    SPC, 
    checkParams,
    fetchSpace,
    fetchAllSpace, 
    filterMidd
}

