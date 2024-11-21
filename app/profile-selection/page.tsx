import React from 'react';
import Link from 'next/link';
import { UserGroupIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const ProfileSelection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-300 via-blue-300 to-pink-300 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <h1 className="text-4xl font-bold mb-12 text-shadow-lg text-white">انتخاب پروفایل</h1>
      <div className="flex flex-col space-y-6 w-full max-w-xs z-10">
        <Link href="/parent-profile" legacyBehavior>
          <a className="bg-yellow-400 text-white p-6 rounded-2xl shadow-lg transform transition-transform hover:scale-105 flex flex-col items-center">
            <AcademicCapIcon className="h-16 w-16 mb-4" />
            <span className="text-2xl font-semibold">پروفایل والدین</span>
          </a>
        </Link>
        <Link href="/child-profile" legacyBehavior>
          <a className="bg-pink-400 text-white p-6 rounded-2xl shadow-lg transform transition-transform hover:scale-105 flex flex-col items-center">
            <UserGroupIcon className="h-16 w-16 mb-4" />
            <span className="text-2xl font-semibold">پروفایل کودکان</span>
          </a>
        </Link>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400 rounded-full opacity-70"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-400 rounded-full opacity-70"></div>
    </div>
  );
};

export default ProfileSelection;
