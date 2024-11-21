'use client'
import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const MemberSchema = Yup.object().shape({
  name: Yup.string().required('نام الزامی است'),
  nationalId: Yup.string().required('کد ملی الزامی است'),
  birthDate: Yup.date().required('تاریخ تولد الزامی است'),
  phone: Yup.string().required('شماره تماس الزامی است'),
  email: Yup.string().email('ایمیل نامعتبر است').required('ایمیل الزامی است'),
  address: Yup.string().required('آدرس الزامی است'),
  role: Yup.string().required('نقش الزامی است'),
  group: Yup.string().required('کارگروه الزامی است'),
  joinDate: Yup.date().required('تاریخ عضویت الزامی است'),
  status: Yup.string().required('وضعیت عضویت الزامی است'),
  skills: Yup.string(),
  gender: Yup.string().required('جنسیت الزامی است'),
  city: Yup.string().required('شهر الزامی است'),
  province: Yup.string().required('استان الزامی است'),
  accessLevel: Yup.string().required('سطح دسترسی الزامی است'),
});

const AddEditMember = ({ onSubmit, initialValues }) => {
  return (
    <div className="container mx-auto px-4 py-8 mb-20">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Add / Edit Member</h1>
      <div className="max-w-4xl mx-auto shadow-lg rounded-lg overflow-hidden p-6 bg-white">
        <Formik
          initialValues={initialValues}
          validationSchema={MemberSchema}
          onSubmit={onSubmit}
        >
          {({ errors, touched }) => (
            <Form className="space-y-4">
              {/* Identification Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <Field name="name" type="text" placeholder="Full Name" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                  {errors.name && touched.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700">National ID</label>
                  <Field name="nationalId" type="text" placeholder="National ID" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                  {errors.nationalId && touched.nationalId && <p className="text-red-500 text-xs">{errors.nationalId}</p>}
                </div>
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Birth Date</label>
                  <Field name="birthDate" type="date" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                  {errors.birthDate && touched.birthDate && <p className="text-red-500 text-xs">{errors.birthDate}</p>}
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                  <Field as="select" name="gender" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </Field>
                  {errors.gender && touched.gender && <p className="text-red-500 text-xs">{errors.gender}</p>}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <Field name="phone" type="text" placeholder="Phone Number" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                  {errors.phone && touched.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <Field name="email" type="email" placeholder="Email Address" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                  {errors.email && touched.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                  <Field name="address" type="text" placeholder="Address" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                  {errors.address && touched.address && <p className="text-red-500 text-xs">{errors.address}</p>}
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                  <Field as="select" name="city" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <option value="">Select City</option>
                    <option value="tehran">Tehran</option>
                    <option value="mashhad">Mashhad</option>
                  </Field>
                  {errors.city && touched.city && <p className="text-red-500 text-xs">{errors.city}</p>}
                </div>
                <div>
                  <label htmlFor="province" className="block text-sm font-medium text-gray-700">Province</label>
                  <Field as="select" name="province" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <option value="">Select Province</option>
                    <option value="tehran">Tehran</option>
                    <option value="khorasan">Khorasan</option>
                  </Field>
                  {errors.province && touched.province && <p className="text-red-500 text-xs">{errors.province}</p>}
                </div>
              </div>

              {/* Organizational Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                  <Field as="select" name="role" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <option value="">Select Role</option>
                    <option value="manager">Manager</option>
                    <option value="member">Member</option>
                  </Field>
                  {errors.role && touched.role && <p className="text-red-500 text-xs">{errors.role}</p>}
                </div>
                <div>
                  <label htmlFor="group" className="block text-sm font-medium text-gray-700">Group</label>
                  <Field as="select" name="group" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <option value="">Select Group</option>
                    <option value="A">Group A</option>
                    <option value="B">Group B</option>
                  </Field>
                  {errors.group && touched.group && <p className="text-red-500 text-xs">{errors.group}</p>}
                </div>
                <div>
                  <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700">Join Date</label>
                  <Field name="joinDate" type="date" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                  {errors.joinDate && touched.joinDate && <p className="text-red-500 text-xs">{errors.joinDate}</p>}
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                  <Field as="select" name="status" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </Field>
                  {errors.status && touched.status && <p className="text-red-500 text-xs">{errors.status}</p>}
                </div>
              </div>

              {/* Skills and Expertise */}
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills and Expertise</label>
                <Field name="skills" type="text" placeholder="Skills and Expertise" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                {errors.skills && <p className="text-red-500 text-xs">{errors.skills}</p>}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between mt-6">
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-secondary">Cancel</button>
                <button type="button" className="btn btn-danger">Delete</button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddEditMember;
