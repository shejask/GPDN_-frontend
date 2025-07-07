"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the ForumDiscussion component with SSR disabled
const ForumDiscussion = dynamic(
  () => import('@/components/dashboard/ForumDiscussion'),
  { ssr: false } // This prevents the component from being rendered on the server
);

// Simple loading component
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export default function ForumPage() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // This will only run on the client after hydration
    setIsClient(true);
  }, []);
  
  // Only render the ForumDiscussion component on the client
  return isClient ? <ForumDiscussion /> : <LoadingFallback />;
}