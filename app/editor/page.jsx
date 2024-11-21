"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import templates from "../../templates.json";

const categories = ["All", "فاطمیه", "Category 2", "Category 3"];

export default function TemplateSelection() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const handleTemplateSelect = (template) => {
    if (template.requirePreFill) {
      router.push(`/prefill/${template.id}`);
    } else {
      router.push(`/editor/${template.id}`);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedCategory === "All" || template.categories.includes(selectedCategory);
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
        Select Your Favorite Template
      </h1>

      {/* فیلتر و جستجو */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* دسته‌بندی‌ها */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* جستجو */}
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        />
      </div>

      {/* لیست تمپلت‌ها */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className="group border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer bg-white"
          >
            <div className="relative w-full h-40 overflow-hidden">
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4">
              <h2 className="text-center text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {template.name}
              </h2>
              <p className="text-center text-sm text-gray-500 mt-1">
                {template.categories.join(", ")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* پیام در صورت نبودن تمپلت */}
      {filteredTemplates.length === 0 && (
        <p className="text-center text-gray-500 mt-10 text-lg">
          No templates found for your search or category.
        </p>
      )}
    </div>
  );
}
