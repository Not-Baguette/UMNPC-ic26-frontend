import type { ContestProblem, Language } from './../utils/utils'

interface EditorPaneProps {
  mode: 'workspace' | 'contest'
  editorLanguage: 'javascript' | 'python' | 'cpp'
  onLanguageChange: (language: 'javascript' | 'python' | 'cpp') => void
  activeEditorCode: string
  onCodeChange: (code: string) => void
  selectedLanguageId: string
  onLanguageIdChange: (id: string) => void
  languages: Language[]
  onRunLocal: () => void
  onSubmit: () => void
  submitMessage: string
  submitStatus: 'idle' | 'ok' | 'error'
}

export function EditorPane({
  mode,
  editorLanguage,
  onLanguageChange,
  activeEditorCode,
  onCodeChange,
  selectedLanguageId,
  onLanguageIdChange,
  languages,
  onRunLocal,
  onSubmit,
  submitMessage,
  submitStatus,
}: EditorPaneProps) {
  return (
    <section className={`panel code-panel ${mode === 'contest' ? 'contest-code-panel' : ''}`}>
      <header className="panel-header">
        <h2>{mode === 'contest' ? 'Solve' : 'Local Console'}</h2>
        <div className="workspace-actions">
          <select value={editorLanguage} onChange={(event) => onLanguageChange(event.target.value as 'javascript' | 'python' | 'cpp')}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
          <select
            value={selectedLanguageId}
            onChange={(event) => onLanguageIdChange(event.target.value)}
            disabled={languages.length === 0}
            title="DOMjudge language"
          >
            {languages.length === 0 ? <option value="">No API languages</option> : null}
            {languages.map((language) => (
              <option key={language.id} value={language.id}>
                {language.id} - {language.name}
              </option>
            ))}
          </select>
          <button type="button" className="filter-button" onClick={onRunLocal}>
            Run Local
          </button>
          <button type="button" className="filter-button submit-button" onClick={onSubmit}>
            Submit
          </button>
        </div>
      </header>
      <textarea className="code-editor" value={activeEditorCode} onChange={(event) => onCodeChange(event.target.value)} spellCheck={false} />
      <div className={`submit-status submit-status-${submitStatus}`}>{submitMessage}</div>
    </section>
  )
}

interface ContestViewProps {
  selectedProblemId: string | null
  onProblemSelect: (id: string) => void
  problems: ContestProblem[]
  problemStats: Map<string, { solved: number; attempts: number; pending: number }>
  selectedStatementUrl: string | null
  editorLanguage: 'javascript' | 'python' | 'cpp'
  onLanguageChange: (language: 'javascript' | 'python' | 'cpp') => void
  activeEditorCode: string
  onCodeChange: (code: string) => void
  selectedLanguageId: string
  onLanguageIdChange: (id: string) => void
  languages: Language[]
  onRunLocal: () => void
  onSubmit: () => void
  submitMessage: string
  submitStatus: 'idle' | 'ok' | 'error'
  onOpenWorkspace: () => void
}

export function ContestView({
  selectedProblemId,
  onProblemSelect,
  problems,
  problemStats,
  selectedStatementUrl,
  editorLanguage,
  onLanguageChange,
  activeEditorCode,
  onCodeChange,
  selectedLanguageId,
  onLanguageIdChange,
  languages,
  onRunLocal,
  onSubmit,
  submitMessage,
  submitStatus,
  onOpenWorkspace,
}: ContestViewProps) {
  const selectedProblem = problems.find((p) => p.id === selectedProblemId)

  return (
    <main className="contest-layout">
      <aside className="panel problem-list-panel">
        <header className="panel-header">
          <h2>Problems</h2>
        </header>
        <div className="problem-list">
          {problems.map((problem) => {
            const stats = problemStats.get(problem.id)
            const isActive = selectedProblemId === problem.id

            return (
              <button
                key={problem.id}
                type="button"
                className={`problem-item ${isActive ? 'problem-item-active' : ''}`}
                onClick={() => onProblemSelect(problem.id)}
              >
                <strong>
                  {problem.label}. {problem.name}
                </strong>
                <span>
                  Solved: {stats?.solved ?? 0} | Attempts: {stats?.attempts ?? 0}
                </span>
              </button>
            )
          })}
        </div>
      </aside>

      <section className="panel problem-detail-panel">
        <header className="panel-header">
          <h2>{selectedProblem ? `${selectedProblem.label}. ${selectedProblem.name}` : 'Select a problem'}</h2>
          <button type="button" className="filter-button" onClick={onOpenWorkspace}>
            Open Full Workspace
          </button>
        </header>
        {selectedProblem ? (
          <div className="problem-split-layout">
            <article className="problem-statement-pane">
              <div className="problem-meta">
                <p>
                  <strong>Problem ID:</strong> {selectedProblem.id}
                </p>
                <p>
                  <strong>Time limit:</strong> {selectedProblem.time_limit ?? 'N/A'} sec
                </p>
              </div>
              {selectedStatementUrl ? (
                <iframe
                  className="statement-frame"
                  src={selectedStatementUrl}
                  title={`Statement ${selectedProblem.label}`}
                />
              ) : (
                <div className="problem-detail-body muted">
                  <p>No embeddable statement URL available from API.</p>
                  <p>Use Workspace page for bigger coding space while problem statements are unavailable.</p>
                </div>
              )}
            </article>

            <article className="problem-editor-pane">
              <EditorPane
                mode="contest"
                editorLanguage={editorLanguage}
                onLanguageChange={onLanguageChange}
                activeEditorCode={activeEditorCode}
                onCodeChange={onCodeChange}
                selectedLanguageId={selectedLanguageId}
                onLanguageIdChange={onLanguageIdChange}
                languages={languages}
                onRunLocal={onRunLocal}
                onSubmit={onSubmit}
                submitMessage={submitMessage}
                submitStatus={submitStatus}
              />
            </article>
          </div>
        ) : (
          <div className="problem-detail-body muted">No problem available.</div>
        )}
      </section>
    </main>
  )
}
