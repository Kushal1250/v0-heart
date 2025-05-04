"use client"

import { Suspense } from "react"
import { ProfileContent } from "@/components/profile-content"
import { ProfileSkeleton } from "@/components/profile-skeleton"

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-10">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </div>
  )
}
