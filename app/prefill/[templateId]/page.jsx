"use client";

import templates from "../../../templates.json";
import { useRouter } from "next/navigation";
import { useForm } from "../../context/FormContext";
import React from "react";

export default function PreFillPage({ params }) {
  const router = useRouter();
  const { templateId } = params;
  const template = templates.find((t) => t.id === templateId);
  const { formData, setFormData } = useForm();

  if (!template) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-800 text-white">
        <p className="text-lg font-semibold">قالب پیدا نشد!</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    router.push(`/editor/${template.id}`);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          تکمیل اطلاعات برای <span className="text-blue-400">{template.name}</span>
        </h1>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {template.preFillFields.map((field) => (
            <div key={field.field}>
              <label className="block font-medium mb-2 text-sm">{field.label}</label>
              <input
                type="text"
                name={field.field}
                value={formData[field.field] || ""}
                onChange={handleChange}
                className="w-full p-3 border border-gray-700 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder={`وارد کردن ${field.label}`}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all"
          >
            ادامه به ویرایشگر
          </button>
        </form>
      </div>
    </div>
  );
}
