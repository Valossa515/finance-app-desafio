import fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const app = fastify()
const prisma = new PrismaClient()

app.register(cors, {
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
})

app.get('/health', async () => {
  return { status: 'ok' }
})

const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email(),
  status: z.boolean().optional(),
})

app.post('/clients', async (request, reply) => {
  try {
    const { name, email, status = true } = clientSchema.parse(request.body)

    const client = await prisma.client.create({
      data: {
        name,
        email,
        status,
      },
    })

    return reply.status(201).send(client)
  } catch (err) {
    console.error('Validation or creation error:', err)

    if (err instanceof z.ZodError) {
      return reply.status(400).send({ message: 'Validation failed', errors: err.errors })
    }

    return reply.status(500).send({ message: 'Internal server error' })
  }
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
  const { id } = z.object({ id: z.string() }).parse(request.params)
  
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
  const { id } = z.object({ id: z.string() }).parse(request.params)
  const numericId = Number(id)
  if (isNaN(numericId)) {
    return reply.status(400).send({ message: 'Invalid client id' })
  }

  const { name, email, status = true } = clientSchema.parse(request.body)

  try {
    const client = await prisma.client.update({
      where: { id: numericId },
      data: {
        name,
        email,
        status,
      },
    })
    return reply.status(200).send(client)
  } catch (error) {
    console.error('Error updating client:', error)
    return reply.status(404).send({ message: 'Client not found' })
  }
})

app.delete('/clients/:id', async (request, reply) => {
  const { id } = z.object({ id: z.string() }).parse(request.params)
  const numericId = Number(id)
  if (isNaN(numericId)) {
    return reply.status(400).send({ message: 'Invalid client id' })
  }

  try {
    await prisma.client.delete({
      where: { id: numericId },
    })
    return reply.status(204).send()
  } catch (error) {
    console.error('Error deleting client:', error)
    return reply.status(404).send({ message: 'Client not found' })
  }
})

const assetSchema = z.object({
  name: z.string(),
  value: z.number(),
  clientId: z.number(),
})

app.get('/clients/:id/assets', async (request, reply) => {
  const { id } = z.object({ id: z.string() }).parse(request.params)
  const numericId = Number(id)

  if (isNaN(numericId)) {
    return reply.status(400).send({ message: 'ID do cliente inválido.' })
  }

  const clientAssets = await prisma.asset.findMany({
    where: { clientId: numericId },
  })

  return clientAssets
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

app.get('/assets', async () => {
    const allAssets = await prisma.asset.findMany({
        include: {
            client: true
        }
    });
    return allAssets;
});

app.get('/assets-static', async () => {
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