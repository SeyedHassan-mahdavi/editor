"use client"
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
  labels: ['مهارت A', 'مهارت B', 'مهارت C'],
  datasets: [
    {
      label: 'درصد پیشرفت',
      data: [85, 70, 90],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'پیشرفت در یادگیری',
    },
  },
};

const LearningProgress = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-300 via-blue-300 to-pink-300 text-white p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">پیشرفت در یادگیری</h1>
      <div className="bg-white text-primary p-4 rounded-lg shadow-md">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default LearningProgress;
