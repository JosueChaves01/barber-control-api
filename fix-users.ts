import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUsers() {
    console.log('🔧 Fixing user providers...');

    // Update all users without googleId to have LOCAL provider
    const result = await prisma.user.updateMany({
        where: {
            googleId: null,
        },
        data: {
            provider: 'LOCAL',
        },
    });

    console.log(`✅ Updated ${result.count} users to LOCAL provider`);

    // List all users to verify
    const users = await prisma.user.findMany({
        select: {
            email: true,
            provider: true,
            passwordHash: true,
        },
    });

    console.log('\n📋 Current users:');
    users.forEach(user => {
        console.log(`  - ${user.email}: provider=${user.provider}, hasPassword=${!!user.passwordHash}`);
    });

    await prisma.$disconnect();
}

fixUsers().catch(console.error);
