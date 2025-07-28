import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";
import Button from "@/components/atoms/Button";
import { settingsService } from "@/services/api/settingsService";
import { modelService } from "@/services/api/modelService";
import { blacklistService } from "@/services/api/blacklistService";
const AddModelForm = ({ model, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    link: "",
    platform: "",
    notes: "",
    followedBy: "",
    followDate: "",
    dmSent: false,
    dmSentDate: ""
  });
const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [platforms, setPlatforms] = useState([
    { value: "", label: "Select Platform" },
    { value: "Instagram", label: "Instagram" },
    { value: "TikTok", label: "TikTok" },
    { value: "OnlyFans", label: "OnlyFans" },
    { value: "Twitter", label: "Twitter" },
    { value: "Other", label: "Other" }
  ]);

useEffect(() => {
    const loadPlatforms = async () => {
      try {
        const settings = await settingsService.get();
        const platformOptions = [
          { value: "", label: "Select Platform" },
          ...settings.platforms.map(platform => ({
            value: platform.name,
            label: platform.name
          })),
          { value: "Other", label: "Other" }
        ];
        setPlatforms(platformOptions);
      } catch (error) {
        console.error("Failed to load platforms:", error);
      }
    };

    loadPlatforms();
  }, []);

  useEffect(() => {
    if (model) {
      setFormData({
        link: model.link || "",
        platform: model.platform || "",
        notes: model.notes || "",
        followedBy: model.followedBy || "",
        followDate: model.followDate ? model.followDate.split("T")[0] : "",
        dmSent: model.dmSent || false,
        dmSentDate: model.dmSentDate ? model.dmSentDate.split("T")[0] : ""
      });
    }
  }, [model]);

const detectPlatformFromUrl = async (url) => {
    if (!url || !isValidUrl(url)) return "";

    try {
      // Handle URLs with or without protocol
      let normalizedUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        normalizedUrl = 'https://' + url;
      }
      
      const urlObj = new URL(normalizedUrl);
      const domain = urlObj.hostname.replace(/^www\./, '').toLowerCase();
      
      const settings = await settingsService.get();
      const matchedPlatform = settings.platforms.find(platform => {
        const platformDomain = platform.domain.replace(/^www\./, '').toLowerCase();
        return domain === platformDomain || domain.endsWith('.' + platformDomain);
      });
      
      return matchedPlatform ? matchedPlatform.name : "";
    } catch (error) {
      return "";
    }
  };
// URL cleaning utility
  const cleanUrl = (url) => {
    if (!url) return url;
    
    try {
      const urlObj = new URL(url);
      // Remove all query parameters and hash fragments
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`.replace(/\/$/, '');
    } catch (error) {
      return url; // Return original if parsing fails
    }
  };

  const validateForm = async () => {
    const newErrors = {};

    if (!formData.link.trim()) {
      newErrors.link = "Link is required";
    } else if (!isValidUrl(formData.link)) {
      newErrors.link = "Please enter a valid URL";
    } else {
      // Check for duplicates using cleaned URLs
      const cleanedUrl = cleanUrl(formData.link);
      
      try {
        // Check models for duplicate
        const existingModels = await modelService.getAll();
        const duplicateModel = existingModels.find(model => 
          cleanUrl(model.link) === cleanedUrl && model.Id !== formData.Id
        );
        
        if (duplicateModel) {
          newErrors.link = "This link already exists in your models list";
        } else {
          // Check blacklist for duplicate
          const existingBlacklist = await blacklistService.getAll();
          const duplicateBlacklist = existingBlacklist.find(item => 
            cleanUrl(item.link) === cleanedUrl
          );
          
          if (duplicateBlacklist) {
            newErrors.link = "This link exists in your blacklist";
          }
        }
      } catch (error) {
        console.error('Error checking for duplicates:', error);
        // Don't block submission on error, just log it
      }
    }

    if (!formData.platform) {
      newErrors.platform = "Platform is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };
const handleChange = async (field, value) => {
    // Auto-detect platform when URL is entered or changed
    if (field === "link" && value) {
      // Clean the URL automatically
      const cleanedUrl = cleanUrl(value);
      const detectedPlatform = await detectPlatformFromUrl(cleanedUrl);
      
      setFormData(prev => ({
        ...prev,
        [field]: cleanedUrl,
        platform: detectedPlatform || prev.platform
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    
    try {
      // Ensure URL is cleaned before submission
      const cleanedFormData = {
        ...formData,
        link: cleanUrl(formData.link)
      };
      
      await onSubmit(cleanedFormData);
      toast.success(model ? "Model updated successfully!" : "Model added successfully!");
    } catch (error) {
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
<form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Profile Link *"
        type="url"
        value={formData.link}
        onChange={(e) => handleChange("link", e.target.value)}
        placeholder="https://instagram.com/username"
        error={errors.link}
      />

      <Select
        label="Platform *"
        value={formData.platform}
        onChange={(e) => handleChange("platform", e.target.value)}
        error={errors.platform}
      >
        {platforms.map((platform) => (
          <option key={platform.value} value={platform.value}>
            {platform.label}
          </option>
        ))}
      </Select>

      <Input
        label="Followed By"
        value={formData.followedBy}
        onChange={(e) => handleChange("followedBy", e.target.value)}
        placeholder="Account name that followed"
      />

      <Input
        label="Follow Date"
        type="date"
        value={formData.followDate}
        onChange={(e) => handleChange("followDate", e.target.value)}
      />

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="dmSent"
          checked={formData.dmSent}
          onChange={(e) => handleChange("dmSent", e.target.checked)}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="dmSent" className="text-sm font-medium text-gray-700">
          DM Sent
        </label>
      </div>

      {formData.dmSent && (
        <Input
          label="DM Sent Date"
          type="date"
          value={formData.dmSentDate}
          onChange={(e) => handleChange("dmSentDate", e.target.value)}
        />
      )}

      <Textarea
        label="Notes"
        value={formData.notes}
        onChange={(e) => handleChange("notes", e.target.value)}
        placeholder="Additional notes about this model..."
        rows={3}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : model ? "Update Model" : "Add Model"}
        </Button>
      </div>
    </form>
  );
};

export default AddModelForm;