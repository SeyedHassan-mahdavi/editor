'use client';
import React, { useState, useEffect } from 'react';
import DatePicker, { Calendar, DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import arabic from 'react-date-object/calendars/arabic';
import arabic_ar from 'react-date-object/locales/arabic_ar';
import '../../../styles/custom-calendar.css'; // Import custom CSS file
import 'react-multi-date-picker/styles/layouts/mobile.css';

const PersianCalendar = () => {
  // Weekdays information
  const weekDays = [
    { name: 'شنبه', index: 0 },
    { name: 'یکشنبه', index: 1 },
    { name: 'دوشنبه', index: 2 },
    { name: 'سه‌شنبه', index: 3 },
    { name: 'چهارشنبه', index: 4 },
    { name: 'پنج‌شنبه', index: 5 },
    { name: 'جمعه', index: 6 }
  ];

  // Initial Persian date
  const [value, setValue] = useState(new DateObject({ calendar: persian, locale: persian_fa }));
  const [currentMonthJalali, setCurrentMonthJalali] = useState('');
  const [currentYearJalali, setCurrentYearJalali] = useState('');
  const [currentMonthHijri, setCurrentMonthHijri] = useState('');
  const [currentYearHijri, setCurrentYearHijri] = useState('');
  const [currentDateGregorian, setCurrentDateGregorian] = useState('');
  const [weekDates, setWeekDates] = useState([]);

  useEffect(() => {
    // Set current month and year in Jalali calendar
    setCurrentMonthJalali(value.month.name);
    setCurrentYearJalali(value.year);
  
    // Set current month and year in Hijri calendar
    const arabicDate = new DateObject({ calendar: arabic, locale: arabic_ar });
    setCurrentMonthHijri(arabicDate.month.name);
    setCurrentYearHijri(arabicDate.year);

     // Calculate Gregorian date
  const gregorianDate = new DateObject({ calendar: 'gregorian' });
  setCurrentDateGregorian(`${gregorianDate.month.name} - ${gregorianDate.year}`);
  
    // Calculate the start of the week manually
    const weekStartDay = new DateObject({ calendar: persian, locale: persian_fa }).set({
      day: value.day - value.weekDay.index,
      month: value.month.number,
      year: value.year
    });
  
    const weekArray = [];
    const daysInMonth = new DateObject({
      calendar: persian,
      locale: persian_fa,
      day: 1,
      month: value.month.number,
      year: value.year
    }).month.length;
  
    for (let i = 0; i < 7; i++) {
      const currentDay = new DateObject({
        calendar: persian,
        locale: persian_fa,
        day: weekStartDay.day + i,
        month: weekStartDay.month,
        year: weekStartDay.year
      });
  
      // Check if the day is within the current month
      if (currentDay.day < 1 || currentDay.day > daysInMonth) {
        continue; // Skip days that are outside the current month
      }
  
      weekArray.push({
        day: weekDays[i].name,
        date: currentDay.day
      });
    }
  
    setWeekDates(weekArray);
  }, [value]);
  
  return (
    <div className="custom-calendar bg-blue-600 text-white pt-3 px-5 shadow-md">
      <div className="flex justify-between items-center mb-4">

        <div>
          <p className="text-sm">{`${currentMonthHijri} - ${currentYearHijri}`}</p>
        </div>
        <div>
          <p className="text-xl font-bold">{`${currentMonthJalali} ${currentYearJalali}`}</p>
        </div>
        <div>
          <p className="text-sm">{currentDateGregorian}</p>
        </div>
      </div>

      {/* Display weekdays with dates */}
      <div className="flex justify-between w-full text-center ">
        {weekDates.map((day, index) => (
          <div
            key={index}
            className={`flex flex-1 flex-col items-center  ${index === value.weekDay.index ? 'text-yellow-400 font-bold  border-b-4 border-yellow-400' : ''} ${index === 6 ? 'text-red-500 font-bold' : ''}`}
          >
            <div className={`${index === value.weekDay.index ? 'text-yellow-400' : ' text-xs '}`}>{day.day}</div>
            <div className={`${index === value.weekDay.index ? 'text-yellow-400' : ''} text-sm`}>{day.date}</div>
          </div>

        ))}
      </div>
    </div>
  );
};

export default PersianCalendar;
