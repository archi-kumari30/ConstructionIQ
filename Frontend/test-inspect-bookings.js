import mongoose from 'mongoose';
import dns from 'node:dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const inspect = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (mongoUri.startsWith('mongodb+srv://')) {
      dns.setServers(['1.1.1.1', '8.8.8.8']);
    }
    await mongoose.connect(mongoUri);

    const Equipment = mongoose.model('Equipment', new mongoose.Schema({}, { strict: false }));
    const EquipmentBooking = mongoose.model('EquipmentBooking', new mongoose.Schema({}, { strict: false }));

    const equipmentList = await Equipment.find().lean();
    console.log('--- ALL EQUIPMENT ---');
    equipmentList.forEach(e => {
      console.log(`ID: ${e._id}, Name: ${e.name}, Status: ${e.status}, isDeleted: ${e.isDeleted}`);
    });

    const bookingsList = await EquipmentBooking.find().lean();
    console.log('\n--- ALL BOOKINGS ---');
    bookingsList.forEach(b => {
      console.log(`ID: ${b._id}, EquipmentId: ${b.equipmentId}, Status: ${b.status}, StartTime: ${b.startTime}, EndTime: ${b.endTime}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Inspection failed:', err.message);
    process.exit(1);
  }
};

inspect();
