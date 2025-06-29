"use client";
import React, { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { userContactDetails } from "@/api/user";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const contact = await userContactDetails(formData);
      if (contact.data.data) {
        console.log(contact.data.data);
        setBlogs(Array.isArray(contact.data.data) ? contact.data.data : []);
      }
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  return (
    <section className="w-full h-full flex justify-center items-center">
      <div className="h-full w-full">
        <div className="h-full w-full flex flex-col items-start justify-between">
          <div className="w-full h-auto lg:h-[45vh] flex justify-start items-center py-5 lg:py-0">
            <h1 className="font-semibold text-[1.9rem] md:text-[3rem] xl:text-[4rem] leading-tight text-secondary">
              Get in touch with us.
              <br />
              We're here to assist you.
            </h1>
          </div>
          <div className="h-auto lg:h-full w-full flex justify-center items-center">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col justify-around gap-10 py-10 w-full h-[50vh] lg:h-full"
            >
              <div className="w-full h-auto flex flex-col lg:flex-row justify-between items-center gap-7">
                <div className="w-full h-auto flex justify-between items-center gap-7">
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="w-full text-black text-base md:text-xl outline-none border-b border-tertiary pb-3 lg:pb-5"
                  />
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email Address"
                    className="w-full text-black text-base md:text-xl outline-none border-b border-tertiary pb-3 lg:pb-5"
                  />
                  <input
                    type="number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number (optional)"
                    className="hidden lg:block w-full text-black text-base md:text-xl outline-none border-b border-tertiary pb-3 lg:pb-5"
                  />
                </div>
                <input
                  type="number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number (optional)"
                  className="lg:hidden w-full text-black text-base md:text-xl outline-none border-b border-tertiary pb-3 lg:pb-5"
                />
              </div>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full text-black text-base md:text-xl outline-none border-b border-tertiary pb-4 lg:pb-8"
                placeholder="Message"
              ></textarea>

              <div className="w-full flex justify-start">
                <button
                  type="submit"
                  className="bg-primary rounded-xl px-6 py-4 flex gap-2 items-center text-white"
                >
                  <p>Leave us a Message</p>
                  <FiArrowRight />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;
