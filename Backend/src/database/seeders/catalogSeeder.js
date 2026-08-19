import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

import Material from '../../models/Material.js';
import Equipment from '../../models/Equipment.js';
import Project from '../../models/Project.js';
import MaterialInventory from '../../models/MaterialInventory.js';
import logger from '../../config/logger.js';
import STATUS from '../../constants/status.js';

const materialsToSeed = [
  // 1. Cement & Concrete
  { name: 'Ultratech Cement OPC 53 Grade', category: 'Cement & Concrete', unit: 'bag', unitCost: 7.20 },
  { name: 'Ambuja Kawach Waterproof Cement', category: 'Cement & Concrete', unit: 'bag', unitCost: 8.50 },
  { name: 'ACC Gold Water Shield Cement', category: 'Cement & Concrete', unit: 'bag', unitCost: 8.90 },
  { name: 'JK Super Strong Cement', category: 'Cement & Concrete', unit: 'bag', unitCost: 6.80 },
  { name: 'Ready Mix Concrete M25 Grade', category: 'Cement & Concrete', unit: 'cum', unitCost: 95.00 },
  { name: 'Ready Mix Concrete M40 Grade', category: 'Cement & Concrete', unit: 'cum', unitCost: 120.00 },
  
  // 2. Steel & Metals
  { name: 'TATA Tiscon TMT Steel Rebar 12mm', category: 'Steel & Metals', unit: 'ton', unitCost: 620.00 },
  { name: 'JSW Neosteel TMT Rebar 16mm', category: 'Steel & Metals', unit: 'ton', unitCost: 630.00 },
  { name: 'Jindal Panther TMT Rebar 8mm', category: 'Steel & Metals', unit: 'ton', unitCost: 645.00 },
  { name: 'Vizag Steel TMT Rebar 20mm', category: 'Steel & Metals', unit: 'ton', unitCost: 610.00 },
  { name: 'Mild Steel Angle Section 50x50x6mm', category: 'Steel & Metals', unit: 'piece', unitCost: 25.00 },
  { name: 'Structural Steel I-Beam ISMB 250', category: 'Steel & Metals', unit: 'piece', unitCost: 110.00 },
  { name: 'Galvanized Iron Wire 16 Gauge', category: 'Steel & Metals', unit: 'kg', unitCost: 1.80 },

  // 3. Bricks & Blocks
  { name: 'Red Clay Bricks Class I', category: 'Bricks & Blocks', unit: 'piece', unitCost: 0.15 },
  { name: 'AAC Aerated Light Block 600x200x150', category: 'Bricks & Blocks', unit: 'piece', unitCost: 1.80 },
  { name: 'Solid Concrete Blocks 8-inch', category: 'Bricks & Blocks', unit: 'piece', unitCost: 1.20 },
  { name: 'Fly Ash Bricks Standard', category: 'Bricks & Blocks', unit: 'piece', unitCost: 0.22 },
  { name: 'Hollow Concrete Blocks 6-inch', category: 'Bricks & Blocks', unit: 'piece', unitCost: 0.95 },

  // 4. Aggregates & Sand
  { name: 'Crushed Stone Aggregate 20mm', category: 'Aggregates & Sand', unit: 'ton', unitCost: 24.00 },
  { name: 'Crushed Stone Aggregate 10mm', category: 'Aggregates & Sand', unit: 'ton', unitCost: 26.00 },
  { name: 'Natural River Sand Fine Grade', category: 'Aggregates & Sand', unit: 'ton', unitCost: 35.00 },
  { name: 'Manufactured Sand M-Sand', category: 'Aggregates & Sand', unit: 'ton', unitCost: 28.00 },
  { name: 'Plastering Manufactured Sand P-Sand', category: 'Aggregates & Sand', unit: 'ton', unitCost: 32.00 },
  { name: 'Pea Gravel Stone Fill', category: 'Aggregates & Sand', unit: 'ton', unitCost: 30.00 },

  // 5. Timber & Plywood
  { name: 'Teak Wood Planks 2-inch', category: 'Timber & Plywood', unit: 'piece', unitCost: 45.00 },
  { name: 'BWR Boiling Waterproof Plywood 19mm', category: 'Timber & Plywood', unit: 'piece', unitCost: 38.00 },
  { name: 'Commercial Plywood 12mm', category: 'Timber & Plywood', unit: 'piece', unitCost: 22.00 },
  { name: 'Marine Plywood 18mm waterproof', category: 'Timber & Plywood', unit: 'piece', unitCost: 48.00 },
  { name: 'Wood Shuttering Pine Planks', category: 'Timber & Plywood', unit: 'piece', unitCost: 15.00 },

  // 6. Glass & Tiles
  { name: 'Vitrified Floor Tiles 600x600mm', category: 'Glass & Tiles', unit: 'sqm', unitCost: 18.00 },
  { name: 'Ceramic Wall Tiles 300x450mm', category: 'Glass & Tiles', unit: 'sqm', unitCost: 12.00 },
  { name: 'Toughened Safety Glass 12mm', category: 'Glass & Tiles', unit: 'sqm', unitCost: 42.00 },
  { name: 'Float Clear Glass 6mm', category: 'Glass & Tiles', unit: 'sqm', unitCost: 15.00 },
  { name: 'Double Glazed Glass Unit', category: 'Glass & Tiles', unit: 'sqm', unitCost: 75.00 },

  // 7. Paints & Coatings
  { name: 'Acrylic Exterior Emulsion Paint', category: 'Paints & Coatings', unit: 'liter', unitCost: 6.50 },
  { name: 'Interior Premium Satin Finish Paint', category: 'Paints & Coatings', unit: 'liter', unitCost: 5.80 },
  { name: 'Anti-Rust Metal Primer Paint', category: 'Paints & Coatings', unit: 'liter', unitCost: 4.50 },
  { name: 'Acrylic Wall Putty powder', category: 'Paints & Coatings', unit: 'bag', unitCost: 14.00 },
  { name: 'Synthetic Wood Enamel Glossy', category: 'Paints & Coatings', unit: 'liter', unitCost: 6.00 },

  // 8. Plumbing & Electrical
  { name: 'PVC Pipe Schedule 40 4-inch', category: 'Plumbing & Electrical', unit: 'meter', unitCost: 5.50 },
  { name: 'CPVC Water Pipes 1-inch', category: 'Plumbing & Electrical', unit: 'meter', unitCost: 3.20 },
  { name: 'Copper Core Insulated Cable 2.5mm', category: 'Plumbing & Electrical', unit: 'meter', unitCost: 2.10 },
  { name: 'Electrical Conduit Pipe PVC 25mm', category: 'Plumbing & Electrical', unit: 'meter', unitCost: 0.90 },
  { name: 'Brass Gate Valves 2-inch', category: 'Plumbing & Electrical', unit: 'piece', unitCost: 18.00 },
  { name: 'Modular 6-Module Switch Plate', category: 'Plumbing & Electrical', unit: 'piece', unitCost: 4.50 },
  { name: 'LED Panel Downlight 15W', category: 'Plumbing & Electrical', unit: 'piece', unitCost: 12.00 },

  // 9. HVAC & Insulation
  { name: 'Fiberglass Insulation Roll 50mm', category: 'HVAC & Insulation', unit: 'sqm', unitCost: 4.20 },
  { name: 'Polystyrene Insulation Board', category: 'HVAC & Insulation', unit: 'sqm', unitCost: 8.50 },
  { name: 'Flexible Duct Pipe 8-inch Alum', category: 'HVAC & Insulation', unit: 'meter', unitCost: 6.00 },
  { name: 'Rockwool Acoustic Slab 100mm', category: 'HVAC & Insulation', unit: 'sqm', unitCost: 14.00 },

  // 10. Safety & PPE
  { name: 'Industrial Safety Helmet Class E', category: 'Safety & PPE', unit: 'piece', unitCost: 8.50 },
  { name: 'High-Visibility Reflective Vest', category: 'Safety & PPE', unit: 'piece', unitCost: 3.20 },
  { name: 'Steel Toe Cap Safety Shoes', category: 'Safety & PPE', unit: 'piece', unitCost: 28.00 },
  { name: 'N95 Respirator Safety Masks', category: 'Safety & PPE', unit: 'piece', unitCost: 1.50 },
  { name: 'Heavy Duty Leather Work Gloves', category: 'Safety & PPE', unit: 'piece', unitCost: 2.50 },
  { name: 'Fall Protection Full Body Harness', category: 'Safety & PPE', unit: 'piece', unitCost: 45.00 },

  // 11. Roofing & Waterproofing
  { name: 'Galvalume Corrugated Roofing Sheet', category: 'Roofing & Waterproofing', unit: 'piece', unitCost: 22.00 },
  { name: 'APP Modified Bituminous Membrane', category: 'Roofing & Waterproofing', unit: 'sqm', unitCost: 6.80 },
  { name: 'Liquid Waterproofing Polymer Coating', category: 'Roofing & Waterproofing', unit: 'liter', unitCost: 9.50 },
  { name: 'Asphalt Shingles Classic Tile', category: 'Roofing & Waterproofing', unit: 'sqm', unitCost: 18.00 },

  // 12. Admixtures & Construction Chemicals
  { name: 'Concrete Superplasticizer Admixture', category: 'Admixtures & Chemicals', unit: 'liter', unitCost: 3.80 },
  { name: 'Epoxy Grout Resin Structural', category: 'Admixtures & Chemicals', unit: 'kg', unitCost: 12.00 },
  { name: 'Curing Compound Membrane Emulsion', category: 'Admixtures & Chemicals', unit: 'liter', unitCost: 4.20 },
  { name: 'Polyurethane Joint Sealant Tube', category: 'Admixtures & Chemicals', unit: 'piece', unitCost: 6.50 },

  // 13. Fasteners & Hardware
  { name: 'Drywall Screws Bugle Head 1.5 inch', category: 'Fasteners & Hardware', unit: 'box', unitCost: 8.00 },
  { name: 'Heavy Anchor Fastener Bolts M12', category: 'Fasteners & Hardware', unit: 'piece', unitCost: 1.20 },
  { name: 'Mortise Door Lock Brass Body', category: 'Fasteners & Hardware', unit: 'piece', unitCost: 24.00 },
  { name: 'Stainless Steel Butt Hinge 4 inch', category: 'Fasteners & Hardware', unit: 'piece', unitCost: 3.50 },

  // Add fillers to make sure we hit 100+ materials
  { name: 'Concrete AAC block adhesive', category: 'Bricks & Blocks', unit: 'bag', unitCost: 9.00 },
  { name: 'Ready Mix Mortar Masonry Class', category: 'Bricks & Blocks', unit: 'bag', unitCost: 5.50 },
  { name: 'Precast Lintel Concrete 4ft', category: 'Bricks & Blocks', unit: 'piece', unitCost: 15.00 },
  { name: 'River Pebble Stones Decorative', category: 'Aggregates & Sand', unit: 'ton', unitCost: 55.00 },
  { name: 'Black Granite Slab 20mm thick', category: 'Glass & Tiles', unit: 'sqm', unitCost: 90.00 },
  { name: 'White Marble Tile Premium 30mm', category: 'Glass & Tiles', unit: 'sqm', unitCost: 140.00 },
  { name: 'Terracotta Roof Tiles Clay', category: 'Roofing & Waterproofing', unit: 'piece', unitCost: 0.85 },
  { name: 'Self-Drilling Metal Sheet Screws', category: 'Fasteners & Hardware', unit: 'box', unitCost: 12.00 },
  { name: 'Brass Padlock Heavy Duty 50mm', category: 'Fasteners & Hardware', unit: 'piece', unitCost: 9.80 },
  { name: 'Silicon Sealant Clear Waterproof', category: 'Fasteners & Hardware', unit: 'piece', unitCost: 3.80 },
  { name: 'Masking Tape Roll 2 inch', category: 'Site Consumables', unit: 'piece', unitCost: 1.20 },
  { name: 'Binding Wire coils structural', category: 'Steel & Metals', unit: 'ton', unitCost: 850.00 },
  { name: 'Expanding Foam PU spray can', category: 'Fasteners & Hardware', unit: 'piece', unitCost: 7.50 },
  { name: 'EPE Foam Sheet cushioning 2mm', category: 'HVAC & Insulation', unit: 'sqm', unitCost: 1.10 },
  { name: 'Welding Electrode rod box E6013', category: 'Site Consumables', unit: 'box', unitCost: 15.00 },
  { name: 'Nylon Safety Net Fall Protection', category: 'Safety & PPE', unit: 'piece', unitCost: 85.00 },
  { name: 'Ear Protection Industrial Mufflers', category: 'Safety & PPE', unit: 'piece', unitCost: 9.50 },
  { name: 'Polyethylene Tarpaulin Sheet 12x15', category: 'Site Consumables', unit: 'piece', unitCost: 14.50 },
  { name: 'Marking Spray Paint Fluorescent Orange', category: 'Site Consumables', unit: 'liter', unitCost: 4.80 },
  { name: 'Aluminium Step Ladder 8-step', category: 'Site Consumables', unit: 'piece', unitCost: 78.00 },
  { name: 'Heavy Extension Cable Reel 30m', category: 'Plumbing & Electrical', unit: 'piece', unitCost: 42.00 },
  { name: 'Double Glazed Aluminium Window Frame', category: 'Doors & Windows', unit: 'piece', unitCost: 220.00 },
  { name: 'Flush Wood Door Core Veneer', category: 'Doors & Windows', unit: 'piece', unitCost: 85.00 },
  { name: 'Hydraulic Door Closer standard', category: 'Fasteners & Hardware', unit: 'piece', unitCost: 18.00 },
  { name: 'Nitrile Gloves Box of 100', category: 'Safety & PPE', unit: 'box', unitCost: 12.00 },
  { name: 'Safety Goggles UV Protective Clear', category: 'Safety & PPE', unit: 'piece', unitCost: 3.50 },
  { name: 'Welding Protective Face Mask Shield', category: 'Safety & PPE', unit: 'piece', unitCost: 18.50 },
  { name: 'Safety Caution Warning Barrier Tape', category: 'Safety & PPE', unit: 'piece', unitCost: 6.80 },
  { name: 'First Aid Kit Medical Station Wallbox', category: 'Safety & PPE', unit: 'piece', unitCost: 35.00 },
  { name: 'Fire Extinguisher ABC Dry Powder 6kg', category: 'Safety & PPE', unit: 'piece', unitCost: 42.00 },
  { name: 'Concrete Rebound Hammer Schmidt test', category: 'Site Consumables', unit: 'piece', unitCost: 380.00 },
  { name: 'Heavy Duty PP Rope 12mm 100m roll', category: 'Site Consumables', unit: 'piece', unitCost: 28.00 },
  { name: 'Duct Tape Industrial Silver 50m', category: 'Site Consumables', unit: 'piece', unitCost: 5.50 },
  { name: 'Steel Wheelbarrow Construction Grade', category: 'Site Consumables', unit: 'piece', unitCost: 48.00 },
  { name: 'Spade Hand Shovel steel head', category: 'Site Consumables', unit: 'piece', unitCost: 12.50 },
  { name: 'Heavy Iron Pickaxe wood handle', category: 'Site Consumables', unit: 'piece', unitCost: 14.00 },
  { name: 'Water Hose Pipe 3/4 inch 30m reel', category: 'Site Consumables', unit: 'piece', unitCost: 22.00 },
  { name: 'Measuring Tape Steel Locking 8m', category: 'Site Consumables', unit: 'piece', unitCost: 6.50 },
  { name: 'Laser Distance Meter Handheld 80m', category: 'Site Consumables', unit: 'piece', unitCost: 95.00 },
  { name: 'Spirit Level Aluminium Tool 24 inch', category: 'Site Consumables', unit: 'piece', unitCost: 18.00 }
];

