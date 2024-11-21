'use client'
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaBirthdayCake,
  FaTag,
  FaStar,
  FaPaperclip,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaTimes
} from 'react-icons/fa';
import { useTable, useSortBy, useFilters } from 'react-table';

const fakeMember = {
  id: 1,
  name: 'محمد رضایی',
  nationalId: '0012345678',
  profileImage: '/default-profile.jpg',
  birthDate: '1365/05/01',
  phone: '09123456789',
  email: 'example@example.com',
  address: 'تهران، خیابان شهید بهشتی',
  currentRoles: ['مدیر', 'سخنران'],
  currentTaskForces: ['کارگروه A', 'کارگروه B'],
  previousRoles: ['مداح'],
  previousTaskForces: ['کارگروه C'],
  participationHistory: [
    {
      eventName: 'مراسم سخنرانی محرم',
      role: 'سخنران',
      date: '1401/06/01',
      status: 'نقش فعال داشت',
      rating: 4,
    },
    {
      eventName: 'پروژه کمک‌های مردمی',
      role: 'مدیر پروژه',
      date: '1401/03/15',
      status: 'مدیریت کرد',
      rating: 5,
    },
  ],
  financialReports: [
    {
      type: 'کمک مالی',
      amount: 500000,
      date: '1401/01/15',
      status: 'تسویه‌شده',
    },
    {
      type: 'هزینه عضویت',
      amount: 200000,
      date: '1401/04/10',
      status: 'تسویه‌شده',
    },
  ],
  messages: [
    {
      id: 1,
      sender: 'مدیر',
      content: 'سلام، لطفاً گزارش پروژه را ارسال کنید.',
      timestamp: '1402/02/15 10:30',
      status: 'خوانده‌شده',
    },
    {
      id: 2,
      sender: 'عضو',
      content: 'سلام، گزارش را تا فردا ارسال می‌کنم.',
      timestamp: '1402/02/15 11:00',
      status: 'ارسال‌شده',
    },
  ],
};

