'use client'

import React from 'react';
import PersianCalendar from './components/event/PersianCalendar';
import StorySection from './components/more/StorySection';
import Slider from './components/more/Slider';
import ServicesSection from './components/more/ServicesSection';

const Home = () => {

  return (
    <>

      {/* Include the Calendar */}
      <PersianCalendar />
      <div className="max-w-7xl mx-auto py-6 pb-24">


        <StorySection />
        <Slider />
        <ServicesSection />



      </div>
    </>

  );
};

export default Home;
