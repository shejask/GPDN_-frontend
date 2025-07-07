import React from 'react'
import azeem from '../../assets/registation/Frame.png'
import logo from '../../assets/registation/logo.png'
import Image from 'next/image'
import { FaAngleLeft } from "react-icons/fa6";
import Link from 'next/link';
function page() {
  return (
    <div className=' w-full h-screen flex items-center justify-center'>
        <div className=' w-5/6 md:w-3/4 md:h-[600px] flex justify-between border border-gray-300 shadow-xl rounded-2xl'>
            <div className=' md:w-1/2 h-full px-5  md:px-10 py-20 flex flex-col gap-10'>
                <Image alt='' src={logo} width={100}/>
                <h1 className=' text-2xl md:text-4xl font-bold text-[#00A99D]'>Registration Request Submitted</h1>
                <h1>Thank you for submitting your registration request. Our team will review your details shortly.You’ll receive an email once your account is verified and activated.</h1>
                <Link href={'/signin'} >
                <div className=' border border-gray-300 md:w-60 rounded-lg flex items-center justify-center hover:bg-black hover:text-white duration-300 px-5 py-2'  >
                    <h1 className=' flex items-center gap-2'><FaAngleLeft/> Back To Homepage</h1>
                </div>
                </Link>
            </div>

            <div className='hidden md:flex w-1/2 h-full'>
                <Image alt='' src={azeem} className=' rounded-r-2xl w-full h-full object-cover'/>
            </div>
        </div>
    </div>
  )
}

export default page