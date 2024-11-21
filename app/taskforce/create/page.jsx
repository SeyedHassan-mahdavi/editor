'use client';
import React, { useState } from 'react';
import Select, { components } from 'react-select';
import { FaSave, FaTimes } from 'react-icons/fa';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

const fakeMembers = [
  { id: 1, name: 'علی رضایی', profileImage: '/default-profile.jpg' },
  { id: 2, name: 'مریم احمدی', profileImage: '/default-profile.jpg' },
  { id: 3, name: 'سارا کاظمی', profileImage: '/default-profile.jpg' },
  { id: 4, name: 'حسین ملکی', profileImage: '/default-profile.jpg' },
  { id: 5, name: 'نازنین نظری', profileImage: '/default-profile.jpg' },
  { id: 6, name: 'محمد قاسمی', profileImage: '/default-profile.jpg' },
];

const memberOptions = fakeMembers.map(member => ({
  value: member.id,
  label: member.name,
  profileImage: member.profileImage,
}));

const AddTaskForce = () => {
  const [taskForceName, setTaskForceName] = useState('');
  const [description, setDescription] = useState('');
  const [leader, setLeader] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [taskForceDate, setTaskForceDate] = useState(null);
  const [status, setStatus] = useState('');
  const [accessLevel, setAccessLevel] = useState('');

  const handleMemberChange = (selectedOptions) => {
    setSelectedMembers(selectedOptions || []);
  };

  const handleRemoveMember = (memberId) => {
    const updatedMembers = selectedMembers.filter(member => member.value !== memberId);
    setSelectedMembers(updatedMembers);
  };

  const handleSaveTaskForce = () => {
    console.log({
      taskForceName,
      description,
      leader,
      selectedMembers,
      taskForceDate,
      status,
      accessLevel,
    });
  };

  const customStyles = {
    option: (provided, { isSelected, data }) => ({
      ...provided,
      backgroundColor: isSelected ? '#cce5ff' : selectedMembers.some(member => member.value === data.value) ? '#e6f7ff' : null,
      color: isSelected ? '#004085' : selectedMembers.some(member => member.value === data.value) ? '#1890ff' : null,
      ':active': {
        ...provided[':active'],
        backgroundColor: isSelected ? '#cce5ff' : provided[':active'].backgroundColor,
      },
    }),
  };

  const Option = (props) => {
    const isSelectedMember = selectedMembers.some(member => member.value === props.data.value);
    return (
      <components.Option {...props}>
        <img
          src={props.data.profileImage}
          alt={props.data.label}
          className="w-8 h-8 rounded-full ml-2 inline-block"
        />
        <span>{props.data.label}</span>
        {isSelectedMember && <span className="ml-2 text-sm text-blue-600">(انتخاب‌شده)</span>}
      </components.Option>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-28">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">ثبت / ویرایش کارگروه</h1>
        <div className="mb-4">
          <label className="block text-right font-medium mb-2">نام کارگروه *</label>
          <input
            type="text"
            className="border p-2 rounded w-full text-right"
            value={taskForceName}
            onChange={(e) => setTaskForceName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">شرح وظایف</label>
          <textarea
            className="border p-2 rounded w-full text-right"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">رئیس کارگروه</label>
          <Select
            options={memberOptions}
            placeholder="انتخاب کنید"
            onChange={setLeader}
            isClearable
            styles={customStyles}
            components={{ Option }}
            className="text-right"
          />
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">اعضای کارگروه</label>
          <Select
            isMulti
            options={memberOptions}
            placeholder="انتخاب اعضا"
            onChange={handleMemberChange}
            value={selectedMembers}
            styles={customStyles}
            components={{ Option }}
            className="text-right"
          />
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">اعضای انتخاب‌شده</label>
          <div className="flex flex-wrap">
            {selectedMembers.map((member) => (
              <div
                key={member.value}
                className="bg-gray-200 rounded-lg p-2 mr-2 mb-2 flex items-center"
              >
                <img
                  src={member.profileImage}
                  alt={member.label}
                  className="w-8 h-8 rounded-full ml-2"
                />
                <span>{member.label}</span>
                <FaTimes
                  className="text-red-500 ml-2 cursor-pointer"
                  onClick={() => handleRemoveMember(member.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">تاریخ تشکیل</label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={taskForceDate}
            onChange={setTaskForceDate}
            className="border p-2 rounded w-full text-right"
            inputClass="w-full p-2 rounded border"
            placeholder="انتخاب تاریخ"
          />
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">وضعیت کارگروه</label>
          <select
            className="border p-2 rounded w-full text-right"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">انتخاب کنید</option>
            <option value="فعال">فعال</option>
            <option value="غیرفعال">غیرفعال</option>
            <option value="تعلیق‌شده">تعلیق‌شده</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-right font-medium mb-2">سطح دسترسی</label>
          <select
            className="border p-2 rounded w-full text-right"
            value={accessLevel}
            onChange={(e) => setAccessLevel(e.target.value)}
          >
            <option value="">انتخاب کنید</option>
            <option value="مدیر">مدیر</option>
            <option value="کاربر عادی">کاربر عادی</option>
            <option value="مهمان">مهمان</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row justify-end mt-6 space-y-2 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center justify-center"
            onClick={handleSaveTaskForce}
          >
            <FaSave className="ml-2" /> ذخیره
          </button>
          <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center justify-center">
            <FaTimes className="ml-2" /> لغو
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskForce;
