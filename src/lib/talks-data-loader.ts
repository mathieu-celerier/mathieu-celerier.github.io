import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

export interface TalkLinks {
  slides?: string
  video?: string
  poster?: string
  website?: string
}

export interface Talk {
  title: string
  event: string
  date: string
  location: string
  links?: TalkLinks
}

export function loadTalks(): Talk[] {
  const filePath = path.join(process.cwd(), 'data', 'talks.yaml')
  if (!fs.existsSync(filePath)) return []
  const raw = fs.readFileSync(filePath, 'utf8')
  const parsed = yaml.load(raw)
  return Array.isArray(parsed) ? (parsed as Talk[]) : []
}
