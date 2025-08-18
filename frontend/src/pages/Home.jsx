import React, { useEffect, useState } from 'react'
import Header from '../components/header/Header';
import SpecialityMenu from '../components/SpecialityMenu';
import TopDoctors from '../components/TopDoctors';
import Banner from '../components/Banner';
import Faq from '../components/Faq';
import BookingStep from '../components/BookingStep';
import HomeReviews from '../components/HomeReviews';
import Hero from '../components/Hero';
import BlogCard from '../components/BlogCard';
import axios from 'axios';
import { Link } from 'react-router-dom';


const Home = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  
  const fetchFeaturedBlogs = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/blog/featured?limit=3`);
      if (data.success) {
        setFeaturedBlogs(data.blogs);
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => {
    fetchFeaturedBlogs();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Header /> */}
      <Hero />

      <main className="container mx-auto px-4 py-8">
        {/* Main content will go here */}
        <div className="text-center text-gray-500 mt-8">
          <p>Scroll down to explore our services</p>
        </div>
      </main>
      <div>
        <BookingStep />
        <SpecialityMenu />
        <HomeReviews />
        <TopDoctors />
        {/* Featured Blogs Section */}
        {featuredBlogs.length > 0 && (
          <div className="my-16 mx-4 md:mx-10 xl:mx-32">
            <div className="text-center text-3xl pt-10 md:pt-16 text-gray-800">
              <p>Latest Health <span className="text-primary font-semibold">Insights</span></p>
            </div>
            <div className="text-center text-sm font-light text-gray-600 mt-3 mb-10">
              <p>Stay informed with expert health advice and medical insights from our doctors</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {featuredBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                to="/blogs"
                className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                View All Blogs
              </Link>
            </div>
          </div>
        )}
        <Faq />
        <Banner />
      </div>
    </div>

  )
}

export default Home