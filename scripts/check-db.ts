import { prisma, isDatabaseConfigured, checkDatabaseHealth } from '../src/lib/prisma';
import { authDb } from '../src/lib/server/auth-db';

async function main() {
  console.log('isDatabaseConfigured (PostgreSQL):', isDatabaseConfigured());
  let dbConnected = false;
  try {
    const health = await checkDatabaseHealth();
    if (health.healthy) {
      dbConnected = true;
      console.log(`PostgreSQL connection SUCCESSFUL (Latency: ${health.latencyMs}ms).`);
      const usersInPostgres = await prisma.user.findMany();
      console.log(`Found ${usersInPostgres.length} users in PostgreSQL:`);
      for (const u of usersInPostgres) {
        console.log(`- Email: ${u.email}, Role: ${u.role}, Verified: ${u.isEmailVerified}`);
      }
    } else {
      console.log('PostgreSQL connection check reported unhealthy:', health.error);
    }
  } catch (err: any) {
    console.log('PostgreSQL connection FAILED:', err.message);
  }

  console.log('\nChecking authDb.getAllUsers():');
  const allUsers = await authDb.getAllUsers();
  console.log(`authDb reports ${allUsers.length} total users:`);
  for (const u of allUsers) {
    console.log(`- Email: ${u.email}, Role: ${u.role}, Verified: ${u.isEmailVerified}`);
  }

  if (dbConnected) {
    await prisma.$disconnect();
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
