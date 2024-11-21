'use client'
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const stories = [
  { type: 'image', src: '/Capture1.JPG' },
  { type: 'image', src: '/Capture3.JPG' },
  { type: 'image', src: '/Capture4.JPG' },
  { type: 'video', src: '/videos/story1.mp4' },
  // Add more stories here
];

const StoryViewer = ({ onClose }) => {
  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    afterChange: (index) => {
      if (index === stories.length - 1) {
        setTimeout(onClose, 5000);
      }
    },
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="absolute top-0 left-0 w-full h-full" onClick={onClose} />
      <div className="relative w-full h-full flex items-center justify-center">
        <Slider {...settings} className="w-full h-full">
          {stories.map((story, index) => (
            <div key={index} className="h-full">
              {story.type === 'image' ? (
                <img src={story.src} alt={`Story ${index + 1}`} className="w-full h-full object-cover" />
              ) : (
                <video src={story.src} className="w-full h-full object-cover" autoPlay muted />
              )}
            </div>
          ))}
        </Slider>
      </div>
    </div>,
    document.body
  );
};

const StoryIcon = () => {
  const [isViewing, setIsViewing] = useState(false);

  const handleOpen = () => setIsViewing(true);
  const handleClose = () => setIsViewing(false);

  return (
    <>
      <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer" onClick={handleOpen}>
        <span className="text-white">Story</span>
      </div>
      {isViewing && <StoryViewer onClose={handleClose} />}
    </>
  );
};

export default StoryIcon;
