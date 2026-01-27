import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateOverallScore(performance: number, seo: number, accessibility: number): number {
  return Math.round(performance * 0.4 + seo * 0.4 + accessibility * 0.2)
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600"
  if (score >= 70) return "text-yellow-600"
  return "text-red-600"
}

export function getScoreBgColor(score: number): string {
  if (score >= 90) return "bg-green-100"
  if (score >= 70) return "bg-yellow-100"
  return "bg-red-100"
}