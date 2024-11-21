'use client'
import React, { useState, useMemo } from 'react';
import { useTable, usePagination, useSortBy } from 'react-table';
import ReactPaginate from 'react-paginate';
import SearchFilterBar from '../components/Member/SearchFilterBar';
import { FaPlus, FaFileExport, FaEnvelope, FaChartBar, FaEdit, FaEye, FaTrash } from 'react-icons/fa';

const Dashboard = () => {
    const membersData = [
        {
            id: 1,
            name: 'محمد رضایی',
            role: 'مدیر',
            group: 'کارگروه A',
            status: 'فعال',
            joinDate: '2023-01-01',
            phone: '09123456789',
            email: 'example1@example.com',
            profileImage: 'https://via.placeholder.com/150',
        },
        {
            id: 2,
            name: 'علی احمدی',
            role: 'عضو عادی',
            group: 'کارگروه B',
            status: 'غیرفعال',
            joinDate: '2022-06-15',
            phone: '09123456788',
            email: 'example2@example.com',
            profileImage: 'https://via.placeholder.com/150',
        },
        // داده‌های بیشتر
    ];

    const [filteredMembers, setFilteredMembers] = useState(membersData);
    const [selectedMember, setSelectedMember] = useState(null);

    const handleFilter = (filters) => {
        let filtered = membersData;

        if (filters.searchTerm) {
            filtered = filtered.filter((member) =>
                member.name.includes(filters.searchTerm) ||
                member.email.includes(filters.searchTerm) ||
                member.phone.includes(filters.searchTerm)
            );
        }

        if (filters.roleFilter) {
            filtered = filtered.filter((member) => member.role === filters.roleFilter);
        }

        if (filters.groupFilter) {
            filtered = filtered.filter((member) => member.group === filters.groupFilter);
        }

        if (filters.statusFilter) {
            filtered = filtered.filter((member) => member.status === filters.statusFilter);
        }

        if (filters.dateFilter) {
            filtered = filtered.filter(
                (member) => new Date(member.joinDate) >= new Date(filters.dateFilter)
            );
        }

        setFilteredMembers(filtered);
    };

    const handleViewProfile = (member) => {
        setSelectedMember(member);
    };

    const handleCloseSidebar = () => {
        setSelectedMember(null);
    };

    // Columns definition for the table
    const columns = useMemo(
        () => [
            {
                Header: 'نام',
                accessor: 'name',
            },
            {
                Header: 'نقش',
                accessor: 'role',
            },
            {
                Header: 'کارگروه',
                accessor: 'group',
            },
            {
                Header: 'وضعیت عضویت',
                accessor: 'status',
                Cell: ({ value }) => (
                    <span className={value === 'فعال' ? 'text-green-500' : 'text-red-500'}>
                        {value}
                    </span>
                ),
            },
            {
                Header: 'تاریخ عضویت',
                accessor: 'joinDate',
            },
            {
                Header: 'شماره تماس',
                accessor: 'phone',
            },
            {
                Header: 'ایمیل',
                accessor: 'email',
            },
            {
                Header: 'عملیات',
                Cell: ({ row }) => (
                    <div className="flex space-x-2">
                        <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center">
                            <FaEdit className="ml-2" /> ویرایش
                        </button>
                        <button
                            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 flex items-center"
                            onClick={() => handleViewProfile(row.original)}
                        >
                            <FaEye className="ml-2" /> مشاهده
                        </button>
                        <button className="bg-red-500 text-white p-2 rounded hover:bg-red-600 flex items-center">
                            <FaTrash className="ml-2" /> حذف
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    const data = useMemo(() => filteredMembers, [filteredMembers]);

    // Use the useTable hook with pagination and sorting
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        page,
        prepareRow,
        canPreviousPage,
        canNextPage,
        pageOptions,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = useTable(
        {
            columns,
            data,
            initialState: { pageIndex: 0 }, // Start on the first page
        },
        useSortBy,
        usePagination
    );

    return (
        <div className="flex flex-col min-h-screen">
            <div className="container mx-auto p-4 flex-grow">
                {/* دکمه‌های عملیات */}
                <div className="flex justify-between mb-4">
                    <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center justify-center w-full md:w-auto mb-2 md:mb-0">
                        <FaPlus className="ml-2" /> افزودن عضو جدید
                    </button>
                </div>

                <SearchFilterBar onFilter={handleFilter} />



                <div className="bg-white p-4 rounded shadow-md mb-4 flex-grow overflow-auto">
                    <div className="flex flex-wrap justify-between mb-4">
                        {/* دکمه‌های عملیات جدول */}
                        <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center justify-center w-full md:w-auto">
                                <FaChartBar className="ml-2" /> گزارش‌گیری
                            </button>
                            <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 flex items-center justify-center w-full md:w-auto">
                                <FaFileExport className="ml-2" /> خروجی گرفتن
                            </button>
                            <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center justify-center w-full md:w-auto">
                                <FaEnvelope className="ml-2" /> ارسال پیام گروهی
                            </button>
                        </div>
                    </div>

                    <h2 className="text-lg font-bold mb-4">لیست اعضا</h2>
                    <table {...getTableProps()} className="w-full table-auto">
                        <thead>
                            {headerGroups.map(headerGroup => (
                                <tr {...headerGroup.getHeaderGroupProps()} className="bg-gray-100">
                                    {headerGroup.headers.map(column => (
                                        <th
                                            {...column.getHeaderProps(column.getSortByToggleProps())}
                                            className="p-2 cursor-pointer"
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
                            {page.map(row => {
                                prepareRow(row);
                                return (
                                    <tr {...row.getRowProps()} className="hover:bg-gray-50">
                                        {row.cells.map(cell => (
                                            <td {...cell.getCellProps()} className="p-2 border-b">
                                                {cell.render('Cell')}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Pagination controls */}
                    <div className="pagination mt-4">
                        <ReactPaginate
                            previousLabel={'← قبلی'}
                            nextLabel={'بعدی →'}
                            breakLabel={'...'}
                            pageCount={pageOptions.length}
                            onPageChange={({ selected }) => gotoPage(selected)}
                            containerClassName={'pagination flex justify-center'}
                            previousLinkClassName={'bg-blue-500 text-white px-3 py-1 rounded-l'}
                            nextLinkClassName={'bg-blue-500 text-white px-3 py-1 rounded-r'}
                            disabledClassName={'opacity-50 cursor-not-allowed'}
                            activeClassName={'bg-blue-700 text-white'}
                            pageLinkClassName={'px-3 py-1'}
                        />
                    </div>
                </div>

                <div className="bg-white p-4 rounded shadow-md mb-28">
                    <h2 className="text-lg font-bold mb-4">خلاصه آماری</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-100 rounded text-center">
                            <h3 className="text-lg font-bold">اعضای فعال</h3>
                            <p className="text-xl">{filteredMembers.filter(m => m.status === 'فعال').length}</p>
                        </div>
                        <div className="p-4 bg-red-100 rounded text-center">
                            <h3 className="text-lg font-bold">اعضای غیرفعال</h3>
                            <p className="text-xl">{filteredMembers.filter(m => m.status === 'غیرفعال').length}</p>
                        </div>
                        <div className="p-4 bg-green-100 rounded text-center">
                            <h3 className="text-lg font-bold">اعضای هر کارگروه</h3>
                            <p className="text-xl">{filteredMembers.filter(m => m.group === 'کارگروه A').length}</p>
                        </div>
                        <div className="p-4 bg-yellow-100 rounded text-center">
                            <h3 className="text-lg font-bold">اعضای جدید</h3>
                            <p className="text-xl">{filteredMembers.filter(m => new Date(m.joinDate) >= new Date('2023-01-01')).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* سایدبار پیش‌نمایش پروفایل */}
            {selectedMember && (
                <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg z-50 p-4 overflow-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">پروفایل عضو</h2>
                        <button onClick={handleCloseSidebar} className="text-gray-500 hover:text-gray-700">&times;</button>
                    </div>
                    <div className="text-center mb-4">
                        <img
                            src={selectedMember.profileImage}
                            alt={selectedMember.name}
                            className="w-24 h-24 rounded-full mx-auto mb-4"
                        />
                        <h3 className="text-lg font-bold">{selectedMember.name}</h3>
                        <p className="text-sm text-gray-600">{selectedMember.role}</p>
                    </div>
                    <div className="mb-4">
                        <h4 className="text-md font-bold">اطلاعات تماس</h4>
                        <p className="text-sm">شماره تماس: {selectedMember.phone}</p>
                        <p className="text-sm">ایمیل: {selectedMember.email}</p>
                    </div>
                    <div className="mb-4">
                        <h4 className="text-md font-bold">تاریخچه عضویت</h4>
                        <p className="text-sm">تاریخ عضویت: {selectedMember.joinDate}</p>
                        <p className="text-sm">وضعیت عضویت: {selectedMember.status}</p>
                    </div>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full">
                        مشاهده کامل پروفایل
                    </button>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
