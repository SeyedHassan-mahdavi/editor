  'use client';

  import { useState } from 'react';
  import Link from 'next/link';
  import { Calendar, DateObject } from 'react-multi-date-picker';
  import persian from 'react-date-object/calendars/persian';
  import persian_fa from 'react-date-object/locales/persian_fa';
  import 'react-multi-date-picker/styles/layouts/mobile.css';
  import { FaEdit, FaProjectDiagram, FaTrash } from 'react-icons/fa';

  export default function Dashboard() {
    const [events, setEvents] = useState([
      {
        id: '1',
        title: 'مراسم افتتاحیه',
        date: '1403/05/25',
        details: 'مراسم افتتاحیه شامل سخنرانی مدیر کل',
        manager: 'مدیر ۱',
        status: 'ready', // وضعیت آماده
        progress: 50, // 50 درصد پیشرفت
      },
      {
        id: '4',
        title: 'مراسم افتتاحیه',
        date: '1403/05/25',
        details: 'مراسم افتتاحیه شامل سخنرانی مدیر کل',
        manager: 'مدیر ۱',
        status: 'in-progress', // وضعیت در حال انجام
        progress: 30, // 30 درصد پیشرفت
      },
      {
        id: '2',
        title: 'جلسه هم‌اندیشی',
        date: '1403/07/10',
        details: 'جلسه هم‌اندیشی با حضور کارشناسان',
        manager: 'مدیر ۲',
        status: 'urgent', // وضعیت فوری
        progress: 80, // 80 درصد پیشرفت
      },
    ]);

    const [selectedDate, setSelectedDate] = useState(new DateObject({ calendar: persian, locale: persian_fa }));

    const getEventsForSelectedDate = () => {
      const formattedSelectedDate = selectedDate.format('YYYY/MM/DD'); 
      return events.filter(event => {
        const eventDate = new DateObject({ date: event.date, calendar: persian, locale: persian_fa });
        return eventDate.format('YYYY/MM/DD') === formattedSelectedDate;
      });
    };

    const getEventsForSelectedMonth = () => {
      const selectedMonth = selectedDate.month.index; // ماه انتخابی از تقویم
      const selectedYear = selectedDate.year; // سال انتخابی از تقویم
      return events.filter(event => {
        const eventDate = new DateObject({ date: event.date, calendar: persian, locale: persian_fa });
        return eventDate.month.index === selectedMonth && eventDate.year === selectedYear;
      });
    };

    const handleEdit = (id) => {
      console.log(`Editing event with id: ${id}`);
      // Implement edit functionality here
    };

    const handleManageProject = (id) => {
      console.log(`Managing project for event with id: ${id}`);
      // Implement manage project functionality here
    };

    const handleDelete = (id) => {
      console.log(`Deleting event with id: ${id}`);
      // Implement delete functionality here
    };

    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        {/* بخش هدر */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">داشبورد مراسمات</h1>
          <Link href="/create-event" legacyBehavior>
            <a className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
              ایجاد مراسم جدید
            </a>
          </Link>
        </div>

        {/* بخش تقویم */}
        <div className="mb-8 flex justify-center">
          <div className="w-full sm:w-3/4 lg:w-1/2">
            <h2 className="text-2xl font-semibold mb-4 text-center">تقویم مراسمات</h2>
            <Calendar
              numberOfMonths={1}
              value={selectedDate}
              onChange={setSelectedDate}
              calendar={persian}
              locale={persian_fa}
              className="rmdp-calendar mx-auto"
              mapDays={({ date, today, selectedDate, currentMonth, isSameDate }) => {
                let props = {};

                let formattedDate = date.format('YYYY/MM/DD');
                let isEventDay = events.some(event => {
                  const eventDate = new DateObject({ date: event.date, calendar: persian, locale: persian_fa });
                  return eventDate.format('YYYY/MM/DD') === formattedDate;
                });

                if (isEventDay) {
                  props.style = {
                    backgroundColor: "#8BC34A", 
                    color: "white", 
                    borderRadius: "50%", 
                  };
                }

                if (isSameDate(date, selectedDate)) {
                  props.style = {
                    ...props.style,
                    color: "#0074d9",
                    backgroundColor: "#a5a5a5",
                    fontWeight: "bold",
                    border: "1px solid #777",
                  };
                }

                if (isSameDate(date, today)) {
                  props.style = {
                    ...props.style,
                    color: "green",
                  };
                }

                return props;
              }}
            />
          </div>
        </div>
        {/* بخش نمایش رویدادها */}
        <div className="mt-8 mb-8">
          <h3 className="text-lg font-medium mb-6 text-center text-gray-700">مراسمات برای تاریخ {selectedDate.format('YYYY/MM/DD')}:</h3>
          <ul className="space-y-4">
            {getEventsForSelectedDate().length > 0 ? (
              getEventsForSelectedDate().map((event, index) => {
                // تعریف رنگ بر اساس وضعیت
                let statusColor;
                switch (event.status) {
                  case 'ready':
                    statusColor = 'border-green-500';
                    break;
                  case 'in-progress':
                    statusColor = 'border-yellow-500';
                    break;
                  case 'urgent':
                    statusColor = 'border-red-500';
                    break;
                  default:
                    statusColor = 'border-gray-300';
                }

                return (
                  <li 
                    key={index} 
                    className={`bg-white shadow-md rounded-lg p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center transition duration-300 transform border-l-4 ${statusColor}`}
                  >
                    <div className="mb-4 sm:mb-0 w-full">
                      <h4 className="text-xl font-semibold text-gray-800">{event.title}</h4>
                      <p className="text-sm text-gray-600 mb-1">{event.details}</p>
                      <p className="text-sm text-gray-500">مدیر: {event.manager}</p>
                      {/* نوار پیشرفت */}
                      <div className="relative w-full h-2 bg-gray-300 rounded mt-2">
                        <div
                          className="absolute top-0 left-0 h-2 bg-blue-600 rounded"
                          style={{ width: `${event.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                      <button
                        onClick={() => handleEdit(event.id)}
                        className="bg-blue-500 text-white py-2 px-4 rounded-md text-center text-sm transition duration-300 hover:bg-blue-600"
                      >
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleManageProject(event.id)}
                        className="bg-green-500 text-white py-2 px-4 rounded-md text-center text-sm transition duration-300 hover:bg-green-600"
                      >
                        مدیریت پروژه
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="bg-red-500 text-white py-2 px-4 rounded-md text-center text-sm transition duration-300 hover:bg-red-600"
                      >
                        حذف
                      </button>
                    </div>
                  </li>
                );
              })
            ) : (
              <p className="text-center text-gray-500">هیچ مراسمی برای این تاریخ ثبت نشده است.</p>
            )}
          </ul>
        </div>

        {/* بخش آمار */}
        <div className="mb-20">
          <h2 className="text-2xl font-semibold mb-4">آمار کلی</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white shadow rounded">
              <h3 className="text-lg font-medium">تعداد کل مراسمات</h3>
              <p className="text-2xl font-bold">{events.length}</p>
            </div>
            <div className="p-4 bg-white shadow rounded">
              <h3 className="text-lg font-medium">مراسمات این ماه</h3>
              <p className="text-2xl font-bold">
                {getEventsForSelectedMonth().length}
              </p>
            </div>
            <div className="p-4 bg-white shadow rounded">
              <h3 className="text-lg font-medium">تعداد سخنرانان</h3>
              <p className="text-2xl font-bold">5</p>
            </div>
            <div className="p-4 bg-white shadow rounded">
              <h3 className="text-lg font-medium">مراسمات آینده</h3>
              <p className="text-2xl font-bold">
                {events.filter(event => new DateObject({ date: event.date, calendar: persian, locale: persian_fa }).valueOf() > new DateObject().valueOf()).length}
              </p>
            </div>
          </div>
        </div>

      </div>
    );
  }
