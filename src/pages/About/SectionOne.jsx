import Image from 'next/image'
import React from 'react'
import bannerImg1 from '../../app/assets/ABOUT/SectionOne/banner-1.webp'
import bannerImg2 from '../../app/assets/ABOUT/SectionOne/banner-2.webp'

const SectionOne = () => {
  return (
    <section className="w-full h-auto lg:h-full flex justify-center items-center pt-14 pb-1">
        <div className='h-auto md:h-full w-full flex flex-col gap-5'>
            <h1 className='font-medium text-[2rem] md:text-[3rem] lg:text-[4rem] xl:text-[5rem] 2xl:text-[6.2rem] leading-tight mb-5'>Uniting Physicians.<br/>Advancing Palliative Care.</h1>
            <div className='h-auto md:h-full w-full flex flex-col gap-5 md:grid md:grid-cols-[1fr_0.6fr] md:gap-x-5'>
                <div className='h-[25vh] md:h-full w-full relative rounded-2xl'>
                    <Image layout='fill'  src={bannerImg1} className='w-full object-cover rounded-2xl' alt='banner image'/>
                </div>
                <div className='flex flex-col md:grid md:grid-rows-[0.4fr_1fr] md:gap-y-5'>
                   <div className='w-full h-full pt-1'>
                   <h5 className='font-normal text-base md:text-lg text-tertiary md:w-[90%]'>
                   At GPDN, we bring together palliative care physicians from around the world to foster a supportive, collaborative community—one that champions knowledge-sharing, clinical insight, and peer connection to elevate the standard of patient care across diverse settings.
                    </h5>
                   </div>
                   <div className='h-[25vh] md:h-full w-full relative rounded-2xl'>
                    <Image  layout='fill'  src={bannerImg2} className='w-full object-cover rounded-2xl' alt='banner image'/>
                   </div>
                </div>
            </div>
        </div>
    </section>

  )
}

export default SectionOne