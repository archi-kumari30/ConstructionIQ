import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { suppliers, materialsDetails, equipmentDetails } from '../data/catalogData';
import {
  Search,
  Filter,
  ArrowUpDown,
  ShoppingBag,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronRight,
  Info
} from 'lucide-react';

const SearchCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const query = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialType = searchParams.get('type') || 'all';
  const initialLocation = searchParams.get('location') || 'all';
  const initialSort = searchParams.get('sort') || 'relevance';

  const [searchVal, setSearchVal] = useState(query);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeType, setActiveType] = useState(initialType);
  const [activeLocation, setActiveLocation] = useState(initialLocation);
  const [activeSort, setActiveSort] = useState(initialSort);
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const [activeBrand, setActiveBrand] = useState('all');
  const [activeSupplier, setActiveSupplier] = useState('all');
  const [activeAvailability, setActiveAvailability] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');

  // DB mapping lookup states
  const [dbMaterials, setDbMaterials] = useState([]);
  const [dbEquipment, setDbEquipment] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Modal / details states
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  
  // Form submission states
  const [selectedProject, setSelectedProject] = useState('');
  const [quantity, setQuantity] = useState('50');
  const [urgency, setUrgency] = useState('medium');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(null); // 'material' or 'equipment'
  const [errorMsg, setErrorMsg] = useState('');
  const [fetchError, setFetchError] = useState(false);

  // 1. Fetch DB mapping references (materials, equipment, projects) on mount
  useEffect(() => {
    const fetchReferences = async () => {
      try {
        setLoadingDb(true);
        setFetchError(false);
        const [mRes, eRes, pRes] = await Promise.all([
          api.get('/materials'),
          api.get('/equipment'),
          api.get('/projects')
        ]);
        setDbMaterials(mRes.data?.data?.materials || []);
        setDbEquipment(eRes.data?.data?.equipment || []);
        
        const projList = pRes.data?.data?.projects || [];
        setProjects(projList);
        if (projList.length > 0) {
          // Default to first project or active project from localStorage
          const cachedProj = localStorage.getItem('activeProjectId');
          if (cachedProj && projList.some(p => p.id === cachedProj || p._id === cachedProj)) {
            setSelectedProject(cachedProj);
          } else {
            setSelectedProject(projList[0].id || projList[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch DB references for mapping:', err);
        setFetchError(true);
      } finally {
        setLoadingDb(false);
      }
    };
    fetchReferences();
  }, []);

  // Update URL search parameters when state changes
  useEffect(() => {
    const params = {};
    if (query) params.q = query;
    if (activeCategory !== 'all') params.category = activeCategory;
    if (activeType !== 'all') params.type = activeType;
    if (activeLocation !== 'all') params.location = activeLocation;
    if (activeSort !== 'relevance') params.sort = activeSort;
    setSearchParams(params);
  }, [query, activeCategory, activeType, activeLocation, activeSort]);

  // Handle compact header search triggers
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: searchVal, category: activeCategory, type: activeType, location: activeLocation, sort: activeSort });
  };

  // Compile Unified Search Records from static data
  const compileResults = () => {
    let results = [];

    // Compile materials
    Object.keys(materialsDetails).forEach((name) => {
      const detail = materialsDetails[name];
      const primarySupplier = suppliers.find(s => s.id === detail.suppliers[0].supplierId);
      const dbMatch = dbMaterials.find(m => m.name === name || m.sku === detail.sku);
      const category = dbMatch ? dbMatch.category : 'Materials';
      results.push({
        id: detail.sku,
        name,
        type: 'material',
        sku: detail.sku,
        brand: detail.brand,
        category: category,
        description: detail.description,
        tags: detail.tags,
        primaryPrice: detail.suppliers[0].price,
        primaryAvailability: detail.suppliers[0].availability,
        primaryLocation: primarySupplier ? primarySupplier.location : 'Vadodara',
        primarySupplierName: primarySupplier ? primarySupplier.name : 'Unknown',
        allSuppliers: detail.suppliers.map(s => {
          const sup = suppliers.find(su => su.id === s.supplierId);
          return {
            ...s,
            supplierName: sup ? sup.name : 'Unknown',
            location: sup ? sup.location : 'Vadodara',
            rating: sup ? sup.rating : 4.5
          };
        })
      });
    });

    // Compile equipment
    Object.keys(equipmentDetails).forEach((name) => {
      const detail = equipmentDetails[name];
      const sup = suppliers.find(s => s.id === detail.supplierId);
      const dbMatch = dbEquipment.find(e => e.name === name);
      const category = (dbMatch ? dbMatch.type : detail.category) || 'Equipment';
      results.push({
        id: name,
        name,
        type: 'equipment',
        sku: detail.model,
        brand: category,
        category: category,
        description: detail.description,
        tags: [(category || '').toLowerCase(), 'heavy machinery', 'fleet'],
        primaryPrice: detail.dailyRate,
        primaryAvailability: 'Available',
        primaryLocation: detail.location || 'Vadodara',
        primarySupplierName: sup ? sup.name : 'Unknown',
        allSuppliers: [{
          supplierId: detail.supplierId,
          supplierName: sup ? sup.name : 'Unknown',
          price: detail.dailyRate,
          availability: 'Available',
          location: detail.location,
          rating: sup ? sup.rating : 4.5,
          leadTime: '1 day'
        }]
      });
    });

    // Apply Client Search Filter with defensive safety
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter((item) =>
        (item.name || '').toLowerCase().includes(lowerQuery) ||
        (item.sku || '').toLowerCase().includes(lowerQuery) ||
        (item.category || '').toLowerCase().includes(lowerQuery) ||
        (item.description || '').toLowerCase().includes(lowerQuery) ||
        (item.brand || '').toLowerCase().includes(lowerQuery) ||
        (item.primarySupplierName || '').toLowerCase().includes(lowerQuery) ||
        (item.tags || []).some(tag => (tag || '').toLowerCase().includes(lowerQuery))
      );
    }

    // Apply Filters
    if (activeType !== 'all') {
      results = results.filter(item => item.type === activeType);
    }

    if (activeCategory !== 'all') {
      results = results.filter(item => item.category === activeCategory);
    }

    if (activeSubcategory !== 'all') {
      results = results.filter(item => (item.tags || []).some(t => (t || '').toLowerCase() === activeSubcategory.toLowerCase()));
    }

    if (activeBrand !== 'all') {
      results = results.filter(item => item.brand === activeBrand);
    }

    if (activeSupplier !== 'all') {
      results = results.filter(item => item.primarySupplierName === activeSupplier);
    }

    if (activeAvailability !== 'all') {
      results = results.filter(item => {
        if (activeAvailability === 'instock') {
          return item.primaryAvailability === 'In Stock' || item.primaryAvailability === 'Available';
        } else {
          return item.primaryAvailability === 'Limited Stock' || item.primaryAvailability === 'Out of Stock';
        }
      });
    }

    if (maxPrice) {
      const maxVal = parseFloat(maxPrice);
      if (!isNaN(maxVal)) {
        results = results.filter(item => item.primaryPrice <= maxVal);
      }
    }

    if (activeLocation !== 'all') {
      results = results.filter(item => (item.primaryLocation || '').toLowerCase() === activeLocation.toLowerCase());
    }

    // Apply Sorting
    if (activeSort === 'price_asc') {
      results.sort((a, b) => a.primaryPrice - b.primaryPrice);
    } else if (activeSort === 'price_desc') {
      results.sort((a, b) => b.primaryPrice - a.primaryPrice);
    } else if (activeSort === 'availability') {
      results.sort((a, b) => {
        if (a.primaryAvailability === 'In Stock' || a.primaryAvailability === 'Available') return -1;
        return 1;
      });
    } else if (activeSort === 'newest') {
      // Demo sort order: alphabetical reversal by SKU code
      results.sort((a, b) => b.sku.localeCompare(a.sku));
    }

    return results;
  };

  const results = compileResults();

  // Get unique categories dynamically from the compiled results
  const categoriesList = Array.from(new Set(
    results.map(item => item.category)
  )).filter(Boolean).sort();

  // Get unique subcategories/tags dynamically from the catalog
  const subcategoriesList = Array.from(new Set([
    ...Object.values(materialsDetails).flatMap(m => m.tags || []),
    ...Object.values(equipmentDetails).map(e => (e.category || '').toLowerCase())
  ])).filter(Boolean).sort();

  // Get unique brands dynamically
  const brandsList = Array.from(new Set([
    ...Object.values(materialsDetails).map(m => m.brand),
    ...Object.values(equipmentDetails).map(e => e.category)
  ])).filter(Boolean).sort();

  // Get unique suppliers list
  const suppliersNames = suppliers.map(s => s.name).sort();

  const locationsList = ['Vadodara', 'Ahmedabad', 'Surat', 'Anand', 'Mumbai', 'Pune', 'Morbi'];

  // Handle open Request modals
  const handleOpenAction = (item) => {
    setSelectedItem(item);
    setSuccessState(null);
    setErrorMsg('');
    setNotes('');
    
    // Set default dates for equipment
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 8);
    
    setStartDate(tomorrow.toISOString().split('T')[0]);
    setEndDate(nextWeek.toISOString().split('T')[0]);
    
    setRequestModalOpen(true);
  };

  // Submit request (links backend requests and bookings logic)
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (selectedItem.type === 'material') {
        // Find matching material record in backend database
        const dbMat = dbMaterials.find(m => (m.name || '').toLowerCase() === (selectedItem.name || '').toLowerCase());
        
        if (!dbMat) {
          throw new Error('This material is not initialized in the backend database. Run database seeders.');
        }

        const payload = {
          materialId: dbMat.id || dbMat._id,
          quantityRequested: parseFloat(quantity),
          urgency: urgency
        };

        await api.post(`/projects/${selectedProject}/requests`, payload);
        setSuccessState('material');
      } else {
        // Find matching equipment record in backend database
        const dbEquip = dbEquipment.find(e => (e.name || '').toLowerCase() === (selectedItem.name || '').toLowerCase());

        if (!dbEquip) {
          throw new Error('This equipment unit is not initialized in the backend database. Run database seeders.');
        }

        const payload = {
          equipmentId: dbEquip.id || dbEquip._id,
          startTime: new Date(startDate),
          endTime: new Date(endDate),
          purpose: notes || 'Standard site operations usage'
        };

        await api.post(`/projects/${selectedProject}/bookings`, payload);
        setSuccessState('equipment');
      }
    } catch (err) {
      console.error('B2B Catalog Request Error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Request creation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDb) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px', gap: '16px' }}>
        <Loader2 size={32} className="animate-spin" color="#A64B2A" />
        <span style={{ fontSize: '13px', color: '#5F6870', fontWeight: 500, fontFamily: 'var(--sans)' }}>Connecting to ConstructionIQ B2B Catalog...</span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px', gap: '16px', border: '1px solid #C9C5BD', padding: '40px', backgroundColor: '#FFFFFF', textAlign: 'center' }}>
        <AlertCircle size={40} color="#C62828" />
        <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)', margin: '8px 0 0 0', letterSpacing: '0.5px' }}>CATALOG CONNECTION ERROR</h2>
        <p style={{ fontSize: '13px', color: '#5F6870', margin: '4px 0 16px 0' }}>Unable to load procurement inventory from database services.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ backgroundColor: '#1E252B', minWidth: '120px' }}>
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-slide-up">
      
      {/* Title & Eyebrow */}
      <div>
        <div style={{ fontSize: '10px', color: '#A64B2A', letterSpacing: '1.5px', fontWeight: 500, fontFamily: 'var(--font-title)', marginBottom: '6px', textTransform: 'uppercase' }}>
          CONSTRUCTION PROCUREMENT
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)', margin: 0 }}>
          Find materials, equipment and suppliers
        </h1>
        <p style={{ color: '#5F6870', fontSize: '13.5px', margin: '4px 0 0 0', fontWeight: 400 }}>
          Search standard items, compare quote prices across Gujarat, and route material requests or fleet bookings immediately.
        </p>
      </div>

      {/* Main Search Panel */}
      <div className="search-main-panel" style={{ display: 'grid', gridTemplateColumns: '2.5fr 7.5fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Side: Filter Sidebar */}
        <div style={{ border: '1px solid #C9C5BD', backgroundColor: '#FFFFFF', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #C9C5BD', paddingBottom: '10px', marginBottom: '4px' }}>
            <Filter size={14} color="#A64B2A" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#1E252B', letterSpacing: '0.5px', fontFamily: 'var(--font-title)', textTransform: 'uppercase' }}>FILTERS</span>
          </div>

          {/* Type Filter */}
          <div>
            <label style={{ fontSize: '9px', color: '#5F6870', display: 'block', marginBottom: '8px', fontWeight: 600, fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>CATALOG TYPE</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                <input type="radio" name="type" checked={activeType === 'all'} onChange={() => setActiveType('all')} style={{ accentColor: '#A64B2A' }} />
                <span>All Catalog</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                <input type="radio" name="type" checked={activeType === 'material'} onChange={() => setActiveType('material')} style={{ accentColor: '#A64B2A' }} />
                <span>Materials & Products</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                <input type="radio" name="type" checked={activeType === 'equipment'} onChange={() => setActiveType('equipment')} style={{ accentColor: '#A64B2A' }} />
                <span>Machinery & Fleet</span>
              </label>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#E9E5DD' }}></div>

          {/* Category Filter */}
          <div>
            <label style={{ fontSize: '9px', color: '#5F6870', display: 'block', marginBottom: '6px', fontWeight: 600, fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>CATEGORY</label>
            <select
              className="form-select"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              style={{ fontSize: '12.5px', height: '36px', borderRadius: '0px', border: '1px solid #C9C5BD' }}
            >
              <option value="all">All Categories</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Subcategory Filter */}
          <div>
            <label style={{ fontSize: '9px', color: '#5F6870', display: 'block', marginBottom: '6px', fontWeight: 600, fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>SUBCATEGORY TAG</label>
            <select
              className="form-select"
              value={activeSubcategory}
              onChange={(e) => setActiveSubcategory(e.target.value)}
              style={{ fontSize: '12.5px', height: '36px', borderRadius: '0px', border: '1px solid #C9C5BD' }}
            >
              <option value="all">All Subcategories</option>
              {subcategoriesList.map(subcat => (
                <option key={subcat} value={subcat}>{subcat}</option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <label style={{ fontSize: '9px', color: '#5F6870', display: 'block', marginBottom: '6px', fontWeight: 600, fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>BRAND MANUFACTURER</label>
            <select
              className="form-select"
              value={activeBrand}
              onChange={(e) => setActiveBrand(e.target.value)}
              style={{ fontSize: '12.5px', height: '36px', borderRadius: '0px', border: '1px solid #C9C5BD' }}
            >
              <option value="all">All Brands</option>
              {brandsList.map(brnd => (
                <option key={brnd} value={brnd}>{brnd}</option>
              ))}
            </select>
          </div>

          {/* Supplier Filter */}
          <div>
            <label style={{ fontSize: '9px', color: '#5F6870', display: 'block', marginBottom: '6px', fontWeight: 600, fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>SUPPLIER PROVIDER</label>
            <select
              className="form-select"
              value={activeSupplier}
              onChange={(e) => setActiveSupplier(e.target.value)}
              style={{ fontSize: '12.5px', height: '36px', borderRadius: '0px', border: '1px solid #C9C5BD' }}
            >
              <option value="all">All Suppliers</option>
              {suppliersNames.map(sup => (
                <option key={sup} value={sup}>{sup}</option>
              ))}
            </select>
          </div>

          <div style={{ height: '1px', backgroundColor: '#E9E5DD' }}></div>

          {/* Availability Filter */}
          <div>
            <label style={{ fontSize: '9px', color: '#5F6870', display: 'block', marginBottom: '6px', fontWeight: 600, fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>AVAILABILITY</label>
            <select
              className="form-select"
              value={activeAvailability}
              onChange={(e) => setActiveAvailability(e.target.value)}
              style={{ fontSize: '12.5px', height: '36px', borderRadius: '0px', border: '1px solid #C9C5BD' }}
            >
              <option value="all">Any Status</option>
              <option value="instock">In Stock / Available</option>
              <option value="limited">Limited / Out of Stock</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label style={{ fontSize: '9px', color: '#5F6870', display: 'block', marginBottom: '6px', fontWeight: 600, fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>GEOGRAPHIC REGION</label>
            <select
              className="form-select"
              value={activeLocation}
              onChange={(e) => setActiveLocation(e.target.value)}
              style={{ fontSize: '12.5px', height: '36px', borderRadius: '0px', border: '1px solid #C9C5BD' }}
            >
              <option value="all">All Locations (Gujarat)</option>
              {locationsList.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Max Price Filter */}
          <div>
            <label style={{ fontSize: '9px', color: '#5F6870', display: 'block', marginBottom: '6px', fontWeight: 600, fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>MAX PRICE / RATE ($)</label>
            <input
              type="number"
              className="form-input"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="e.g. 500"
              style={{ fontSize: '12.5px', height: '36px', borderRadius: '0px', border: '1px solid #C9C5BD' }}
            />
          </div>

          {/* Sort Filter */}
          <div>
            <label style={{ fontSize: '9px', color: '#5F6870', display: 'block', marginBottom: '6px', fontWeight: 600, fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>SORT RESULTS BY</label>
            <select
              className="form-select"
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
              style={{ fontSize: '12.5px', height: '36px', borderRadius: '0px', border: '1px solid #C9C5BD' }}
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="availability">Availability</option>
              <option value="newest">Newest Catalog SKU</option>
            </select>
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => {
              setActiveCategory('all');
              setActiveSubcategory('all');
              setActiveBrand('all');
              setActiveSupplier('all');
              setActiveAvailability('all');
              setMaxPrice('');
              setActiveType('all');
              setActiveLocation('all');
              setActiveSort('relevance');
              setSearchVal('');
              setSearchParams({});
            }}
            style={{ width: '100%', fontSize: '11px', height: '36px', textTransform: 'uppercase', fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}
          >
            Clear All Filters
          </button>
        </div>

        {/* Right Side: Search Input and Table Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Search bar input */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '16px' }} />
              <input
                type="text"
                placeholder="Search materials, equipment, suppliers..."
                className="form-input"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                style={{ paddingLeft: '44px', height: '46px', fontSize: '13.5px', borderRadius: '0px', border: '1px solid #C9C5BD' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: '46px', padding: '0 24px', backgroundColor: '#1E252B', textTransform: 'uppercase', fontSize: '12px', fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>
              Search
            </button>
          </form>

          {/* Result count & sorting header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #C9C5BD',
            paddingBottom: '8px',
            fontSize: '11px',
            fontFamily: 'var(--font-title)',
            color: '#5F6870',
            letterSpacing: '0.5px'
          }}>
            <span style={{ textTransform: 'uppercase' }}>
              {results.length} {results.length === 1 ? 'RESULT' : 'RESULTS'} 
              {query && ` FOR "${query.toUpperCase()}"`}
            </span>
            <span style={{ textTransform: 'uppercase' }}>
              SORT: {activeSort.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Search Results list in editorial rows */}
          {results.length === 0 ? (
            <div style={{ border: '1px solid #C9C5BD', backgroundColor: '#FFFFFF', padding: '60px 40px', textAlign: 'center' }}>
              <AlertCircle size={32} color="#5F6870" style={{ margin: '0 auto 16px auto' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1E252B', display: 'block', marginBottom: '4px', fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}>NO MATCHES FOUND</span>
              <span style={{ fontSize: '12.5px', color: '#5F6870' }}>No materials or equipment match your query. Try another search or adjust the filters.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', border: '1px solid #C9C5BD', backgroundColor: '#FFFFFF' }}>
              {results.map((item, idx) => (
                <div key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'stretch',
                  borderBottom: idx < results.length - 1 ? '1px solid #C9C5BD' : 'none',
                  padding: '24px 28px',
                  position: 'relative',
                  transition: 'background-color 0.2s cubic-bezier(0.22, 1, 0.36, 1)'
                }} className="catalog-row-hover">
                  
                  {/* Left block: details metadata */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '9px', color: '#5F6870', letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: 'var(--font-title)' }}>
                      <span>CATALOG // {item.type}</span>
                      <span>•</span>
                      <span>SKU {item.sku}</span>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)', margin: '4px 0' }}>
                      {item.name}
                    </h3>

                    <p style={{ fontSize: '12.5px', color: '#5F6870', margin: '2px 0 6px 0', lineHeight: 1.4, maxWidth: '540px' }}>
                      {item.description}
                    </p>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#5F6870', fontFamily: 'var(--sans)' }}>
                      <span>{item.category.toUpperCase()} // {item.brand}</span>
                      <span>•</span>
                      <span>{item.primaryLocation} · <strong style={{ color: '#A64B2A' }}>{item.primaryAvailability}</strong></span>
                    </div>
                  </div>

                  {/* Right block: Commercials, Supplier and Actions */}
                  <div style={{ width: '220px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', borderLeft: '1px solid #E9E5DD', paddingLeft: '24px', marginLeft: '24px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '20px', fontWeight: 500, color: '#1E252B', fontFamily: 'var(--font-title)', display: 'block', lineHeight: 1.1 }}>
                        ${item.primaryPrice.toLocaleString()}{item.type === 'equipment' ? '/day' : ''}
                      </span>
                      <span style={{ fontSize: '11px', color: '#5F6870', display: 'block', marginTop: '4px' }}>
                        {item.primarySupplierName} <span style={{ color: '#A64B2A' }}>★ {item.allSuppliers[0]?.rating.toFixed(1) || '4.5'}</span>
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '12px' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => { setSelectedItem(item); setDetailModalOpen(true); }}
                        style={{ flex: 1, padding: '6px 12px', fontSize: '11px', height: '32px', textTransform: 'uppercase', fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}
                      >
                        Details
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleOpenAction(item)}
                        style={{ flex: 1.2, padding: '6px 12px', fontSize: '11px', height: '32px', backgroundColor: '#A64B2A', textTransform: 'uppercase', fontFamily: 'var(--font-title)', letterSpacing: '0.5px' }}
                      >
                        {item.type === 'material' ? 'Request' : 'Book'}
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Details & Quote Comparison Modal */}
      {detailModalOpen && selectedItem && (
        <div className="modal-overlay" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(30, 37, 43, 0.4)' }}>
          <div className="modal-content" style={{ maxWidth: '640px', backgroundColor: '#F4F1EA', borderRadius: '0px', border: '1px solid #C9C5BD', padding: '36px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #C9C5BD', paddingBottom: '16px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '9px', color: '#A64B2A', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600, fontFamily: 'var(--font-title)' }}>
                  TECHNICAL SPECIFICATION SHEET
                </span>
                <h2 style={{ fontSize: '24px', fontWeight: 500, fontFamily: 'var(--font-title)', margin: '4px 0 0 0', color: '#1E252B' }}>
                  {selectedItem.name}
                </h2>
              </div>
              <button onClick={() => setDetailModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#5F6870', padding: 0, lineHeight: 1 }}>&times;</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Product Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', borderBottom: '1px solid #C9C5BD', paddingBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '9px', color: '#5F6870', display: 'block', textTransform: 'uppercase', fontWeight: 500, fontFamily: 'var(--font-title)' }}>IDENTIFIER</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#1E252B' }}>{selectedItem.sku}</span>
                </div>
                <div>
                  <span style={{ fontSize: '9px', color: '#5F6870', display: 'block', textTransform: 'uppercase', fontWeight: 500, fontFamily: 'var(--font-title)' }}>MANUFACTURER</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#1E252B' }}>{selectedItem.brand}</span>
                </div>
                <div>
                  <span style={{ fontSize: '9px', color: '#5F6870', display: 'block', textTransform: 'uppercase', fontWeight: 500, fontFamily: 'var(--font-title)' }}>CATEGORY</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#1E252B' }}>{selectedItem.category}</span>
                </div>
              </div>

              {/* Description */}
              <div style={{ borderBottom: '1px solid #C9C5BD', paddingBottom: '20px' }}>
                <span style={{ fontSize: '9px', color: '#5F6870', display: 'block', marginBottom: '6px', fontWeight: 600, fontFamily: 'var(--font-title)' }}>TECHNICAL DESCRIPTION</span>
                <p style={{ fontSize: '13px', color: '#1E252B', margin: 0, lineHeight: 1.5, fontWeight: 400 }}>{selectedItem.description}</p>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', borderBottom: '1px solid #C9C5BD', paddingBottom: '20px' }}>
                {selectedItem.tags.map(t => (
                  <span key={t} className="badge" style={{ backgroundColor: '#E9E5DD', color: '#1E252B', fontSize: '11px', textTransform: 'none', border: '1px solid #C9C5BD', borderRadius: '0px' }}>#{t}</span>
                ))}
              </div>

              {/* B2B Quote Comparisons Table */}
              <div>
                <span style={{ fontSize: '9px', color: '#5F6870', display: 'block', marginBottom: '10px', fontWeight: 600, fontFamily: 'var(--font-title)' }}>SUPPLIER OFFERS</span>
                
                <div style={{ border: '1px solid #C9C5BD', backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
                  <table className="table" style={{ margin: 0, borderCollapse: 'collapse', width: '100%', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F4F1EA', borderBottom: '1px solid #C9C5BD' }}>
                        <th style={{ padding: '8px 12px', fontWeight: 500, color: '#5F6870' }}>Supplier</th>
                        <th style={{ padding: '8px 12px', fontWeight: 500, color: '#5F6870' }}>Rate</th>
                        <th style={{ padding: '8px 12px', fontWeight: 500, color: '#5F6870' }}>Lead</th>
                        <th style={{ padding: '8px 12px', fontWeight: 500, color: '#5F6870' }}>Availability</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItem.allSuppliers.map((sup, idx) => (
                        <tr key={idx} style={{ borderBottom: idx < selectedItem.allSuppliers.length - 1 ? '1px solid #E9E5DD' : 'none' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 500 }}>
                            {sup.supplierName} <span style={{ fontSize: '10.5px', color: '#A64B2A', marginLeft: '4px' }}>★ {sup.rating.toFixed(1)}</span>
                          </td>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1E252B' }}>
                            ${sup.price.toLocaleString()}{selectedItem.type === 'equipment' ? '/day' : ''}
                          </td>
                          <td style={{ padding: '10px 12px', color: '#5F6870' }}>{sup.leadTime}</td>
                          <td style={{ padding: '10px 12px', color: '#A64B2A', fontWeight: 500 }}>{sup.availability}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', borderTop: '1px solid #C9C5BD', paddingTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setDetailModalOpen(false)} style={{ textTransform: 'uppercase', fontFamily: 'var(--font-title)', fontSize: '11px', height: '36px', padding: '0 16px' }}>Close</button>
              <button
                className="btn btn-primary"
                onClick={() => { setDetailModalOpen(false); handleOpenAction(selectedItem); }}
                style={{ backgroundColor: '#A64B2A', textTransform: 'uppercase', fontFamily: 'var(--font-title)', fontSize: '11px', height: '36px', padding: '0 16px' }}
              >
                {selectedItem.type === 'material' ? 'Request Material' : 'Book Machinery'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Procurement Request Form Modal */}
      {requestModalOpen && selectedItem && (
        <div className="modal-overlay" style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(30, 37, 43, 0.4)' }}>
          <div className="modal-content" style={{ maxWidth: '480px', backgroundColor: '#F4F1EA', borderRadius: '0px', border: '1px solid #C9C5BD', padding: '36px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #C9C5BD', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 500, fontFamily: 'var(--font-title)', margin: 0, color: '#1E252B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {selectedItem.type === 'material' ? 'MATERIAL PROCUREMENT REQUEST' : 'FLEET RESERVATION'}
              </h2>
              <button onClick={() => setRequestModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#5F6870', padding: 0 }} disabled={submitting}>&times;</button>
            </div>

            {successState ? (
              <div style={{ padding: '20px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                <CheckCircle size={40} color="#A64B2A" />
                <div>
                  <h3 style={{ fontSize: '16px', margin: 0, fontWeight: 500, fontFamily: 'var(--font-title)', textTransform: 'uppercase' }}>Request Dispatched Successfully</h3>
                  <p style={{ fontSize: '13px', color: '#5F6870', marginTop: '8px', lineHeight: 1.4 }}>
                    {successState === 'material'
                      ? 'The material request has been logged into the ledger and is awaiting PM approval.'
                      : 'The machinery lease request has been successfully dispatched for scheduling.'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', width: '100%' }}>
                  <button className="btn btn-secondary" onClick={() => setRequestModalOpen(false)} style={{ flex: 1, fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-title)', height: '36px' }}>Close</button>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setRequestModalOpen(false);
                      navigate(successState === 'material' ? '/materials/requests' : '/equipment/bookings');
                    }}
                    style={{ flex: 1, backgroundColor: '#A64B2A', fontSize: '11px', textTransform: 'uppercase', fontFamily: 'var(--font-title)', height: '36px' }}
                  >
                    View Status Log
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {errorMsg && (
                    <div style={{ backgroundColor: 'rgba(198, 40, 40, 0.05)', color: '#C62828', border: '1px solid rgba(198, 40, 40, 0.2)', padding: '10px', fontSize: '12px' }}>
                      {errorMsg}
                    </div>
                  )}

                  {/* Static Item Info Sheet Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: '16px 20px', border: '1px solid #C9C5BD' }}>
                    <div>
                      <span style={{ fontSize: '9px', color: '#5F6870', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-title)' }}>SELECTED ITEM</span>
                      <span style={{ fontWeight: 500, fontSize: '14px', color: '#1E252B' }}>{selectedItem.name}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '9px', color: '#5F6870', display: 'block', textTransform: 'uppercase', fontFamily: 'var(--font-title)' }}>STANDARD RATE</span>
                      <span style={{ fontWeight: 600, color: '#A64B2A', fontSize: '14px' }}>
                        ${selectedItem.primaryPrice.toLocaleString()}{selectedItem.type === 'equipment' ? '/day' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Project Selector */}
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '9px', fontFamily: 'var(--font-title)', color: '#5F6870', letterSpacing: '0.5px' }}>ASSIGNED PROJECT</label>
                    <select
                      className="form-select"
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      style={{ height: '36px', fontSize: '13px', borderRadius: '0px', border: '1px solid #C9C5BD' }}
                      required
                    >
                      {projects.map(p => (
                        <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedItem.type === 'material' ? (
                    <>
                      {/* Quantity Input */}
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '9px', fontFamily: 'var(--font-title)', color: '#5F6870', letterSpacing: '0.5px' }}>REQUEST QUANTITY</label>
                        <input
                          type="number"
                          className="form-input"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          placeholder="e.g. 100"
                          min="1"
                          style={{ height: '36px', fontSize: '13px', borderRadius: '0px', border: '1px solid #C9C5BD' }}
                          required
                        />
                      </div>

                      {/* Urgency Input */}
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '9px', fontFamily: 'var(--font-title)', color: '#5F6870', letterSpacing: '0.5px' }}>URGENCY PRIORITY</label>
                        <select
                          className="form-select"
                          value={urgency}
                          onChange={(e) => setUrgency(e.target.value)}
                          style={{ height: '36px', fontSize: '13px', borderRadius: '0px', border: '1px solid #C9C5BD' }}
                        >
                          <option value="low">Low (Replenishment)</option>
                          <option value="medium">Medium (Standard)</option>
                          <option value="high">High (Active Block)</option>
                          <option value="critical">Critical (Immediate Stop)</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Booking Start & End dates */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '9px', fontFamily: 'var(--font-title)', color: '#5F6870', letterSpacing: '0.5px' }}>START DATE</label>
                          <input
                            type="date"
                            className="form-input"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ height: '36px', fontSize: '13px', borderRadius: '0px', border: '1px solid #C9C5BD' }}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" style={{ fontSize: '9px', fontFamily: 'var(--font-title)', color: '#5F6870', letterSpacing: '0.5px' }}>END DATE</label>
                          <input
                            type="date"
                            className="form-input"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ height: '36px', fontSize: '13px', borderRadius: '0px', border: '1px solid #C9C5BD' }}
                            required
                          />
                        </div>
                      </div>

                      {/* Booking Purpose */}
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '9px', fontFamily: 'var(--font-title)', color: '#5F6870', letterSpacing: '0.5px' }}>BOOKING PURPOSE</label>
                        <input
                          type="text"
                          className="form-input"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="e.g. Excavation of foundation block B"
                          style={{ height: '36px', fontSize: '13px', borderRadius: '0px', border: '1px solid #C9C5BD' }}
                          required
                        />
                      </div>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', borderTop: '1px solid #C9C5BD', paddingTop: '20px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setRequestModalOpen(false)} style={{ textTransform: 'uppercase', fontFamily: 'var(--font-title)', fontSize: '11px', height: '36px', padding: '0 16px' }} disabled={submitting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#A64B2A', textTransform: 'uppercase', fontFamily: 'var(--font-title)', fontSize: '11px', height: '36px', padding: '0 16px' }} disabled={submitting}>
                    {submitting ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Dispatching...</span>
                      </div>
                    ) : (
                      <span>Submit Request</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Dynamic responsive overrides */}
      <style>{`
        .catalog-row-hover:hover {
          background-color: #F4F1EA !important;
        }
        @media (max-width: 992px) {
          .search-main-panel {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
};

export default SearchCatalog;
