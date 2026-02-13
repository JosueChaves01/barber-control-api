import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Create SuperAdmin
    const superAdminEmail = 'superadmin@example.com';
    const existingSuperAdmin = await prisma.user.findUnique({
        where: { email: superAdminEmail },
    });

    if (!existingSuperAdmin) {
        const passwordHash = await bcrypt.hash('123456', 10);
        await prisma.user.create({
            data: {
                email: superAdminEmail,
                passwordHash,
                provider: 'LOCAL',
                role: 'SUPERADMIN',
                firstName: 'Support',
                lastName: 'Admin',
                phone: '1234567890',
            },
        });
        console.log('✅ Created SuperAdmin user: superadmin@example.com / 123456');
    } else {
        console.log('ℹ️ SuperAdmin already exists');
    }

    // Create Admin with Organization
    const adminEmail = 'admin@example.com';
    let admin = await prisma.user.findUnique({
        where: { email: adminEmail },
        include: { organization: true },
    });

    if (!admin) {
        const passwordHash = await bcrypt.hash('123456', 10);
        admin = await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                provider: 'LOCAL',
                role: 'ADMIN',
                firstName: 'Josue',
                lastName: 'Barber',
                phone: '1234567891',
            },
            include: { organization: true },
        });
        console.log('✅ Created Admin user: admin@example.com / 123456');
    } else {
        console.log('ℹ️ Admin user already exists');
    }

    // Create Organization for Admin if not exists
    if (!admin.organization) {
        await prisma.organization.create({
            data: {
                name: 'Peluquería Josue',
                address: 'Calle Principal 123',
                phone: '555-1234',
                email: 'contacto@peluqueriajosue.com',
                adminId: admin.id,
            },
        });
        console.log('✅ Created Organization: Peluquería Josue');
    } else {
        console.log('ℹ️ Organization already exists');
    }

    console.log('🌱 Seed finished');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
