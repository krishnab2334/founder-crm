import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { contactsAPI, aiAPI } from '../services/api';
import { toast } from 'react-toastify';
// Import the necessary icons from react-icons/fa
import { FaBuilding, FaCity, FaHospital, FaSchool, FaWarehouse } from "react-icons/fa";
// ADD THIS IMPORT STATEMENT FOR THE "Fi" ICONS
import { FiPlus, FiSearch, FiMail, FiPhone, FiUser } from 'react-icons/fi';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    type: 'lead',
    status: '',
    notes: '',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [useAI, setUseAI] = useState(false);

  useEffect(() => {
    loadContacts();
  }, [filterType]);

  const loadContacts = async () => {
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (searchTerm) params.search = searchTerm;
      
      const response = await contactsAPI.getAll(params);
      setContacts(response.data.data);
    } catch (error) {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadContacts();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let dataToSubmit = { ...formData };

      // Use AI to categorize if enabled
      if (useAI && formData.notes) {
        const aiResponse = await aiAPI.categorizeContact(formData);
        dataToSubmit = {
          ...dataToSubmit,
          type: aiResponse.data.data.type,
          tags: [...new Set([...dataToSubmit.tags, ...aiResponse.data.data.tags])]
        };
        toast.info(`AI suggested: ${aiResponse.data.data.type}`);
      }

      await contactsAPI.create(dataToSubmit);
      toast.success('Contact added successfully!');
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        type: 'lead',
        status: '',
        notes: '',
        tags: []
      });
      loadContacts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add contact');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      customer: 'blue',
      investor: 'purple',
      partner: 'green',
      lead: 'orange'
    };
    return colors[type] || 'gray';
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1>Contacts</h1>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <FiPlus /> Add Contact
          </button>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <form onSubmit={handleSearch} className="search-form">
            <FiSearch />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterType === '' ? 'active' : ''}`}
              onClick={() => setFilterType('')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filterType === 'lead' ? 'active' : ''}`}
              onClick={() => setFilterType('lead')}
            >
              Leads
            </button>
            <button
              className={`filter-btn ${filterType === 'customer' ? 'active' : ''}`}
              onClick={() => setFilterType('customer')}
            >
              Customers
            </button>
            <button
              className={`filter-btn ${filterType === 'investor' ? 'active' : ''}`}
              onClick={() => setFilterType('investor')}
            >
              Investors
            </button>
            <button
              className={`filter-btn ${filterType === 'partner' ? 'active' : ''}`}
              onClick={() => setFilterType('partner')}
            >
              Partners
            </button>
          </div>
        </div>

        {/* Contacts Grid */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading contacts...</p>
          </div>
        ) : (
          <div className="contacts-grid">
            {contacts.length > 0 ? (
              contacts.map(contact => (
                <Link to={`/contacts/${contact.id}`} key={contact.id} className="contact-card">
                  <div className="contact-header">
                    <div className="contact-avatar">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <span className={`type-badge ${getTypeColor(contact.type)}`}>
                      {contact.type}
                    </span>
                  </div>
                  <h3>{contact.name}</h3>
                  <div className="contact-info">
                    {contact.email && (
                      <div className="info-item">
                        <FiMail /> {contact.email}
                      </div>
                    )}
                    {contact.phone && (
                      <div className="info-item">
                        <FiPhone /> {contact.phone}
                      </div>
                    )}
                    {contact.company && (
                      <div className="info-item">
                        <FaBuilding /> {contact.company}
                      </div>
                    )}
                  </div>
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="contact-tags">
                      {contact.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </Link>
              ))
            ) : (
              <div className="empty-state-large">
                <FiUser size={48} />
                <h3>No contacts found</h3>
                <p>Add your first contact to get started</p>
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
                  <FiPlus /> Add Contact
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add Contact Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Contact</h2>
                <button onClick={() => setShowAddModal(false)} className="close-btn">×</button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div className="form-group">
                    <label>Company</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Acme Inc"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select name="type" value={formData.type} onChange={handleChange}>
                      <option value="lead">Lead</option>
                      <option value="customer">Customer</option>
                      <option value="investor">Investor</option>
                      <option value="partner">Partner</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <input
                      type="text"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      placeholder="Active, Cold, Hot, etc."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Any additional information..."
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Tags</label>
                  <div className="tags-input">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <button type="button" onClick={handleAddTag} className="btn btn-sm">
                      Add
                    </button>
                  </div>
                  <div className="tags-list">
                    {formData.tags.map(tag => (
                      <span key={tag} className="tag">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={useAI}
                      onChange={(e) => setUseAI(e.target.checked)}
                    />
                    🤖 Use AI to categorize contact
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Contact
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Contacts;