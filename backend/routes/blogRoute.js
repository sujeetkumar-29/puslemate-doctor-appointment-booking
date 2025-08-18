import express from 'express';
import {
  createBlog,
  generateBlogContent,
  getAllBlogs,
  getBlogBySlug,
  getDoctorBlogs,
  updateBlog,
  deleteBlog,
  toggleLikeBlog,
  addComment,
  getFeaturedBlogs,
  getBlogCategories
} from '../controllers/blogController.js';
import authDoctor from '../middlewares/authDoctor.js';
import authUser from '../middlewares/authUser.js';
import upload from '../middlewares/multer.js';

const blogRouter = express.Router();

// Public routes
blogRouter.get('/all', getAllBlogs);
blogRouter.get('/featured', getFeaturedBlogs);
blogRouter.get('/categories', getBlogCategories);
blogRouter.get('/:slug', getBlogBySlug);

// Doctor routes (require doctor authentication)
blogRouter.post('/create', authDoctor, upload.single('image'), createBlog);
blogRouter.post('/generate-content', authDoctor, generateBlogContent);
blogRouter.get('/doctor/my-blogs', authDoctor, getDoctorBlogs);
blogRouter.put('/update/:id', authDoctor, upload.single('image'), updateBlog);
blogRouter.delete('/delete/:id', authDoctor, deleteBlog);

// User routes (require user authentication)
blogRouter.post('/like/:id', authUser, toggleLikeBlog);
blogRouter.post('/comment/:id', authUser, addComment);

export default blogRouter;