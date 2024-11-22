const express = require('express');
const {createBlog, getBlogs, deleteBlog} = require('../controller/blogsController');
const {uploadToS3}=require('../comman/multerConfig');


const router = express.Router();

router.post('/createBlog',uploadToS3, createBlog);
router.get('/get-blogs', getBlogs);
router.delete('/delete/:id', deleteBlog);



module.exports = router;