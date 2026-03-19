import type { AppConfig } from '../config.ts'
import type { Clarification, Contest, Scoreboard, Submission, Team, ScoreboardRow, ScoreboardProblem } from '../types.ts'

interface DashboardViewProps {
  appConfig: AppConfig | null
  contest: Contest | null
  scoreboard: Scoreboard | null
  teams: Team[]
  submissions: Submission[]
  clarifications: Clarification[]
  problemLabels: string[]
  recentSubmissions: Submission[]
  recentClarifications: Clarification[]
  teamNameById: Map<string, string>
  formatClock: (value: string | null | undefined) => string
}

export function DashboardView({
  appConfig,
  scoreboard,
  teamNameById,
  problemLabels,
  recentSubmissions,
  recentClarifications,
  formatClock,
}: DashboardViewProps) {
  return (
    <main className="content-grid">
      <section className="panel scoreboard-panel">
        <header className="panel-header">
          <h2>Live Scoreboard</h2>
          <button type="button" className="filter-button">
            Auto refresh: {appConfig?.autoRefreshMs ?? 15000}ms
          </button>
        </header>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Solved</th>
                <th>Score</th>
                {problemLabels.map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(scoreboard?.rows || []).map((row: ScoreboardRow) => {
                const problemByLabel = new Map(row.problems.map((problem: ScoreboardProblem) => [problem.label, problem]))

                return (
                  <tr key={`${row.rank}-${row.team_id}`}>
                    <td>{row.rank}</td>
                    <td className="team">{teamNameById.get(row.team_id) || row.team_id}</td>
                    <td>{row.score.num_solved}</td>
                    <td>{row.score.total_time ?? 0}</td>
                    {problemLabels.map((label) => {
                      const scoreProblem = problemByLabel.get(label) as ScoreboardProblem | undefined
                      if (!scoreProblem) {
                        return <td key={`${row.team_id}-${label}`}>-</td>
                      }

                      if (scoreProblem.solved) {
                        return (
                          <td key={`${row.team_id}-${label}`}>
                            <span className="status status-ok">+{scoreProblem.time ?? ''}</span>
                          </td>
                        )
                      }

                      if (scoreProblem.num_pending > 0) {
                        return (
                          <td key={`${row.team_id}-${label}`}>
                            <span className="status status-pending">?{scoreProblem.num_pending}</span>
                          </td>
                        )
                      }

                      if (scoreProblem.num_judged > 0) {
                        return (
                          <td key={`${row.team_id}-${label}`}>
                            <span className="status status-failed">-{scoreProblem.num_judged}</span>
                          </td>
                        )
                      }

                      return <td key={`${row.team_id}-${label}`}>-</td>
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="side-stack">
        <article className="panel">
          <header className="panel-header">
            <h2>Submissions</h2>
          </header>
          <ul className="list submissions-list">
            {recentSubmissions.map((item) => (
              <li key={`${item.id ?? item.time}-${item.problem_id}`}>
                <span>{formatClock(item.contest_time || item.time)}</span>
                <strong className="problem-tag">{item.problem_id}</strong>
                <span>{teamNameById.get(item.team_id) || item.team_id}</span>
                <span className="status status-pending">SUBMITTED</span>
              </li>
            ))}
            {recentSubmissions.length === 0 ? <li className="empty-item">No submissions available.</li> : null}
          </ul>
        </article>

        <article className="panel">
          <header className="panel-header">
            <h2>Clarifications</h2>
          </header>
          <ul className="list clarifications-list">
            {recentClarifications.map((item) => (
              <li key={`${item.id ?? item.contest_time}-${item.problem_id ?? 'general'}`}>
                <span>{formatClock(item.contest_time || item.time)}</span>
                <strong>{item.from_team_id ? teamNameById.get(item.from_team_id) || item.from_team_id : 'Jury'}</strong>
                <span>{item.problem_id ? `Problem ${item.problem_id}` : 'General'}</span>
              </li>
            ))}
            {recentClarifications.length === 0 ? <li className="empty-item">No clarifications available.</li> : null}
          </ul>
        </article>
      </section>
    </main>
  )
}
