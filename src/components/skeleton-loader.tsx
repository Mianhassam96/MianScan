'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'skeleton rounded-md bg-muted',
        className
      )}
    />
  )
}

export function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      {/* Overall score skeleton */}
      <div className="bg-white dark:bg-card rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Score circle skeleton */}
          <div className="flex-shrink-0">
            <Skeleton className="w-32 h-32 rounded-full" />
          </div>

          {/* Category breakdown skeleton */}
          <div className="flex-1 w-full space-y-4">
            <Skeleton className="h-6 w-32" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="flex-1 h-3 rounded-full" />
                <Skeleton className="w-12 h-4" />
                <Skeleton className="w-12 h-3" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="bg-white dark:bg-card rounded-lg shadow-lg">
        <div className="flex border-b">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-32 m-1 rounded" />
          ))}
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 dark:bg-muted rounded-lg p-4">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-5 h-5 rounded mt-1" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}