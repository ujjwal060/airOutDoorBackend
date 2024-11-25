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
  console.log("body",req.body);
  try {
    const { title, description, qaList } = req.body;

    console.log("Saved Blog:", qaList);
    let imageUrl = [];
    if (req.fileLocations) {
      imageUrl = req.fileLocations; // Assuming `req.fileLocations` contains uploaded image URLs
    }

    // Create a new blog with the Q&A list
    const newBlog = new Blogs({
      title,
      description,
      image: imageUrl,
      qaList: qaList || [], // Initialize with an empty array if no Q&A provided
    });

    const savedBlog = await newBlog.save();

    res.status(200).json({
      success: true,
      message: "Blog created successfully",
      blog: savedBlog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({
      success: false,
      message: "Error while creating blog",
    });
  }
};

const updateBlog = async (req, res) => {
  console.log("in update blog");
  try {
    const id = req.params.id; // Blog ID from the request URL
    const { title, description, qaList } = req.body; // Updated data from the request body

    // Initialize the updated data object
    let updatedData = { title, description };

    // Check if new images are provided
    if (req.fileLocations && req.fileLocations.length > 0) {
      updatedData.image = req.fileLocations; // Assuming images are sent as an array in `req.fileLocations`
    }

    // If Q&A list is provided, update it
    if (qaList && Array.isArray(qaList)) {
      updatedData.qaList = qaList; // Assign the updated Q&A list
    }

    // Find the blog by ID and update it with the new data
    const updatedBlog = await Blogs.findByIdAndUpdate(id, updatedData, { new: true });

    console.log("Updated blog with ID:", updatedBlog);

    // Return success response with updated blog
    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      updatedBlog,
    });
  } catch (error) {
    console.error("Error while updating blog:", error);
    res.status(500).json({
      success: false,
      message: "Error while updating blog",
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

module.exports = {getBlogs, createBlog, deleteBlog,updateBlog };
