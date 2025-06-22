export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

export async function onRequestError(err: unknown, request: { url: string; headers: any }) {
  const { captureException } = await import('@sentry/nextjs')
  
  captureException(err, {
    contexts: {
      request: {
        url: request.url,
        headers: request.headers,
      },
    },
  })
}