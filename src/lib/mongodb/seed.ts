import { connectToDatabase, isMongoConfigured } from '../mongodb';
import {
  UserModel,
  DisasterModel,
  SOSRequestModel,
  ShelterModel,
  SupplyModel,
  ResponderModel,
  DonationModel,
} from '../models';
import {
  initialDisasters,
  initialSOSRequests,
  initialShelters,
  initialSupplies,
  initialResponders,
  initialDonations,
} from '../db';
import { authDb } from '../server/auth-db';

export async function seedMongoIfEmpty(): Promise<boolean> {
  if (!isMongoConfigured()) return false;

  try {
    const conn = await connectToDatabase();
    if (!conn) return false;

    // Check if Disasters exist
    const disasterCount = await DisasterModel.countDocuments();
    if (disasterCount === 0) {
      console.log('[ReliefAI MongoDB] Seeding Bangladesh Disasters...');
      await DisasterModel.insertMany(initialDisasters);
    }

    // Check if Users exist
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('[ReliefAI MongoDB] Seeding Bangladesh RBAC Users...');
      const seedUsers = authDb.getRawUsers();
      await UserModel.insertMany(seedUsers);
    }

    // Check if SOS requests exist
    const sosCount = await SOSRequestModel.countDocuments();
    if (sosCount === 0) {
      console.log('[ReliefAI MongoDB] Seeding Bangladesh SOS Requests...');
      await SOSRequestModel.insertMany(initialSOSRequests);
    }

    // Check if Shelters exist
    const shelterCount = await ShelterModel.countDocuments();
    if (shelterCount === 0) {
      console.log('[ReliefAI MongoDB] Seeding Bangladesh Shelters...');
      await ShelterModel.insertMany(initialShelters);
    }

    // Check if Supplies exist
    const supplyCount = await SupplyModel.countDocuments();
    if (supplyCount === 0) {
      console.log('[ReliefAI MongoDB] Seeding Bangladesh Strategic Stockpiles...');
      await SupplyModel.insertMany(initialSupplies);
    }

    // Check if Responders exist
    const responderCount = await ResponderModel.countDocuments();
    if (responderCount === 0) {
      console.log('[ReliefAI MongoDB] Seeding Bangladesh Rescue Task Forces...');
      await ResponderModel.insertMany(initialResponders);
    }

    // Check if Donations exist
    const donationCount = await DonationModel.countDocuments();
    if (donationCount === 0) {
      console.log('[ReliefAI MongoDB] Seeding Bangladesh Humanitarian Ledger...');
      await DonationModel.insertMany(initialDonations);
    }

    return true;
  } catch (err) {
    console.error('[ReliefAI MongoDB Seeding Error]:', err);
    return false;
  }
}
