'use client'
import React, { useState } from 'react';

const SearchFilterBar = ({ onFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearch = () => {
    onFilter({
      searchTerm,
      roleFilter,
      groupFilter,
      statusFilter,
      dateFilter,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setGroupFilter('');
    setStatusFilter('');
    setDateFilter('');
    setShowAdvancedFilters(false);
    onFilter({
      searchTerm: '',
      roleFilter: '',
      groupFilter: '',
      statusFilter: '',
      dateFilter: '',
    });
  };

  return (
    <div className="bg-white p-4 rounded shadow-md mb-4">
      <h2 className="text-lg font-bold mb-4">جستجو و فیلتر اعضا</h2>
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="جستجو با نام، ایمیل، کد ملی"
          className="p-2 border rounded w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="p-2 border rounded w-full md:w-1/6"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">نقش</option>
          <option value="مدیر">مدیر</option>
          <option value="عضو عادی">عضو عادی</option>
          <option value="مداح">مداح</option>
          <option value="سخنران">سخنران</option>
        </select>

        <select
          className="p-2 border rounded w-full md:w-1/6"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
        >
          <option value="">کارگروه</option>
          <option value="کارگروه A">کارگروه A</option>
          <option value="کارگروه B">کارگروه B</option>
          <option value="کارگروه C">کارگروه C</option>
        </select>

        <select
          className="p-2 border rounded w-full md:w-1/6"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">وضعیت عضویت</option>
          <option value="فعال">فعال</option>
          <option value="غیرفعال">غیرفعال</option>
          <option value="تعلیق‌شده">تعلیق‌شده</option>
        </select>

        <input
          type="date"
          className="p-2 border rounded w-full md:w-1/6"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />

        <button
          className="p-2 bg-blue-500 text-white rounded w-full md:w-1/6"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          فیلتر پیشرفته
        </button>
      </div>

      {showAdvancedFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h3 className="text-md font-bold mb-2">فیلترهای پیشرفته</h3>
          <div className="flex flex-wrap gap-4">
            <input
              type="number"
              placeholder="سن"
              className="p-2 border rounded w-full md:w-1/6"
            />

            <select className="p-2 border rounded w-full md:w-1/6">
              <option value="">مهارت‌ها</option>
              <option value="مهارت A">مهارت A</option>
              <option value="مهارت B">مهارت B</option>
              <option value="مهارت C">مهارت C</option>
            </select>

            <input
              type="date"
              className="p-2 border rounded w-full md:w-1/6"
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-4">
        <button
          className="p-2 bg-green-500 text-white rounded"
          onClick={handleSearch}
        >
          اعمال فیلترها
        </button>
        <button
          className="p-2 bg-red-500 text-white rounded"
          onClick={handleClearFilters}
        >
          پاک کردن فیلترها
        </button>
      </div>
    </div>
  );
};

export default SearchFilterBar;
