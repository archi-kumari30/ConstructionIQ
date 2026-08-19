import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Mail, Phone, ExternalLink, Loader2, Package } from 'lucide-react';

const Suppliers = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [suppliersList, setSuppliersList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSuppliersData = async () => {
    try {
      setLoading(true);
      // 1. Fetch all projects
      const projectsRes = await api.get('/projects');
      const projectList = projectsRes.data?.data?.projects || [];
      setProjects(projectList);

      const aggregatedSuppliers = {};

      // 2. Fetch team members and deliveries in parallel for all projects
      await Promise.all(
        projectList.map(async (project) => {
          const pId = project.id || project._id;

          // Fetch team
          let team = [];
          try {
            const teamRes = await api.get(`/projects/${pId}/team`);
            team = teamRes.data?.data || [];
          } catch (e) {
            console.warn(`Error fetching team for project ${pId}:`, e.message);
          }

          // Fetch deliveries to find materials supplied
          let deliveries = [];
          try {
            const deliveriesRes = await api.get(`/projects/${pId}/deliveries`);
            deliveries = deliveriesRes.data?.data?.deliveries || [];
          } catch (e) {
            console.warn(`Error fetching deliveries for project ${pId}:`, e.message);
          }

          // Extract suppliers from team
          team.forEach((member) => {
            const u = member.userId || member.user || {};
            const roleOnProject = member.roleOnProject || '';
            const userRole = u.role || '';

            if (roleOnProject === 'supplier' || userRole === 'supplier') {
              const uId = u._id || u.id || member.userId || member.user;
              if (!uId) return;

              if (!aggregatedSuppliers[uId]) {
                aggregatedSuppliers[uId] = {
                  id: uId,
                  name: u.name || 'Supplier Vendor',
                  email: u.email || 'N/A',
                  phone: u.phone || 'N/A',
                  projects: new Set(),
                  materials: new Set()
                };
              }

              // Add project name
              aggregatedSuppliers[uId].projects.add(project.name);

              // Find materials delivered by this supplier in this project
              deliveries.forEach((del) => {
                const delSupplierId = del.supplierId?._id || del.supplierId?.id || del.supplierId;
                if (delSupplierId === uId) {
                  const matName = del.materialId?.name;
                  if (matName) {
                    aggregatedSuppliers[uId].materials.add(matName);
                  }
                }
              });
            }
          });
        })
      );

      // Convert Sets to Arrays for rendering
      const result = Object.values(aggregatedSuppliers).map((sup) => ({
        ...sup,
        projects: Array.from(sup.projects),
        materials: Array.from(sup.materials)
      }));

      setSuppliersList(result);
    } catch (err) {
      console.error('Error compiling supplier directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliersData();
  }, []);

  return (
    <div style={{ textAlign: 'left' }}>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Supplier Partners</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Supplier database aggregated from active project teams.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <Loader2 className="animate-spin" size={28} color="var(--primary)" />
          <span style={{ marginLeft: '10px', fontWeight: 600 }}>Compiling supplier records...</span>
        </div>
      ) : suppliersList.length === 0 ? (
        <div className="empty-state">
          <Users size={36} color="var(--text-muted)" />
          <span className="empty-state-title">No supplier records compiled</span>
          <span className="empty-state-desc">Assign users of role 'supplier' to project teams to build the directory.</span>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Supplier Vendor</th>
                <th>Contacts</th>
                <th>Materials Supplied</th>
                <th>Active Projects Assigned</th>
                <th>Contract Status</th>
              </tr>
            </thead>
            <tbody>
              {suppliersList.map((sup) => (
                <tr key={sup.id}>
                  <td style={{ fontWeight: 600, fontSize: '14px' }}>{sup.name}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '12px' }}>
                      {sup.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                          <Mail size={12} />
                          <span>{sup.email}</span>
                        </div>
                      )}
                      {sup.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                          <Phone size={12} />
                          <span>{sup.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {sup.materials.length > 0 ? (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {sup.materials.map((mat, idx) => (
                          <span key={idx} className="badge badge-info" style={{ textTransform: 'none' }}>
                            {mat}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No shipments received yet</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
                      {sup.projects.map((proj, idx) => (
                        <span key={idx} style={{ color: 'var(--primary-light)', fontWeight: 500 }}>
                          • {proj}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-success">Active Partner</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
