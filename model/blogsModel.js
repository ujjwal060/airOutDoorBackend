const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
    }
  ],
  category: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: 'Admin',
  },
  date: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
});

module.exports = mongoose.model('Blogs', BlogSchema);