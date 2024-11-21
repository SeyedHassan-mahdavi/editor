import { FaRegNewspaper, FaWpforms, FaFileAlt, FaFolder } from 'react-icons/fa';

export default function IconsSection() {
  const items = [
    { id: 1, label: 'خبرخوان', icon: <FaRegNewspaper /> },
    { id: 2, label: 'فرم ساز', icon: <FaWpforms /> },
    { id: 3, label: 'گزارش', icon: <FaFileAlt /> },
    { id: 4, label: 'درایو', icon: <FaFolder /> },
  ];

  return (
    <div className='px-4 sm:px-6 lg:px-8'>
      <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center ">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col items-center text-center">
            <div className="bg-blue-500 text-white p-3 rounded-full text-3xl">
              {item.icon}
            </div>
            <span className="mt-2 text-gray-700 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>

  );
}
