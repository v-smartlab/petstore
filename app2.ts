// app.ts
import { PrismaClient } from '@prisma/client';
import { ZenStackMiddleware } from '@zenstackhq/server/express';
import express from 'express';
import dotenv from 'dotenv';
import { withPresets } from '@zenstackhq/runtime';
import jwt from 'jsonwebtoken';
import { compareSync } from 'bcryptjs';

const app = express();
app.use(express.json());

const prisma = new PrismaClient();
//app.use('/api', ZenStackMiddleware({ getPrisma: () => prisma }));
app.use('/api', ZenStackMiddleware({ getPrisma: () => withPresets(prisma) }));

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findFirst({
        where: { email },
    });
    if (!user || !compareSync(password, user.password)) {
        res.status(401).json({ error: 'Invalid credentials' });
    } else {
        // sign a JWT token and return it in the response
        const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!);
        res.json({ id: user.id, email: user.email, token });
    }
});

app.listen(3000, () => console.log('Server ready at: http://localhost:3000'));
