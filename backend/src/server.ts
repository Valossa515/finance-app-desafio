import fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const app = fastify()
const prisma = new PrismaClient()

app.register(cors, {
  origin: ['http://localhost:3000'],
})

app.get('/health', async () => {
  return { status: 'ok' }
})

const clientSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  status: z.boolean().optional(),
})

app.post('/clients', async (request, reply) => {
  const { name, email, status } = clientSchema.parse(request.body)
  
  const client = await prisma.client.create({
    data: {
      name,
      email,
      status: status ?? true,
    },
  })
  
  return reply.status(201).send(client)
})

app.get('/clients', async () => {
  const clients = await prisma.client.findMany({
    include: {
      assets: true,
    },
  })
  return clients
})

app.get('/clients/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  
  const client = await prisma.client.findUnique({
    where: { id: Number(id) },
    include: {
      assets: true,
    },
  })
  
  if (!client) {
    return reply.status(404).send({ message: 'Client not found' })
  }
  
  return client
})

app.put('/clients/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const { name, email, status } = clientSchema.parse(request.body)
  
  try {
    const client = await prisma.client.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        status,
      },
    })
    
    return client
  } catch (error) {
    return reply.status(404).send({ message: 'Client not found' })
  }
})

app.delete('/clients/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  
  try {
    await prisma.client.delete({
      where: { id: Number(id) },
    })
    
    return reply.status(204).send()
  } catch (error) {
    return reply.status(404).send({ message: 'Client not found' })
  }
})

const assetSchema = z.object({
  name: z.string(),
  value: z.number(),
  clientId: z.number(),
})

app.post('/assets', async (request, reply) => {
  const { name, value, clientId } = assetSchema.parse(request.body)
  
  const asset = await prisma.asset.create({
    data: {
      name,
      value,
      clientId,
    },
  })
  
  return reply.status(201).send(asset)
})

// List predefined assets (static data)
app.get('/assets', async () => {
  return [
    { name: 'Ação XYZ', value: 150.75 },
    { name: 'Fundo ABC', value: 85.20 },
    { name: 'ETF DEF', value: 120.50 },
    { name: 'Bond GHI', value: 95.30 },
  ]
})

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001
    await app.listen({ port, host: '0.0.0.0' })
    console.log(`Server running on port ${port}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
