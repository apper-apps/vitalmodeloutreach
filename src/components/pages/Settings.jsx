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
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="OnlyFans">OnlyFans</option>
              <option value="Twitter">Twitter</option>
              <option value="Other">Other</option>
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
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="Twitter">Twitter</option>
            <option value="OnlyFans">OnlyFans</option>
            <option value="Other">Other</option>
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
    </div>
);
};

export default Settings;