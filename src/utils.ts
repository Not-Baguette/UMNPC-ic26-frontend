import type { AppConfig } from './config'

export function formatClock(value: string | null | undefined, parseDurationToSeconds?: (v: string | null | undefined) => number | null, formatSecondsAsDuration?: (s: number) => string): string {
  if (!value) {
    return '--:--:--'
  }

  const durationSeconds = parseDurationToSeconds?.(value) ?? null
  if (durationSeconds !== null && formatSecondsAsDuration) {
    return formatSecondsAsDuration(durationSeconds)
  }

  const clean = value.split('.')[0]
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(clean)) {
    return clean
  }

  const parsed = new Date(value)
  if (!Number.isNaN(parsed.valueOf())) {
    return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return clean
}

export function parseDurationToSeconds(value: string | null | undefined): number | null {
  if (!value) {
    return null
  }

  const clean = value.split('.')[0]
  const match = clean.match(/^(-?)(\d+):(\d{2})(?::(\d{2}))?$/)
  if (!match) {
    return null
  }

  const sign = match[1] === '-' ? -1 : 1
  const hours = Number(match[2])
  const minutes = Number(match[3])
  const seconds = Number(match[4] ?? '0')

  if ([hours, minutes, seconds].some((part) => Number.isNaN(part))) {
    return null
  }

  return sign * (hours * 3600 + minutes * 60 + seconds)
}

export function formatSecondsAsDuration(totalSeconds: number): string {
  const isNegative = totalSeconds < 0
  const safe = Math.abs(totalSeconds)
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60

  return `${isNegative ? '-' : ''}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function buildApiResourceUrl(config: AppConfig | null, href: string | undefined): string | null {
  if (!config || !href) {
    return null
  }

  if (/^https?:\/\//i.test(href)) {
    return href
  }

  const normalized = href.startsWith('/') ? href : `/${href}`
  return `${config.apiBaseUrl}${normalized}`
}

export async function requestJson<T>(config: AppConfig, path: string, signal: AbortSignal): Promise<T> {
  const timeoutController = new AbortController()
  const onAbort = () => timeoutController.abort()
  signal.addEventListener('abort', onAbort)
  const timeoutId = window.setTimeout(() => {
    timeoutController.abort()
  }, config.requestTimeoutMs)

  try {
    const response = await fetch(`${config.apiBaseUrl}${path}`, {
      signal: timeoutController.signal,
      credentials: config.withCredentials ? 'include' : 'omit',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Request failed for ${path}: ${response.status} ${response.statusText}`)
    }

    return (await response.json()) as T
  } catch (error) {
    if (timeoutController.signal.aborted && !signal.aborted) {
      throw new Error(`Request timeout for ${path} after ${config.requestTimeoutMs}ms`)
    }
    throw error
  } finally {
    signal.removeEventListener('abort', onAbort)
    window.clearTimeout(timeoutId)
  }
}

export const starterCode: Record<'javascript' | 'python' | 'cpp', string> = {
  javascript: `function solve(input) {
  // input: raw stdin as string
  // return: output as string
  const text = input.trim();
  if (!text) return 'No input';
  return text;
}`,
  python: `def solve(inp: str) -> str:
    # input: raw stdin as string
    # return: output string
    text = inp.strip()
    return text if text else "No input"
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // TODO: implement solution
    return 0;
}
`,
}
