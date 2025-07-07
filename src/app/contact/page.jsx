import Navbar from '@/components/Navbar'
import ContactForm from '@/pages/Contact/ContactForm'
import ContactInfo from '@/pages/Contact/ContactInfo'
import Footer from '@/pages/Home/Footer'
import React from 'react'

const page = () => {
  return (
    <main className="flex  flex-col items-center overflow-hidden">
    <div className="flex w-full  flex-col items-center justify-between gap-10 lg:gap-0 px-7 md:px-16 lg:px-20 2xl:px-40">
    <div className="h-auto lg:min-h-screen  w-full flex flex-col justify-between pt-8 ">
    <Navbar/>
    <ContactForm/>
    </div>
    </div>
    <ContactInfo/>
    <Footer/>
  </main>
  )
}

export default page