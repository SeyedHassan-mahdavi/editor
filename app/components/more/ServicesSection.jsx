import { FaUsers, FaStoreAlt, FaHandshake, FaWallet, FaFileAlt, FaThLarge, FaBuilding, FaCloud } from 'react-icons/fa';

export default function ServicesSection() {
  const items = [
    { id: 1, label: 'ام بیمه', icon: <FaUsers />, bgColor: 'bg-gray-100' },
    { id: 2, label: 'ام حسام', icon: <FaStoreAlt />, bgColor: 'bg-gray-100' },
    { id: 3, label: 'ام بازار', icon: <FaBuilding />, bgColor: 'bg-gray-100' },
    { id: 4, label: 'وام قرض الحسنه', icon: <FaHandshake />, bgColor: 'bg-gray-100', tag: 'جدید', tagColor: 'bg-yellow-300 text-white' },
    { id: 5, label: 'همه خدمات', icon: <FaThLarge />, bgColor: 'bg-gray-100' },
    { id: 6, label: 'خدمات عمومی', icon: <FaFileAlt />, bgColor: 'bg-gray-100' },
    { id: 7, label: 'همراه بانک', icon: <FaWallet />, bgColor: 'bg-gray-100' },
    { id: 8, label: 'رسالت آسمانی', icon: <FaCloud />, bgColor: 'bg-gray-100' },
  ];

  return (
    <div className="p-4 bg-white mt-5 shadow-md">
      <h2 className="text-xl font-semibold mb-4 border-b-2 ">خدمات</h2>
      <div className="grid grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="relative flex flex-col items-center text-center">
            <div className={`${item.bgColor} p-4 rounded-full text-3xl text-blue-600`}>
              {item.icon}
            </div>
            {item.tag && (
              <span className={`absolute top-0 right-6 text-xs px-2 py-1 rounded ${item.tagColor}`}>
                {item.tag}
              </span>
            )}
            <span className="mt-2 text-gray-700 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
