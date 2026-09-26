import { defineConfig, loadEnv, type Plugin } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'
import viteReact from '@vitejs/plugin-react'
import type { Handler, HandlerContext, HandlerEvent, HandlerResponse } from '@netlify/functions'

function localApi(): Plugin {
  return {
    name: 'local-netlify-api',
    apply: 'serve',
    configureServer(server) {
      let handlerPromise: Promise<Handler> | undefined
      server.middlewares.use(async (request, response, next) => {
        if (!request.url?.startsWith('/api/')) return next()

        try {
          handlerPromise ??= server.ssrLoadModule('/netlify/functions/api.ts').then((module) => (module as { handler: Handler }).handler)
          const handler = await handlerPromise
          const requestUrl = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`)
          const chunks: Buffer[] = []
          for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
          const body = chunks.length ? Buffer.concat(chunks).toString('utf8') : null
          const headers = Object.fromEntries(Object.entries(request.headers).map(([name, value]) => [
            name,
            Array.isArray(value) ? value.join(', ') : value,
          ]))
          const queryValues = new Map<string, string[]>()
          for (const [name, value] of requestUrl.searchParams) {
            queryValues.set(name, [...(queryValues.get(name) ?? []), value])
          }
          const queryStringParameters = Object.fromEntries([...queryValues].map(([name, values]) => [name, values.at(-1)]))
          const multiValueQueryStringParameters = Object.fromEntries(queryValues)
          const event: HandlerEvent = {
            rawUrl: requestUrl.href,
            rawQuery: requestUrl.search.slice(1),
            path: requestUrl.pathname,
            httpMethod: request.method ?? 'GET',
            headers,
            multiValueHeaders: {},
            queryStringParameters: Object.keys(queryStringParameters).length ? queryStringParameters : null,
            multiValueQueryStringParameters: Object.keys(multiValueQueryStringParameters).length ? multiValueQueryStringParameters : null,
            body,
            isBase64Encoded: false,
          }
          const context: HandlerContext = {
            callbackWaitsForEmptyEventLoop: false,
            functionName: 'api',
            functionVersion: 'local',
            invokedFunctionArn: 'local',
            memoryLimitInMB: '1024',
            awsRequestId: crypto.randomUUID(),
            logGroupName: 'local',
            logStreamName: 'local',
            getRemainingTimeInMillis: () => 30_000,
            done() {},
            fail() {},
            succeed() {},
          }
          const result = await handler(event, context) as HandlerResponse
          response.statusCode = result.statusCode
          for (const [name, value] of Object.entries(result.headers ?? {})) response.setHeader(name, String(value))
          for (const [name, values] of Object.entries(result.multiValueHeaders ?? {})) response.setHeader(name, values.map(String))
          response.end(result.isBase64Encoded ? Buffer.from(result.body ?? '', 'base64') : result.body ?? '')
        } catch (error) {
          next(error)
        }
      })
    },
  }
}

export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    const localEnv = loadEnv(mode, process.cwd(), '')
    for (const [name, value] of Object.entries(localEnv)) process.env[name] ??= value
  }

  return {
    plugins: [...(command === 'serve' ? [localApi()] : []), tanstackStart(), ...(command === 'build' ? [netlify()] : []), viteReact()],
  }
})
