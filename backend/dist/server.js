"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const app = (0, fastify_1.default)();
const prisma = new client_1.PrismaClient();
app.register(cors_1.default, {
    origin: ['http://localhost:3000'],
});
app.get('/health', () => __awaiter(void 0, void 0, void 0, function* () {
    return { status: 'ok' };
}));
const clientSchema = zod_1.z.object({
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    status: zod_1.z.boolean().optional(),
});
app.post('/clients', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, status } = clientSchema.parse(request.body);
    const client = yield prisma.client.create({
        data: {
            name,
            email,
            status: status !== null && status !== void 0 ? status : true,
        },
    });
    return reply.status(201).send(client);
}));
app.get('/clients', () => __awaiter(void 0, void 0, void 0, function* () {
    const clients = yield prisma.client.findMany({
        include: {
            assets: true,
        },
    });
    return clients;
}));
app.get('/clients/:id', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    const client = yield prisma.client.findUnique({
        where: { id: Number(id) },
        include: {
            assets: true,
        },
    });
    if (!client) {
        return reply.status(404).send({ message: 'Client not found' });
    }
    return client;
}));
app.put('/clients/:id', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    const { name, email, status } = clientSchema.parse(request.body);
    try {
        const client = yield prisma.client.update({
            where: { id: Number(id) },
            data: {
                name,
                email,
                status,
            },
        });
        return client;
    }
    catch (error) {
        return reply.status(404).send({ message: 'Client not found' });
    }
}));
app.delete('/clients/:id', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    try {
        yield prisma.client.delete({
            where: { id: Number(id) },
        });
        return reply.status(204).send();
    }
    catch (error) {
        return reply.status(404).send({ message: 'Client not found' });
    }
}));
const assetSchema = zod_1.z.object({
    name: zod_1.z.string(),
    value: zod_1.z.number(),
    clientId: zod_1.z.number(),
});
app.post('/assets', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, value, clientId } = assetSchema.parse(request.body);
    const asset = yield prisma.asset.create({
        data: {
            name,
            value,
            clientId,
        },
    });
    return reply.status(201).send(asset);
}));
// List predefined assets (static data)
app.get('/assets', () => __awaiter(void 0, void 0, void 0, function* () {
    return [
        { name: 'Ação XYZ', value: 150.75 },
        { name: 'Fundo ABC', value: 85.20 },
        { name: 'ETF DEF', value: 120.50 },
        { name: 'Bond GHI', value: 95.30 },
    ];
}));
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const port = Number(process.env.PORT) || 3001;
        yield app.listen({ port, host: '0.0.0.0' });
        console.log(`Server running on port ${port}`);
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
});
start();
