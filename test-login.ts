import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testLogin() {
    const user = await prisma.user.findUnique({
        where: { email: 'admin@example.com' },
    });

    console.log('User found:', !!user);

    if (user) {
        console.log('Email:', user.email);
        console.log('Has password:', !!user.passwordHash);
        console.log('Provider:', user.provider);
        console.log('Role:', user.role);

        if (user.passwordHash) {
            const isValid = await bcrypt.compare('123456', user.passwordHash);
            console.log('Password "123456" is valid:', isValid);
        }
    }

    await prisma.$disconnect();
}

testLogin().catch(console.error);
