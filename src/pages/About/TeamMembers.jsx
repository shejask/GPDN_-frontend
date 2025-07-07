import { teamMembersData } from '@/app/assets/assets'
import Image from 'next/image'
import React from 'react'

const TeamMembers = () => {
  return (
    <section className="w-full h-auto  flex justify-center items-center pt-10 pb-14">
      <div className='w-full h-auto flex flex-col gap-7 md:gap-12 lg:gap-14 items-start'>
        <div className='w-full flex flex-col gap-2'>
        <h3 className='w-full text-4xl md:text-5xl text-secondary font-semibold mb-3'>Meet our<br className='md:hidden'/> Dedicated Team</h3>
        <div className='flex justify-start items-center'>
        <div className='text-base md:text-lg font-normal text-tertiary w-full flex flex-col-reverse lg:flex-row justify-between gap-5'>
          <p>The network is guided by a dedicated core team of palliative care physicians who collaborate closely with the founders to shape its direction, foster engagement, and uphold clinical excellence. The core team includes:</p>
          <p>Together, this team helps drive GPDN’s mission forward—building a global community united by compassion, expertise, and the shared goal of advancing palliative care.</p>
        </div>
        </div>
        </div>

        <div className='w-full h-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-flow-row gap-x-4 gap-y-20'>
          {
            teamMembersData.map((memberData,index)=>(
              <div key={index} className='w-full h-auto flex flex-col gap-4 '>
                <div className='w-full h-[25rem] relative rounded-xl'>
                  <Image 
                    src={memberData.profileImage} 
                    alt={`Profile picture of ${memberData.name}`}
                    className='w-full h-full rounded-xl object-cover object-top border-b-[5px] border-secondary' 
                    layout='fill'
                  />
                </div>
                <div className='w-full h-auto flex flex-col'>
                  <h5 className='font-semibold text-[1.7rem] text-black'>{memberData.name}</h5>
                  <h6 className='font-normal text-[1.1rem] text-tertiary hidden'>{memberData.qualification}</h6>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </section>

  )
}

export default TeamMembers