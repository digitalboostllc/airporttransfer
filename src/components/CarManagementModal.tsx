'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Trash2, 
  Plus, 
  Car, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  createCar, 
  updateCar, 
  type CarData, 
  type Car,
  CAR_CATEGORIES,
  CAR_MAKES,
  CAR_FEATURES
} from '@/lib/car-client';

interface CarManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  car?: Car | null; // If provided, we're editing; if null, we're creating
  token: string;
}

interface FormData {
  make: string;
  model: string;
  year: number;
  category: string;
  pricePerDay: number;
  images: string[];
  features: string[];
  location: string;
  description: string;
  specifications: {
    seats: number;
    luggage: number;
    transmission: string;
    fuelType: string;
    engine: string;
  };
}

export default function CarManagementModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  car, 
  token 
}: CarManagementModalProps) {
  const isEditing = !!car;
  
  const [formData, setFormData] = useState<FormData>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    category: '',
    pricePerDay: 0,
    images: [],
    features: [],
    location: '',
    description: '',
    specifications: {
      seats: 5,
      luggage: 2,
      transmission: 'Manual',
      fuelType: 'Petrol',
      engine: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newFeature, setNewFeature] = useState('');

  // Load car data for editing
  useEffect(() => {
    if (isEditing && car) {
      setFormData({
        make: car.make,
        model: car.model,
        year: car.year,
        category: car.category,
        pricePerDay: car.pricePerDay,
        images: car.images || [],
        features: car.features || [],
        location: car.location || '',
        description: car.description || '',
        specifications: {
          seats: car.specifications?.seats || 5,
          luggage: car.specifications?.luggage || 2,
          transmission: car.specifications?.transmission || 'Manual',
          fuelType: car.specifications?.fuelType || 'Petrol',
          engine: car.specifications?.engine || ''
        }
      });
    } else {
      // Reset form for new car
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        category: '',
        pricePerDay: 0,
        images: [],
        features: [],
        location: '',
        description: '',
        specifications: {
          seats: 5,
          luggage: 2,
          transmission: 'Manual',
          fuelType: 'Petrol',
          engine: ''
        }
      });
    }
  }, [isEditing, car]);

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSpecificationChange = (field: keyof FormData['specifications'], value: any) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      }
    }));
  };

  // Handle image management
  const addImage = () => {
    if (newImageUrl && !formData.images.includes(newImageUrl)) {
      handleInputChange('images', [...formData.images, newImageUrl]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    handleInputChange('images', newImages);
  };

  // Handle feature management
  const addFeature = (feature: string) => {
    if (feature && !formData.features.includes(feature)) {
      handleInputChange('features', [...formData.features, feature]);
    }
  };

  const addCustomFeature = () => {
    if (newFeature && !formData.features.includes(newFeature)) {
      handleInputChange('features', [...formData.features, newFeature]);
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    const newFeatures = formData.features.filter(f => f !== feature);
    handleInputChange('features', newFeatures);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.make || !formData.model || !formData.category || formData.pricePerDay <= 0) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const carData: CarData = {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        category: formData.category,
        pricePerDay: formData.pricePerDay,
        images: formData.images,
        features: formData.features,
        location: formData.location,
        description: formData.description,
        specifications: formData.specifications
      };

      let result;
      if (isEditing && car) {
        result = await updateCar(token, car.id, carData);
      } else {
        result = await createCar(token, carData);
      }

      if (result.success) {
        setSuccess(isEditing ? 'Car updated successfully!' : 'Car created successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Car form error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Car className="w-6 h-6 text-orange-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Car' : 'Add New Car'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-700">{success}</span>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Make *
              </label>
              <select
                value={formData.make}
                onChange={(e) => handleInputChange('make', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select Make</option>
                {CAR_MAKES.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model *
              </label>
              <Input
                type="text"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="e.g., Clio, A-Class"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                min="1990"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {CAR_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Day (MAD) *
              </label>
              <Input
                type="number"
                value={formData.pricePerDay}
                onChange={(e) => handleInputChange('pricePerDay', parseFloat(e.target.value))}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <Input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Casablanca, Rabat"
              />
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Specifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seats</label>
                <Input
                  type="number"
                  value={formData.specifications.seats}
                  onChange={(e) => handleSpecificationChange('seats', parseInt(e.target.value))}
                  min="2"
                  max="9"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Luggage</label>
                <Input
                  type="number"
                  value={formData.specifications.luggage}
                  onChange={(e) => handleSpecificationChange('luggage', parseInt(e.target.value))}
                  min="0"
                  max="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                <select
                  value={formData.specifications.transmission}
                  onChange={(e) => handleSpecificationChange('transmission', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                  <option value="CVT">CVT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                <select
                  value={formData.specifications.fuelType}
                  onChange={(e) => handleSpecificationChange('fuelType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Engine</label>
              <Input
                type="text"
                value={formData.specifications.engine}
                onChange={(e) => handleSpecificationChange('engine', e.target.value)}
                placeholder="e.g., 1.6L Turbo, 2.0L Diesel"
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Car Images</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Enter image URL"
                  className="flex-1"
                />
                <Button type="button" onClick={addImage} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Car image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {formData.images.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No images added yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {CAR_FEATURES.map(feature => (
                  <label key={feature} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          addFeature(feature);
                        } else {
                          removeFeature(feature);
                        }
                      }}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add custom feature"
                  className="flex-1"
                />
                <Button type="button" onClick={addCustomFeature} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.features.map(feature => (
                    <span
                      key={feature}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700"
                    >
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFeature(feature)}
                        className="ml-2 text-orange-500 hover:text-orange-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              placeholder="Describe your car, its condition, special features, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {isEditing ? 'Update Car' : 'Create Car'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
