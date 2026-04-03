'use client'

import { useState, useEffect } from 'react'

export type SelectOption = {
  value: string
  label: string
}

export function useAcademicData() {
  const [years, setYears] = useState<SelectOption[]>([])
  const [semesters, setSemesters] = useState<SelectOption[]>([])
  const [subjects, setSubjects] = useState<SelectOption[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch years on mount
  useEffect(() => {
    const fetchYears = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/subjects')
        const data = await response.json()
        
        // Ensure data is an array before setting
        if (Array.isArray(data)) {
          setYears(data)
        } else {
          console.warn('Unexpected response format for years:', data)
          setYears([])
        }
      } catch (error) {
        console.error('Error fetching years:', error)
        setYears([])
      } finally {
        setLoading(false)
      }
    }

    fetchYears()
  }, [])

  // Fetch semesters when year changes
  const fetchSemesters = async (year: string) => {
    if (!year) {
      setSemesters([])
      setSubjects([])
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/subjects?year=${year}`)
      const data = await response.json()
      
      // Ensure data is an array before setting
      if (Array.isArray(data)) {
        setSemesters(data)
      } else {
        console.warn('Unexpected response format for semesters:', data)
        setSemesters([])
      }
      setSubjects([])
    } catch (error) {
      console.error('Error fetching semesters:', error)
      setSemesters([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch subjects when year and semester change
  const fetchSubjects = async (year: string, semester: string) => {
    if (!year || !semester) {
      setSubjects([])
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/subjects?year=${year}&semester=${semester}`)
      const data = await response.json()
      
      // Ensure data is an array before setting
      if (Array.isArray(data)) {
        setSubjects(data)
      } else {
        console.warn('Unexpected response format for subjects:', data)
        setSubjects([])
      }
    } catch (error) {
      console.error('Error fetching subjects:', error)
      setSubjects([])
    } finally {
      setLoading(false)
    }
  }

  return {
    years,
    semesters,
    subjects,
    loading,
    fetchSemesters,
    fetchSubjects,
  }
}
