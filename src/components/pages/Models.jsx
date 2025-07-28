import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import Modal from "@/components/molecules/Modal";
import ModelsTable from "@/components/organisms/ModelsTable";
import AddModelForm from "@/components/organisms/AddModelForm";
import AdvancedFilters from "@/components/organisms/AdvancedFilters";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { modelService } from "@/services/api/modelService";
import { blacklistService } from "@/services/api/blacklistService";
import { accountService } from "@/services/api/accountService";
const Models = () => {
const location = useLocation();
const [models, setModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dashboardFilter, setDashboardFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [advancedFilters, setAdvancedFilters] = useState({
    platform: null,
    followedBy: null,
    dmSent: null,
    dateAddedFrom: null,
    dateAddedTo: null,
    followDateFrom: null,
    followDateTo: null,
    dmSentDateFrom: null,
    dmSentDateTo: null
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  // Check for dashboard filter from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get('filter');
    setDashboardFilter(filter || "");
  }, [location.search]);

  const loadModels = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await modelService.getAll();
      setModels(data);
      setFilteredModels(data);
    } catch (err) {
      setError("Failed to load models");
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const data = await accountService.getAll();
      setAccounts(data);
    } catch (err) {
      console.error("Failed to load accounts:", err);
    }
  };

  useEffect(() => {
    loadModels();
    loadAccounts();
  }, []);
