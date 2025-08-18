import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true,
    maxLength: 300
  },
  image: {
    type: String, // Cloudinary URL
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'doctor',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'General Health',
      'Mental Health',
      'Nutrition',
      'Cardiology',
      'Dermatology',
      'Pediatrics',
      'Orthopedics',
      'Neurology',
      'Oncology',
      'Gynecology',
      'Urology',
      'ENT',
      'Ophthalmology',
      'Dentistry',
      'Preventive Care',
      'Lifestyle',
      'Medical Research',
      'Health Technology',
      'Emergency Care',
      'Alternative Medicine'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  readTime: {
    type: Number, // in minutes
    default: 5
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    comment: {
      type: String,
      required: true,
      maxLength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  seoTitle: String,
  seoDescription: String,
  publishedAt: Date,
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware to generate slug from title
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .trim('-');
  }
  
  // Calculate read time based on content length
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  this.readTime = Math.ceil(wordCount / wordsPerMinute);
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Index for better search performance
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ category: 1, status: 1 });
// blogSchema.index({ slug: 1 });

const blogModel = mongoose.models.blog || mongoose.model('blog', blogSchema);

export default blogModel;