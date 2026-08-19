// Reusable B2B Construction Catalog Detail Mapping (100+ materials, 50+ equipment, 20+ suppliers)
// This file maps MongoDB document names to extra B2B attributes (SKU, brand, description, tags, suppliers compare table).

export const suppliers = [
  { id: 'sup_1', name: 'Apex Building Supplies', location: 'Vadodara', contact: '+91 98250 11111', rating: 4.8 },
  { id: 'sup_2', name: 'Gujarat Steel Corp', location: 'Ahmedabad', contact: '+91 98250 22222', rating: 4.7 },
  { id: 'sup_3', name: 'Vadodara ReadyMix Co', location: 'Vadodara', contact: '+91 98250 33333', rating: 4.6 },
  { id: 'sup_4', name: 'Western Cement & Aggregates', location: 'Surat', contact: '+91 98250 44444', rating: 4.5 },
  { id: 'sup_5', name: 'National Equipment Rentals', location: 'Vadodara', contact: '+91 98250 55555', rating: 4.9 },
  { id: 'sup_6', name: 'Baroda Machinery Hub', location: 'Vadodara', contact: '+91 98250 66666', rating: 4.4 },
  { id: 'sup_7', name: 'Larsen Construction Tools', location: 'Anand', contact: '+91 98250 77777', rating: 4.7 },
  { id: 'sup_8', name: 'Premier Sand & Stone Corp', location: 'Surat', contact: '+91 98250 88888', rating: 4.3 },
  { id: 'sup_9', name: 'Jindal Steel Distributors', location: 'Ahmedabad', contact: '+91 98250 99999', rating: 4.8 },
  { id: 'sup_10', name: 'JK Cement Trading', location: 'Anand', contact: '+91 98250 10101', rating: 4.5 },
  { id: 'sup_11', name: 'Reliable Timber & Plywood', location: 'Vadodara', contact: '+91 98250 12121', rating: 4.6 },
  { id: 'sup_12', name: 'Glass & Glazing Solutions', location: 'Ahmedabad', contact: '+91 98250 23232', rating: 4.4 },
  { id: 'sup_13', name: 'Supreme Plumbing Fittings', location: 'Surat', contact: '+91 98250 34343', rating: 4.7 },
  { id: 'sup_14', name: 'Havells Electrical Agency', location: 'Vadodara', contact: '+91 98250 45454', rating: 4.9 },
  { id: 'sup_15', name: 'Thermal Insulation Supplies', location: 'Anand', contact: '+91 98250 56565', rating: 4.2 },
  { id: 'sup_16', name: 'Eco Safety Equipment Ltd', location: 'Vadodara', contact: '+91 98250 67676', rating: 4.6 },
  { id: 'sup_17', name: 'Industrial Chemicals & Resins', location: 'Ahmedabad', contact: '+91 98250 78787', rating: 4.5 },
  { id: 'sup_18', name: 'Star Fasteners & Hardware', location: 'Surat', contact: '+91 98250 89898', rating: 4.3 },
  { id: 'sup_19', name: 'Smart Climate HVAC Systems', location: 'Mumbai', contact: '+91 98250 90909', rating: 4.8 },
  { id: 'sup_20', name: 'Royal Tiles & Vitrified', location: 'Morbi', contact: '+91 98250 91919', rating: 4.7 }
];

