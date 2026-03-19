export type ViewMode = 'login' | 'dashboard' | 'contest' | 'workspace'
export type EditorLanguage = 'javascript' | 'python' | 'cpp'

export type Contest = {
  id: string
  cid?: number
  name: string
  shortname?: string
  formal_name?: string
}

export type ContestState = {
  frozen?: string | null
  thawed?: string | null
}

export type Score = {
  num_solved: number
  total_time: number | null
}

export type ScoreboardProblem = {
  label: string
  problem_id: string
  num_judged: number
  num_pending: number
  solved: boolean
  time: number | null
}

export type ScoreboardRow = {
  rank: number
  team_id: string
  score: Score
  problems: ScoreboardProblem[]
}

export type Scoreboard = {
  contest_time: string | null
  state: ContestState | null
  rows: ScoreboardRow[]
}

export type Team = {
  id: string
  name: string
  display_name: string | null
  label: string
}

export type ContestProblem = {
  ordinal: number
  label: string
  id: string
  name: string
  color?: string
  rgb?: string
  time_limit?: number
  statement?: Array<{
    href: string
    mime?: string
    filename?: string
  }>
}

export type Submission = {
  id: string | null
  time: string
  contest_time: string
  team_id: string
  problem_id: string
}

export type Clarification = {
  id: string | null
  time: string | null
  contest_time: string
  from_team_id: string | null
  problem_id: string | null
}

export type Language = {
  id: string
  name: string
  allow_submit?: boolean
  extensions?: string[]
}
