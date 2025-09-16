import Navbar from "@/components/Navbar";
import BlogDetails from "@/pages/Blog/FullBlog/BlogDetails";
import RelatedBlogs from "@/pages/Blog/FullBlog/RelatedBlogs";
import Footer from "@/pages/Home/Footer";
import React from "react";

const page = async ({ params }) => {
  const { blogId } = await params;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="md:p-5 md:px-10 p-5">
        <Navbar />
      </div>
      <BlogDetails blogId={blogId} />
      {/* <RelatedBlogs blogId={blogId} /> */}
      <Footer />
    </main>
  );
};

export default page;
