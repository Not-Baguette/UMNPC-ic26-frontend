import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { loadAppConfig, type AppConfig } from './config.ts'
import { useAuth, AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './middleware/ProtectedRoute'
import { LoginView } from './views/LoginView'
import { DashboardView } from './views/DashboardView'
import { ContestView } from './views/ContestView'
import { WorkspaceView } from './views/WorkspaceView'
import { AppHeader } from './components/AppHeader'
import {
  formatClock,
  parseDurationToSeconds,
  formatSecondsAsDuration,
  buildApiResourceUrl,
  requestJson,
  starterCode,
} from './utils'
import type { ViewMode, EditorLanguage, Contest, Scoreboard, Team, ContestProblem, Submission, Clarification, Language } from './types'

const DRAFTS_STORAGE_KEY = 'domjudge-problem-drafts-v1'

function AppContent() {
  const { logout } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null)
  const [contest, setContest] = useState<Contest | null>(null)
  const [scoreboard, setScoreboard] = useState<Scoreboard | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [problems, setProblems] = useState<ContestProblem[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [clarifications, setClarifications] = useState<Clarification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [liveContestTime, setLiveContestTime] = useState('--:--:--')
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null)
  const [editorLanguage, setEditorLanguage] = useState<EditorLanguage>('javascript')
  const [stdinValue, setStdinValue] = useState('')
  const [runOutput, setRunOutput] = useState('Run your code locally to see output here.')
  const [runStatus, setRunStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [draftsByProblem, setDraftsByProblem] = useState<Record<string, Record<EditorLanguage, string>>>({})
  const [languages, setLanguages] = useState<Language[]>([])
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>('')
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('Submit your current draft to DOMjudge.')

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DRAFTS_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, Record<EditorLanguage, string>>
        if (parsed && typeof parsed === 'object') {
          setDraftsByProblem(parsed)
        }
      }
    } catch {
      // Ignore malformed local draft cache.
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(draftsByProblem))
    } catch {
      // ignore storage failures (private mode/quota).
    }
  }, [draftsByProblem])

  useEffect(() => {
    let timerId: number | null = null
    let activeController: AbortController | null = null
    let isDisposed = false

    const loadContestData = async (nextConfig: AppConfig) => {
      activeController?.abort()
      const controller = new AbortController()
      activeController = controller

      setError(null)
      setWarning(null)
      try {
        const contests = await requestJson<Contest[]>(nextConfig, '/contests', controller.signal)
        if (contests.length === 0) {
          throw new Error('No contests available from DOMjudge API.')
        }

        const configuredContestId = nextConfig.contestId?.trim()
        let selectedContest: Contest = contests[0]

        if (configuredContestId) {
          const exactMatch = contests.find(
            (item) => item.id === configuredContestId || String(item.cid ?? '') === configuredContestId,
          )

          if (exactMatch) {
            selectedContest = exactMatch
          } else {
            const available = contests
              .map((item) => `${item.id}${item.cid !== undefined ? ` (cid:${item.cid})` : ''}`)
              .join(', ')

            setWarning(
              `Configured contestId "${configuredContestId}" was not found for this account/session. ` +
                `Falling back to "${selectedContest.id}". Available contests: ${available}`,
            )
          }
        }

        const contestId = encodeURIComponent(selectedContest.id)

        const [nextScoreboard, nextTeams, nextProblems, nextSubmissions, nextClarifications, nextLanguages] =
          await Promise.all([
            requestJson<Scoreboard>(nextConfig, `/contests/${contestId}/scoreboard`, controller.signal),
            requestJson<Team[]>(nextConfig, `/contests/${contestId}/teams`, controller.signal),
            requestJson<ContestProblem[]>(nextConfig, `/contests/${contestId}/problems`, controller.signal),
            requestJson<Submission[]>(nextConfig, `/contests/${contestId}/submissions`, controller.signal),
            requestJson<Clarification[]>(nextConfig, `/contests/${contestId}/clarifications`, controller.signal),
            requestJson<Language[]>(nextConfig, `/contests/${contestId}/languages`, controller.signal),
          ])

        if (controller.signal.aborted || isDisposed) {
          return
        }

        setContest(selectedContest)
        setScoreboard(nextScoreboard)
        setTeams(nextTeams)
        setProblems(nextProblems)
        setSubmissions(nextSubmissions)
        setClarifications(nextClarifications)
        setLanguages(nextLanguages)

        if (nextLanguages.length > 0) {
          setSelectedLanguageId((previous) => {
            if (previous && nextLanguages.some((language) => language.id === previous)) {
              return previous
            }

            const preferredByEditor =
              editorLanguage === 'javascript'
                ? ['js', 'javascript', 'nodejs']
                : editorLanguage === 'python'
                  ? ['py', 'python3', 'python']
                  : ['cpp', 'c++17', 'c++']

            const matched = nextLanguages.find((language) =>
              preferredByEditor.some((token) => language.id.toLowerCase().includes(token)),
            )

            return matched?.id ?? nextLanguages[0].id
          })
        }
      } catch (loadError) {
        if (controller.signal.aborted || isDisposed) {
          return
        }
        setError(loadError instanceof Error ? loadError.message : 'Failed to load DOMjudge data.')
      } finally {
        if (!controller.signal.aborted && !isDisposed) {
          setLoading(false)
        }
      }
    }

    const initialize = async () => {
      try {
        const nextConfig = await loadAppConfig()
        if (isDisposed) {
          return
        }

        setAppConfig(nextConfig)

        await loadContestData(nextConfig)

        timerId = window.setInterval(() => {
          void loadContestData(nextConfig)
        }, nextConfig.autoRefreshMs)
      } catch (configError) {
        if (isDisposed) {
          return
        }
        setError(configError instanceof Error ? configError.message : 'Failed to load app configuration.')
        setLoading(false)
      }
    }

    void initialize()

    return () => {
      isDisposed = true
      activeController?.abort()
      if (timerId !== null) {
        window.clearInterval(timerId)
      }
    }
  }, [])

  useEffect(() => {
    const baseSeconds = parseDurationToSeconds(scoreboard?.contest_time)

    if (baseSeconds === null) {
      setLiveContestTime(formatClock(scoreboard?.contest_time))
      return
    }

    const syncedAtMs = Date.now()

    const tick = () => {
      const elapsedSeconds = Math.floor((Date.now() - syncedAtMs) / 1000)
      setLiveContestTime(formatSecondsAsDuration(baseSeconds + elapsedSeconds))
    }

    tick()
    const intervalId = window.setInterval(tick, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [scoreboard?.contest_time])

  const teamNameById = useMemo(() => {
    return new Map(teams.map((team) => [team.id, team.display_name || team.name || team.label]))
  }, [teams])

  useEffect(() => {
    if (problems.length === 0) {
      setSelectedProblemId(null)
      return
    }

    if (!selectedProblemId || !problems.some((problem) => problem.id === selectedProblemId)) {
      setSelectedProblemId(problems[0].id)
    }
  }, [problems, selectedProblemId])

  useEffect(() => {
    if (languages.length === 0) {
      return
    }

    const preferredByEditor =
      editorLanguage === 'javascript'
        ? ['js', 'javascript', 'nodejs']
        : editorLanguage === 'python'
          ? ['py', 'python3', 'python']
          : ['cpp', 'c++17', 'c++']

    const matched = languages.find((language) =>
      preferredByEditor.some((token) => language.id.toLowerCase().includes(token)),
    )

    if (matched && matched.id !== selectedLanguageId) {
      setSelectedLanguageId(matched.id)
    }
  }, [editorLanguage, languages, selectedLanguageId])

  const problemLabels = useMemo(() => {
    return [...problems].sort((a, b) => a.ordinal - b.ordinal).map((problem) => problem.label)
  }, [problems])

  const selectedProblem = useMemo(() => {
    return problems.find((problem) => problem.id === selectedProblemId) ?? null
  }, [problems, selectedProblemId])

  const activeProblemKey = selectedProblem?.id ?? '__global__'
  const activeEditorCode = draftsByProblem[activeProblemKey]?.[editorLanguage] ?? starterCode[editorLanguage]

  const setActiveEditorCode = (nextCode: string) => {
    setDraftsByProblem((previous) => {
      const previousByProblem = previous[activeProblemKey] ?? { ...starterCode }
      return {
        ...previous,
        [activeProblemKey]: {
          ...previousByProblem,
          [editorLanguage]: nextCode,
        },
      }
    })
  }

  const problemStats = useMemo(() => {
    const stats = new Map<string, { solved: number; attempts: number; pending: number }>()

    for (const row of scoreboard?.rows || []) {
      for (const problem of row.problems) {
        const current = stats.get(problem.problem_id) || { solved: 0, attempts: 0, pending: 0 }
        current.attempts += problem.num_judged + problem.num_pending
        current.pending += problem.num_pending
        if (problem.solved) {
          current.solved += 1
        }
        stats.set(problem.problem_id, current)
      }
    }

    return stats
  }, [scoreboard])

  const recentSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) => (a.time < b.time ? 1 : -1)).slice(0, 8)
  }, [submissions])

  const recentClarifications = useMemo(() => {
    return [...clarifications].sort((a, b) => (a.contest_time < b.contest_time ? 1 : -1)).slice(0, 8)
  }, [clarifications])

  const isFrozen = Boolean(scoreboard?.state?.frozen && !scoreboard?.state?.thawed)

  const selectedStatementUrl = buildApiResourceUrl(appConfig, selectedProblem?.statement?.[0]?.href)

  const runCodeLocally = async () => {
    if (editorLanguage !== 'javascript') {
      setRunStatus('error')
      setRunOutput('Local runner currently supports JavaScript only. Use this page as a coding workspace for other languages.')
      return
    }

    try {
      setRunStatus('idle')
      const maybeSolve = new Function(`${activeEditorCode}\nreturn typeof solve === 'function' ? solve : null;`)()

      if (typeof maybeSolve !== 'function') {
        throw new Error('Define a function named solve(input) to run code locally.')
      }

      const result = maybeSolve(stdinValue)
      const resolved = result instanceof Promise ? await result : result

      setRunStatus('ok')
      setRunOutput(String(resolved ?? ''))
    } catch (runError) {
      setRunStatus('error')
      setRunOutput(runError instanceof Error ? runError.message : 'Runtime error while executing code.')
    }
  }

  const submitToDomjudge = async () => {
    if (!appConfig || !contest || !selectedProblem) {
      setSubmitStatus('error')
      setSubmitMessage('Contest or problem is not loaded yet.')
      return
    }

    if (!selectedLanguageId) {
      setSubmitStatus('error')
      setSubmitMessage('Select a DOMjudge language first.')
      return
    }

    if (!activeEditorCode.trim()) {
      setSubmitStatus('error')
      setSubmitMessage('Code is empty. Write a solution before submitting.')
      return
    }

    let timeoutId: number | null = null

    try {
      setSubmitStatus('idle')
      setSubmitMessage('Submitting...')

      const timeoutController = new AbortController()
      timeoutId = window.setTimeout(() => timeoutController.abort(), appConfig.requestTimeoutMs)

      const extension =
        editorLanguage === 'javascript' ? 'js' : editorLanguage === 'python' ? 'py' : 'cpp'

      const formData = new FormData()
      formData.append('problem_id', selectedProblem.id)
      formData.append('language_id', selectedLanguageId)
      formData.append('code', new Blob([activeEditorCode], { type: 'text/plain' }), `main.${extension}`)

      const response = await fetch(
        `${appConfig.apiBaseUrl}/contests/${encodeURIComponent(contest.id)}/submissions`,
        {
          method: 'POST',
          credentials: appConfig.withCredentials ? 'include' : 'omit',
          body: formData,
          signal: timeoutController.signal,
        },
      )

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`Submit failed (${response.status}): ${errorBody || response.statusText}`)
      }

      const payload = (await response.json().catch(() => null)) as
        | { id?: string; submitid?: number }
        | null

      setSubmitStatus('ok')
      setSubmitMessage(
        payload?.id || payload?.submitid
          ? `Submitted successfully. Submission ID: ${payload.id ?? payload.submitid}`
          : 'Submitted successfully.',
      )
    } catch (submitError) {
      setSubmitStatus('error')
      setSubmitMessage(submitError instanceof Error ? submitError.message : 'Submit failed.')
    } finally {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
      }
    }
  }

  const renderDashboard = () => (
    <DashboardView
      appConfig={appConfig}
      contest={contest}
      scoreboard={scoreboard}
      teams={teams}
      submissions={submissions}
      clarifications={clarifications}
      problemLabels={problemLabels}
      recentSubmissions={recentSubmissions}
      recentClarifications={recentClarifications}
      teamNameById={teamNameById}
      formatClock={formatClock}
    />
  )

  const renderContest = () => (
    <ContestView
      selectedProblemId={selectedProblemId}
      onProblemSelect={setSelectedProblemId}
      problems={problems}
      problemStats={problemStats}
      selectedStatementUrl={selectedStatementUrl}
      editorLanguage={editorLanguage}
      onLanguageChange={setEditorLanguage}
      activeEditorCode={activeEditorCode}
      onCodeChange={setActiveEditorCode}
      selectedLanguageId={selectedLanguageId}
      onLanguageIdChange={setSelectedLanguageId}
      languages={languages}
      onRunLocal={runCodeLocally}
      onSubmit={submitToDomjudge}
      submitMessage={submitMessage}
      submitStatus={submitStatus}
      onOpenWorkspace={() => setViewMode('workspace')}
    />
  )

  const renderWorkspace = () => (
    <WorkspaceView
      selectedProblemId={selectedProblemId}
      problems={problems}
      selectedProblem={selectedProblem}
      editorLanguage={editorLanguage}
      onLanguageChange={setEditorLanguage}
      activeEditorCode={activeEditorCode}
      onCodeChange={setActiveEditorCode}
      selectedLanguageId={selectedLanguageId}
      onLanguageIdChange={setSelectedLanguageId}
      languages={languages}
      onRunLocal={runCodeLocally}
      onSubmit={submitToDomjudge}
      submitMessage={submitMessage}
      submitStatus={submitStatus}
      stdinValue={stdinValue}
      onStdinChange={setStdinValue}
      runOutput={runOutput}
      runStatus={runStatus}
    />
  )

  return (
    <div className="app">
      <ProtectedRoute onFallback={() => setViewMode('login')}>
        <AppHeader
          contest={contest}
          teams={teams}
          problemCount={problemLabels.length}
          liveContestTime={liveContestTime}
          isFrozen={isFrozen}
          onViewChange={(view) => setViewMode(view)}
          onLogout={logout}
        />

        <section className="problem-pills" aria-label="problem legend">
          {problemLabels.map((label) => (
            <span key={label} className="pill">
              {label}
            </span>
          ))}
        </section>

        {loading ? <section className="panel loading-panel">Loading contest data from DOMjudge API...</section> : null}

        {error ? (
          <section className="panel error-panel">
            <strong>API error:</strong> {error}
          </section>
        ) : null}

        {warning ? (
          <section className="panel warning-panel">
            <strong>Warning:</strong> {warning}
          </section>
        ) : null}

        {viewMode === 'dashboard' ? renderDashboard() : null}
        {viewMode === 'contest' ? renderContest() : null}
        {viewMode === 'workspace' ? renderWorkspace() : null}
      </ProtectedRoute>

      {viewMode === 'login' && <LoginView onSuccess={() => setViewMode('dashboard')} />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
