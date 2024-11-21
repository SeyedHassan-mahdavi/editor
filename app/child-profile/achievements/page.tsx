import React from 'react';

const achievements = [
  { name: 'مدال طلایی', description: 'کسب امتیاز 100 در بازی X' },
  { name: 'مدال نقره‌ای', description: 'کسب امتیاز 80 در بازی Y' },
  { name: 'مدال برنزی', description: 'کسب امتیاز 60 در بازی Z' },
];

const Achievements = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-300 via-blue-300 to-pink-300 text-white p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">امتیازها و دستاوردها</h1>
      <div className="space-y-4">
        {achievements.map((achievement, index) => (
          <div key={index} className="bg-white text-primary p-4 rounded-lg shadow-md flex flex-col items-center">
            <span className="text-2xl font-semibold mb-2">{achievement.name}</span>
            <span>{achievement.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
