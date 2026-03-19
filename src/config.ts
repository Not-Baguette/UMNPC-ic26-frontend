export type AppConfig = {
  apiBaseUrl: string
  contestId?: string
  withCredentials: boolean
  autoRefreshMs: number
  requestTimeoutMs: number
}

  type RuntimeConfig = {
    apiBaseUrl?: unknown
    contestId?: unknown
    withCredentials?: unknown
    autoRefreshMs?: unknown
    requestTimeoutMs?: unknown
  }

function sanitizeApiBaseUrl(value: string): string {
  const trimmed = value.trim().replace(/\/$/, '')
  if (!trimmed) {
    throw new Error('App config error: apiBaseUrl cannot be empty.')
  }

  if (trimmed.startsWith('/')) {
    return trimmed
  }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    throw new Error('App config error: apiBaseUrl must be a valid URL or a relative path.')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('App config error: apiBaseUrl must use http or https.')
  }

  const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  if (window.location.protocol === 'https:' && url.protocol === 'http:' && !isLocal) {
    throw new Error('App config error: insecure HTTP API is blocked when the frontend is served over HTTPS.')
  }

  return trimmed
}

function parsePositiveNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.floor(value)
  }

  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.floor(parsed)
    }
  }

  return fallback
}

function parseBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true') {
      return true
    }
    if (normalized === 'false') {
      return false
    }
  }

  return fallback
}

function normalizeContestId(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeConfig(source: RuntimeConfig, fallback: AppConfig): AppConfig {
  const sourceContestId = normalizeContestId(source.contestId)

  return {
    apiBaseUrl: sanitizeApiBaseUrl(
      typeof source.apiBaseUrl === 'string' ? source.apiBaseUrl : fallback.apiBaseUrl,
    ),
    contestId: sourceContestId ?? fallback.contestId,
    withCredentials: parseBoolean(source.withCredentials, fallback.withCredentials),
    autoRefreshMs: parsePositiveNumber(source.autoRefreshMs, fallback.autoRefreshMs),
    requestTimeoutMs: parsePositiveNumber(source.requestTimeoutMs, fallback.requestTimeoutMs),
  }
}

function defaultConfigFromEnv(): AppConfig {
  const env = import.meta.env as Record<string, string | undefined>

  return normalizeConfig(
    {
      apiBaseUrl: env.VITE_DOMJUDGE_API_BASE ?? '/api/v4',
      contestId: env.VITE_DOMJUDGE_CONTEST_ID,
      withCredentials: env.VITE_DOMJUDGE_WITH_CREDENTIALS ?? 'true',
      autoRefreshMs: env.VITE_DOMJUDGE_AUTO_REFRESH_MS ?? '15000',
      requestTimeoutMs: env.VITE_DOMJUDGE_REQUEST_TIMEOUT_MS ?? '10000',
    },
    {
      apiBaseUrl: '/api/v4',
      withCredentials: true,
      autoRefreshMs: 15000,
      requestTimeoutMs: 10000,
    },
  )
}

async function loadRuntimeConfig(path: string): Promise<RuntimeConfig | null> {
  const response = await fetch(path, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Failed to load runtime config: ${response.status} ${response.statusText}`)
  }

  const json = (await response.json()) as unknown
  if (!json || typeof json !== 'object') {
    throw new Error('Runtime config file must be a JSON object.')
  }

  return json as RuntimeConfig
}

export async function loadAppConfig(): Promise<AppConfig> {
  const env = import.meta.env as Record<string, string | undefined>
  const configPath = env.VITE_APP_CONFIG_PATH ?? '/app-config.json'
  const fallback = defaultConfigFromEnv()

  const runtime = await loadRuntimeConfig(configPath)
  if (!runtime) {
    return fallback
  }

  return normalizeConfig(runtime, fallback)
}