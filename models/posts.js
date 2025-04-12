const mongoose = require('mongoose');

    let postSchema  = mongoose.Schema({
       
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        },

        image:{
            type:String,
            required:true,
            unique:true
        },
        description:{
            type:String
        },


    
    }, { timestamps: true })
    
    module.exports = mongoose.model('post',postSchema);


   
