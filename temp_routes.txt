import { Router } from 'express'
import userAuth from '../middleware/authMiddleware.js'
import { isAdmin } from '../middleware/isAdmin.js'
import { createBlog, deleteBlog, getAllBlogs, getBlog, searchBlog, updateBlog } from '../controller/blogcontroller.js'
import { upload } from '../config/cloudinary.js'

const router = Router()

router.post('/create', upload.array('media', 3), userAuth, isAdmin, createBlog)
router.get('/:id', getBlog)
router.get('/', getAllBlogs)
router.put('/:id', userAuth, isAdmin, updateBlog)
router.delete('/:id', userAuth, isAdmin, deleteBlog)
router.get('/search/:query', searchBlog)


export default router