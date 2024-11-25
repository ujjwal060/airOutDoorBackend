const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: [String] },
  video: { type: [String] },
  qaList: [
    {
      question: { type: String },
      answer: { type: String },
    },
  ],
}, { timestamps: true });

const Blogs = mongoose.model("Blogs", blogSchema);
module.exports = Blogs;
