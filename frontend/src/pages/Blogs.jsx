import React from 'react';
import  BlogList  from '../components/BlogList';

const Blogs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Health & Medical Blog
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Stay informed with expert insights, health tips, and the latest medical research from our team of healthcare professionals.
            </p>
            <div className="flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-md w-full">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold">500+</div>
                    <div className="text-blue-100">Articles</div>
                  </div>
                  <div className="w-px h-8 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">50+</div>
                    <div className="text-blue-100">Expert Authors</div>
                  </div>
                  <div className="w-px h-8 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">10k+</div>
                    <div className="text-blue-100">Readers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Blogs Section */}
      {/* <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Articles</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Handpicked articles by our medical experts covering the most important health topics
          </p>
        </div>
        
        <BlogList featured={true} limit={6} />
      </div> */}

      {/* All Blogs Section */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">All Articles</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive collection of health and medical articles
            </p>
          </div>
          
          <BlogList />
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Healthy, Stay Informed</h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Get the latest health tips, medical insights, and wellness advice delivered to your inbox.
            </p>
            <form className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blogs;