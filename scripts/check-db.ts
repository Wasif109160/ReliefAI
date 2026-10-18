import { connectToDatabase, isMongoConfigured } from '../src/lib/mongodb';
import { UserModel } from '../src/lib/models/User';
import { authDb } from '../src/lib/server/auth-db';

async function main() {
  console.log('isMongoConfigured:', isMongoConfigured());
  let mongoConnected = false;
  try {
    const conn = await connectToDatabase();
    if (conn) {
      mongoConnected = true;
      console.log('MongoDB connection SUCCESSFUL.');
      const usersInMongo = await UserModel.find({}).lean();
      console.log(`Found ${usersInMongo.length} users in MongoDB:`);
      for (const u of usersInMongo) {
        console.log(`- Email: ${u.email}, Role: ${u.role}, Verified: ${u.isEmailVerified}`);
      }
    }
  } catch (err: any) {
    console.log('MongoDB connection FAILED or not running:', err.message);
  }

  console.log('\nChecking authDb.getAllUsers():');
  const allUsers = await authDb.getAllUsers();
  console.log(`authDb reports ${allUsers.length} total users:`);
  for (const u of allUsers) {
    console.log(`- Email: ${u.email}, Role: ${u.role}, Verified: ${u.isEmailVerified}`);
  }

  if (mongoConnected) {
    const mongoose = (await import('mongoose')).default;
    await mongoose.disconnect();
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
