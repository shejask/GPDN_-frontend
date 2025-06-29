"use client"

import { useParams } from 'next/navigation';
import BlogDetail from '@/components/dashboard/BlogDetail';

const BlogDetailPage = () => {
  const params = useParams();
  return <BlogDetail id={params.id} />;
};

export default BlogDetailPage;