import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

export interface CVLink {
  label: string
  url: string
}

export interface CVBasics {
  first_name: string
  last_name: string
  position: string
  email: string
  date_of_birth?: string
  github?: string
  linkedin?: string
  address?: string
  mobile?: string
  website?: string
  scholar?: string
  orcid?: string
  location?: string
}

export interface CVSummary {
  paragraph?: string
}

export interface CVExperience {
  title: string
  organization: string
  location: string
  dates: string
  items?: string[]
}

export interface CVEducation {
  degree: string
  area?: string
  institution: string
  location: string
  dates: string
  items?: string[]
}

export interface CVSkill {
  category: string
  items?: string[]
}

export interface CV {
  basics: CVBasics
  summary?: CVSummary
  experience?: CVExperience[]
  education?: CVEducation[]
  skills?: CVSkill[]
}

export function loadCV(): CV {
  const filePath = path.join(process.cwd(), 'data', 'cv.yaml')
  const raw = fs.readFileSync(filePath, 'utf8')
  return yaml.load(raw) as CV
}
