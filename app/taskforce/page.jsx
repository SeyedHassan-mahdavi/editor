'use client';
import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaUserPlus } from 'react-icons/fa';

// داده‌های فیک کارگروه‌ها برای تست
const fakeTaskForces = [
  {
    id: 1,
    name: 'کارگروه A',
    status: 'فعال',
    membersCount: 10,
    createdAt: '1400/01/15',
    members: ['علی رضایی', 'مریم احمدی'],
  },
  {
    id: 2,
    name: 'کارگروه B',
    status: 'غیرفعال',
    membersCount: 5,
    createdAt: '1399/05/20',
    members: ['سارا کاظمی'],
  },
  {
    id: 3,
    name: 'کارگروه C',
    status: 'تعلیق‌شده',
    membersCount: 7,
    createdAt: '1401/02/10',
    members: [],
  },
];

// داده‌های فیک اعضا برای تست
const fakeMembers = [
  'علی رضایی',
  'مریم احمدی',
  'سارا کاظمی',
  'حسین ملکی',
  'نازنین نظری',
  'محمد قاسمی',
];

const TaskForceDashboard = () => {
  const [taskForces, setTaskForces] = useState(fakeTaskForces);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedTaskForce, setSelectedTaskForce] = useState(null);
  const [availableMembers, setAvailableMembers] = useState(fakeMembers);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showMemberPopup, setShowMemberPopup] = useState(false);
  const [showAddMemberPopup, setShowAddMemberPopup] = useState(false);

  // فیلتر و جستجو
  const filteredTaskForces = taskForces.filter(taskForce => 
    taskForce.name.includes(searchTerm) && 
    (filterStatus === '' || taskForce.status === filterStatus)
  );

  // افزودن عضو به کارگروه
  const handleAddMember = () => {
    if (selectedTaskForce && selectedMembers.length > 0) {
      const updatedTaskForces = taskForces.map(taskForce => {
        if (taskForce.id === selectedTaskForce.id) {
          return {
            ...taskForce,
            membersCount: taskForce.membersCount + selectedMembers.length,
            members: [...taskForce.members, ...selectedMembers],
          };
        }
        return taskForce;
      });
      setTaskForces(updatedTaskForces);
      setSelectedTaskForce(null);
      setSelectedMembers([]);
      setShowAddMemberPopup(false);
    }
  };

  // مشاهده اعضای کارگروه
  const handleViewMembers = (taskForce) => {
    setSelectedTaskForce(taskForce);
    setShowMemberPopup(true);
  };

  // باز کردن پنجره پاپ‌آپ افزودن عضو
  const handleOpenAddMemberPopup = (taskForce) => {
    setSelectedTaskForce(taskForce);
    setShowAddMemberPopup(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">مدیریت کارگروه‌ها</h1>
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center">
          <FaPlus className="mr-2" /> افزودن کارگروه جدید
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center mb-4">
        <input 
          type="text" 
          placeholder="جستجو بر اساس نام..." 
          className="border p-2 rounded flex-grow mb-4 md:mb-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="border p-2 rounded md:ml-4"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="فعال">فعال</option>
          <option value="غیرفعال">غیرفعال</option>
          <option value="تعلیق‌شده">تعلیق‌شده</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="w-full bg-gray-200">
              <th className="py-2 px-4 border">نام کارگروه</th>
              <th className="py-2 px-4 border">وضعیت</th>
              <th className="py-2 px-4 border">تعداد اعضا</th>
              <th className="py-2 px-4 border">تاریخ تشکیل</th>
              <th className="py-2 px-4 border">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredTaskForces.map((taskForce) => (
              <tr key={taskForce.id} className="text-center">
                <td className="py-2 px-4 border whitespace-nowrap">{taskForce.name}</td>
                <td className={`py-2 px-4 border whitespace-nowrap ${taskForce.status === 'فعال' ? 'text-green-600' : taskForce.status === 'غیرفعال' ? 'text-gray-600' : 'text-red-600'}`}>
                  {taskForce.status}
                </td>
                <td className="py-2 px-4 border whitespace-nowrap">{taskForce.membersCount}</td>
                <td className="py-2 px-4 border whitespace-nowrap">{taskForce.createdAt}</td>
                <td className="py-2 px-4 border flex justify-center space-x-2 space-x-reverse">
                  <button 
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => handleOpenAddMemberPopup(taskForce)}
                  >
                    <FaUserPlus />
                  </button>
                  <button 
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => handleViewMembers(taskForce)}
                  >
                    <FaEye />
                  </button>
                  <button className="text-yellow-500 hover:text-yellow-700">
                    <FaEdit />
                  </button>
                  <button className="text-red-500 hover:text-red-700">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddMemberPopup && selectedTaskForce && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">افزودن عضو به {selectedTaskForce.name}</h2>
            <input 
              type="text" 
              placeholder="جستجو بر اساس نام..." 
              className="border p-2 rounded mb-4 w-full"
              onChange={(e) => setAvailableMembers(fakeMembers.filter(member => member.includes(e.target.value)))}
            />
            <div className="flex flex-wrap mb-4 max-h-40 overflow-y-auto">
              {availableMembers.map((member, index) => (
                <div key={index} className="mr-2 mb-2 w-1/2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      value={member} 
                      className="mr-2"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMembers([...selectedMembers, member]);
                        } else {
                          setSelectedMembers(selectedMembers.filter(m => m !== member));
                        }
                      }}
                    />
                    {member}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button 
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={handleAddMember}
              >
                افزودن اعضا
              </button>
              <button 
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2"
                onClick={() => setShowAddMemberPopup(false)}
              >
                لغو
              </button>
            </div>
          </div>
        </div>
      )}

      {showMemberPopup && selectedTaskForce && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">اعضای {selectedTaskForce.name}</h2>
            <ul className="list-disc list-inside">
              {selectedTaskForce.members.map((member, index) => (
                <li key={index}>{member}</li>
              ))}
            </ul>
            <button 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-4"
              onClick={() => setShowMemberPopup(false)}
            >
              بستن
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-lg font-semibold">خلاصه آماری</h2>
        <div className="flex flex-wrap justify-between mt-2">
          <div className="w-full md:w-auto">تعداد کارگروه‌های فعال: {taskForces.filter(tf => tf.status === 'فعال').length}</div>
          <div className="w-full md:w-auto">تعداد کارگروه‌های غیرفعال: {taskForces.filter(tf => tf.status === 'غیرفعال').length}</div>
          <div className="w-full md:w-auto">تعداد کارگروه‌های تعلیق‌شده: {taskForces.filter(tf => tf.status === 'تعلیق‌شده').length}</div>
          <div className="w-full md:w-auto">تعداد کل اعضا: {taskForces.reduce((acc, tf) => acc + tf.membersCount, 0)}</div>
        </div>
      </div>
    </div>
  );
};

export default TaskForceDashboard;