// Rich material attributes matched by product name
export const materialsDetails = {
  'Ultratech Cement OPC 53 Grade': {
    sku: 'MAT-CEM-001',
    brand: 'Ultratech',
    description: 'High-strength Ordinary Portland Cement (53 Grade) suitable for all RCC structures like slabs, beams, columns, and high-rise commercial structures.',
    tags: ['cement', 'concrete', 'structural', 'opc'],
    suppliers: [
      { supplierId: 'sup_1', price: 7.20, availability: 'In Stock', leadTime: '1 day' },
      { supplierId: 'sup_4', price: 7.40, availability: 'In Stock', leadTime: '2 days' },
      { supplierId: 'sup_10', price: 7.10, availability: 'Limited Stock', leadTime: '3 days' }
    ]
  },
  'Ambuja Kawach Waterproof Cement': {
    sku: 'MAT-CEM-002',
    brand: 'Ambuja',
    description: 'Specially engineered waterproof cement designed with active water-repellent properties, preventing water ingress and dampness in structural masonry.',
    tags: ['cement', 'waterproof', 'masonry', 'structural'],
    suppliers: [
      { supplierId: 'sup_1', price: 8.50, availability: 'In Stock', leadTime: '1 day' },
      { supplierId: 'sup_10', price: 8.35, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'ACC Gold Water Shield Cement': {
    sku: 'MAT-CEM-003',
    brand: 'ACC',
    description: 'Premium water-repellent concrete-grade cement shield. Blocks dampness and capillary action under heavy rainfall situations.',
    tags: ['cement', 'waterproof', 'concrete'],
    suppliers: [
      { supplierId: 'sup_4', price: 8.90, availability: 'In Stock', leadTime: '2 days' },
      { supplierId: 'sup_10', price: 8.70, availability: 'Limited Stock', leadTime: '2 days' }
    ]
  },
  'JK Super Strong Cement': {
    sku: 'MAT-CEM-004',
    brand: 'JK Cement',
    description: 'High durability Portland Pozzolana Cement (PPC). Provides excellent cohesion and resistance to chemical erosion.',
    tags: ['cement', 'ppc', 'cohesive'],
    suppliers: [
      { supplierId: 'sup_1', price: 6.80, availability: 'In Stock', leadTime: '1 day' },
      { supplierId: 'sup_10', price: 6.60, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Ready Mix Concrete M25 Grade': {
    sku: 'MAT-CON-001',
    brand: 'Custom ReadyMix',
    description: 'Freshly mixed M25 concrete batch (1:1:2 mix ratio). Cast in ready mix transit mixer units, delivering 25 MPa compressive strength after 28 days of curing.',
    tags: ['concrete', 'ready mix', 'rmc', 'm25'],
    suppliers: [
      { supplierId: 'sup_3', price: 95.00, availability: 'In Stock', leadTime: 'Same day' },
      { supplierId: 'sup_4', price: 98.00, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Ready Mix Concrete M40 Grade': {
    sku: 'MAT-CON-002',
    brand: 'Custom ReadyMix',
    description: 'High performance M40 concrete mix for heavy-duty columns, shear walls, and foundation rafts. Contains superplasticizer chemical agents.',
    tags: ['concrete', 'ready mix', 'm40', 'high strength'],
    suppliers: [
      { supplierId: 'sup_3', price: 120.00, availability: 'In Stock', leadTime: 'Same day' },
      { supplierId: 'sup_4', price: 124.00, availability: 'Limited Stock', leadTime: '1 day' }
    ]
  },
  'TATA Tiscon TMT Steel Rebar 12mm': {
    sku: 'MAT-STL-001',
    brand: 'TATA Tiscon',
    description: 'Thermo-mechanically treated (TMT) steel reinforcement rebar with 12mm diameter. High yield strength, ductile bendability, and superior corrosion resistance.',
    tags: ['steel', 'rebar', 'reinforcement', 'tmt', '12mm'],
    suppliers: [
      { supplierId: 'sup_2', price: 620.00, availability: 'In Stock', leadTime: '1 day' },
      { supplierId: 'sup_9', price: 615.00, availability: 'Limited Stock', leadTime: '2 days' }
    ]
  },
  'JSW Neosteel TMT Rebar 16mm': {
    sku: 'MAT-STL-002',
    brand: 'JSW',
    description: 'Premium grade Fe 550D TMT reinforcement rebars (16mm). Best suited for bridge decks, tall frameworks, and heavy-duty load paths.',
    tags: ['steel', 'rebar', 'tmt', '16mm'],
    suppliers: [
      { supplierId: 'sup_2', price: 630.00, availability: 'In Stock', leadTime: '2 days' },
      { supplierId: 'sup_9', price: 625.00, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Jindal Panther TMT Rebar 8mm': {
    sku: 'MAT-STL-003',
    brand: 'Jindal Panther',
    description: 'High ductility Fe 500D TMT rebar with 8mm size. Suitable for stirrups, columns ties, and residential partition slabs.',
    tags: ['steel', 'rebar', '8mm', 'stirrup'],
    suppliers: [
      { supplierId: 'sup_9', price: 645.00, availability: 'In Stock', leadTime: '1 day' },
      { supplierId: 'sup_2', price: 650.00, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Vizag Steel TMT Rebar 20mm': {
    sku: 'MAT-STL-004',
    brand: 'Vizag Steel',
    description: 'Structural reinforcement TMT rebar with 20mm diameter. Perfect for heavy load column bases, piers, and deep foundations.',
    tags: ['steel', 'rebar', '20mm', 'heavy structural'],
    suppliers: [
      { supplierId: 'sup_9', price: 610.00, availability: 'In Stock', leadTime: '2 days' },
      { supplierId: 'sup_2', price: 615.00, availability: 'Limited Stock', leadTime: '3 days' }
    ]
  },
  'Mild Steel Angle Section 50x50x6mm': {
    sku: 'MAT-MET-001',
    brand: 'Gujarat Steel',
    description: 'L-shaped hot rolled structural steel angle segment, dimensions 50x50x6mm. Extensively used in truss frames and bracket fittings.',
    tags: ['metal', 'angle section', 'steel angle', 'truss'],
    suppliers: [
      { supplierId: 'sup_2', price: 25.00, availability: 'In Stock', leadTime: '2 days' },
      { supplierId: 'sup_18', price: 26.50, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Structural Steel I-Beam ISMB 250': {
    sku: 'MAT-MET-002',
    brand: 'TATA Steel',
    description: 'Medium weight hot-rolled structural steel I-Beam section (ISMB 250). Provides optimal bending resistance for roofs and frames.',
    tags: ['metal', 'i-beam', 'beam', 'structural steel'],
    suppliers: [
      { supplierId: 'sup_2', price: 110.00, availability: 'Limited Stock', leadTime: '3 days' },
      { supplierId: 'sup_9', price: 108.00, availability: 'Out of Stock', leadTime: '5 days' }
    ]
  },
  'Galvanized Iron Wire 16 Gauge': {
    sku: 'MAT-MET-003',
    brand: 'Star Wires',
    description: 'Galvanized iron (GI) bindings wire (16 Gauge). Used to tie steel rebars tightly at junctions before casting concrete.',
    tags: ['metal', 'binding wire', 'gi wire', 'rebars tie'],
    suppliers: [
      { supplierId: 'sup_2', price: 1.80, availability: 'In Stock', leadTime: '1 day' },
      { supplierId: 'sup_18', price: 1.95, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Red Clay Bricks Class I': {
    sku: 'MAT-BRK-001',
    brand: 'Local Kiln',
    description: 'First class kiln-burnt red clay bricks with smooth faces and sharp corners. Ideal for external and load-bearing walls.',
    tags: ['bricks', 'clay bricks', 'masonry', 'walls'],
    suppliers: [
      { supplierId: 'sup_1', price: 0.15, availability: 'In Stock', leadTime: '2 days' },
      { supplierId: 'sup_8', price: 0.14, availability: 'In Stock', leadTime: '3 days' }
    ]
  },
  'AAC Aerated Light Block 600x200x150': {
    sku: 'MAT-BRK-002',
    brand: 'JK Aeroblocks',
    description: 'Autoclaved Aerated Concrete (AAC) lightweight blocks. Provides acoustic and thermal insulation, fast masonry speed, and light weight load.',
    tags: ['blocks', 'aac blocks', 'lightweight', 'insulation'],
    suppliers: [
      { supplierId: 'sup_1', price: 1.80, availability: 'In Stock', leadTime: '1 day' },
      { supplierId: 'sup_10', price: 1.75, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Solid Concrete Blocks 8-inch': {
    sku: 'MAT-BRK-003',
    brand: 'Gujarat Concrete',
    description: 'Heavy duty solid concrete masonry blocks, 8-inch width. Ideal for exterior compound walls and load path walls.',
    tags: ['blocks', 'concrete blocks', 'solid', 'boundary wall'],
    suppliers: [
      { supplierId: 'sup_4', price: 1.20, availability: 'In Stock', leadTime: '2 days' },
      { supplierId: 'sup_8', price: 1.15, availability: 'Limited Stock', leadTime: '3 days' }
    ]
  },
  'Fly Ash Bricks Standard': {
    sku: 'MAT-BRK-004',
    brand: 'Eco bricks',
    description: 'Standard fly ash bricks made of industrial byproducts. High compressive strength and uniform size parameters.',
    tags: ['bricks', 'fly ash', 'masonry', 'eco-friendly'],
    suppliers: [
      { supplierId: 'sup_8', price: 0.22, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Hollow Concrete Blocks 6-inch': {
    sku: 'MAT-BRK-005',
    brand: 'Vadodara Blocks',
    description: 'Hollow concrete block units for hollow core walls, offering space for internal wiring conduit runs.',
    tags: ['blocks', 'hollow blocks', 'conduits'],
    suppliers: [
      { supplierId: 'sup_1', price: 0.95, availability: 'In Stock', leadTime: '1 day' },
      { supplierId: 'sup_8', price: 0.90, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Crushed Stone Aggregate 20mm': {
    sku: 'MAT-AGG-001',
    brand: 'Baroda Quarry',
    description: '20mm size black granite crushed stone aggregate. Standard aggregate size for columns, beams, and slab concrete mixes.',
    tags: ['aggregates', 'stone', '20mm', 'coarse aggregate'],
    suppliers: [
      { supplierId: 'sup_8', price: 24.00, availability: 'In Stock', leadTime: '1 day' },
      { supplierId: 'sup_4', price: 25.50, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Crushed Stone Aggregate 10mm': {
    sku: 'MAT-AGG-002',
    brand: 'Baroda Quarry',
    description: '10mm graded aggregates for thin structural elements, precast items, and self-compacting concrete mixes.',
    tags: ['aggregates', 'stone', '10mm', 'precast'],
    suppliers: [
      { supplierId: 'sup_8', price: 26.00, availability: 'In Stock', leadTime: '1 day' },
      { supplierId: 'sup_4', price: 27.00, availability: 'Limited Stock', leadTime: '2 days' }
    ]
  },
  'Natural River Sand Fine Grade': {
    sku: 'MAT-SND-001',
    brand: 'River Bed Sourcing',
    description: 'Clean river bed sand for plastering and finish masonry. Screened to remove organic silt and clay aggregates.',
    tags: ['sand', 'river sand', 'plastering', 'masonry mortar'],
    suppliers: [
      { supplierId: 'sup_8', price: 35.00, availability: 'Limited Stock', leadTime: '3 days' }
    ]
  },
  'Manufactured Sand M-Sand': {
    sku: 'MAT-SND-002',
    brand: 'Premier Sand',
    description: 'Crushed stone manufactured sand (M-Sand) for concrete works. Offers zero silt ratio and high structural cohesion.',
    tags: ['sand', 'm-sand', 'concrete sand', 'eco-friendly'],
    suppliers: [
      { supplierId: 'sup_8', price: 28.00, availability: 'In Stock', leadTime: '1 day' },
      { supplierId: 'sup_1', price: 29.50, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Plastering Manufactured Sand P-Sand': {
    sku: 'MAT-SND-003',
    brand: 'Premier Sand',
    description: 'Finely crushed manufactured plastering sand (P-Sand). Ensures smooth plaster walls with no micro-cracking.',
    tags: ['sand', 'p-sand', 'plaster sand'],
    suppliers: [
      { supplierId: 'sup_8', price: 32.00, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Pea Gravel Stone Fill': {
    sku: 'MAT-AGG-003',
    brand: 'Baroda Quarry',
    description: 'Smooth pea gravel size stone aggregates. Ideal for drainage lining, pavement borders, and landscaping details.',
    tags: ['aggregates', 'gravel', 'pea gravel', 'drainage'],
    suppliers: [
      { supplierId: 'sup_8', price: 30.00, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Teak Wood Planks 2-inch': {
    sku: 'MAT-TIM-001',
    brand: 'Reliable Timber',
    description: 'Natural seasoned teak wood timber planks (2-inch thickness). Used for high-end door frames and decorative window frames.',
    tags: ['timber', 'teak wood', 'carpentry', 'door frame'],
    suppliers: [
      { supplierId: 'sup_11', price: 45.00, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'BWR Boiling Waterproof Plywood 19mm': {
    sku: 'MAT-PLY-001',
    brand: 'Century Ply',
    description: '19mm Boiling Water Resistant (BWR) synthetic resin-bonded plywood. Suitable for kitchen cabinets and moist areas.',
    tags: ['plywood', 'bwr', '19mm', 'carpentry'],
    suppliers: [
      { supplierId: 'sup_11', price: 38.00, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Commercial Plywood 12mm': {
    sku: 'MAT-PLY-002',
    brand: 'Reliable Ply',
    description: '12mm standard interior-grade plywood. Suitable for partition frames and backing panels.',
    tags: ['plywood', '12mm', 'interior partition'],
    suppliers: [
      { supplierId: 'sup_11', price: 22.00, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Marine Plywood 18mm waterproof': {
    sku: 'MAT-PLY-003',
    brand: 'Century Ply',
    description: '18mm grade marine plywood bonded with phenol formaldehyde resin. Extremely strong, water repellent, and durable.',
    tags: ['plywood', 'marine ply', '18mm', 'waterproof'],
    suppliers: [
      { supplierId: 'sup_11', price: 48.00, availability: 'Limited Stock', leadTime: '2 days' }
    ]
  },
  'Wood Shuttering Pine Planks': {
    sku: 'MAT-TIM-002',
    brand: 'Reliable Timber',
    description: 'Softwood pine planks for concrete shuttering frameworks. Reusable and economical.',
    tags: ['timber', 'shuttering', 'concrete formwork'],
    suppliers: [
      { supplierId: 'sup_11', price: 15.00, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Vitrified Floor Tiles 600x600mm': {
    sku: 'MAT-TIL-001',
    brand: 'Kajaria',
    description: 'Glossy vitrified porcelain floor tiles, 600x600mm size. Low water absorption, scratch resistant, and clean ivory finish.',
    tags: ['tiles', 'vitrified', 'flooring', 'porcelain'],
    suppliers: [
      { supplierId: 'sup_20', price: 18.00, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Ceramic Wall Tiles 300x450mm': {
    sku: 'MAT-TIL-002',
    brand: 'Kajaria',
    description: 'Digital printed ceramic wall tiles, 300x450mm. Ideal for bathroom and kitchen wall linings.',
    tags: ['tiles', 'ceramic', 'wall tiles'],
    suppliers: [
      { supplierId: 'sup_20', price: 12.00, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Toughened Safety Glass 12mm': {
    sku: 'MAT-GLS-001',
    brand: 'AIS Glass',
    description: '12mm tempered safety glass panel. High thermal stability and impact resistance. Used in glass doors and railings.',
    tags: ['glass', 'toughened', 'safety glass', 'glazing'],
    suppliers: [
      { supplierId: 'sup_12', price: 42.00, availability: 'In Stock', leadTime: '3 days' }
    ]
  },
  'Float Clear Glass 6mm': {
    sku: 'MAT-GLS-002',
    brand: 'AIS Glass',
    description: '6mm clear float glass. Used for standard window panes and partition panels.',
    tags: ['glass', 'float glass', 'window pane'],
    suppliers: [
      { supplierId: 'sup_12', price: 15.00, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Double Glazed Glass Unit': {
    sku: 'MAT-GLS-003',
    brand: 'AIS Glass',
    description: 'DGU unit (6mm clear + 12mm air gap + 6mm low-E glass) for high energy efficiency and thermal insulation.',
    tags: ['glass', 'dgu', 'insulated glass', 'energy saver'],
    suppliers: [
      { supplierId: 'sup_12', price: 75.00, availability: 'Limited Stock', leadTime: '4 days' }
    ]
  },
  'Acrylic Exterior Emulsion Paint': {
    sku: 'MAT-PNT-001',
    brand: 'Asian Paints',
    description: 'High-durability acrylic exterior wall paint. UV-resistant, rain-proof, and washable.',
    tags: ['paint', 'acrylic', 'exterior', 'emulsion'],
    suppliers: [
      { supplierId: 'sup_1', price: 6.50, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Interior Premium Satin Finish Paint': {
    sku: 'MAT-PNT-002',
    brand: 'Asian Paints',
    description: 'Premium interior emulsion paint with a luxurious satin gloss finish. High coverage and scratch resistant.',
    tags: ['paint', 'interior', 'satin finish', 'emulsion'],
    suppliers: [
      { supplierId: 'sup_1', price: 5.80, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Anti-Rust Metal Primer Paint': {
    sku: 'MAT-PNT-003',
    brand: 'Asian Paints',
    description: 'Red oxide metal primer. Forms a protective rust-inhibiting layer on steel and iron structural elements.',
    tags: ['paint', 'metal primer', 'red oxide', 'anti-rust'],
    suppliers: [
      { supplierId: 'sup_1', price: 4.50, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Acrylic Wall Putty powder': {
    sku: 'MAT-PNT-004',
    brand: 'Birla White',
    description: 'White cement-based wall putty powder. Fills pores in plaster to create a smooth surface for painting.',
    tags: ['paint', 'wall putty', 'birla white', 'plaster fill'],
    suppliers: [
      { supplierId: 'sup_1', price: 14.00, availability: 'In Stock', leadTime: '1 day' },
      { supplierId: 'sup_10', price: 13.50, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Synthetic Wood Enamel Glossy': {
    sku: 'MAT-PNT-005',
    brand: 'Asian Paints',
    description: 'High-gloss synthetic enamel paint for wooden and metal trims. Durable and washable coat.',
    tags: ['paint', 'wood enamel', 'glossy paint'],
    suppliers: [
      { supplierId: 'sup_1', price: 6.00, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'PVC Pipe Schedule 40 4-inch': {
    sku: 'MAT-PLM-001',
    brand: 'Supreme Pipes',
    description: '4-inch diameter PVC pipes (Schedule 40). Designed for soil waste, rainwater disposal, and sewer lines.',
    tags: ['plumbing', 'pvc pipe', '4-inch', 'sewerage'],
    suppliers: [
      { supplierId: 'sup_13', price: 5.50, availability: 'In Stock', leadTime: '1 day' },
      { supplierId: 'sup_18', price: 5.80, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'CPVC Water Pipes 1-inch': {
    sku: 'MAT-PLM-002',
    brand: 'Supreme Pipes',
    description: 'Chlorinated PVC (CPVC) hot and cold water transport pipes, 1-inch size. Highly temperature and pressure resistant.',
    tags: ['plumbing', 'cpvc pipe', 'hot water', '1-inch'],
    suppliers: [
      { supplierId: 'sup_13', price: 3.20, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Copper Core Insulated Cable 2.5mm': {
    sku: 'MAT-ELC-001',
    brand: 'Finolex Cables',
    description: 'Multi-strand copper core wire (2.5 sq mm). PVC insulated, flame retardant. Suitable for power plug runs.',
    tags: ['electrical', 'cable', 'wire', 'copper wire', '2.5mm'],
    suppliers: [
      { supplierId: 'sup_14', price: 2.10, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Electrical Conduit Pipe PVC 25mm': {
    sku: 'MAT-ELC-002',
    brand: 'Finolex',
    description: '25mm rigid PVC conduits pipe. FRLS (Flame Retardant Low Smoke) protection. Houses wall wiring.',
    tags: ['electrical', 'conduit', 'pvc conduit', '25mm'],
    suppliers: [
      { supplierId: 'sup_14', price: 0.90, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Brass Gate Valves 2-inch': {
    sku: 'MAT-PLM-003',
    brand: 'Supreme',
    description: '2-inch heavy-duty brass gate valves. Used to regulate plumbing supply lines at header tanks.',
    tags: ['plumbing', 'gate valve', 'brass valve', '2-inch'],
    suppliers: [
      { supplierId: 'sup_13', price: 18.00, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Modular 6-Module Switch Plate': {
    sku: 'MAT-ELC-003',
    brand: 'Havells',
    description: 'Modular switch frame plate (6-module configuration). Clean white polycarbonate construct.',
    tags: ['electrical', 'switch plate', 'modular switch'],
    suppliers: [
      { supplierId: 'sup_14', price: 4.50, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'LED Panel Downlight 15W': {
    sku: 'MAT-ELC-004',
    brand: 'Havells',
    description: '15W slim recessed LED panel light. Warm white light for false ceilings.',
    tags: ['electrical', 'led light', 'downlight', 'panel light'],
    suppliers: [
      { supplierId: 'sup_14', price: 12.00, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Fiberglass Insulation Roll 50mm': {
    sku: 'MAT-INS-001',
    brand: 'Thermal Insulate',
    description: 'Glasswool fiberglass insulation roll (50mm thickness). Excellent thermal barrier for walls and false roofs.',
    tags: ['insulation', 'fiberglass', 'glasswool', 'thermal insulation'],
    suppliers: [
      { supplierId: 'sup_15', price: 4.20, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Polystyrene Insulation Board': {
    sku: 'MAT-INS-002',
    brand: 'Thermal Insulate',
    description: 'Extruded polystyrene (XPS) rigid foam board. Used in under-slab waterproofing and thermal shielding.',
    tags: ['insulation', 'polystyrene', 'xps board', 'under-slab'],
    suppliers: [
      { supplierId: 'sup_15', price: 8.50, availability: 'Limited Stock', leadTime: '3 days' }
    ]
  },
  'Flexible Duct Pipe 8-inch Alum': {
    sku: 'MAT-HVC-001',
    brand: 'HVAC Duct',
    description: '8-inch diameter double-walled flexible aluminium ducting. Connects diffuser terminals to main lines.',
    tags: ['hvac', 'duct pipe', 'flexible duct', '8-inch'],
    suppliers: [
      { supplierId: 'sup_19', price: 6.00, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Rockwool Acoustic Slab 100mm': {
    sku: 'MAT-INS-003',
    brand: 'Thermal Insulate',
    description: '100mm high density rockwool insulation slab. Offers fire barrier and acoustic wall partitioning.',
    tags: ['insulation', 'rockwool', 'acoustic slab', 'soundproof'],
    suppliers: [
      { supplierId: 'sup_15', price: 14.00, availability: 'In Stock', leadTime: '3 days' }
    ]
  },
  'Industrial Safety Helmet Class E': {
    sku: 'MAT-PPE-001',
    brand: 'Safety First',
    description: 'High density polyethylene (HDPE) industrial safety helmet (Class E). Rated for 20,000V electrical shield and high impact protection.',
    tags: ['safety', 'ppe', 'helmet', 'hard hat'],
    suppliers: [
      { supplierId: 'sup_16', price: 8.50, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'High-Visibility Reflective Vest': {
    sku: 'MAT-PPE-002',
    brand: 'Safety First',
    description: 'Fluorescent polyester high-visibility safety vest with 2-inch reflective strips. Essential for all site visitors.',
    tags: ['safety', 'ppe', 'reflective vest', 'high-vis'],
    suppliers: [
      { supplierId: 'sup_16', price: 3.20, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Steel Toe Cap Safety Shoes': {
    sku: 'MAT-PPE-003',
    brand: 'Safety First',
    description: 'Industrial safety shoes with protective steel toe caps. Anti-puncture steel midsole and skid-resistant rubber soles.',
    tags: ['safety', 'ppe', 'shoes', 'steel toe'],
    suppliers: [
      { supplierId: 'sup_16', price: 28.00, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'N95 Respirator Safety Masks': {
    sku: 'MAT-PPE-004',
    brand: 'Safety First',
    description: 'Particulate respirator mask. Blocks 95% of airborne silica concrete dust particles during concrete operations.',
    tags: ['safety', 'ppe', 'mask', 'respirator', 'n95'],
    suppliers: [
      { supplierId: 'sup_16', price: 1.50, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Heavy Duty Leather Work Gloves': {
    sku: 'MAT-PPE-005',
    brand: 'Safety First',
    description: 'Reinforced split cowhide leather work gloves. Protects hands during rebar binding and concrete placement.',
    tags: ['safety', 'ppe', 'gloves', 'leather gloves'],
    suppliers: [
      { supplierId: 'sup_16', price: 2.50, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Fall Protection Full Body Harness': {
    sku: 'MAT-PPE-006',
    brand: 'Safety First',
    description: 'Full body fall protection harness with dorsal D-ring, quick connect chest buckles, and shock-absorbing lanyard.',
    tags: ['safety', 'ppe', 'harness', 'fall arrest'],
    suppliers: [
      { supplierId: 'sup_16', price: 45.00, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Galvalume Corrugated Roofing Sheet': {
    sku: 'MAT-ROF-001',
    brand: 'TATA Bluescope',
    description: 'Corrugated roof sheet made of Galvalume (zinc-aluminium alloy coating). Highly rust resistant and durable.',
    tags: ['roofing', 'galvalume', 'sheets', 'corrugated'],
    suppliers: [
      { supplierId: 'sup_2', price: 22.00, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'APP Modified Bituminous Membrane': {
    sku: 'MAT-WPF-001',
    brand: 'Fosroc Waterproofing',
    description: 'Atactic Polypropylene (APP) modified torch-on waterproofing membrane (3mm thick) for structural slabs.',
    tags: ['waterproofing', 'app membrane', 'torch-on', 'slab roof'],
    suppliers: [
      { supplierId: 'sup_17', price: 6.80, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Liquid Waterproofing Polymer Coating': {
    sku: 'MAT-WPF-002',
    brand: 'Fosroc Waterproofing',
    description: 'Elastomeric acrylic liquid-applied waterproofing membrane. Forms a seamless waterproof rubber seal.',
    tags: ['waterproofing', 'liquid membrane', 'coating'],
    suppliers: [
      { supplierId: 'sup_17', price: 9.50, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Asphalt Shingles Classic Tile': {
    sku: 'MAT-ROF-002',
    brand: 'TATA Shingles',
    description: 'Classic asphalt roofing shingles reinforced with fiberglass. Offers premium design look for roofs.',
    tags: ['roofing', 'shingles', 'asphalt shingles'],
    suppliers: [
      { supplierId: 'sup_4', price: 18.00, availability: 'Limited Stock', leadTime: '3 days' }
    ]
  },
  'Concrete Superplasticizer Admixture': {
    sku: 'MAT-CHM-001',
    brand: 'Fosroc Chemicals',
    description: 'High range water reducing superplasticizer admixture. Increases concrete workability and strength parameters.',
    tags: ['chemicals', 'admixture', 'plasticizer', 'workability'],
    suppliers: [
      { supplierId: 'sup_17', price: 3.80, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Epoxy Grout Resin Structural': {
    sku: 'MAT-CHM-002',
    brand: 'Fosroc Chemicals',
    description: 'Three-component high strength structural epoxy grout. Used to anchor machines and steel columns baseplates.',
    tags: ['chemicals', 'epoxy', 'structural grout', 'anchor'],
    suppliers: [
      { supplierId: 'sup_17', price: 12.00, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Curing Compound Membrane Emulsion': {
    sku: 'MAT-CHM-003',
    brand: 'Fosroc Chemicals',
    description: 'Liquid curing compound. Prevents rapid water evaporation from concrete surface, ensuring optimal hydration.',
    tags: ['chemicals', 'curing compound', 'concrete care'],
    suppliers: [
      { supplierId: 'sup_17', price: 4.20, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Polyurethane Joint Sealant Tube': {
    sku: 'MAT-CHM-004',
    brand: 'Fosroc Chemicals',
    description: 'Single component polyurethane sealant. Fills expansion joints in concrete highways and building slabs.',
    tags: ['chemicals', 'pu sealant', 'expansion joint'],
    suppliers: [
      { supplierId: 'sup_17', price: 6.50, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Drywall Screws Bugle Head 1.5 inch': {
    sku: 'MAT-FST-001',
    brand: 'Star Fasteners',
    description: 'Black phosphate bugle head drywall screws, 1.5-inch length. Used to mount boards onto metal frames.',
    tags: ['fasteners', 'drywall screws', 'hardware'],
    suppliers: [
      { supplierId: 'sup_18', price: 8.00, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Heavy Anchor Fastener Bolts M12': {
    sku: 'MAT-FST-002',
    brand: 'Star Fasteners',
    description: 'Steel expansion anchor bolts (M12). Secures heavy structural items onto solid concrete walls.',
    tags: ['fasteners', 'anchor bolt', 'expansion anchor'],
    suppliers: [
      { supplierId: 'sup_18', price: 1.20, availability: 'In Stock', leadTime: '1 day' }
    ]
  },
  'Mortise Door Lock Brass Body': {
    sku: 'MAT-HDW-001',
    brand: 'Star Hardware',
    description: 'Premium double action mortise door lock with heavy brass handles and cylinders.',
    tags: ['hardware', 'door lock', 'mortise lock'],
    suppliers: [
      { supplierId: 'sup_18', price: 24.00, availability: 'In Stock', leadTime: '2 days' }
    ]
  },
  'Stainless Steel Butt Hinge 4 inch': {
    sku: 'MAT-HDW-002',
    brand: 'Star Hardware',
    description: 'Heavy duty SS butt hinge (4-inch size). Ensures smooth swing action for wooden fire doors.',
    tags: ['hardware', 'door hinge', 'butt hinge'],
    suppliers: [
      { supplierId: 'sup_18', price: 3.50, availability: 'In Stock', leadTime: '1 day' }
    ]
  }
};

// Rich equipment detail mapping matched by equipment database name
export const equipmentDetails = {
  'CAT 320 Hydraulic Excavator 20T': {
    model: '320D-II',
    category: 'Excavators',
    description: 'Heavy-duty 20-ton crawler excavator equipped with a 1.2 cubic meter bucket. Delivers excellent bucket breakout force and fuel efficiency for digging deep foundation pits.',
    dailyRate: 280,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'Komatsu PC210 Crawler Excavator': {
    model: 'PC210-10M0',
    category: 'Excavators',
    description: 'Highly stable 21-ton excavator featuring advanced hydraulic efficiency modes. Used for earthmoving and site grading operations.',
    dailyRate: 275,
    location: 'Ahmedabad',
    supplierId: 'sup_5'
  },
  'Hitachi ZX130 Medium Excavator 13T': {
    model: 'ZX130-G',
    category: 'Excavators',
    description: 'Medium scale 13-ton crawler excavator. Ideal for narrow utility pipeline trenches and urban site excavations.',
    dailyRate: 190,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'Volvo EC300D Heavy Excavator 30T': {
    model: 'EC300D',
    category: 'Excavators',
    description: 'High performance 30-ton excavator for rock cutting and heavy earthmoving applications.',
    dailyRate: 380,
    location: 'Surat',
    supplierId: 'sup_6'
  },
  'CAT 305 Mini Excavator 5T': {
    model: '305E2 CR',
    category: 'Excavators',
    description: 'Compact 5-ton excavator with zero tail swing. Best suited for interior renovations and landscaping tasks.',
    dailyRate: 120,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'JCB 3CX Eco Backhoe Loader': {
    model: '3CX Eco',
    category: 'Backhoe Loaders',
    description: 'Versatile utility machine featuring a front loader bucket and a rear excavating bucket. Combines diesel economy with high mobility.',
    dailyRate: 140,
    location: 'Vadodara',
    supplierId: 'sup_6'
  },
  'CAT 424 Backhoe Loader Utility': {
    model: '424-II',
    category: 'Backhoe Loaders',
    description: 'Reliable 4.2-ton backhoe loader for municipal utility work, grading, and light loading operations.',
    dailyRate: 135,
    location: 'Ahmedabad',
    supplierId: 'sup_5'
  },
  'Case 770 EX Backhoe Loader': {
    model: '770 EX',
    category: 'Backhoe Loaders',
    description: 'Versatile loader with high bucket capacity. Best for small site logistics.',
    dailyRate: 130,
    location: 'Surat',
    supplierId: 'sup_6'
  },
  'CAT D6 Track-Type Dozer 150HP': {
    model: 'D6R2',
    category: 'Bulldozers',
    description: '150 HP track bulldozer equipped with a semi-U blade and ripper. Ideal for land clearing, heavy grading, and leveling rocky surfaces.',
    dailyRate: 350,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'Komatsu D65 Dozer Earthmover': {
    model: 'D65EX-16',
    category: 'Bulldozers',
    description: 'Heavy duty dozer featuring automatic lockup transmission mode. Excellent grading speed.',
    dailyRate: 340,
    location: 'Ahmedabad',
    supplierId: 'sup_6'
  },
  'CAT D8 Heavy Bulldozer 310HP': {
    model: 'D8T',
    category: 'Bulldozers',
    description: 'High capacity 310 HP dozer for mass quarry stripping and primary highway land cuts.',
    dailyRate: 520,
    location: 'Anand',
    supplierId: 'sup_7'
  },
  'CAT 950M Wheel Loader 5Ton': {
    model: '950M',
    category: 'Wheel Loaders',
    description: 'Heavy duty 5-ton wheel loader with 3.3 cubic meter loading bucket capacity. Efficient aggregates transport onto dump trucks.',
    dailyRate: 220,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'Komatsu WA380 Wheel Loader': {
    model: 'WA380-6',
    category: 'Wheel Loaders',
    description: 'High torque loading tractor with automatic transmission logic. Ideal for sand and stone stockpiles.',
    dailyRate: 210,
    location: 'Ahmedabad',
    supplierId: 'sup_6'
  },
  'SDLG L956F Wheel Loader Heavy': {
    model: 'L956F',
    category: 'Wheel Loaders',
    description: 'Robust wheel loader designed for severe quarry conditions.',
    dailyRate: 200,
    location: 'Surat',
    supplierId: 'sup_6'
  },
  'Liebherr LTM 1050 Mobile Crane 50T': {
    model: 'LTM 1050-3.1',
    category: 'Cranes',
    description: '50-ton all-terrain mobile crane with a telescopic boom length of 38 meters. Suitable for structural steel assemblies and girder setup.',
    dailyRate: 650,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'Zoomlion TC6012 Tower Crane 6T': {
    model: 'TC6012-6A',
    category: 'Cranes',
    description: '6-ton stationary tower crane with a jib reach of 60 meters. Essential for vertical logistics at tall commercial building frameworks.',
    dailyRate: 480,
    location: 'Vadodara',
    supplierId: 'sup_6'
  },
  'Terex Demag AC100 Mobile Crane 100T': {
    model: 'AC 100',
    category: 'Cranes',
    description: '100-ton capacity mobile crane for heavy precast panels and structural frame placements.',
    dailyRate: 980,
    location: 'Ahmedabad',
    supplierId: 'sup_5'
  },
  'Potain MC85 Tower Crane 5T': {
    model: 'MC85',
    category: 'Cranes',
    description: '5-ton tower crane with smooth frequency drive trolley movement. Ideal for residential frame projects.',
    dailyRate: 420,
    location: 'Surat',
    supplierId: 'sup_6'
  },
  'Toyota 8FGU25 Forklift 2.5T Gas': {
    model: '8FGU25',
    category: 'Forklifts',
    description: '2.5-ton LPG powered material forklift. Best suited for moving cement bags and tile pallets in warehousing yards.',
    dailyRate: 75,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'CAT DP30 Forklift Diesel 3.0T': {
    model: 'DP30N',
    category: 'Forklifts',
    description: '3-ton diesel forklift with pneumatic tires, built for unpaved site pathways and inventory handling.',
    dailyRate: 90,
    location: 'Ahmedabad',
    supplierId: 'sup_6'
  },
  'Crown SC5200 Electric Forklift': {
    model: 'SC5200',
    category: 'Forklifts',
    description: 'Electric forklift for indoor warehousing operations.',
    dailyRate: 80,
    location: 'Anand',
    supplierId: 'sup_7'
  },
  'TATA Prima 2528 Dumper Truck 16cum': {
    model: 'Prima 2528.K',
    category: 'Dump Trucks',
    description: 'Heavy dumper truck (16 cubic meter box capacity) powered by a 280 HP engine. Safely hauls loose earth and aggregates.',
    dailyRate: 150,
    location: 'Vadodara',
    supplierId: 'sup_6'
  },
  'Ashok Leyland U-Truck 2518 Dumper': {
    model: 'U-2518',
    category: 'Dump Trucks',
    description: 'Reliable tipper truck for sand and stone quarry runs.',
    dailyRate: 130,
    location: 'Ahmedabad',
    supplierId: 'sup_5'
  },
  'BharatBenz 2823C Dumper Truck': {
    model: '2823C',
    category: 'Dump Trucks',
    description: 'Heavy duty dumper truck featuring optimized fuel consumption.',
    dailyRate: 160,
    location: 'Surat',
    supplierId: 'sup_6'
  },
  'Volvo FMX 460 Dump Truck Heavy': {
    model: 'FMX 460',
    category: 'Dump Trucks',
    description: '460 HP dump truck with robust heavy-duty suspension for extreme quarry site haulage.',
    dailyRate: 240,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'CAT 120M Motor Grader 12ft': {
    model: '120M-2',
    category: 'Graders',
    description: '12-foot blade grader featuring joystick controls. Perfect for precision grading and leveling sub-bases of roads.',
    dailyRate: 290,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'Sany SMG200 Motor Grader': {
    model: 'SMG200C-8',
    category: 'Graders',
    description: 'Grading tractor with high drawbar pull capacity.',
    dailyRate: 270,
    location: 'Ahmedabad',
    supplierId: 'sup_6'
  },
  'Hamm 311 Soil Compactor Roller 11T': {
    model: '311-III',
    category: 'Rollers',
    description: '11-ton vibratory soil compactor roller. Ensures optimal soil density and concrete sub-grade compaction.',
    dailyRate: 180,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'Case 1107 EX Tandem Roller Compactor': {
    model: '1107 EX',
    category: 'Rollers',
    description: '11-ton vibratory compactor for soil and asphalt layers.',
    dailyRate: 170,
    location: 'Surat',
    supplierId: 'sup_6'
  },
  'Schwing Stetter CP30 Batching Plant': {
    model: 'CP30-RMC',
    category: 'Concrete Equipment',
    description: 'Compact concrete batching plant (30 cubic meters per hour output). Delivers uniform concrete mix proportions.',
    dailyRate: 450,
    location: 'Vadodara',
    supplierId: 'sup_6'
  },
  'Putmeister M36 Concrete Boom Pump': {
    model: 'M36-4',
    category: 'Concrete Equipment',
    description: 'Truck-mounted concrete pump with a 36-meter vertical boom. Channels ready-mix concrete directly to upper floors.',
    dailyRate: 390,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'ACE RMC Concrete Transit Mixer 6cum': {
    model: 'ACE-6',
    category: 'Concrete Mixers',
    description: '6 cubic meter concrete transit mixer mounted on a heavy chassis. Prevents concrete setting during transit.',
    dailyRate: 140,
    location: 'Vadodara',
    supplierId: 'sup_6'
  },
  'Jaypee 10/7 Concrete Mixer Drum': {
    model: '10/7-CD',
    category: 'Concrete Mixers',
    description: 'Portable diesel concrete mixer drum. Ideal for on-site mortar and small brickwork foundations.',
    dailyRate: 35,
    location: 'Anand',
    supplierId: 'sup_7'
  },
  'Cummins 125kVA Silent Diesel Generator': {
    model: 'C125D5P',
    category: 'Generators',
    description: '125 kVA soundproof silent diesel generator set. Provides continuous backup power for site cranes, office containers, and heavy lighting.',
    dailyRate: 110,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'Kirloskar 250kVA Power Generator': {
    model: 'KG250WS',
    category: 'Generators',
    description: 'Heavy duty 250 kVA generator. Supplies continuous three-phase power for welding and batching plants.',
    dailyRate: 190,
    location: 'Ahmedabad',
    supplierId: 'sup_6'
  },
  'Atlas Copco XAS 97 Diesel Compressor': {
    model: 'XAS 97',
    category: 'Compressors',
    description: 'Diesel-driven rotary screw air compressor. Powers pneumatic drills, sandblasting guns, and demolition breakers.',
    dailyRate: 95,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'Lincoln Electric welding machine 400A': {
    model: 'Vantage 400',
    category: 'Welding Machines',
    description: '400A engine-driven multi-process welding machine. Suitable for heavy structural steel welding.',
    dailyRate: 65,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'Bosch GSH 16-30 Demolition Jackhammer': {
    model: 'GSH 16-30',
    category: 'Jackhammers',
    description: 'Heavy demolition jackhammer with 41 Joules impact energy force. Quickly breaks down concrete blocks and slabs.',
    dailyRate: 35,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'Hilti TE 3000 Heavy Demolition Breaker': {
    model: 'TE 3000-AVR',
    category: 'Jackhammers',
    description: '68 Joules high-performance demolition breaker featuring vibration reduction. Ideal for slab and asphalt cracking.',
    dailyRate: 50,
    location: 'Ahmedabad',
    supplierId: 'sup_6'
  },
  'Husqvarna K770 Concrete Cutoff Saw': {
    model: 'K770',
    category: 'Saws',
    description: 'Handheld concrete gas cutoff saw. Suitable for slicing concrete curbstones, bricks, and metal rebars.',
    dailyRate: 45,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'STIHL TS 420 Cutquik Saw 14 inch': {
    model: 'TS 420',
    category: 'Saws',
    description: 'Powerful 14-inch abrasive wheel gas saw for piping and steel profiles.',
    dailyRate: 40,
    location: 'Surat',
    supplierId: 'sup_6'
  },
  'Cuplock Steel Scaffolding System 500sqm': {
    model: 'Cuplock-500',
    category: 'Scaffolding',
    description: 'Modular cuplock scaffolding package. Includes ledger bars, vertical tubes, base jacks, and walkways to cover a 500 sqm surface.',
    dailyRate: 150,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'Generac V20 Mobile Lighting Tower LED': {
    model: 'V20-LED',
    category: 'Lighting Towers',
    description: 'Mobile diesel-driven lighting tower with 4x320W high efficiency LED lamps. Extensively used for night shifts.',
    dailyRate: 85,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'Koshin Diesel Water Pump 4-inch flow': {
    model: 'KDP-40X',
    category: 'Water Pumps',
    description: '4-inch self-priming diesel water pump. Used for dewatering foundation excavations and pumping silt water.',
    dailyRate: 55,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'Potain MCT 85 Tower Crane 5T': {
    model: 'MCT 85',
    category: 'Tower Cranes',
    description: 'High performance 5-ton tower crane designed for fast, urban high-rise assembly.',
    dailyRate: 460,
    location: 'Ahmedabad',
    supplierId: 'sup_9'
  },
  'Liebherr LTM 1100 Mobile Crane 100T': {
    model: 'LTM 1100-4.2',
    category: 'Mobile Cranes',
    description: '100-ton capacity mobile crane for heavy precast and industrial structure assemblies.',
    dailyRate: 950,
    location: 'Surat',
    supplierId: 'sup_5'
  },
  'Schwing Stetter BP 350 Concrete Pump': {
    model: 'BP 350',
    category: 'Concrete Pumps',
    description: 'High performance trailer concrete pump with a delivery range of 100m vertical height.',
    dailyRate: 260,
    location: 'Vadodara',
    supplierId: 'sup_3'
  },
  'Cummins 250kVA Silent Diesel Generator': {
    model: 'C250D5',
    category: 'Generators',
    description: '250 kVA heavy-duty silent diesel generator set. Provides continuous backup power for operations.',
    dailyRate: 210,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'Kirloskar 45kVA Silent Generator Set': {
    model: 'KG45WS',
    category: 'Generators',
    description: 'Compact 45 kVA generator. Supplies continuous single and three-phase power for lighting.',
    dailyRate: 85,
    location: 'Anand',
    supplierId: 'sup_10'
  },
  'Atlas Copco XAS 400 Air Compressor': {
    model: 'XAS 400',
    category: 'Air Compressors',
    description: 'Diesel-driven rotary screw air compressor delivering 400 CFM for multiple jackhammers.',
    dailyRate: 140,
    location: 'Ahmedabad',
    supplierId: 'sup_6'
  },
  'Koshin 3-inch Petrol Water Pump': {
    model: 'SEH-80X',
    category: 'Water Pumps',
    description: '3-inch gasoline engine-driven self-priming pump for utility water management.',
    dailyRate: 40,
    location: 'Surat',
    supplierId: 'sup_13'
  },
  'Lincoln Electric welding machine 600A': {
    model: 'Vantage 600',
    category: 'Welding Machines',
    description: '600A engine-driven multi-process welder/generator for heavy duty site welding.',
    dailyRate: 90,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'Wacker Neuson VP1550 Plate Compactor': {
    model: 'VP1550',
    category: 'Plate Compactors',
    description: 'Vibratory plate compactor for narrow subgrade compacting in trenches and pathways.',
    dailyRate: 45,
    location: 'Vadodara',
    supplierId: 'sup_5'
  },
  'Bosch GSH 11E Jackhammer 11kg': {
    model: 'GSH 11E',
    category: 'Jackhammers',
    description: '11kg demolition breaker hammer. Easy handling for wall openings and channel cuts.',
    dailyRate: 25,
    location: 'Vadodara',
    supplierId: 'sup_1'
  },
  'Hilti TE 1000-AVR Demolition Jackhammer': {
    model: 'TE 1000-AVR',
    category: 'Jackhammers',
    description: 'High performance AVR-equipped breaker hammer for concrete slab demolition.',
    dailyRate: 40,
    location: 'Ahmedabad',
    supplierId: 'sup_7'
  },
  'Generac V20 Mobile Light Tower LED': {
    model: 'V20-LED-M',
    category: 'Lighting Towers',
    description: 'LED mobile lighting tower with robust canopy and low fuel footprint.',
    dailyRate: 80,
    location: 'Morbi',
    supplierId: 'sup_20'
  }
};
