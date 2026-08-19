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

    const Project = mongoose.model('Project', new mongoose.Schema({}, { strict: false }));
    const p = await Project.findOne({ _id: '6a806e331a4ab04ab9781835' }).lean();
    
    console.log('Project Document from MongoDB:');
    console.log(JSON.stringify(p, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Inspection failed:', err.message);
    process.exit(1);
  }
};

inspect();
