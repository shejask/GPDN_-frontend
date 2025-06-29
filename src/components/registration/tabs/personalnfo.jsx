"use client"
import React, { useState } from 'react'
import { ArrowRightOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import { MdOutlineEmail } from "react-icons/md";
import { Input } from "antd";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

function Personalnfo({ onContinue }) {
  const [phone, setPhone] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!phone) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onContinue({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: phone,
        password: formData.password
      });
    }
  };

  return (
    <div className=" w-full flex flex-col gap-5 justify-center items-center">
    <div className=" w-24 h-24 rounded-full flex items-center justify-center bg-gray-200">
      <UserOutlined className=" text-5xl text-[#00A99D]" />
    </div>
    <div className=" flex flex-col gap-2 items-center">
      <h1 className=" text-3xl font-semibold">Welcome to GPDN</h1>
      <h1 className=" text-gray-500">Start by entering your Personal Information</h1>
    </div>
    <div className=" flex flex-col gap-4">
      <div className=" flex flex-col gap-2 ">
        <label className=" text-sm font-semibold">Full Name</label>
        <Input
          size="large"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-96 text-sm"
          placeholder="Full Name"
          prefix={<UserOutlined className="text-lg mr-1" />}
        />
        {errors.fullName && <span className="text-red-500 text-xs">{errors.fullName}</span>}
      </div>
      <div className=" flex flex-col gap-2 ">
        <label className=" text-sm font-semibold">Email Address</label>
        <Input
          size="large"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-96 text-sm"
          placeholder="example@gmail.com"
          prefix={<MdOutlineEmail className="text-lg mr-1" />}
        />
        {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
      </div>
      <div className=" flex flex-col gap-2 ">
        <label className=" text-sm font-semibold">Phone number</label>
        <PhoneInput
        inputStyle={{width: '100%'}}
        country={'us'}
        value={phone}
        onChange={phone => setPhone(phone)}
      />
        {errors.phone && <span className="text-red-500 text-xs">{errors.phone}</span>}
      </div>
      <div className=" flex flex-col gap-2 ">
        <label className=" text-sm font-semibold">Password</label>
        <Input
          size="large"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-96 text-sm"
          placeholder="password"
          prefix={<LockOutlined  className="text-lg mr-1" />}
        />
        {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}
      </div>
      <div className=" flex flex-col gap-2 ">
        <label className=" text-sm font-semibold">Confirm Password</label>
        <Input
          size="large"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-96 text-sm"
          placeholder="password"
          prefix={<LockOutlined  className="text-lg mr-1" />}
        />
        {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword}</span>}
      </div>
      <button
        onClick={handleSubmit}
        className="w-full  h-10 rounded-lg font-semibold bg-[#00A99D] flex items-center justify-center text-white cursor-pointer hover:bg-[#008F84] transition-colors"
      >
        <h1 className="flex items-center gap-2 cursor-pointer">Continue <ArrowRightOutlined/></h1>
      </button>
    </div>
  </div>
  )
}

export default Personalnfo
