import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create admin user if doesn't exist
  const adminEmail = process.env.ADMIN_EMAIL || "admin@wedding-platform.local"
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123456"

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    await prisma.user.create({
      data: {
        email: adminEmail,
        hashedPassword,
        name: "Platform Admin",
        role: "admin",
        // Admin has no tenantId - they access all tenants
      },
    })

    console.log(`Created admin user: ${adminEmail}`)
  } else {
    console.log(`Admin user already exists: ${adminEmail}`)
  }

  // Optionally create a test wedding
  const testSubdomain = "demo"
  const existingTenant = await prisma.tenant.findUnique({
    where: { subdomain: testSubdomain },
  })

  if (!existingTenant) {
    const tenant = await prisma.tenant.create({
      data: {
        subdomain: testSubdomain,
        name: "Demo Wedding",
      },
    })

    await prisma.wedding.create({
      data: {
        tenantId: tenant.id,
        partner1Name: "Alice",
        partner2Name: "Bob",
      },
    })

    const couplePassword = await bcrypt.hash("demo123456", 12)
    await prisma.user.create({
      data: {
        email: "demo@wedding-platform.local",
        hashedPassword: couplePassword,
        name: "Alice & Bob",
        role: "couple",
        tenantId: tenant.id,
      },
    })

    console.log("Created demo wedding: demo.localhost:3000")
    console.log("Demo couple login: demo@wedding-platform.local / demo123456")
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
