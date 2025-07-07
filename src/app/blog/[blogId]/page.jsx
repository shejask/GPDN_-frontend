import Navbar from '@/components/Navbar'
import BlogDetails from '@/pages/Blog/FullBlog/BlogDetails'
import RelatedBlogs from '@/pages/Blog/FullBlog/RelatedBlogs'
import Footer from '@/pages/Home/Footer'
import React from 'react'

const page = async ({params}) => {

    const {blogId} = await params ;

  return (
    <main className="flex  flex-col items-center gap-20">
      <div className="flex w-full  flex-col items-center justify-between gap-20 px-7 md:px-16 lg:px-20 2xl:px-40">
      <div className="h-auto  w-full flex flex-col gap-20 justify-between pt-8 ">
      <Navbar/>
      <BlogDetails blogId={blogId}/>
      </div>
    <RelatedBlogs blogId={blogId}/> 
      </div>
      <Footer/> 
    </main>
  )
}

export default page