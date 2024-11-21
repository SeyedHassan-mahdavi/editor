import React from 'react';
import Link from 'next/link';

const ChildProfile = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-300 via-blue-300 to-pink-300 text-white p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">پروفایل کودکان</h1>
      <div className="space-y-6">
        <Link href="/child-profile/achievements" legacyBehavior>
          <a className="block bg-yellow-400 text-white p-4 rounded-lg shadow-lg hover:scale-105 transition transform flex flex-col items-center">
            <span className="text-2xl font-semibold">امتیازها و دستاوردها</span>
          </a>
        </Link>
        <Link href="/child-profile/recommended-games" legacyBehavior>
          <a className="block bg-pink-400 text-white p-4 rounded-lg shadow-lg hover:scale-105 transition transform flex flex-col items-center">
            <span className="text-2xl font-semibold">بازی‌های پیشنهادی</span>
          </a>
        </Link>
        <Link href="/child-profile/learning-progress" legacyBehavior>
          <a className="block bg-blue-400 text-white p-4 rounded-lg shadow-lg hover:scale-105 transition transform flex flex-col items-center">
            <span className="text-2xl font-semibold">پیشرفت در یادگیری</span>
          </a>
        </Link>
      </div>
    </div>
  );
};

export default ChildProfile;
