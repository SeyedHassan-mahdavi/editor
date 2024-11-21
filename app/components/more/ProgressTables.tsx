import React from 'react';

const ProgressTables = () => {
  const activities = [
    { name: 'Activity 1', score: 85 },
    { name: 'Activity 2', score: 90 },
    { name: 'Activity 3', score: 78 },
  ];

  const skills = [
    { name: 'Skill A', level: 'Beginner' },
    { name: 'Skill B', level: 'Intermediate' },
    { name: 'Skill C', level: 'Advanced' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">جدول فعالیت‌ها</h2>
        <table className="w-full text-right">
          <thead>
            <tr>
              <th className="border px-4 py-2">نام فعالیت</th>
              <th className="border px-4 py-2">امتیاز</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{activity.name}</td>
                <td className="border px-4 py-2">{activity.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">جدول مهارت‌ها</h2>
        <table className="w-full text-right">
          <thead>
            <tr>
              <th className="border px-4 py-2">نام مهارت</th>
              <th className="border px-4 py-2">سطح</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{skill.name}</td>
                <td className="border px-4 py-2">{skill.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgressTables;
