import blogModel from "../models/blogModel.js";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from 'cloudinary';
import { GoogleGenerativeAI } from '@google/generative-ai';
import slugify from "slugify";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create a new blog
const createBlog = async (req, res) => {
    try {
        
        const { title, content, excerpt, category, tags, status, aiGenerated, seoTitle, seoDescription } = req.body;

        if (!title || !content || !excerpt || !category) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        let imageUrl = null;

        // Upload image to Cloudinary if provided
        if (req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path, {
                resource_type: "image",
                folder: "pulsemate_blogs"
            });
            imageUrl = imageUpload.secure_url;
        }

        const blogData = {
            title,
            content,
            excerpt,
            image: imageUrl,
            author: req.doctor,
            category,
            tags: tags ? tags : [],
            status: status || 'draft',
            aiGenerated: aiGenerated || false,
            seoTitle,
            seoDescription,
            slug: slugify(title, { lower: true, strict: true }), // auto slug
            // author: doctorId
        };

        const newBlog = new blogModel(blogData);
        const blog = await newBlog.save();

        res.json({ success: true, message: "Blog created successfully", blog });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Generate blog content using Gemini AI
// Improved generateBlogContent function for better formatting
// Updated generateBlogContent function in blogController.js
const generateBlogContent = async (req, res) => {
  try {
    const { topic, category, targetLength } = req.body;

    if (!topic) {
      return res.json({ success: false, message: "Topic is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Write a comprehensive, professional medical blog post about "${topic}" in the category "${category}".

      Requirements:
      - Target length: ${targetLength || "800-1000"} words
      - Write in a professional yet accessible tone
      - Include accurate medical information (add disclaimer about consulting healthcare professionals)
      - Structure with clear headings and subheadings
      - Include practical tips or advice where appropriate
      - Make it engaging for general readers
      - Ensure content is factual and evidence-based

      IMPORTANT FORMATTING RULES:
      - Use <h1>Title</h1> for the main title
      - Use <h2>Section Title</h2> for main sections
      - Use <h3>Subsection</h3> for subsections
      - Use regular paragraphs without any special formatting
      - Separate paragraphs with double line breaks
      - Use **bold text** for important points
      - Use *italic text* for medical terms
      - For lists, use numbered format: 1. Item one 2. Item two
      - End with a medical disclaimer section

      Structure the blog with these sections:
      1. Introduction paragraph
      2. What is [Topic]? section
      3. Key symptoms or aspects
      4. Treatment options
      5. Prevention tips (if applicable)
      6. When to see a doctor
      7. Conclusion
      8. Medical disclaimer

     
     
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    // Remove markdown fences if present
    text = text.replace(/```json|```/g, "").trim();

    let blogContent;
    try {
      blogContent = JSON.parse(text);
      
      // Clean up the content - remove any unwanted characters
      if (blogContent.content) {
        blogContent.content = blogContent.content
          .replace(/\\n/g, '\n') // Convert \n to actual line breaks
          .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive line breaks
          .trim();
      }
      
    } catch (parseError) {
      console.error("JSON parse failed, creating formatted fallback:", parseError);

      // Create a well-formatted fallback
      const formattedContent = `<h1>About ${topic}</h1>

${text.replace(/\n\s*\n/g, '\n\n')}

<h2>Medical Disclaimer</h2>

**Important:** This article is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider before making any medical decisions or if you have concerns about your health.`;

      blogContent = {
        title: `${topic} - A Comprehensive Medical Guide`,
        excerpt: `Learn about ${topic}, its symptoms, treatment options, and when to seek medical care from healthcare professionals.`,
        content: formattedContent,
        suggestedTags: [
          topic.toLowerCase().replace(/\s+/g, '-'), 
          category?.toLowerCase().replace(/\s+/g, '-') || "health",
          "medical-guide",
          "healthcare"
        ],
        seoTitle: `${topic} - Expert Medical Insights and Treatment Guide`,
        seoDescription: `Comprehensive guide about ${topic} covering symptoms, treatment options, prevention tips, and when to consult healthcare professionals.`,
      };
    }

    // Ensure aiGenerated flag is set
    blogContent.aiGenerated = true;

    res.json({ success: true, blogContent });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Failed to generate blog content" });
  }
};


// Get all published blogs with pagination
const getAllBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category;
        const search = req.query.search;
        const featured = req.query.featured;

        const skip = (page - 1) * limit;

        let query = { status: 'published' };

        if (category) {
            query.category = category;
        }

        if (featured === 'true') {
            query.featured = true;
        }

        if (search) {
            query.$text = { $search: search };
        }

        const blogs = await blogModel.find(query)
            .populate('author', 'name speciality image')
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await blogModel.countDocuments(query);

        res.json({
            success: true,
            blogs,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get single blog by slug
const getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const blog = await blogModel.findOne({ slug, status: 'published' })
            .populate('author', 'name speciality image experience')
            .populate('comments.user', 'name image');

        if (!blog) {
            return res.json({ success: false, message: "Blog not found" });
        }

        // Increment views
        blog.views += 1;
        await blog.save();

        res.json({ success: true, blog });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get blogs by doctor
const getDoctorBlogs = async (req, res) => {
    try {
        // const { docId } = req.body;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;

        const skip = (page - 1) * limit;

        let query = { author: req.doctor };
        if (status) {
            query.status = status;
        }

        const blogs = await blogModel.find(query)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await blogModel.countDocuments(query);

        res.json({
            success: true,
            blogs,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update blog
const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        // const { docId } = req.body;

        const updateData = req.body;

        const blog = await blogModel.findOne({ _id: id, author: req.doctor });

        if (!blog) {
            return res.json({ success: false, message: "Blog not found or unauthorized" });
        }

        // Handle image update
        if (req.file) {
            const imageUpload = await cloudinary.uploader.upload(req.file.path, {
                resource_type: "image",
                folder: "pulsemate_blogs"
            });
            updateData.image = imageUpload.secure_url;
        }

        // Parse tags if provided
        if (updateData.tags) {
            updateData.tags = updateData.tags;
        }

        const updatedBlog = await blogModel.findByIdAndUpdate(id, updateData, { new: true });

        res.json({ success: true, message: "Blog updated successfully", blog: updatedBlog });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete blog
const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        // const { docId } = req.body;


        const blog = await blogModel.findOneAndDelete({ _id: id, author: req.doctor });

        if (!blog) {
            return res.json({ success: false, message: "Blog not found or unauthorized" });
        }

        res.json({ success: true, message: "Blog deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Like/Unlike blog
const toggleLikeBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const blog = await blogModel.findById(id);

    if (!blog) {
      return res.json({ success: false, message: "Blog not found" });
    }

    const existingLike = blog.likes.find(like => like?.user?.toString() === userId);

    if (existingLike) {
      // Unlike
      blog.likes = blog.likes.filter(like => like?.user?.toString() !== userId);
    } else {
      // Like
      blog.likes.push({ user: userId });
    }

    await blog.save();

    res.json({ success: true, message: existingLike ? "Blog unliked" : "Blog liked", likesCount: blog.likes.length });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Add comment to blog
const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        const userId = req.user?.userId;
        console.log(userId)

        if (!comment) {
            return res.json({ success: false, message: "Comment is required" });
        }

        const blog = await blogModel.findById(id);

        if (!blog) {
            return res.json({ success: false, message: "Blog not found" });
        }

        blog.comments.push({
            user: userId,
            comment
        });

        await blog.save();

        // Populate the new comment
        const updatedBlog = await blogModel.findById(id).populate('comments.user', 'name image');
        const newComment = updatedBlog.comments[updatedBlog.comments.length - 1];

        res.json({ success: true, message: "Comment added successfully", comment: newComment });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get featured blogs
const getFeaturedBlogs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 2;

        const blogs = await blogModel.find({ status: 'published', featured: true })
            .populate('author', 'name speciality image')
            .sort({ publishedAt: -1 })
            .limit(limit);

        res.json({ success: true, blogs });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get blog categories with counts
const getBlogCategories = async (req, res) => {
    try {
        const categories = await blogModel.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({ success: true, categories });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
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
};