import React, { useState } from 'react';

const membersData = [
  {
    name: 'Ali Rezaei',
    role: 'Manager',
    workgroup: 'Workgroup 1',
    status: 'active',
    joinDate: '2022-05-15',
    phone: '09123456789',
    email: 'ali.rezaei@example.com',
  },
  {
    name: 'Sara Mohammadi',
    role: 'Member',
    workgroup: 'Workgroup 2',
    status: 'inactive',
    joinDate: '2021-11-30',
    phone: '09223344556',
    email: 'sara.mohammadi@example.com',
  },
  // Add more members as needed
];

export default function MemberList({ filters }) {
  const [members] = useState(membersData);

  const filteredMembers = members.filter((member) => {
    const matchRole = filters.role ? member.role.toLowerCase() === filters.role.toLowerCase() : true;
    const matchWorkgroup = filters.workgroup ? member.workgroup.toLowerCase() === filters.workgroup.toLowerCase() : true;
    const matchStatus = filters.status ? member.status.toLowerCase() === filters.status.toLowerCase() : true;
    const matchSearch = filters.search
      ? member.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        member.phone.includes(filters.search) ||
        member.email.toLowerCase().includes(filters.search.toLowerCase())
      : true;

    return matchRole && matchWorkgroup && matchStatus && matchSearch;
  });

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="w-1/4 p-4 text-left font-semibold">Member Name</th>
            <th className="w-1/6 p-4 text-left font-semibold">Role</th>
            <th className="w-1/6 p-4 text-left font-semibold">Workgroup</th>
            <th className="w-1/6 p-4 text-left font-semibold">Status</th>
            <th className="w-1/6 p-4 text-left font-semibold">Join Date</th>
            <th className="w-1/6 p-4 text-left font-semibold">Phone</th>
            <th className="w-1/6 p-4 text-left font-semibold">Email</th>
            <th className="w-1/6 p-4 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member, index) => (
              <tr key={index} className="border-t">
                <td className="p-4">{member.name}</td>
                <td className="p-4">{member.role}</td>
                <td className="p-4">{member.workgroup}</td>
                <td className={`p-4 ${member.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                  {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                </td>
                <td className="p-4">{member.joinDate}</td>
                <td className="p-4">{member.phone}</td>
                <td className="p-4">{member.email}</td>
                <td className="p-4 flex space-x-2">
                  <button className="text-blue-500 hover:underline">View</button>
                  <button className="text-yellow-500 hover:underline">Edit</button>
                  <button className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="p-4 text-center text-gray-500">
                No members found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
