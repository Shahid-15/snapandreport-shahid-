const express = require('express');
const brcypt = require('bcrypt');
const path = require('path')
const app = express();
const jwt = require('jsonwebtoken')
const userModel = require('./models/user');
const postModel = require('./models/posts')
const cookieParser = require('cookie-parser')
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
  });


app.set("view engine","ejs");
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));


app.get('/',function(req,res){

    res.render("home") 
})



app.get('/signup',function(req,res){

 
    res.render("signup") 
})

app.post('/post',async (req,res)=>{
let user = await postModel.create({
    image:req.body.image
})
    res.send(user)
})


app.post('/register',async (req,res)=>{

    const {name,username,email,password} = req.body;

    let check =await userModel.findOne({email}); 
    if(check) return res.send("Please Login Account Already Exists")
        

    let salt = await brcypt.genSalt(10);
    let hash = await brcypt.hash(password,salt);
    
  let user = await userModel.create({
    name,
    username,
    email,
    password:hash
  })
  let id = user._id;
  let token = jwt.sign({email,name,id},"secret");
  res.cookie("token",token);

    res.redirect('/dashboard/'+user._id)

})

app.get('/dashboard/:id',isLoggedIn,(req,res)=>{
  console.log(req.usr);  

    res.render('dashboard',{id:req.usr.id})
})

app.get('/rendermain/:id',isLoggedIn,(req,res)=>{
     console.log("req.usr.id",req.usr.name);
  res.render('mainpage',{name:req.usr.name,id:req.usr.id})
})

app.get('/login',function(req,res){

    res.render('login')
})  

app.post('/login',async function(req,res){
    
    const {email,password} = req.body;

    let user = await userModel.findOne({email});
    if(!user) return res.send("You Dont have any account ") 

   let result = await brcypt.compare(password,user.password);
   let id = user._id;
   let name = user.name;


   if(result){
    let token = jwt.sign({email,name,id},"secret");
       res.cookie("token",token);
       
       res.redirect('/dashboard/'+user._id);
   }
   else{
     res.send("Something went wrong")
   }

})


app.get('/logout',(req,res)=>{

     res.cookie("token","");
     res.redirect('/')
})

app.post('/storeimg',isLoggedIn, async (req, res) => {
    const { img ,description,address} = req.body;
    let plateNumber = "";
  
    if (!img) {
      return res.status(400).send("No image provided");
    }
  
    try {
    
      const result = await cloudinary.uploader.upload(img, { 
        resource_type: "image",
      });
  
      console.log(result.secure_url);

      //$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
      //code to detect the number from the number plate

      

let response = await axios.post('https://api.platerecognizer.com/v1/plate-reader/', 
  {
    upload_url: result?.secure_url  
  },
  {
    headers: {
      Authorization: 'Token b8012c9783442992ed59435330a2d070ae8bfc5d',
      'Content-Type': 'application/json'  
    }
  }
)

if(response.data.results[0]?.plate){
  plateNumber = response.data.results[0]?.plate;
}
     
//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$



      let objID = await userModel.findOne({email:req.usr.email},{_id:1})
       

      let postUser = await postModel.create({
        userId:objID._id,
        image:result.secure_url,
        description,
        address,
        plateNumber
      })

console.log("Image stord successfully");
      res.send(`Short URL: ${result.secure_url}`); 
      

    } catch (error) {
      console.error(error);
      res.status(500).send("Image upload failed");
    }
  });
  
app.listen(process.env.PORT,()=>{``
    console.log("Server is running at http://localhost:3000")
})

app.get('/showRes',isLoggedIn, async (req,res)=>{

  //here the work is remaining and il completed it 
  let id = req.usr.id;

  let postData = await postModel.find({userId:id});
  let arr = Array.from(postData)
  let len  = arr.length;
 

  res.render('result',{userId:id,data:arr[len-1]})
})

function isLoggedIn(req,res,next){

    if(req.cookies.token === ""){
       return res.render('error')
    }
    else{
        
        let data = jwt.verify(req.cookies.token,"secret");
        req.usr = data;
    }
    next();
}