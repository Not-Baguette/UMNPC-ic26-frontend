import type { ContestProblem, Language } from './../utils/types'
import { EditorPane } from './ContestView'

interface ProblemsetViewProps {
  selectedProblemId: string | null
  problems: ContestProblem[]
  selectedProblem: ContestProblem | null
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
  stdinValue: string
  onStdinChange: (value: string) => void
  runOutput: string
  runStatus: 'idle' | 'ok' | 'error'
}

export function ProblemsetView({
  selectedProblem,
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
  stdinValue,
  onStdinChange,
  runOutput,
  runStatus,
}: ProblemsetViewProps) {
  return (
    <main className="workspace-layout">
      <EditorPane
        mode="workspace"
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

      <section className="panel io-panel">
        <header className="panel-header">
          <h2>Input / Output</h2>
        </header>
        <div className="io-body">
          <p className="workspace-problem-label">
            Active problem: {selectedProblem ? `${selectedProblem.label}. ${selectedProblem.name}` : 'None selected'}
          </p>
          <label htmlFor="stdin-input">stdin</label>
          <textarea
            id="stdin-input"
            className="io-input"
            value={stdinValue}
            onChange={(event) => onStdinChange(event.target.value)}
            placeholder="Paste sample input here"
          />

          <label htmlFor="stdout-output">output</label>
          <pre id="stdout-output" className={`io-output ${runStatus === 'error' ? 'io-output-error' : ''}`}>
            {runOutput}
          </pre>
        </div>
      </section>
    </main>
  )
}
