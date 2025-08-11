import React from 'react'
import Header from '../components/header/Header';
import SpecialityMenu from '../components/SpecialityMenu';
import TopDoctors from '../components/TopDoctors';
import Banner from '../components/Banner';
import Faq from '../components/Faq';
import BookingStep from '../components/BookingStep';
import HomeReviews from '../components/HomeReviews';
import Hero from '../components/Hero';

const Home = () => {
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
        <TopDoctors />
        <HomeReviews />
        <Faq />
        <Banner />
      </div>
    </div>

  )
}

export default Home