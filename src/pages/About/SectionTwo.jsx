import Image from 'next/image'
import React from 'react'
import aboutBanner from '../../app/assets/ABOUT/SectionTwo/about-banner.webp'

const SectionTwo = () => {
  return (
    <section className="w-full min-h-screen  flex justify-center items-center py-10">
      <div className='w-full h-full flex flex-col gap-24'>
        <div className='w-full flex flex-col gap-10 md:gap-0 md:grid md:grid-cols-2 md:gap-x-8 lg:gap-x-5 '>
          <div className='w-full h-full flex flex-col justify-between gap-8'>
            <h3 className='text-4xl md:text-5xl text-secondary font-semibold'>Why GPDN?</h3>
            <p className='text-tertiary font-normal text-base md:text-lg'>The Global Palliative Doctors Network (GPDN) is an international platform connecting palliative care physicians worldwide through WhatsApp. Launched in October 2024 by Dr. Mujeeb Rahman and Dr. Shafika Banoo—both respected leaders in the field—GPDN emerged from a shared vision during the Global Fellowship in Palliative Care. <br className='hidden lg:block'/><br className='hidden lg:block'/>

What began as a bold idea has grown into a global community focused on collaboration, peer support, and continuous learning—working together to advance the quality of palliative care across borders.</p>
          </div>

          <div className='flex flex-col gap-5 lg:gap-0 lg:grid lg:grid-cols-[0.9fr_1fr] lg:gap-x-8'>
            <div className='h-[25vh] md:h-full w-full relative rounded-2xl overflow-hidden'>
              <Image src={aboutBanner} alt='about banner' layout='fill' className='object-cover h-full w-full rounded-2xl'/>
            </div>
            <div className='flex flex-col gap-5 md:gap-0 justify-between'>
              <div className='flex flex-col gap-2'>
                <div className='flex items-center justify-between'>
                  <h6 className='font-poppins text-primary text-2xl md:text-3xl lg:text-4xl font-semibold w-[50%]'>450+</h6>
                  <p className='font-normal text-lg lg:text-xl text-[#525252] w-[50%]'>Palliative Care<br />Physicians</p>
                </div>
                <div className='flex items-center justify-between'>
                  <h6 className='font-poppins text-primary text-2xl md:text-3xl lg:text-4xl font-semibold w-[50%]'>80+</h6>
                  <p className='font-normal text-lg lg:text-xl text-[#525252] w-[50%]'>Countries &<br />Growing</p>
                </div>
                <div className='flex items-center justify-between'>
                  <h6 className='font-poppins text-primary text-2xl md:text-3xl lg:text-4xl font-semibold w-[50%]'>8</h6>
                  <p className='font-normal text-lg lg:text-xl text-[#525252] w-[50%]'>Experts<br />Steering GPDN</p>
                </div>
              </div>
              <p className='font-normal text-lg text-tertiary'>A growing global collective of 450+ palliative care physicians across 80 countries, guided by a core team of 8 dedicated experts.</p>
            </div>
          </div>
        </div>

        <div className='w-full h-auto md:py-10 flex flex-col gap-20'>
          <div className='flex flex-col gap-3 md:gap-0 md:grid md:grid-cols-2'>
            <div className='w-full h-full flex items-start justify-start'>
              <h3 className='text-4xl md:text-5xl font-semibold text-secondary'>Our Mission</h3>
            </div>
            <p className='font-normal text-base md:text-lg text-[#8E8E8E]'>Our mission is to build a vibrant and inclusive international community of palliative care physicians united by a shared commitment to compassionate, patient-centered care. We aim to foster meaningful collaboration, mutual support, and continuous learning among physicians dedicated to improving the well-being of patients with serious health conditions.<br /> <br />By bridging geographical and cultural gaps, we empower physicians to connect, exchange knowledge, and inspire one another. Together, we strive to enhance clinical excellence, promote innovation, and improve the quality of care for patients and their families—ensuring that every doctor feels supported in delivering care that truly makes a difference.</p>
          </div>
          <div className='flex flex-col gap-3 md:gap-0 md:grid md:grid-cols-2'>
            <div className='w-full h-full flex items-start justify-start'>
              <h3 className='text-4xl md:text-5xl font-semibold text-secondary'>Our Vision</h3>
            </div>
            <p className='font-normal text-base md:text-lg text-[#8E8E8E]'>To build a seamlessly connected global community of palliative care physicians that fosters cross-border collaboration, freely shares knowledge and resources, and empowers every doctor to provide compassionate, high-quality, person-centered care that uplifts patients and families around the world.</p>
          </div>
        </div>
      </div>
    </section>

  )
}

export default SectionTwo