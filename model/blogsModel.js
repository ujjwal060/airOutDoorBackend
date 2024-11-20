const mongoose=require("mongoose")
const blogSchema=new mongoose.Schema({
    title:{
        type:String
    },
    description:{
        type:String
    },
    image:{
        type:String
    }
})


module.exports=mongoose.model("Blogs",blogSchema)