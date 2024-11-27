const express = require('express');
const {createBlog,getBlog,deleteBlog,updateBlog,getBlogById} = require('../controller/blogsController');
const {uploadToS3}=require('../comman/multerConfig');


const router = express.Router();

router.post('/createBlog',uploadToS3, createBlog);
router.put('/update/:id',uploadToS3,updateBlog);
router.get('/getBlog', getBlog);
router.get('/getBlog/:id', getBlogById);
router.delete('/delete/:id', deleteBlog);



module.exports = router;