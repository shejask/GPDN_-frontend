// "use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import React from 'react'

const MobileMenu = ({isShowMenu,setIsShowMenu}) => {

    const pathname = usePathname();

  return (
    <section className={`z-20 fixed lg:hidden top-0  bg-[#fcfcfc] w-[75%] h-screen border-r-4 border-primary ${isShowMenu ? 'left-0' : '-left-[80vw]'} transition-all duration-500 ease-in-out`}>
        <div className='h-full w-full flex justify-start items-start p-10 pt-16'>
            <div className='flex flex-col gap-10 '>
                <Link onClick={()=>setIsShowMenu(!isShowMenu)} href={'/'}>
                <button className={`${pathname === '/' ? "text-primary text-xl" : "text-black text-2xl" }  font-medium`}>Home</button>
                </Link>
                <Link className={`${pathname === '/about' ? "text-primary text-xl" : "text-black text-2xl" }  font-medium`} href={'/about'}>
                <button className='text-2xl font-medium'>About</button>
                </Link>
                <Link className={`${pathname.startsWith('/blog') ? "text-primary text-xl" : "text-black text-2xl" }  font-medium`} href={'/blog'}>
                <button className='text-2xl font-medium'>Blog</button>
                </Link>
                <Link className={`${pathname === '/contact' ? "text-primary text-xl" : "text-black text-2xl" }  font-medium`} href={'/contact'}>
                <button className='text-2xl font-medium'>Contact</button>
                </Link>
            </div>
        </div>
    </section>
  )
}

export default MobileMenu