'use client';

import React, { useState } from 'react';
import { Star, Loader2, CheckCircle, X, Car, Clock, DollarSign, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  bookingId: string;
  carDetails: {
    make: string;
    model: string;
    year: number;
    category: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

interface ReviewData {
  rating: number;
  title: string;
  comment: string;
  cleanlinessRating: number;
  serviceRating: number;
  valueRating: number;
}

const StarRating = ({ 
  rating, 
  onRatingChange, 
  label, 
  description,
  disabled = false 
}: {
  rating: number;
  onRatingChange: (rating: number) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) => (
  <div className="space-y-2">
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onRatingChange(star)}
          className={cn(
            "transition-colors",
            disabled ? "cursor-not-allowed" : "hover:scale-110 transform transition-transform"
          )}
        >
          <Star
            className={cn(
              "w-6 h-6",
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-300"
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">
        {rating > 0 ? `${rating}/5` : 'No rating'}
      </span>
    </div>
  </div>
);

export default function ReviewForm({
  bookingId,
  carDetails,
  isOpen,
  onClose,
  onSuccess,
  token
}: ReviewFormProps) {
  const [reviewData, setReviewData] = useState<ReviewData>({
    rating: 0,
    title: '',
    comment: '',
    cleanlinessRating: 0,
    serviceRating: 0,
    valueRating: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (reviewData.rating === 0) {
      setError('Please provide an overall rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId,
          ...reviewData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
          // Reset form
          setReviewData({
            rating: 0,
            title: '',
            comment: '',
            cleanlinessRating: 0,
            serviceRating: 0,
            valueRating: 0
          });
          setSuccess(false);
        }, 1500);
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Review submission error:', error);
      setError('An error occurred while submitting your review');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError('');
      setSuccess(false);
    }
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Review Submitted!
          </h3>
          <p className="text-gray-600">
            Thank you for your feedback. Your review will help other customers make better choices.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Rate Your Experience
              </h2>
              <p className="text-sm text-gray-600">
                {carDetails.make} {carDetails.model} {carDetails.year}
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Overall Rating */}
          <div className="bg-gray-50 rounded-xl p-4">
            <StarRating
              rating={reviewData.rating}
              onRatingChange={(rating) => setReviewData(prev => ({ ...prev, rating }))}
              label="Overall Rating"
              description="How would you rate your overall experience?"
              disabled={loading}
            />
          </div>

          {/* Detailed Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">Cleanliness</span>
              </div>
              <StarRating
                rating={reviewData.cleanlinessRating}
                onRatingChange={(rating) => setReviewData(prev => ({ ...prev, cleanlinessRating: rating }))}
                label=""
                description="Car condition and cleanliness"
                disabled={loading}
              />
            </div>

            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <Clock className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-900">Service</span>
              </div>
              <StarRating
                rating={reviewData.serviceRating}
                onRatingChange={(rating) => setReviewData(prev => ({ ...prev, serviceRating: rating }))}
                label=""
                description="Customer service quality"
                disabled={loading}
              />
            </div>

            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-center mb-2">
                <DollarSign className="w-4 h-4 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-orange-900">Value</span>
              </div>
              <StarRating
                rating={reviewData.valueRating}
                onRatingChange={(rating) => setReviewData(prev => ({ ...prev, valueRating: rating }))}
                label=""
                description="Value for money"
                disabled={loading}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Title (Optional)
            </label>
            <Input
              type="text"
              value={reviewData.title}
              onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Summarize your experience in a few words"
              disabled={loading}
              maxLength={100}
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review (Optional)
            </label>
            <Textarea
              value={reviewData.comment}
              onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your experience with future customers. What went well? What could be improved?"
              disabled={loading}
              rows={4}
              maxLength={1000}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {reviewData.comment.length}/1000 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || reviewData.rating === 0}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </div>
              ) : (
                'Submit Review'
              )}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-xs text-gray-500 text-center">
            Your review will be public and help other customers make informed decisions.
            You can edit or delete your review later from your profile.
          </p>
        </div>
      </div>
    </div>
  );
}
