import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DoctorContext } from '../../context/DoctorContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dToken, backendUrl } = useContext(DoctorContext);
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    status: 'draft',
    featured: false,
    seoTitle: '',
    seoDescription: ''
  });
  
  const [currentImage, setCurrentImage] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'General Health', 'Mental Health', 'Nutrition', 'Cardiology', 'Dermatology',
    'Pediatrics', 'Orthopedics', 'Neurology', 'Oncology', 'Gynecology',
    'Urology', 'ENT', 'Ophthalmology', 'Dentistry', 'Preventive Care',
    'Lifestyle', 'Medical Research', 'Health Technology', 'Emergency Care', 'Alternative Medicine'
  ];

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/blog/doctor/my-blogs`, {
        headers: { dToken }
      });

      if (data.success) {
        const blog = data.blogs.find(b => b._id === id);
        if (blog) {
          setFormData({
            title: blog.title || '',
            excerpt: blog.excerpt || '',
            content: blog.content || '',
            category: blog.category || '',
            tags: blog.tags ? blog.tags.join(', ') : '',
            status: blog.status || 'draft',
            featured: blog.featured || false,
            seoTitle: blog.seoTitle || '',
            seoDescription: blog.seoDescription || ''
          });
          setCurrentImage(blog.image || '');
        } else {
          toast.error('Blog not found');
          navigate('/doctor-blogs');
        }
      }
    } catch (error) {
      console.log(error);
      toast.error('Error fetching blog');
      navigate('/doctor-blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dToken && id) {
      fetchBlog();
    }
  }, [dToken, id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.excerpt || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (newImage) {
        formDataToSend.append('image', newImage);
      }

      const { data } = await axios.put(`${backendUrl}/api/blog/update/${id}`, formDataToSend, {
        headers: { 
          dToken,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (data.success) {
        toast.success('Blog updated successfully!');
        navigate('/doctor-blogs');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('Error updating blog');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-700">Edit Blog</h1>
          <button
            onClick={() => navigate('/doctor-blogs')}
            className="text-primary hover:text-primary/80"
          >
            ← Back to Blogs
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  maxLength="200"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter blog title"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter tags separated by commas"
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>

              {/* Status and Featured */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                {/* <div className="flex items-center pt-8">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Featured Blog</span>
                  </label>
                </div> */}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                
                {/* Current Image */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                  <img
                    src={currentImage}
                    alt="Current featured image"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>

                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                
                {imagePreview && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">New Image Preview:</p>
                    <img
                      src={imagePreview}
                      alt="New image preview"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt *
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  required
                  maxLength="300"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Brief description of the blog post"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.excerpt.length}/300 characters
                </p>
              </div>

              {/* SEO Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="SEO optimized title"
                />
              </div>

              {/* SEO Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Description
                </label>
                <textarea
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleInputChange}
                  rows="3"
                  maxLength="160"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Meta description for search engines"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seoDescription.length}/160 characters
                </p>
              </div>

              {/* Blog Stats */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Blog Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      formData.status === 'published' ? 'bg-green-100 text-green-800' : 
                      formData.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Featured:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      formData.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {formData.featured ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows="15"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Write your blog content here..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Use markdown for formatting. The content will be processed for reading time calculation.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/doctor-blogs')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-white px-8 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBlog;