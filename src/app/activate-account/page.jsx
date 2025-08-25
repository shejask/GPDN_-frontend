"use client";
import AccountActivation from "@/components/auth/AccountActivation";
import { Suspense } from "react";

export default function ActivateAccountPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AccountActivation   />
    </Suspense>
  );
}
