'use client';

import { useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import "react-multi-date-picker/styles/layouts/mobile.css";
import TimePicker from "react-multi-date-picker/plugins/time_picker";


function Modal({ card, columns, updateCardDetails, closeModal }) {
  const [dueDate, setDueDate] = useState(new DateObject({ date: card.dueDate, calendar: persian, locale: persian_fa }));

  const handleSave = () => {
    updateCardDetails('dueDate', dueDate.format('YYYY/MM/DD'));
    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-lg overflow-y-auto max-h-[80vh]">
        <h2 className="text-2xl font-bold mb-4">Edit Card</h2>
        <div className="mb-4">
          <label className="block text-lg mb-2">Title</label>
          <input 
            type="text" 
            value={card.title} 
            onChange={(e) => updateCardDetails('title', e.target.value)} 
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-lg mb-2">Description</label>
          <textarea 
            value={card.description} 
            onChange={(e) => updateCardDetails('description', e.target.value)} 
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-lg mb-2">Due Date</label>
          <DatePicker
            format="YYYY/DD/MM HH:mm:ss"
            value={dueDate}
            onChange={setDueDate}
            calendar={persian}
            locale={persian_fa}
            className="rmdp-mobile"
            plugins={[
                <TimePicker position="bottom" />
              ]} 
          />
        </div>
        <div className="mb-4">
          <label className="block text-lg mb-2">Status</label>
          <select
            value={card.status}
            onChange={(e) => updateCardDetails('status', e.target.value)}
            className="w-full p-2 border rounded"
          >
            {columns.map(column => (
              <option key={column.id} value={column.title}>
                {column.title}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-lg mb-2">Assigned Members</label>
          <input 
            type="text" 
            value={card.assignedMembers.join(', ')} 
            onChange={(e) => updateCardDetails('assignedMembers', e.target.value.split(', '))} 
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button 
            onClick={closeModal} 
            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
