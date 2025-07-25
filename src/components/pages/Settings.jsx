import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import Modal from "@/components/molecules/Modal";
import { settingsService } from "@/services/api/settingsService";
import { accountService } from "@/services/api/accountService";
const Settings = () => {
const [settings, setSettings] = useState({});
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountForm, setAccountForm] = useState({ name: "", platform: "Instagram", username: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [platformForm, setPlatformForm] = useState({ 
    name: "", 
    domain: "", 
    pillBackgroundColor: "#f3f4f6", 
    pillTextColor: "#374151" 
  });
  const [deletePlatformConfirm, setDeletePlatformConfirm] = useState(null);
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await settingsService.get();
      setSettings(data);
    } catch (err) {
      setError("Failed to load settings");
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
    loadSettings();
    loadAccounts();
  }, []);
  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await settingsService.update(settings);
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
}));
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    setAccountForm({ name: "", platform: "Instagram", username: "" });
    setShowAccountModal(true);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setAccountForm({
      name: account.name,
      platform: account.platform,
      username: account.username
    });
    setShowAccountModal(true);
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        await accountService.update(editingAccount.Id, accountForm);
        toast.success("Account updated successfully!");
      } else {
        await accountService.create(accountForm);
        toast.success("Account added successfully!");
      }
      setShowAccountModal(false);
      loadAccounts();
    } catch (err) {
      toast.error("Failed to save account");
    }
  };

  const handleDeleteAccount = async (accountId) => {
    try {
      await accountService.delete(accountId);
      toast.success("Account deleted successfully!");
      setDeleteConfirm(null);
      loadAccounts();
    } catch (err) {
      toast.error("Failed to delete account");
    }
  };

  const handleAccountFormChange = (field, value) => {
    setAccountForm(prev => ({
      ...prev,
      [field]: value
    }));
};

  const handleAddPlatform = () => {
    setEditingPlatform(null);
    setPlatformForm({ 
      name: "", 
      domain: "", 
      pillBackgroundColor: "#f3f4f6", 
      pillTextColor: "#374151" 
    });
    setShowPlatformModal(true);
  };

  const handleEditPlatform = (platform) => {
    setEditingPlatform(platform);
    setPlatformForm({
      name: platform.name,
      domain: platform.domain,
      pillBackgroundColor: platform.pillBackgroundColor,
      pillTextColor: platform.pillTextColor
    });
    setShowPlatformModal(true);
  };

  const handleSavePlatform = async (e) => {
    e.preventDefault();
    try {
      const platforms = settings.platforms || [];
      let updatedPlatforms;
      
      if (editingPlatform) {
        updatedPlatforms = platforms.map(p => 
          p.Id === editingPlatform.Id 
            ? { ...p, ...platformForm }
            : p
        );
        toast.success("Platform updated successfully!");
      } else {
        const newId = Math.max(...platforms.map(p => p.Id), 0) + 1;
        updatedPlatforms = [...platforms, { Id: newId, ...platformForm }];
        toast.success("Platform added successfully!");
      }
      
      const updatedSettings = { ...settings, platforms: updatedPlatforms };
      await settingsService.update(updatedSettings);
      setSettings(updatedSettings);
      setShowPlatformModal(false);
    } catch (err) {
      toast.error("Failed to save platform");
    }
  };

  const handleDeletePlatform = async (platformId) => {
    try {
      const updatedPlatforms = settings.platforms.filter(p => p.Id !== platformId);
      const updatedSettings = { ...settings, platforms: updatedPlatforms };
      await settingsService.update(updatedSettings);
      setSettings(updatedSettings);
      toast.success("Platform deleted successfully!");
      setDeletePlatformConfirm(null);
    } catch (err) {
      toast.error("Failed to delete platform");
    }
  };

  const handlePlatformFormChange = (field, value) => {
    setPlatformForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadSettings} />;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">Configure your ModelOutreach preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <ApperIcon name="User" size={20} className="text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
          </div>
          
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Display Name"
              value={settings.displayName || ""}
              onChange={(e) => handleChange("displayName", e.target.value)}
              placeholder="Your display name"
            />

            <Input
              label="Email"
              type="email"
              value={settings.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="your@email.com"
            />

<Select
              label="Default Platform"
              value={settings.defaultPlatform || ""}
              onChange={(e) => handleChange("defaultPlatform", e.target.value)}
            >
              <option value="">Select default platform</option>
              {(settings.platforms || []).map((platform) => (
                <option key={platform.Id} value={platform.name}>
                  {platform.name}
                </option>
              ))}
            </Select>

            <Button
              type="submit"
              disabled={saving}
              className="w-full"
            >
              {saving ? "Saving..." : "Save Profile Settings"}
            </Button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <ApperIcon name="Bell" size={20} className="text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                <p className="text-xs text-gray-500">Get notified about important updates</p>
              </div>
              <input
                type="checkbox"
                checked={settings.emailNotifications || false}
                onChange={(e) => handleChange("emailNotifications", e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Follow Reminders</label>
                <p className="text-xs text-gray-500">Remind me to follow up with models</p>
              </div>
              <input
                type="checkbox"
                checked={settings.followReminders || false}
                onChange={(e) => handleChange("followReminders", e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">DM Reminders</label>
                <p className="text-xs text-gray-500">Remind me to send DMs</p>
              </div>
              <input
                type="checkbox"
                checked={settings.dmReminders || false}
                onChange={(e) => handleChange("dmReminders", e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <ApperIcon name="Database" size={20} className="text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
          </div>
          
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              icon="Download"
            >
              Export Data
            </Button>
            
            <Button
              variant="outline"
              className="w-full"
              icon="Upload"
            >
              Import Data
            </Button>
            
            <Button
              variant="danger"
              className="w-full"
              icon="Trash2"
            >
              Clear All Data
            </Button>
          </div>
</div>

        {/* My Accounts Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <ApperIcon name="Users" size={20} className="text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">My Accounts</h3>
            </div>
            <Button
              onClick={handleAddAccount}
              size="sm"
              className="flex items-center gap-2"
            >
              <ApperIcon name="Plus" size={16} />
              Add Account
            </Button>
          </div>

          {accounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ApperIcon name="Users" size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No accounts added yet</p>
              <p className="text-sm">Add your first outreach account to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div key={account.Id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <ApperIcon name="User" size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{account.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <ApperIcon name="Globe" size={14} className="mr-1" />
                          {account.platform}
                        </span>
                        <span className="flex items-center">
                          <ApperIcon name="AtSign" size={14} className="mr-1" />
                          {account.username}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditAccount(account)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <ApperIcon name="Edit" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(account)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
</div>

        {/* Platforms Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <ApperIcon name="Globe" size={20} className="text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Platforms</h3>
            </div>
            <Button
              onClick={handleAddPlatform}
              size="sm"
              className="flex items-center gap-2"
            >
              <ApperIcon name="Plus" size={16} />
              Add Platform
            </Button>
          </div>

          {!settings.platforms || settings.platforms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ApperIcon name="Globe" size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No platforms configured yet</p>
              <p className="text-sm">Add your first platform to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {settings.platforms.map((platform) => (
                <div key={platform.Id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Globe" size={20} className="text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{platform.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <ApperIcon name="Link" size={14} className="mr-1" />
                          {platform.domain}
                        </span>
                        <span 
                          className="px-2 py-1 rounded-full text-xs border"
                          style={{
                            backgroundColor: platform.pillBackgroundColor,
                            color: platform.pillTextColor,
                            borderColor: platform.pillTextColor + '20'
                          }}
                        >
                          {platform.name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPlatform(platform)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <ApperIcon name="Edit" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletePlatformConfirm(platform)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <ApperIcon name="Info" size={20} className="text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">About</h3>
          </div>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Version:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span className="font-medium">Today</span>
            </div>
            <div className="flex justify-between">
              <span>Total Models:</span>
              <span className="font-medium">{settings.totalModels || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Accounts:</span>
              <span className="font-medium">{accounts.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Platforms:</span>
              <span className="font-medium">{settings.platforms?.length || 0}</span>
            </div>
          </div>
        </div>

      {/* Account Modal */}
      <Modal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        title={editingAccount ? "Edit Account" : "Add New Account"}
      >
        <form onSubmit={handleSaveAccount} className="space-y-4">
          <Input
            label="Account Name"
            value={accountForm.name}
            onChange={(e) => handleAccountFormChange("name", e.target.value)}
            placeholder="e.g., Talent Scout Official"
            required
          />
          
<Select
            label="Platform"
            value={accountForm.platform}
            onChange={(e) => handleAccountFormChange("platform", e.target.value)}
            required
          >
            {(settings.platforms || []).map((platform) => (
              <option key={platform.Id} value={platform.name}>
                {platform.name}
              </option>
            ))}
          </Select>
          
          <Input
            label="Username"
            value={accountForm.username}
            onChange={(e) => handleAccountFormChange("username", e.target.value)}
            placeholder="e.g., talent_scout_official"
            required
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAccountModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingAccount ? "Update Account" : "Add Account"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
            <ApperIcon name="AlertTriangle" size={20} className="text-red-600" />
            <div>
              <p className="font-medium text-red-900">Are you sure?</p>
              <p className="text-sm text-red-700">
                This will permanently delete "{deleteConfirm?.name}" account. This action cannot be undone.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteAccount(deleteConfirm.Id)}
            >
              Delete Account
            </Button>
          </div>
        </div>
</Modal>

      {/* Platform Modal */}
      <Modal
        isOpen={showPlatformModal}
        onClose={() => setShowPlatformModal(false)}
        title={editingPlatform ? "Edit Platform" : "Add New Platform"}
      >
        <form onSubmit={handleSavePlatform} className="space-y-4">
          <Input
            label="Platform Name"
            value={platformForm.name}
            onChange={(e) => handlePlatformFormChange("name", e.target.value)}
            placeholder="e.g., Fansly"
            required
          />
          
          <Input
            label="Associated Domain"
            value={platformForm.domain}
            onChange={(e) => handlePlatformFormChange("domain", e.target.value)}
            placeholder="e.g., fansly.com"
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pill Background Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={platformForm.pillBackgroundColor}
                  onChange={(e) => handlePlatformFormChange("pillBackgroundColor", e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <Input
                  value={platformForm.pillBackgroundColor}
                  onChange={(e) => handlePlatformFormChange("pillBackgroundColor", e.target.value)}
                  placeholder="#f3f4f6"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pill Text Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={platformForm.pillTextColor}
                  onChange={(e) => handlePlatformFormChange("pillTextColor", e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <Input
                  value={platformForm.pillTextColor}
                  onChange={(e) => handlePlatformFormChange("pillTextColor", e.target.value)}
                  placeholder="#374151"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <span 
              className="inline-block px-3 py-1 rounded-full text-sm border"
              style={{
                backgroundColor: platformForm.pillBackgroundColor,
                color: platformForm.pillTextColor,
                borderColor: platformForm.pillTextColor + '20'
              }}
            >
              {platformForm.name || 'Platform Name'}
            </span>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowPlatformModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingPlatform ? "Update Platform" : "Add Platform"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Platform Confirmation Modal */}
      <Modal
        isOpen={!!deletePlatformConfirm}
        onClose={() => setDeletePlatformConfirm(null)}
        title="Delete Platform"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
            <ApperIcon name="AlertTriangle" size={20} className="text-red-600" />
            <div>
              <p className="font-medium text-red-900">Are you sure?</p>
              <p className="text-sm text-red-700">
                This will permanently delete "{deletePlatformConfirm?.name}" platform. This action cannot be undone.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setDeletePlatformConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeletePlatform(deletePlatformConfirm.Id)}
            >
              Delete Platform
            </Button>
          </div>
        </div>
      </Modal>
    </div>
);
};

export default Settings;