import React from 'react';
import Link from 'next/link';

const ParentProfile = () => {
  return (
    <div className="min-h-screen bg-background text-text p-4">
      <h1 className="text-4xl font-bold mb-8">پروفایل والدین</h1>
      <div className="space-y-6">
        <Link href="/parent-profile/progress-report" legacyBehavior>
          <a className="block bg-primary text-white p-4 rounded-lg shadow-lg hover:bg-primary-dark transition">
            گزارش‌های پیشرفت کودکان
          </a>
        </Link>
        {/* سایر لینک‌ها و بخش‌های پروفایل والدین */}
      </div>
    </div>
  );
};

export default ParentProfile;
