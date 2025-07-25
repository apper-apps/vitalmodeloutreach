import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import { settingsService } from "@/services/api/settingsService";

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    loadSettings();
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;