useEffect(() => {
    let filtered = models;

    // Apply dashboard filter first
    if (dashboardFilter) {
      switch (dashboardFilter) {
        case 'followed':
          filtered = models.filter(model => model.followedBy);
          break;
        case 'dm-sent':
          filtered = models.filter(model => model.dmSent);
          break;
        case 'to-follow':
          filtered = models.filter(model => !model.followedBy);
          break;
        case 'to-dm':
          filtered = models.filter(model => model.followedBy && !model.dmSent);
          break;
        default:
          filtered = models;
      }
    }

    // Apply quick filter tabs
    if (!dashboardFilter) { // Only apply quick filters if no dashboard filter is active
      switch (activeFilter) {
        case 'to-follow':
          filtered = filtered.filter(model => !model.followedBy || model.followedBy.trim() === "");
          break;
        case 'to-dm':
          filtered = filtered.filter(model => model.followedBy && model.followedBy.trim() !== "" && !model.dmSent);
          break;
        case 'completed':
          filtered = filtered.filter(model => model.dmSent);
          break;
        case 'all':
        default:
          // No additional filtering for 'all'
          break;
      }
    }

    // Apply advanced filters
    if (advancedFilters.platform) {
      filtered = filtered.filter(model => model.platform === advancedFilters.platform);
    }

    if (advancedFilters.followedBy) {
      if (advancedFilters.followedBy === '__none__') {
        filtered = filtered.filter(model => !model.followedBy || model.followedBy.trim() === '');
      } else {
        filtered = filtered.filter(model => model.followedBy === advancedFilters.followedBy);
      }
    }

    if (advancedFilters.dmSent !== null) {
      const dmSentFilter = advancedFilters.dmSent === 'true';
      filtered = filtered.filter(model => model.dmSent === dmSentFilter);
    }

    // Date range filters
    if (advancedFilters.dateAddedFrom) {
      const fromDate = new Date(advancedFilters.dateAddedFrom);
      filtered = filtered.filter(model => new Date(model.dateAdded) >= fromDate);
    }

    if (advancedFilters.dateAddedTo) {
      const toDate = new Date(advancedFilters.dateAddedTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(model => new Date(model.dateAdded) <= toDate);
    }

    if (advancedFilters.followDateFrom) {
      const fromDate = new Date(advancedFilters.followDateFrom);
      filtered = filtered.filter(model => model.followDate && new Date(model.followDate) >= fromDate);
    }

    if (advancedFilters.followDateTo) {
      const toDate = new Date(advancedFilters.followDateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(model => model.followDate && new Date(model.followDate) <= toDate);
    }

    if (advancedFilters.dmSentDateFrom) {
      const fromDate = new Date(advancedFilters.dmSentDateFrom);
      filtered = filtered.filter(model => model.dmSentDate && new Date(model.dmSentDate) >= fromDate);
    }

    if (advancedFilters.dmSentDateTo) {
      const toDate = new Date(advancedFilters.dmSentDateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(model => model.dmSentDate && new Date(model.dmSentDate) <= toDate);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(model =>
        model.link.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (model.followedBy && model.followedBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (model.notes && model.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredModels(filtered);
  }, [searchTerm, models, dashboardFilter, activeFilter, advancedFilters]);
  const handleAddModel = async (formData) => {
    try {
      const newModel = await modelService.create(formData);
      setModels(prev => [newModel, ...prev]);
      setShowAddModal(false);
      toast.success("Model added successfully!");
    } catch (err) {
      toast.error("Failed to add model");
    }
  };

  const handleEditModel = async (formData) => {
    try {
      const updatedModel = await modelService.update(editingModel.Id, formData);
      setModels(prev => prev.map(m => m.Id === editingModel.Id ? updatedModel : m));
      setEditingModel(null);
toast.success("Model updated successfully!");
    } catch (err) {
      toast.error("Failed to update model");
    }
  };

  const handleFollowedByChange = async (modelId, accountUsername) => {
    try {
      const updateData = {
        followedBy: accountUsername,
        followDate: accountUsername ? new Date().toISOString() : null
      };
      
      await modelService.update(modelId, updateData);
      
      // Update local state
      const updatedModels = models.map(model =>
        model.Id === modelId
          ? { ...model, ...updateData }
          : model
      );
      setModels(updatedModels);
      setFilteredModels(updatedModels.filter(model =>
        model.link.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (model.followedBy && model.followedBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (model.notes && model.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      ));
      
      if (accountUsername) {
        toast.success("Account assigned and follow date set!");
      } else {
        toast.success("Account assignment cleared!");
      }
    } catch (err) {
      toast.error("Failed to update model");
    }
  };
  const handleDeleteModel = async (id) => {
    if (!window.confirm("Are you sure you want to delete this model?")) return;

    try {
      await modelService.delete(id);
      setModels(prev => prev.filter(m => m.Id !== id));
      toast.success("Model deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete model");
    }
};

  const handleDMSentChange = async (modelId, dmSent) => {
    try {
      const updateData = { 
        dmSent,
        dmSentDate: dmSent ? new Date().toISOString() : null
      };
      
      await modelService.update(modelId, updateData);
      setModels(prev => prev.map(model => 
        model.Id === modelId ? { ...model, ...updateData } : model
      ));
      toast.success(dmSent ? "DM marked as sent!" : "DM status updated!");
    } catch (err) {
      toast.error("Failed to update DM status");
    }
  };

  const handleDMSentDateChange = async (modelId, dmSentDate) => {
    try {
      const updateData = { 
        dmSentDate: dmSentDate ? new Date(dmSentDate).toISOString() : null
      };
      
      await modelService.update(modelId, updateData);
      setModels(prev => prev.map(model => 
        model.Id === modelId ? { ...model, ...updateData } : model
      ));
      toast.success("DM date updated!");
    } catch (err) {
      toast.error("Failed to update DM date");
    }
  };

const handleEdit = (model) => {
    setEditingModel(model);
  };

  const handleBlacklistModel = async (id) => {
    if (!window.confirm("Are you sure you want to move this model to blacklist?")) return;

    try {
      await modelService.moveToBlacklist(id);
      setModels(prev => prev.filter(model => model.Id !== id));
      toast.success("Model moved to blacklist successfully!");
    } catch (err) {
      toast.error("Failed to move model to blacklist");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadModels} />;

  return (
<div className="space-y-4 md:space-y-6">
<div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Models</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage your model outreach database.</p>
        </div>
<div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2 w-full sm:w-auto">
          <Button
            icon="Plus"
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base"
            size="md"
          >
            Add Model
          </Button>
          <Button
            icon="Upload"
            variant="secondary"
            onClick={() => setShowBulkAddModal(true)}
            className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base"
            size="md"
          >
            Import Models
          </Button>
        </div>
      </div>

      {/* Quick Filter Tabs */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          {[
            { key: 'all', label: 'All', count: models.length },
            { key: 'to-follow', label: 'To Follow', count: models.filter(m => !m.followedBy || m.followedBy.trim() === "").length },
            { key: 'to-dm', label: 'To DM', count: models.filter(m => m.followedBy && m.followedBy.trim() !== "" && !m.dmSent).length },
            { key: 'completed', label: 'Completed', count: models.filter(m => m.dmSent).length }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 min-h-[44px] flex items-center justify-center ${
                activeFilter === filter.key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              <span className="text-center leading-tight">
                {filter.label}<br className="sm:hidden" />
                <span className="sm:ml-1">({filter.count})</span>
              </span>
            </button>
          ))}
        </div>
      </div>

<div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-md">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search models..."
          />
        </div>
        <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
          {filteredModels.length} of {models.length} models
        </div>
      </div>

      {/* Advanced Filters */}
      <AdvancedFilters
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        accounts={accounts}
        models={models}
        isExpanded={showAdvancedFilters}
        onToggleExpanded={() => setShowAdvancedFilters(!showAdvancedFilters)}
      />

      {filteredModels.length === 0 ? (
        models.length === 0 ? (
          <Empty
            title="No models found"
            description="Start building your model database by adding your first model."
            actionLabel="Add First Model"
            onAction={() => setShowAddModal(true)}
            icon="Users"
          />
        ) : (
          <Empty
            title="No matching models"
            description="Try adjusting your search criteria to find models."
            icon="Search"
          />
        )
      ) : (
<div className="overflow-hidden">
        <ModelsTable
          models={filteredModels}
          onEdit={handleEdit}
          onDelete={handleDeleteModel}
          onBlacklist={handleBlacklistModel}
          accounts={accounts}
          onFollowedByChange={handleFollowedByChange}
          onDMSentChange={handleDMSentChange}
          onDMSentDateChange={handleDMSentDateChange}
          onInlineUpdate={async (modelId, updateData) => {
            const updatedModel = await modelService.update(modelId, updateData);
            setModels(prev => prev.map(m => m.Id === modelId ? updatedModel : m));
          }}
        />
      </div>
      )}

<Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Model"
        footer={null}
      >
        <AddModelForm
          onSubmit={handleAddModel}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

<Modal
        isOpen={showBulkAddModal}
        onClose={() => setShowBulkAddModal(false)}
        title="Import Models"
        footer={null}
        size="xl"
      >
        <AddModelForm
          onSubmit={handleAddModel}
          onCancel={() => setShowBulkAddModal(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingModel}
        onClose={() => setEditingModel(null)}
        title="Edit Model"
        footer={null}
      >
        <AddModelForm
          model={editingModel}
          onSubmit={handleEditModel}
          onCancel={() => setEditingModel(null)}
        />
      </Modal>
    </div>
  );
};

export default Models;