const MemberProfile = () => {
  const member = fakeMember;

  const data = React.useMemo(() => member.participationHistory, [member.participationHistory]);
  const columns = React.useMemo(
    () => [
      {
        Header: 'نام مراسم/پروژه',
        accessor: 'eventName',
      },
      {
        Header: 'نقش',
        accessor: 'role',
      },
      {
        Header: 'تاریخ',
        accessor: 'date',
      },
      {
        Header: 'وضعیت مشارکت',
        accessor: 'status',
      },
      {
        Header: 'رتبه‌بندی',
        accessor: 'rating',
        Cell: ({ value }) => (
          <div>
            {[...Array(value)].map((_, i) => (
              <FaStar key={i} className="text-yellow-500 inline" />
            ))}
          </div>
        ),
      },
    ],
    []
  );

  const financialColumns = React.useMemo(
    () => [
      {
        Header: 'نوع',
        accessor: 'type',
      },
      {
        Header: 'مبلغ (ریال)',
        accessor: 'amount',
        Cell: ({ value }) => value.toLocaleString('fa-IR'),
      },
      {
        Header: 'تاریخ',
        accessor: 'date',
      },
      {
        Header: 'وضعیت',
        accessor: 'status',
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data }, useFilters, useSortBy);

  const {
    getTableProps: getFinancialTableProps,
    getTableBodyProps: getFinancialTableBodyProps,
    headerGroups: financialHeaderGroups,
    rows: financialRows,
    prepareRow: prepareFinancialRow,
  } = useTable({ columns: financialColumns, data: member.financialReports }, useFilters, useSortBy);

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(member.messages);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const messagesEndRef = useRef(null);

  const handleSendMessage = () => {
    const newMsg = {
      id: messages.length + 1,
      sender: 'مدیر',
      content: newMessage,
      timestamp: new Date().toLocaleString('fa-IR'),
      status: 'در حال ارسال',
      attachments: attachedFiles,
    };
    setMessages([...messages, newMsg]);
    setNewMessage('');
    setAttachedFiles([]);

    setTimeout(() => {
      setMessages((msgs) =>
        msgs.map((msg) =>
          msg.id === newMsg.id ? { ...msg, status: 'ارسال‌شده' } : msg
        )
      );
      scrollToBottom();
    }, 1000);
  };

  const handleFileAttach = (e) => {
    const files = Array.from(e.target.files);
    setAttachedFiles([...attachedFiles, ...files]);
  };

  const handleFileRemove = (index) => {
    const newFiles = attachedFiles.filter((_, i) => i !== index);
    setAttachedFiles(newFiles);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 mb-4">
            <Image
              src={member.profileImage}
              alt="Profile Image"
              width={128}
              height={128}
              className="rounded-full"
            />
          </div>
          <h1 className="text-2xl font-bold mb-4">{member.name}</h1>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">اطلاعات شخصی</h2>
          <ul className="space-y-2 text-right">
            <li className="flex items-center">
              <FaBirthdayCake className="ml-2 text-gray-500" />
              <span>تاریخ تولد: {member.birthDate}</span>
            </li>
            <li className="flex items-center">
              <FaIdCard className="ml-2 text-gray-500" />
              <span>کد ملی: {member.nationalId}</span>
            </li>
            <li className="flex items-center">
              <FaPhone className="ml-2 text-gray-500" />
              <span>شماره تماس: {member.phone}</span>
            </li>
            <li className="flex items-center">
              <FaEnvelope className="ml-2 text-gray-500" />
              <span>ایمیل: {member.email}</span>
            </li>
            <li className="flex items-center">
              <FaMapMarkerAlt className="ml-2 text-gray-500" />
              <span>آدرس سکونت: {member.address}</span>
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">نقش‌ها و کارگروه‌ها</h2>
          <div className="mb-4">
            <h3 className="font-bold">نقش‌های فعلی:</h3>
            <div className="flex flex-wrap space-x-2 space-y-2">
              {member.currentRoles.map((role, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  <FaTag className="ml-1 text-blue-500" />
                  {role}
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <h3 className="font-bold">کارگروه‌های فعلی:</h3>
            <div className="flex flex-wrap space-x-2 space-y-2">
              {member.currentTaskForces.map((taskForce, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800"
                >
                  <FaTag className="ml-1 text-green-500" />
                  {taskForce}
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <h3 className="font-bold">نقش‌های سابق:</h3>
            <div className="flex flex-wrap space-x-2 space-y-2">
              {member.previousRoles.map((role, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-200 text-gray-800"
                >
                  <FaTag className="ml-1 text-gray-500" />
                  {role}
                </span>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <h3 className="font-bold">کارگروه‌های سابق:</h3>
            <div className="flex flex-wrap space-x-2 space-y-2">
              {member.previousTaskForces.map((taskForce, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"
                >
                  <FaTag className="ml-1 text-yellow-500" />
                  {taskForce}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">تاریخچه مشارکت</h2>
          <div className="overflow-x-auto">
            <table {...getTableProps()} className="min-w-full bg-white border border-gray-200">
              <thead>
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                      <th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                        className="py-2 px-4 border-b"
                      >
                        {column.render('Header')}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? ' 🔽'
                              : ' 🔼'
                            : ''}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map(row => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map(cell => (
                        <td {...cell.getCellProps()} className="py-2 px-4 border-b whitespace-nowrap">
                          {cell.render('Cell')}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">گزارش‌های مالی</h2>
          <div className="overflow-x-auto">
            <table {...getFinancialTableProps()} className="min-w-full bg-white border border-gray-200">
              <thead>
                {financialHeaderGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                      <th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                        className="py-2 px-4 border-b"
                      >
                        {column.render('Header')}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? ' 🔽'
                              : ' 🔼'
                            : ''}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getFinancialTableBodyProps()}>
                {financialRows.map(row => {
                  prepareFinancialRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map(cell => (
                        <td {...cell.getCellProps()} className="py-2 px-4 border-b whitespace-nowrap">
                          {cell.render('Cell')}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 mb-28">
          <h2 className="text-xl font-semibold mb-4">ارتباطات داخلی</h2>
          <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
            <div className="overflow-y-auto h-64 mb-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`mb-2 flex ${msg.sender === 'مدیر' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-2 rounded-lg shadow ${msg.sender === 'مدیر' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>
                    <p className="mb-1">{msg.content}</p>
                    {msg.attachments && (
                      <div className="mt-2">
                        {msg.attachments.map((file, index) => (
                          <div key={index} className="flex items-center text-sm text-white">
                            <FaPaperclip className="mr-2" />
                            {file.name}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <small className="text-xs">{msg.timestamp}</small>
                      {msg.status === 'در حال ارسال' && <FaClock className="text-xs ml-1 text-yellow-300" />}
                      {msg.status === 'ارسال‌شده' && <FaCheckCircle className="text-xs ml-1 text-green-300" />}
                      {msg.status === 'خوانده‌شده' && <FaCheckCircle className="text-xs ml-1 text-blue-300" />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex items-center">
              <label className="mr-2 bg-gray-200 p-2 rounded-lg hover:bg-gray-300 cursor-pointer">
                <FaPaperclip />
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileAttach}
                />
              </label>
              <div className="flex flex-wrap">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-700 mr-2 mb-2">
                    <FaPaperclip className="mr-1" />
                    <span>{file.name}</span>
                    <FaTimes className="ml-1 cursor-pointer" onClick={() => handleFileRemove(index)} />
                  </div>
                ))}
              </div>
              <textarea
                placeholder="پیام خود را بنویسید..."
                className="flex-grow p-2 rounded-lg border border-gray-300"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows="1"
              />
              <button className="ml-2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600" onClick={handleSendMessage}>
                <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
