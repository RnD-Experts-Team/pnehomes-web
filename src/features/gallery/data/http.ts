// Lightweight HTTP client with JSON + typed errors
export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload?: unknown
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number
}

function isAbortError(e: unknown): boolean {
  // Covers both DOMException AbortError and fetch polyfills that set a name
  return (
    (e instanceof DOMException && e.name === 'AbortError') ||
    (typeof e === 'object' &&
      e !== null &&
      (e as { name?: unknown }).name === 'AbortError')
  )
}

export async function httpGetJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 15000, ...rest } = options
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    console.log(`[httpGetJson] Fetching from: ${url}`)

    const res = await fetch(url, {
      ...rest,
      signal: controller.signal,
      cache: 'no-store',
    })

    console.log(`[httpGetJson] Response status: ${res.status}`)

    const contentType = res.headers.get('content-type') ?? ''
    const isJson = contentType.includes('application/json')
    const body = (isJson ? await res.json() : await res.text()) as unknown

    if (!res.ok) {
      console.error(`[httpGetJson] Request failed with status ${res.status}:`, body)
      throw new HttpError(`GET ${url} failed with ${res.status}`, res.status, body)
    }

    console.log(`[httpGetJson] Successfully fetched data from ${url}`)
    return body as T
  } catch (err: unknown) {
    if (isAbortError(err)) {
      console.error(`[httpGetJson] Request timed out for ${url}`)
      throw new HttpError(`GET ${url} timed out`, 408)
    }
    if (err instanceof HttpError) throw err

    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[httpGetJson] Request failed for ${url}:`, msg)
    throw new HttpError(`GET ${url} failed: ${msg}`, 500)
  } finally {
    clearTimeout(id)
  }
}
