// 'use client'
// import React, { useState } from 'react';

// interface SliderProps {
//   items: string[];
// }

// const Slider: React.FC<SliderProps> = ({ items }) => {
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const prevSlide = () => {
//     setCurrentIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
//   };

//   const nextSlide = () => {
//     setCurrentIndex((prevIndex) => (prevIndex === items.length - 1 ? 0 : prevIndex + 1));
//   };

//   return (
//     <div className="relative w-full overflow-hidden">
//       <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${currentIndex * 100}%)`, width: `${items.length * 100}%` }}>
//         {items.map((item, index) => (
//           <div key={index} className="min-w-full flex-shrink-0">
//             <div className="bg-secondary shadow-md rounded-lg p-6 mx-2">
//               <h2 className="text-xl font-bold mb-2">{item}</h2>
//               <p>توضیح کوتاه درباره {item}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//       <button onClick={prevSlide} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-primary text-white p-2 rounded-full">
//         &lt;
//       </button>
//       <button onClick={nextSlide} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-primary text-white p-2 rounded-full">
//         &gt;
//       </button>
//     </div>
//   );
// }

// export default Slider;


import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Autoplay, Pagination } from 'swiper/modules';

const Slider = () => {

  const sliderImages = [
    '/Capture1.JPG',
    '/Capture3.JPG',
    '/Capture4.JPG',
  ];


  return (
    <>
      {/* اسلایدر */}
      <div className="mt-5 px-4 sm:px-6 lg:px-8">
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="rounded-lg shadow-md"
        >
          {sliderImages.map((src, index) => (
            <SwiperSlide key={index}>
              <img src={src} alt={`Slider ${index + 1}`} className="w-full h-48 object-cover rounded-lg" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>

  )
}

export default Slider
