const Blogs = require("../model/blogsModel");

const createBlog = async (req, res) => {
  try {
    const { title, description } = req.body;

    let imageUrl = [];
    if (req.fileLocations) {
      imageUrl = req.fileLocations;
    }

    const newBlog= new Blogs({
        title,description,image:imageUrl
    })
    const updatedBlogList=await newBlog.save({new:true})
    console.log("updated blog list",updatedBlogList)
    res.status(200).json({
        success:true,
        message:"Blog created Successfully",


    })
  } catch (error) {
    res.status(501).json({
        success:false,
        message:"Error while creating blog",
  })
}};

module.exports={createBlog} 
