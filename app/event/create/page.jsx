'use client'
import { useState } from 'react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import 'react-multi-date-picker/styles/layouts/mobile.css'; 
import { FaTrash } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';  // برای تولید UUID

export default function CreateEvent() {
  const [dateRange, setDateRange] = useState([new DateObject({ calendar: persian, locale: persian_fa }), new DateObject({ calendar: persian, locale: persian_fa })]);
  const [title, setTitle] = useState('');
  const [manager, setManager] = useState('');
  const [details, setDetails] = useState('');
  const [programs, setPrograms] = useState([]);
  const [contacts, setContacts] = useState([
    { id: '1', name: 'سخنران ۱' },
    { id: '2', name: 'سخنران ۲' },
    { id: '3', name: 'سخنران ۳' }
  ]);

  const calculateDaysInRange = () => {
    const start = dateRange[0];
    const end = dateRange[1];
    const days = [];
    
    let current = new DateObject({ calendar: persian, locale: persian_fa, day: start.day, month: start.month.number, year: start.year });
    
    while (current.valueOf() <= end.valueOf()) {  
      days.push(new DateObject(current));  
      current = current.add(1, 'day');
    }
    
    return days;
  };

  const daysInRange = calculateDaysInRange();

  const handleAddProgram = (day) => {
    const newProgram = { 
      id: uuidv4(),  // شناسه یکتا برای هر برنامه
      day: day.format('YYYY/MM/DD'), 
      title: '', 
      speaker: '', 
      time: '' 
    };
    setPrograms([...programs, newProgram]);
  };

  const handleDeleteProgram = (id) => {
    const newPrograms = programs.filter(program => program.id !== id);
    setPrograms(newPrograms);
  };

  const handleProgramChange = (id, field, value) => {
    const newPrograms = programs.map(program => 
      program.id === id ? { ...program, [field]: value } : program
    );
    setPrograms(newPrograms);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Selected Date Range:', dateRange);
    console.log('Event Title:', title);
    console.log('Manager ID:', manager);
    console.log('Event Details:', details);
    console.log('Programs:', programs);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">ایجاد مراسم جدید</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6 mb-20"> {/* mb-20 added */}
        <div>
          <label className="block text-lg font-medium mb-2">انتخاب بازه زمانی:</label>
          <div className="relative">
            <DatePicker
              className="rmdp-mobile"
              value={dateRange}
              onChange={setDateRange}
              calendar={persian}
              locale={persian_fa}
              range
            />
          </div>
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">عنوان مراسم:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded"
            placeholder="عنوان مراسم را وارد کنید"
            required
          />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">انتخاب مدیر برنامه:</label>
          <select
            value={manager}
            onChange={(e) => setManager(e.target.value)}
            className="w-full p-3 border rounded"
            required
          >
            <option value="">مدیر برنامه را انتخاب کنید</option>
            {contacts.map(contact => (
              <option key={contact.id} value={contact.id}>{contact.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-lg font-medium mb-2">توضیحات مراسم:</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full p-3 border rounded"
            rows="4"
            placeholder="توضیحات بیشتری درباره مراسم وارد کنید"
          />
        </div>
        
        {/* Dynamic Programs Section */}
        <div>
          <label className="block text-lg font-medium mb-2">برنامه‌ها:</label>
          {daysInRange.map((day, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-xl font-semibold mb-2">برنامه برای تاریخ {day.format('YYYY/MM/DD')}</h3>
              <button
                type="button"
                onClick={() => handleAddProgram(day)}
                className="bg-green-500 text-white py-2 px-4 rounded mb-2 hover:bg-green-600 transition"
              >
                افزودن برنامه
              </button>
              {programs.filter(program => program.day === day.format('YYYY/MM/DD')).map((program) => (
                <div key={program.id} className="border p-4 rounded mb-4 relative">
                  <FaTrash
                    className="absolute top-0 left-5 mt-2 mr-2 text-red-600 cursor-pointer"
                    onClick={() => handleDeleteProgram(program.id)}
                  />
                  <label className="block text-lg font-medium mb-1">عنوان برنامه:</label>
                  <input
                    type="text"
                    value={program.title}
                    onChange={(e) => handleProgramChange(program.id, 'title', e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="عنوان برنامه را وارد کنید"
                  />
                  <label className="block text-lg font-medium mb-1 mt-2">سخنران:</label>
                  <select
                    value={program.speaker}
                    onChange={(e) => handleProgramChange(program.id, 'speaker', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">سخنران را انتخاب کنید</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>{contact.name}</option>
                    ))}
                  </select>
                  <label className="block text-lg font-medium mb-1 mt-2">زمان:</label>
                  <input
                    type="time"
                    value={program.time}
                    onChange={(e) => handleProgramChange(program.id, 'time', e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition"
        >
          ثبت مراسم
        </button>
      </form>
    </div>
  );
}















// 'use client'
// import { useState } from 'react';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// const initialData = {
//   columns: {
//     'column-1': { id: 'column-1', title: 'در حال انجام', taskIds: ['task-1', 'task-2'] },
//     'column-2': { id: 'column-2', title: 'انجام‌شده', taskIds: [] }
//   },
//   tasks: {
//     'task-1': { id: 'task-1', content: 'تکلیف 1' },
//     'task-2': { id: 'task-2', content: 'تکلیف 2' }
//   },
//   columnOrder: ['column-1', 'column-2']
// };

// export default function KanbanBoard() {
//   const [data, setData] = useState(initialData);

//   const onDragEnd = (result) => {
//     const { source, destination } = result;
//     if (!destination) return;

//     const sourceColumn = data.columns[source.droppableId];
//     const destColumn = data.columns[destination.droppableId];
//     const task = data.tasks[result.draggableId];

//     if (source.droppableId === destination.droppableId) {
//       const newTaskIds = Array.from(sourceColumn.taskIds);
//       newTaskIds.splice(source.index, 1);
//       newTaskIds.splice(destination.index, 0, task.id);

//       const newColumn = { ...sourceColumn, taskIds: newTaskIds };

//       setData({
//         ...data,
//         columns: {
//           ...data.columns,
//           [newColumn.id]: newColumn
//         }
//       });
//     } else {
//       const sourceTaskIds = Array.from(sourceColumn.taskIds);
//       sourceTaskIds.splice(source.index, 1);

//       const newSourceColumn = { ...sourceColumn, taskIds: sourceTaskIds };

//       const destTaskIds = Array.from(destColumn.taskIds);
//       destTaskIds.splice(destination.index, 0, task.id);

//       const newDestColumn = { ...destColumn, taskIds: destTaskIds };

//       setData({
//         ...data,
//         columns: {
//           ...data.columns,
//           [newSourceColumn.id]: newSourceColumn,
//           [newDestColumn.id]: newDestColumn
//         }
//       });
//     }
//   };

//   return (
//     <DragDropContext onDragEnd={onDragEnd}>
//       {data.columnOrder.map(columnId => {
//         const column = data.columns[columnId];
//         const tasks = column.taskIds.map(taskId => data.tasks[taskId]);

//         return (
//           <Droppable key={column.id} droppableId={column.id}>
//             {(provided) => (
//               <div
//                 ref={provided.innerRef}
//                 {...provided.droppableProps}
//                 className="p-4 bg-gray-200 rounded-lg shadow"
//               >
//                 <h2 className="text-lg font-bold">{column.title}</h2>
//                 {tasks.map((task, index) => (
//                   <Draggable key={task.id} draggableId={task.id} index={index}>
//                     {(provided) => (
//                       <div
//                         ref={provided.innerRef}
//                         {...provided.draggableProps}
//                         {...provided.dragHandleProps}
//                         className="p-2 mb-2 bg-white border rounded shadow"
//                       >
//                         {task.content}
//                       </div>
//                     )}
//                   </Draggable>
//                 ))}
//                 {provided.placeholder}
//               </div>
//             )}
//           </Droppable>
//         );
//       })}
//     </DragDropContext>
//   );
// }
