"use client"

import { Suspense } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import HomePageContent from './home-content'

function LoadingFallback() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-6 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </AppLayout>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomePageContent />
    </Suspense>
  )
}
