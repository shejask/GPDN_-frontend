import dynamic from 'next/dynamic';

// Dynamically import the MembersDirectory component with no SSR
const MembersDirectory = dynamic(
  () => import('@/components/dashboard/MembersDirectory'),
  { ssr: false }
);

export default function MembersPage() {
  return <MembersDirectory />;
}