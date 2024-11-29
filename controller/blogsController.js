const Blogs = require("../model/blogsModel");

const createBlog = async (req, res) => {
  const { title,description, category, content,date, author, status } = req.body;

  let imageUrl = [];
    if (req.fileLocations) {
      imageUrl = req.fileLocations;
    }

  const newBlog = new Blogs({
    title,description,
    images:imageUrl,
    category,
    content,
    date,
    author,
    status,
  });

  try {
    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getBlog=async(req,res)=>{
  try {
    const blogs = await Blogs.find();
    res.status(200).json({
      status:200,
      message:"get all",
      data:blogs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const updateBlog = async (req, res) => {
  try {
    const updateData = req.body;
    if (req.fileLocations) {
      updateData.images = req.fileLocations;
    }
   
    const updatedBlog = await Blogs.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedBlog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteBlog=async(req,res)=>{
  try {
    await Blogs.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

const getBlogById = async (req, res) => {
  try {
    const result = await Blogs.findById(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createBlog,getBlog,deleteBlog,updateBlog,getBlogById};
