import 'reflect-metadata'
import { ExpressAdapter } from '@nestjs/platform-express'
import { NestFactory } from '@nestjs/core'
import type { Handler, HandlerContext, HandlerEvent, HandlerResponse } from '@netlify/functions'
import express from 'express'
import serverless from 'serverless-http'
import { AppModule } from '../../src/server/app.module'

async function createHandler() {
  const server = express()
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  })

  await app.init()
  return serverless(server) as unknown as (
    event: HandlerEvent,
    context: HandlerContext,
  ) => Promise<HandlerResponse>
}

const handlerPromise = createHandler()

export const handler: Handler = async (event, context) => {
  const handle = await handlerPromise
  return handle(event, context)
}
