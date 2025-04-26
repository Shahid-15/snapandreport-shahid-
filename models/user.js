const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/SnapAndReport")
// mongoose.connect("mongodb+srv://shahidAtlas:shahid12345@cluster0.4q0sb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")


    let userSchema  = mongoose.Schema({

        name:{
            type:String,
            required:true
        },
        username:{
            type:String,
            required:true,
            
        },
        email:{
            type:String,
            required:true,
            
        },
        password:{
             
            type:String,
            required:true
        },

        posts:[
           {
            type:mongoose.Schema.Types.ObjectId,
            ref:'posts'
           }
        ],
        data:{
            type:Date,
            default:Date.now
        }
    })
    
    module.exports = mongoose.model('user',userSchema);
