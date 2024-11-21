"use client"
import React from 'react';
import ProgressCharts from '../../components/ProgressCharts';
import ProgressTables from '../../components/ProgressTables';

const ProgressReport = () => {
  return (
    <div className="min-h-screen bg-background text-text p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">گزارش‌های پیشرفت کودکان</h1>
      <div className="space-y-12">
        <ProgressCharts />
        <ProgressTables />
      </div>
    </div>
  );
};

export default ProgressReport;
