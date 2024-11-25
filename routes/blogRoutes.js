const express = require('express');
const {createBlog, getBlogs, deleteBlog, updateBlog} = require('../controller/blogsController');
const {uploadToS3}=require('../comman/multerConfig');


const router = express.Router();

router.post('/createBlog',uploadToS3, createBlog);
router.put('/update/:id',uploadToS3,updateBlog);
router.get('/get-blogs', getBlogs);
router.delete('/delete/:id', deleteBlog);



module.exports = router;