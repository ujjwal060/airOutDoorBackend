const Blogs = require("../model/blogsModel");

const getBlogs = async (req, res) => {
  
  try {
   
    const updatedBlogList = await Blogs.find();
    //console("updated blog list",updatedBlogList)
    res.status(200).json({
      success: true,
      message: "Blogs Fetched",
      updatedBlogList,
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({
      success: false,
      message: "Error while fetching blog",
    });
  }
};
const createBlog = async (req, res) => {
  console.log(req.body);
  try {
    const { title, description } = req.body;
    
    let imageUrl = [];
    if (req.fileLocations) {
      imageUrl = req.fileLocations;
    }
    
    const newBlog = new Blogs({
      title,
      description,
      image: imageUrl,
    });
    const updatedBlogList = await newBlog.save({ new: true });
    console.log("updated blog list",updatedBlogList)
    res.status(200).json({
      success: true,
      message: "Blog created Successfully",
      updatedBlogList,
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({
      success: false,
      message: "Error while creating blog",
    });
  }
};
const deleteBlog = async (req, res) => {
  try {
    const id = req.params.id;
    await Blogs.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Blog deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({
      success: false,
      message: "Error while deleting blog",
    });
  }
};

module.exports = {getBlogs, createBlog, deleteBlog };
