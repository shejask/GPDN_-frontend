import Navbar from '@/components/Navbar'
import SectionOne from '@/pages/About/SectionOne'
import SectionTwo from '@/pages/About/SectionTwo'
import TeamMembers from '@/pages/About/TeamMembers'
import Footer from '@/pages/Home/Footer'
import React from 'react'

const page = () => {
  return (
    <main className="flex  flex-col gap-16 items-center overflow-hidden">
      <div className="flex w-full  flex-col items-center justify-between gap-10 lg:gap-0 px-7 md:px-16 lg:px-20 2xl:px-40">
      <div className="h-auto lg:min-h-screen w-full flex flex-col justify-between pt-8 ">
      <Navbar/>
      <SectionOne/>
      </div>
      <SectionTwo/>
      <TeamMembers/>
      </div>
      <Footer/>
    </main>
  )
}

export default page