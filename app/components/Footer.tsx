// import React from 'react';
// import Link from 'next/link';
// import { HomeIcon, MicrophoneIcon, HeartIcon, UserIcon } from '@heroicons/react/24/outline';

// const Footer = () => {
//   return (
//     <footer className="bg-white shadow fixed bottom-0 left-0 right-0 w-full">
//       <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-around items-center text-center">
//         {[
//           { name: 'خانه', icon: HomeIcon, path: '/' },
//           { name: 'مراسم‌ها', icon: MicrophoneIcon, path: '/events' },
//           { name: 'آرشیو', icon: MicrophoneIcon, path: '/archive' },
//           { name: 'کمک‌ها', icon: HeartIcon, path: '/donations' },
//           { name: 'پروفایل', icon: UserIcon, path: '/profile-selection' }
//         ].map((item, index) => (
//           <Link key={index} href={item.path} legacyBehavior>
//             <a className="text-gray-600 flex flex-col items-center">
//               <item.icon className="h-6 w-6 mb-1" />
//               <span className="block text-sm">{item.name}</span>
//             </a>
//           </Link>
//         ))}
//       </div>
//     </footer>
//   );
// };

// export default Footer;
import { FaComments, FaMapMarkerAlt, FaEnvelope, FaUserCircle } from 'react-icons/fa';
import Link from 'next/link';

export default function FooterSection() {
  const items = [
    { id: 1, label: 'پروفایل', icon: <FaUserCircle />, bgColor: 'bg-white', textColor: 'text-gray-600', href: '/profile' },
    { id: 2, label: 'پیام رسان', icon: <FaEnvelope />, bgColor: 'bg-white', textColor: 'text-green-600', notification: '5', href: '/messenger' },
    { id: 3, label: 'نقشه', icon: <FaMapMarkerAlt />, bgColor: 'bg-white', textColor: 'text-purple-500', href: '/map' },
    { id: 4, label: 'رهیار آنلاین', icon: <FaComments />, bgColor: 'bg-yellow-400', textColor: 'text-white', large: true, href: '/online-assistant' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full p-2 bg-gray-100 rounded-t-lg shadow-md flex justify-around items-center">
      {items.map((item) => (
        <Link key={item.id} href={item.href} className="relative flex flex-col items-center text-center">
          <div className={`${item.bgColor} ${item.textColor} p-2 rounded-full ${item.large ? 'text-3xl p-4' : 'text-2xl'}`}>
            {item.icon}
          </div>
          {item.notification && (
            <span className="absolute top-0 right-5 bg-red-600 text-white text-xs px-1 py-0.5 rounded-full">
              {item.notification}
            </span>
          )}
          <span className={`mt-1 ${item.large ? 'text-sm font-semibold' : 'text-xs'} text-gray-700`}>{item.label}</span>
        </Link>
      ))}
    </div>
  );
}
