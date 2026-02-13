import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
    const users = await prisma.user.findMany({
        include: {
            organization: true,
        },
    });

    console.log('=== USERS IN DATABASE ===');
    users.forEach(user => {
        console.log(`\nUser: ${user.email}`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Organization: ${user.organization?.name || 'None'}`);
        console.log(`  Organization ID: ${user.organization?.id || 'None'}`);
    });

    const organizations = await prisma.organization.findMany();
    console.log('\n=== ORGANIZATIONS IN DATABASE ===');
    organizations.forEach(org => {
        console.log(`\nOrganization: ${org.name}`);
        console.log(`  ID: ${org.id}`);
        console.log(`  Admin ID: ${org.adminId}`);
    });

    await prisma.$disconnect();
}

checkData().catch(console.error);
