'use client';
import React, { useState } from 'react';
import { FaSave, FaUpload } from 'react-icons/fa';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import Select from 'react-select';

const fakeMembers = [
  { id: 1, name: 'علی رضایی' },
  { id: 2, name: 'مریم احمدی' },
  { id: 3, name: 'سارا کاظمی' },
  { id: 4, name: 'حسین ملکی' },
];

const memberOptions = fakeMembers.map(member => ({
  value: member.id,
  label: member.name,
}));

const SettingsPage = () => {
  // اطلاعات عمومی هیات
  const [name, setName] = useState('');
  const [foundationDate, setFoundationDate] = useState(null);
  const [mission, setMission] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [socialLinks, setSocialLinks] = useState('');
  const [leader, setLeader] = useState(null);
  const [history, setHistory] = useState('');

  // تنظیمات پیشرفته
  const [accessLevel, setAccessLevel] = useState('');
  const [isPublic, setIsPublic] = useState({
    name: true,
    mission: true,
    history: false,
  });
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);
  const [logoPosition, setLogoPosition] = useState('top-left');
  const [bannerSize, setBannerSize] = useState('medium');
  const [language, setLanguage] = useState('fa');
  const [calendarType, setCalendarType] = useState('persian');
  const [homepageConfig, setHomepageConfig] = useState({
    showNews: true,
    newsCount: 3,
    showEvents: true,
    eventsCount: 5,
    showTaskForces: true,
    taskForcesCount: 4,
    showManagerMessage: true,
    showGallery: true,
  });

  const handleFileChange = (e, setFile) => {
    setFile(e.target.files[0]);
  };

  const handleSaveSettings = () => {
    const settingsData = {
      name,
      foundationDate,
      mission,
      address,
      phoneNumber,
      email,
      socialLinks,
      leader,
      history,
      accessLevel,
      isPublic,
      logo,
      banner,
      logoPosition,
      bannerSize,
      language,
      calendarType,
      homepageConfig,
    };
    console.log('Settings saved:', settingsData);
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-28">
      <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">اطلاعات عمومی هیات</h1>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">نام هیات *</label>
          <input
            type="text"
            className="border p-2 rounded w-full text-right"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">تاریخ تأسیس</label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={foundationDate}
            onChange={setFoundationDate}
            className="border p-2 rounded w-full text-right"
            inputClass="w-full p-2 rounded border"
            placeholder="انتخاب تاریخ"
          />
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">هدف هیات</label>
          <textarea
            className="border p-2 rounded w-full text-right"
            rows="4"
            value={mission}
            onChange={(e) => setMission(e.target.value)}
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">آدرس</label>
          <input
            type="text"
            className="border p-2 rounded w-full text-right"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">شماره تماس</label>
          <input
            type="text"
            className="border p-2 rounded w-full text-right"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">آدرس ایمیل</label>
          <input
            type="email"
            className="border p-2 rounded w-full text-right"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">شبکه‌های اجتماعی</label>
          <input
            type="text"
            className="border p-2 rounded w-full text-right"
            value={socialLinks}
            onChange={(e) => setSocialLinks(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">مدیر اصلی</label>
          <Select
            options={memberOptions}
            placeholder="انتخاب کنید"
            onChange={setLeader}
            isClearable
            className="text-right"
          />
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">شرح تاریخچه</label>
          <textarea
            className="border p-2 rounded w-full text-right"
            rows="6"
            value={history}
            onChange={(e) => setHistory(e.target.value)}
          ></textarea>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">تنظیمات پیشرفته</h2>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">سطح دسترسی اطلاعات</label>
          <Select
            options={[
              { value: 'public', label: 'عمومی' },
              { value: 'restricted', label: 'محدود' },
              { value: 'private', label: 'فقط مدیران' },
            ]}
            placeholder="انتخاب سطح دسترسی"
            onChange={(option) => setAccessLevel(option.value)}
            className="text-right"
          />
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">انتشار عمومی</label>
          <div className="flex flex-col">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={isPublic.name}
                onChange={() => setIsPublic(prev => ({ ...prev, name: !prev.name }))}
                className="form-checkbox"
              />
              <span className="ml-2">نام هیات</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={isPublic.mission}
                onChange={() => setIsPublic(prev => ({ ...prev, mission: !prev.mission }))}
                className="form-checkbox"
              />
              <span className="ml-2">اهداف هیات</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={isPublic.history}
                onChange={() => setIsPublic(prev => ({ ...prev, history: !prev.history }))}
                className="form-checkbox"
              />
              <span className="ml-2">تاریخچه هیات</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">مدیریت لوگو</label>
          <input
            type="file"
            className="border p-2 rounded w-full text-right"
            onChange={(e) => handleFileChange(e, setLogo)}
          />
          {logo && (
            <div className="mt-2">
              <span className="text-sm text-gray-500">{logo.name}</span>
              <div className="flex items-center mt-2">
                <label className="block text-right font-medium mb-2 ml-2">موقعیت نمایش:</label>
                <select
                  className="border p-2 rounded w-1/2 text-right"
                  value={logoPosition}
                  onChange={(e) => setLogoPosition(e.target.value)}
                >
                  <option value="top-left">بالا-چپ</option>
                  <option value="top-right">بالا-راست</option>
                  <option value="bottom-left">پایین-چپ</option>
                  <option value="bottom-right">پایین-راست</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">مدیریت بنر</label>
          <input
            type="file"
            className="border p-2 rounded w-full text-right"
            onChange={(e) => handleFileChange(e, setBanner)}
          />
          {banner && (
            <div className="mt-2">
              <span className="text-sm text-gray-500">{banner.name}</span>
              <div className="flex items-center mt-2">
                <label className="block text-right font-medium mb-2 ml-2">اندازه نمایش:</label>
                <select
                  className="border p-2 rounded w-1/2 text-right"
                  value={bannerSize}
                  onChange={(e) => setBannerSize(e.target.value)}
                >
                  <option value="small">کوچک</option>
                  <option value="medium">متوسط</option>
                  <option value="large">بزرگ</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">تنظیمات زبان و محلی</label>
          <div className="flex">
            <select
              className="border p-2 rounded w-1/2 text-right"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="fa">فارسی</option>
              <option value="ar">عربی</option>
              <option value="en">انگلیسی</option>
            </select>
            <select
              className="border p-2 rounded w-1/2 text-right ml-2"
              value={calendarType}
              onChange={(e) => setCalendarType(e.target.value)}
            >
              <option value="persian">شمسی</option>
              <option value="gregorian">میلادی</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">پیکربندی صفحه اصلی سایت</label>
          <div className="flex flex-col">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={homepageConfig.showNews}
                onChange={() =>
                  setHomepageConfig(prev => ({ ...prev, showNews: !prev.showNews }))
                }
                className="form-checkbox"
              />
              <span className="ml-2">نمایش اخبار</span>
            </label>
            {homepageConfig.showNews && (
              <div className="ml-6">
                <label className="block text-right font-medium mb-2">تعداد اخبار نمایش داده‌شده:</label>
                <input
                  type="number"
                  className="border p-2 rounded w-full text-right"
                  value={homepageConfig.newsCount}
                  onChange={(e) =>
                    setHomepageConfig(prev => ({ ...prev, newsCount: e.target.value }))
                  }
                  min="1"
                />
              </div>
            )}

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={homepageConfig.showEvents}
                onChange={() =>
                  setHomepageConfig(prev => ({ ...prev, showEvents: !prev.showEvents }))
                }
                className="form-checkbox"
              />
              <span className="ml-2">نمایش مراسمات آینده</span>
            </label>
            {homepageConfig.showEvents && (
              <div className="ml-6">
                <label className="block text-right font-medium mb-2">تعداد مراسمات نمایش داده‌شده:</label>
                <input
                  type="number"
                  className="border p-2 rounded w-full text-right"
                  value={homepageConfig.eventsCount}
                  onChange={(e) =>
                    setHomepageConfig(prev => ({ ...prev, eventsCount: e.target.value }))
                  }
                  min="1"
                />
              </div>
            )}

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={homepageConfig.showTaskForces}
                onChange={() =>
                  setHomepageConfig(prev => ({ ...prev, showTaskForces: !prev.showTaskForces }))
                }
                className="form-checkbox"
              />
              <span className="ml-2">معرفی کارگروه‌ها</span>
            </label>
            {homepageConfig.showTaskForces && (
              <div className="ml-6">
                <label className="block text-right font-medium mb-2">تعداد کارگروه‌های نمایش داده‌شده:</label>
                <input
                  type="number"
                  className="border p-2 rounded w-full text-right"
                  value={homepageConfig.taskForcesCount}
                  onChange={(e) =>
                    setHomepageConfig(prev => ({ ...prev, taskForcesCount: e.target.value }))
                  }
                  min="1"
                />
              </div>
            )}

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={homepageConfig.showManagerMessage}
                onChange={() =>
                  setHomepageConfig(prev => ({ ...prev, showManagerMessage: !prev.showManagerMessage }))
                }
                className="form-checkbox"
              />
              <span className="ml-2">نمایش پیام مدیر</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={homepageConfig.showGallery}
                onChange={() =>
                  setHomepageConfig(prev => ({ ...prev, showGallery: !prev.showGallery }))
                }
                className="form-checkbox"
              />
              <span className="ml-2">نمایش گالری تصاویر</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center"
            onClick={handleSaveSettings}
          >
            <FaSave className="ml-2" /> ذخیره تنظیمات
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