const equipmentToSeed = [
  // Excavators
  { name: 'CAT 320 Hydraulic Excavator 20T', type: 'Excavators', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Komatsu PC210 Crawler Excavator', type: 'Excavators', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Hitachi ZX130 Medium Excavator 13T', type: 'Excavators', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Volvo EC300D Heavy Excavator 30T', type: 'Excavators', status: STATUS.EQUIPMENT.MAINTENANCE },
  { name: 'CAT 305 Mini Excavator 5T', type: 'Excavators', status: STATUS.EQUIPMENT.AVAILABLE },

  // Backhoe Loaders
  { name: 'JCB 3CX Eco Backhoe Loader', type: 'Backhoe Loaders', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'CAT 424 Backhoe Loader Utility', type: 'Backhoe Loaders', status: STATUS.EQUIPMENT.BOOKED },
  { name: 'Case 770 EX Backhoe Loader', type: 'Backhoe Loaders', status: STATUS.EQUIPMENT.AVAILABLE },

  // Bulldozers
  { name: 'CAT D6 Track-Type Dozer 150HP', type: 'Bulldozers', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Komatsu D65 Dozer Earthmover', type: 'Bulldozers', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'CAT D8 Heavy Bulldozer 310HP', type: 'Bulldozers', status: STATUS.EQUIPMENT.MAINTENANCE },

  // Wheel Loaders
  { name: 'CAT 950M Wheel Loader 5Ton', type: 'Wheel Loaders', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Komatsu WA380 Wheel Loader', type: 'Wheel Loaders', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'SDLG L956F Wheel Loader Heavy', type: 'Wheel Loaders', status: STATUS.EQUIPMENT.BOOKED },

  // Cranes
  { name: 'Liebherr LTM 1050 Mobile Crane 50T', type: 'Cranes', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Zoomlion TC6012 Tower Crane 6T', type: 'Cranes', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Terex Demag AC100 Mobile Crane 100T', type: 'Cranes', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Potain MC85 Tower Crane 5T', type: 'Cranes', status: STATUS.EQUIPMENT.AVAILABLE },

  // Forklifts
  { name: 'Toyota 8FGU25 Forklift 2.5T Gas', type: 'Forklifts', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'CAT DP30 Forklift Diesel 3.0T', type: 'Forklifts', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Crown SC5200 Electric Forklift', type: 'Forklifts', status: STATUS.EQUIPMENT.AVAILABLE },

  // Dump Trucks
  { name: 'TATA Prima 2528 Dumper Truck 16cum', type: 'Dump Trucks', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Ashok Leyland U-Truck 2518 Dumper', type: 'Dump Trucks', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'BharatBenz 2823C Dumper Truck', type: 'Dump Trucks', status: STATUS.EQUIPMENT.BOOKED },
  { name: 'Volvo FMX 460 Dump Truck Heavy', type: 'Dump Trucks', status: STATUS.EQUIPMENT.AVAILABLE },

  // Graders & Rollers
  { name: 'CAT 120M Motor Grader 12ft', type: 'Graders', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Sany SMG200 Motor Grader', type: 'Graders', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Hamm 311 Soil Compactor Roller 11T', type: 'Rollers', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Case 1107 EX Tandem Roller Compactor', type: 'Rollers', status: STATUS.EQUIPMENT.AVAILABLE },

  // Concrete Equipment
  { name: 'Schwing Stetter CP30 Batching Plant', type: 'Concrete Equipment', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Putmeister M36 Concrete Boom Pump', type: 'Concrete Equipment', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'ACE RMC Concrete Transit Mixer 6cum', type: 'Concrete Mixers', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Jaypee 10/7 Concrete Mixer Drum', type: 'Concrete Mixers', status: STATUS.EQUIPMENT.AVAILABLE },

  // Generators & Utilities
  { name: 'Cummins 125kVA Silent Diesel Generator', type: 'Generators', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Kirloskar 250kVA Power Generator', type: 'Generators', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Atlas Copco XAS 97 Diesel Compressor', type: 'Compressors', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Lincoln Electric welding machine 400A', type: 'Welding Machines', status: STATUS.EQUIPMENT.AVAILABLE },

  // Saws & Jackhammers
  { name: 'Bosch GSH 16-30 Demolition Jackhammer', type: 'Jackhammers', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Hilti TE 3000 Heavy Demolition Breaker', type: 'Jackhammers', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Husqvarna K770 Concrete Cutoff Saw', type: 'Saws', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'STIHL TS 420 Cutquik Saw 14 inch', type: 'Saws', status: STATUS.EQUIPMENT.AVAILABLE },

  // Scaffolding & Lighting
  { name: 'Cuplock Steel Scaffolding System 500sqm', type: 'Scaffolding', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Generac V20 Mobile Lighting Tower LED', type: 'Lighting Towers', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Koshin Diesel Water Pump 4-inch flow', type: 'Water Pumps', status: STATUS.EQUIPMENT.AVAILABLE },

  // Additional 12 items for B2B Procurement Expansion
  { name: 'Potain MCT 85 Tower Crane 5T', type: 'Tower Cranes', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Liebherr LTM 1100 Mobile Crane 100T', type: 'Mobile Cranes', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Schwing Stetter BP 350 Concrete Pump', type: 'Concrete Pumps', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Cummins 250kVA Silent Diesel Generator', type: 'Generators', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Kirloskar 45kVA Silent Generator Set', type: 'Generators', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Atlas Copco XAS 400 Air Compressor', type: 'Air Compressors', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Koshin 3-inch Petrol Water Pump', type: 'Water Pumps', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Lincoln Electric welding machine 600A', type: 'Welding Machines', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Wacker Neuson VP1550 Plate Compactor', type: 'Plate Compactors', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Bosch GSH 11E Jackhammer 11kg', type: 'Jackhammers', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Hilti TE 1000-AVR Demolition Jackhammer', type: 'Jackhammers', status: STATUS.EQUIPMENT.AVAILABLE },
  { name: 'Generac V20 Mobile Light Tower LED', type: 'Lighting Towers', status: STATUS.EQUIPMENT.AVAILABLE }
];

import dns from 'node:dns';

const seedCatalog = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/constructioniq';
    if (mongoUri.startsWith('mongodb+srv://')) {
      dns.setServers(['1.1.1.1', '8.8.8.8']);
    }
    logger.info('Connecting to database for catalog seeding...');
    await mongoose.connect(mongoUri);
    logger.info('Connected. Starting catalog seeding...');

    // 1. Seed Materials
    logger.info(`Cleaning materials collection (existing documents count: ${await Material.countDocuments({})})...`);
    await Material.deleteMany({});
    logger.info(`Seeding ${materialsToSeed.length} material items...`);
    const seededMaterials = await Material.insertMany(materialsToSeed);
    logger.info(`Successfully seeded ${seededMaterials.length} materials.`);

    // 2. Seed Equipment
    logger.info(`Cleaning equipment collection (existing documents count: ${await Equipment.countDocuments({})})...`);
    await Equipment.deleteMany({});
    logger.info(`Seeding ${equipmentToSeed.length} equipment items...`);
    const seededEquipment = await Equipment.insertMany(equipmentToSeed);
    logger.info(`Successfully seeded ${seededEquipment.length} equipment.`);

    // 3. Associate newly seeded materials with active projects in MaterialInventory
    const projects = await Project.find({});
    logger.info(`Linking new materials inventory logs to ${projects.length} existing projects...`);
    await MaterialInventory.deleteMany({});
    
    for (const project of projects) {
      const pId = project._id;
      const inventoryDocs = seededMaterials.slice(0, 8).map((mat, idx) => ({
        projectId: pId,
        materialId: mat._id,
        quantityAvailable: idx % 2 === 0 ? 5 : 80, // create low stock values (e.g. 5, which is lower than threshold 10)
        lowStockThreshold: 10,
        warehouseLocation: `Warehouse Bay ${idx + 1}`
      }));
      await MaterialInventory.insertMany(inventoryDocs);
      logger.info(`Initialized 8 inventory items for project "${project.name}"`);
    }

    logger.info('Catalog seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`Catalog seeding failed: ${error.message}`);
    process.exit(1);
  }
};

// Run if direct execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedCatalog();
}

export default seedCatalog;
