import React from 'react';

const games = [
  { name: 'بازی X', description: 'یک بازی آموزشی برای تقویت مهارت‌های Y' },
  { name: 'بازی Y', description: 'یک بازی سرگرم‌کننده برای یادگیری Z' },
];

const RecommendedGames = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-300 via-blue-300 to-pink-300 text-white p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">بازی‌های پیشنهادی</h1>
      <div className="space-y-4">
        {games.map((game, index) => (
          <div key={index} className="bg-white text-primary p-4 rounded-lg shadow-md flex flex-col items-center">
            <span className="text-2xl font-semibold mb-2">{game.name}</span>
            <span>{game.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedGames;
