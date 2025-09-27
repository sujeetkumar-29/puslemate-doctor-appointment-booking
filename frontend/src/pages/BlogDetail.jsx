import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import BlogCard from '../components/BlogCard';
import axios from 'axios';
import { toast } from 'react-toastify';

const BlogDetail = () => {
  const { slug } = useParams();
  const { backendUrl, token, userData } = useContext(AppContext);
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false); // prevents double clicks

  // fetchBlog now accepts `silent` to avoid showing the full page spinner for small refreshes
  const fetchBlog = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/blog/${slug}`);

      if (data.success) {
        // ensure likes/comments are at least empty arrays
        const blogFromServer = {
          ...data.blog,
          likes: Array.isArray(data.blog.likes) ? data.blog.likes : [],
          comments: Array.isArray(data.blog.comments) ? data.blog.comments : []
        };
        setBlog(blogFromServer);
      } else {
        toast.error(data.message || 'Failed to fetch blog');
      }
    } catch (error) {
      console.log(error);
      toast.error('Error fetching blog');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Keep related blog fetch same as before
  const fetchRelatedBlogs = async (category, currentBlogId) => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/blog/all`, {
        params: { category, limit: 3 }
      });

      if (data.success) {
        const related = data.blogs.filter(b => b._id !== currentBlogId);
        setRelatedBlogs(related.slice(0, 3));
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Update isLiked whenever blog or userData changes (handles refresh + login state)
  useEffect(() => {
    if (blog && userData) {
      const liked = (blog.likes || []).some(like => String(like.user) === String(userData._id));
      setIsLiked(Boolean(liked));
    } else {
      setIsLiked(false);
    }
  }, [blog, userData]);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const handleLike = async () => {
    if (!token) {
      toast.error('Please login to like blogs');
      return;
    }
    if (!blog) return;
    if (likeLoading) return; // guard against double clicks

    setLikeLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/blog/like/${blog._id}`,
        {},
        { headers: { token } }
      );

      if (data.success) {
        // Refresh the blog silently from server so UI matches server canonical state
        // (this avoids stale closures and ensures counts & likes array are accurate)
        await fetchBlog(true);
        toast.success(data.message || 'Updated like');
      } else {
        toast.error(data.message || 'Error updating like');
      }
    } catch (error) {
      console.log(error);
      toast.error('Error updating like');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Please login to comment');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setSubmittingComment(true);
      const { data } = await axios.post(
        `${backendUrl}/api/blog/comment/${blog._id}`,
        { comment },
        { headers: { token } }
      );

      if (data.success) {
        setBlog(prev => ({
          ...prev,
          comments: [...(prev.comments || []), data.comment]
        }));
        setComment('');
        toast.success('Comment added successfully');
      }
    } catch (error) {
      console.log(error);
      toast.error('Error adding comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h2>
        <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
        <Link to="/blogs" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90">
          View All Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Breadcrumb */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="text-sm">
            <Link to="/" className="text-gray-500 hover:text-primary">Home</Link>
            <span className="mx-2 text-gray-300">/</span>
            <Link to="/blogs" className="text-gray-500 hover:text-primary">Blogs</Link>
            <span className="mx-2 text-gray-300">/</span>
            <span className="text-gray-900">{blog.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Featured Image */}
              <div className="relative">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-64 md:h-96 object-cover"
                />
                {blog.featured && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
                      Featured
                    </span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                    {blog.category}
                  </span>
                </div>
              </div>

              <div className="p-8">
                {/* Header, content, tags etc. (left unchanged) */}
                <div className="mb-6">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {blog.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <span>Published {formatDate(blog.publishedAt || blog.createdAt)}</span>
                    <span>•</span>
                    <span>{blog.readTime} min read</span>
                    <span>•</span>
                    <span>{blog.views} views</span>
                  </div>

                  {blog.author && (
                    <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={blog.author.image}
                        alt={blog.author.name}
                        className="w-16 h-16 rounded-full mr-4"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{blog.author.name}</h3>
                        <p className="text-gray-600">{blog.author.speciality}</p>
                        {blog.author.experience && (
                          <p className="text-sm text-gray-500">{blog.author.experience} years experience</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <div className="prose prose-lg max-w-none">
                    {blog.content && blog.content.split('\n').map((line, index) => {
                      const trimmedLine = line.trim();
                      if (!trimmedLine) return null;

                      if (trimmedLine.match(/<h2>.*?<\/h2>/)) {
                        const text = trimmedLine.replace(/<\/?h2>/g, '');
                        return (
                          <h2 key={index} className="text-2xl font-semibold text-gray-900 mb-4 mt-7">
                            {text}
                          </h2>
                        );
                      }

                      if (trimmedLine.match(/<h3>.*?<\/h3>/)) {
                        const text = trimmedLine.replace(/<\/?h3>/g, '');
                        return (
                          <h3 key={index} className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                            {text}
                          </h3>
                        );
                      }

                      if (trimmedLine.match(/^\s*\*\s+\*\*.*?\*\*/)) {
                        const text = trimmedLine
                          .replace(/^\s*\*\s*/, '')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>');
                        return (
                          <div key={index} className="mb-4">
                            <p className="text-gray-700 leading-relaxed flex">
                              <span className="mr-3 text-gray-500">•</span>
                              <span dangerouslySetInnerHTML={{ __html: text }} />
                            </p>
                          </div>
                        );
                      }

                      const text = trimmedLine
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>');

                      return (
                        <p key={index} className="text-gray-700 mb-4 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: text }}
                        />
                      );
                    })}
                  </div>
                </div>

                {blog.tags && blog.tags.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {blog.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Like and Share Section */}
                <div className="flex items-center justify-between py-6 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleLike}
                      disabled={likeLoading}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isLiked
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                        } ${likeLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <svg
                        className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}
                        fill={isLiked ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>{(blog.likes || []).length}</span>
                    </button>

                    <div className="flex items-center space-x-2 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{(blog.comments || []).length} Comments</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Share:</span>
                    {/* share buttons untouched */}
                    <button className="p-2 text-gray-400 hover:text-blue-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-800">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Comments Section (unchanged) */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-bold mb-6">Comments ({(blog.comments || []).length})</h3>

                  {token ? (
                    <form onSubmit={handleComment} className="mb-8">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts..."
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                      <div className="flex justify-end mt-3">
                        <button
                          type="submit"
                          disabled={submittingComment || !comment.trim()}
                          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          {submittingComment ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-gray-600 mb-3">Please login to leave a comment</p>
                      <Link
                        to="/login"
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Login
                      </Link>
                    </div>
                  )}

                  <div className="space-y-6">
                    {(blog.comments || []).length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
                    ) : (
                      (blog.comments || []).map((comment, index) => (
                        <div key={index} className="flex space-x-4">
                          <img
                            src={comment.user.image}
                            alt={comment.user.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">{comment.user.name}</h4>
                                <span className="text-sm text-gray-500">
                                  {formatDate(comment.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-700">{comment.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar (unchanged) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {relatedBlogs.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Related Articles</h3>
                  <div className="space-y-4">
                    {relatedBlogs.map((relatedBlog) => (
                      <div key={relatedBlog._id} className="flex space-x-3">
                        <img
                          src={relatedBlog.image}
                          alt={relatedBlog.title}
                          className="w-16 h-16 rounded object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/blog/${relatedBlog.slug}`}
                            className="text-sm font-medium text-gray-900 hover:text-primary line-clamp-2"
                          >
                            {relatedBlog.title}
                          </Link>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(relatedBlog.publishedAt || relatedBlog.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Link
                      to="/blogs"
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      View All Blogs →
                    </Link>
                  </div>
                </div>
              )}

              <div className="bg-primary text-white rounded-lg p-6">
                <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
                <p className="text-primary-100 mb-4">Subscribe to get the latest health tips and medical insights.</p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button
                    type="submit"
                    className="w-full bg-white text-primary px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
