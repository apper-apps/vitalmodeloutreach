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
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkUrls, setBulkUrls] = useState("");
  const [bulkResults, setBulkResults] = useState([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkProcessed, setBulkProcessed] = useState(false);
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
      setIsBulkMode(false); // Disable bulk mode when editing
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

  const processBulkUrls = async () => {
    if (!bulkUrls.trim()) {
      toast.error("Please enter some URLs to process");
      return;
    }

    setIsBulkProcessing(true);
    setBulkResults([]);

    const urls = bulkUrls.split('\n').filter(url => url.trim());
    const results = [];
    const existingModels = await modelService.getAll();
    const existingBlacklist = await blacklistService.getAll();

    for (let i = 0; i < urls.length; i++) {
      const originalUrl = urls[i].trim();
      if (!originalUrl) continue;

      const result = {
        originalUrl,
        cleanedUrl: '',
        platform: '',
        status: 'processing',
        error: ''
      };

      try {
        // Validate URL format
        if (!isValidUrl(originalUrl)) {
          result.status = 'invalid';
          result.error = 'Invalid URL format';
          results.push(result);
          continue;
        }

        // Clean URL
        const cleanedUrl = cleanUrl(originalUrl);
        result.cleanedUrl = cleanedUrl;

        // Check for duplicates in models
        const duplicateModel = existingModels.find(model => 
          cleanUrl(model.link) === cleanedUrl
        );
        if (duplicateModel) {
          result.status = 'duplicate';
          result.error = 'Already exists in models';
          results.push(result);
          continue;
        }

        // Check for duplicates in blacklist
        const duplicateBlacklist = existingBlacklist.find(item => 
          cleanUrl(item.link) === cleanedUrl
        );
        if (duplicateBlacklist) {
          result.status = 'blacklisted';
          result.error = 'Exists in blacklist';
          results.push(result);
          continue;
        }

        // Check for duplicates in current batch
        const duplicateInBatch = results.find(r => r.cleanedUrl === cleanedUrl);
        if (duplicateInBatch) {
          result.status = 'duplicate';
          result.error = 'Duplicate in current batch';
          results.push(result);
          continue;
        }

        // Detect platform
        const detectedPlatform = await detectPlatformFromUrl(cleanedUrl);
        result.platform = detectedPlatform || 'Other';
        result.status = 'valid';

      } catch (error) {
        result.status = 'error';
        result.error = 'Processing error';
      }

      results.push(result);
    }

    setBulkResults(results);
    setBulkProcessed(true);
    setIsBulkProcessing(false);

    const validCount = results.filter(r => r.status === 'valid').length;
    const duplicateCount = results.filter(r => r.status === 'duplicate' || r.status === 'blacklisted').length;
    const errorCount = results.filter(r => r.status === 'invalid' || r.status === 'error').length;

    toast.info(`Processed ${results.length} URLs: ${validCount} valid, ${duplicateCount} duplicates, ${errorCount} errors`);
  };

  const handleBulkSubmit = async () => {
    const validResults = bulkResults.filter(r => r.status === 'valid');
    
    if (validResults.length === 0) {
      toast.error("No valid URLs to add");
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const result of validResults) {
        try {
          const modelData = {
            link: result.cleanedUrl,
            platform: result.platform,
            notes: `Bulk imported on ${new Date().toLocaleDateString()}`,
            followedBy: "",
            followDate: "",
            dmSent: false,
            dmSentDate: ""
          };
          
          await onSubmit(modelData);
          successCount++;
        } catch (error) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} model${successCount > 1 ? 's' : ''}!`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to add ${errorCount} model${errorCount > 1 ? 's' : ''}`);
      }

      // Reset bulk form on success
      if (successCount > 0) {
        setBulkUrls("");
        setBulkResults([]);
        setBulkProcessed(false);
      }
    } catch (error) {
      toast.error("Bulk import failed");
    } finally {
      setIsSubmitting(false);
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
    <div className="space-y-4">
      {/* Mode Toggle - Only show if not editing existing model */}
      {!model && (
        <div className="flex space-x-2 mb-6">
          <Button
            type="button"
            variant={!isBulkMode ? "primary" : "secondary"}
            onClick={() => setIsBulkMode(false)}
          >
            Single Model
          </Button>
          <Button
            type="button"
            variant={isBulkMode ? "primary" : "secondary"}
            onClick={() => setIsBulkMode(true)}
          >
            Bulk Add
          </Button>
        </div>
      )}

      {/* Single Model Form */}
      {!isBulkMode && (
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
      )}

      {/* Bulk Add Form */}
      {isBulkMode && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste URLs (one per line) *
            </label>
            <Textarea
              value={bulkUrls}
              onChange={(e) => setBulkUrls(e.target.value)}
              placeholder="https://instagram.com/model1&#10;https://tiktok.com/@model2&#10;https://twitter.com/model3&#10;..."
              rows={8}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste each model URL on a new line. URLs will be cleaned and platforms auto-detected.
            </p>
          </div>

          {/* Process Button */}
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={processBulkUrls}
              disabled={isBulkProcessing || !bulkUrls.trim()}
            >
              {isBulkProcessing ? "Processing..." : "Process URLs"}
            </Button>
          </div>

          {/* Results Preview */}
          {bulkProcessed && bulkResults.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Processing Results</h4>
              <div className="max-h-64 overflow-y-auto border rounded-lg">
                {bulkResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 border-b last:border-b-0 ${
                      result.status === 'valid' ? 'bg-green-50' :
                      result.status === 'duplicate' || result.status === 'blacklisted' ? 'bg-yellow-50' :
                      'bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.cleanedUrl || result.originalUrl}
                        </p>
                        {result.platform && (
                          <p className="text-xs text-gray-600">Platform: {result.platform}</p>
                        )}
                        {result.error && (
                          <p className="text-xs text-red-600">{result.error}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          result.status === 'valid' ? 'bg-green-100 text-green-800' :
                          result.status === 'duplicate' ? 'bg-yellow-100 text-yellow-800' :
                          result.status === 'blacklisted' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {result.status === 'valid' ? 'Ready' :
                         result.status === 'duplicate' ? 'Duplicate' :
                         result.status === 'blacklisted' ? 'Blacklisted' :
                         result.status === 'invalid' ? 'Invalid' : 'Error'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Valid URLs: <strong className="text-green-600">{bulkResults.filter(r => r.status === 'valid').length}</strong></span>
                  <span>Duplicates: <strong className="text-yellow-600">{bulkResults.filter(r => r.status === 'duplicate' || r.status === 'blacklisted').length}</strong></span>
                  <span>Errors: <strong className="text-red-600">{bulkResults.filter(r => r.status === 'invalid' || r.status === 'error').length}</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {bulkProcessed && bulkResults.some(r => r.status === 'valid') && (
              <Button
                type="button"
                onClick={handleBulkSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding Models..." : `Add ${bulkResults.filter(r => r.status === 'valid').length} Models`}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddModelForm;