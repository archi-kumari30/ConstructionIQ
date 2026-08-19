import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'node:dns';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

import User from '../../models/User.js';
import Project from '../../models/Project.js';
import ProjectTeam from '../../models/ProjectTeam.js';
import Material from '../../models/Material.js';
import MaterialInventory from '../../models/MaterialInventory.js';

const seedProject = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/constructioniq';
    if (mongoUri.startsWith('mongodb+srv://')) {
      dns.setServers(['1.1.1.1', '8.8.8.8']);
    }
    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    // 1. Find PM User
    const pm = await User.findOne({ email: 'pm@constructioniq.com' });
    if (!pm) {
      throw new Error('PM User pm@constructioniq.com not found. Run npm run seed first.');
    }
    console.log('Found PM User:', pm._id);

    // 2. Create or Update Project 6a806e331a4ab04ab9781835
    const projectId = '6a806e331a4ab04ab9781835';
    await Project.deleteOne({ _id: projectId });
    
    const demoProject = new Project({
      _id: projectId,
      name: 'ConstructionIQ Demo Project',
      description: 'Central commercial tower highrise development in Ahmedabad, Gujarat.',
      location: 'Ahmedabad, Gujarat',
      coordinates: { latitude: 23.0225, longitude: 72.5714 },
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      status: 'active',
      budgetEstimated: 1500000,
      managerId: pm._id
    });
    await demoProject.save();
    console.log('✓ Seeded ConstructionIQ Demo Project');

    // 3. Clear and seed Project Team assignment
    await ProjectTeam.deleteMany({ projectId });
    
    // Assign PM
    const pmMember = new ProjectTeam({
      projectId,
      userId: pm._id,
      roleOnProject: 'manager'
    });
    await pmMember.save();

    // Assign Site Engineer
    const engineer = await User.findOne({ email: 'engineer@constructioniq.com' });
    if (engineer) {
      const engMember = new ProjectTeam({
        projectId,
        userId: engineer._id,
        roleOnProject: 'site_engineer'
      });
      await engMember.save();
      console.log('✓ Added Site Engineer to team');
    }

    // Assign Contractor
    const contractor = await User.findOne({ email: 'contractor@constructioniq.com' });
    if (contractor) {
      const conMember = new ProjectTeam({
        projectId,
        userId: contractor._id,
        roleOnProject: 'contractor'
      });
      await conMember.save();
      console.log('✓ Added Contractor to team');
    }

    // Assign Supplier
    const supplier = await User.findOne({ email: 'supplier@constructioniq.com' });
    if (supplier) {
      const supMember = new ProjectTeam({
        projectId,
        userId: supplier._id,
        roleOnProject: 'supplier'
      });
      await supMember.save();
      console.log('✓ Added Supplier to team');
    }

    // 4. Seed Inventory associated with this project
    await MaterialInventory.deleteMany({ projectId });
    const materials = await Material.find({});
    if (materials.length > 0) {
      const inventoryDocs = materials.slice(0, 12).map((mat, idx) => ({
        projectId,
        materialId: mat._id,
        quantityAvailable: idx % 2 === 0 ? 5 : 80,
        lowStockThreshold: 10,
        warehouseLocation: `Warehouse Bay ${idx + 1}`
      }));
      await MaterialInventory.insertMany(inventoryDocs);
      console.log(`✓ Seeded ${inventoryDocs.length} material inventory logs for the project`);
    }

    console.log('=== PROJECT SEEDING COMPLETED SUCCESSFULLY ===');
    process.exit(0);
  } catch (error) {
    console.error('Project seeding failed:', error.message);
    process.exit(1);
  }
};

seedProject();
