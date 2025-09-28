'use client';

import React, { useState, useEffect } from 'react';
import { Star, User, Calendar, ThumbsUp, MessageCircle, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  cleanlinessRating?: number;
  serviceRating?: number;
  valueRating?: number;
  createdAt: string;
  customerName: string;
  car?: {
    make: string;
    model: string;
    year: number;
    category: string;
  };
  agencyResponse?: string;
  agencyResponseDate?: string;
  isFeatured: boolean;
}

interface ReviewStats {
  averageRating: number;
  averageCleanlinessRating: number;
  averageServiceRating: number;
  averageValueRating: number;
  totalReviews: number;
}

interface ReviewDisplayProps {
  carId?: string;
  agencyId?: string;
  customerId?: string;
  limit?: number;
  showCarInfo?: boolean;
  className?: string;
}

const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) => (
  <div className="flex items-center space-x-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={cn(
          star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
          size === 'lg' ? "w-5 h-5" : "w-4 h-4"
        )}
      />
    ))}
  </div>
);

const RatingBreakdown = ({ stats }: { stats: ReviewStats }) => {
  const categories = [
    { label: 'Overall', rating: stats.averageRating, color: 'bg-blue-500' },
    { label: 'Cleanliness', rating: stats.averageCleanlinessRating, color: 'bg-green-500' },
    { label: 'Service', rating: stats.averageServiceRating, color: 'bg-purple-500' },
    { label: 'Value', rating: stats.averageValueRating, color: 'bg-orange-500' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {categories.map((category) => (
        <div key={category.label} className="text-center">
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2", category.color)}>
            <span className="text-white font-bold text-sm">
              {category.rating > 0 ? category.rating.toFixed(1) : '—'}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-700">{category.label}</p>
          <StarRating rating={Math.round(category.rating)} />
        </div>
      ))}
    </div>
  );
};

const ReviewCard = ({ review, showCarInfo = false }: { review: Review; showCarInfo?: boolean }) => {
  const [showFullComment, setShowFullComment] = useState(false);
  const [showAgencyResponse, setShowAgencyResponse] = useState(false);

  const isLongComment = review.comment && review.comment.length > 200;
  const displayComment = showFullComment ? review.comment : review.comment?.slice(0, 200);

  return (
    <div className={cn(
      "bg-white rounded-xl border border-gray-200 p-6 transition-all hover:shadow-md",
      review.isFeatured && "border-yellow-400 bg-yellow-50"
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">{review.customerName}</h4>
              {review.isFeatured && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                  Featured
                </span>
              )}
            </div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Calendar className="w-3 h-3 mr-1" />
              {format(new Date(review.createdAt), 'MMM dd, yyyy')}
            </div>
          </div>
        </div>
        <StarRating rating={review.rating} size="lg" />
      </div>

      {/* Car Information */}
      {showCarInfo && review.car && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700">
            {review.car.make} {review.car.model} {review.car.year}
          </p>
          <p className="text-xs text-gray-500 capitalize">{review.car.category}</p>
        </div>
      )}

      {/* Title */}
      {review.title && (
        <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
      )}

      {/* Detailed Ratings */}
      {(review.cleanlinessRating || review.serviceRating || review.valueRating) && (
        <div className="flex flex-wrap gap-4 mb-4">
          {review.cleanlinessRating && (
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-600">Cleanliness:</span>
              <StarRating rating={review.cleanlinessRating} />
            </div>
          )}
          {review.serviceRating && (
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-600">Service:</span>
              <StarRating rating={review.serviceRating} />
            </div>
          )}
          {review.valueRating && (
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-600">Value:</span>
              <StarRating rating={review.valueRating} />
            </div>
          )}
        </div>
      )}

      {/* Comment */}
      {review.comment && (
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">
            {displayComment}
            {isLongComment && !showFullComment && '...'}
          </p>
          {isLongComment && (
            <button
              onClick={() => setShowFullComment(!showFullComment)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 flex items-center"
            >
              {showFullComment ? (
                <>
                  Show less <ChevronUp className="w-3 h-3 ml-1" />
                </>
              ) : (
                <>
                  Show more <ChevronDown className="w-3 h-3 ml-1" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Agency Response */}
      {review.agencyResponse && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 flex items-center">
              <MessageCircle className="w-4 h-4 mr-2 text-blue-600" />
              Agency Response
            </span>
            <button
              onClick={() => setShowAgencyResponse(!showAgencyResponse)}
              className="text-blue-600 hover:text-blue-700"
            >
              {showAgencyResponse ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
          {showAgencyResponse && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-gray-700 text-sm leading-relaxed">{review.agencyResponse}</p>
              {review.agencyResponseDate && (
                <p className="text-xs text-gray-500 mt-2">
                  Responded on {format(new Date(review.agencyResponseDate), 'MMM dd, yyyy')}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function ReviewDisplay({
  carId,
  agencyId,
  customerId,
  limit = 10,
  showCarInfo = false,
  className = ''
}: ReviewDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const fetchReviews = async (resetOffset = false) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (carId) params.append('carId', carId);
      if (agencyId) params.append('agencyId', agencyId);
      if (customerId) params.append('customerId', customerId);
      params.append('limit', limit.toString());
      params.append('offset', resetOffset ? '0' : offset.toString());
      if (filterRating) params.append('rating', filterRating.toString());

      const response = await fetch(`/api/reviews?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        if (resetOffset) {
          setReviews(data.reviews);
          setOffset(data.pagination.limit);
        } else {
          setReviews(prev => [...prev, ...data.reviews]);
          setOffset(prev => prev + data.pagination.limit);
        }
        setStats(data.stats);
        setHasMore(data.pagination.hasMore);
      } else {
        setError(data.error || 'Failed to load reviews');
      }
    } catch (error) {
      console.error('Fetch reviews error:', error);
      setError('An error occurred while loading reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(true);
  }, [carId, agencyId, customerId, filterRating]);

  const handleLoadMore = () => {
    fetchReviews(false);
  };

  if (loading && reviews.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-red-600">{error}</p>
        <Button onClick={() => fetchReviews(true)} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
        <p className="text-gray-600">
          Be the first to share your experience with this {carId ? 'car' : 'service'}!
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats and Filter */}
      {stats && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Customer Reviews ({stats.totalReviews})
              </h3>
              <div className="flex items-center space-x-2">
                <StarRating rating={Math.round(stats.averageRating)} size="lg" />
                <span className="text-lg font-medium text-gray-900">
                  {stats.averageRating.toFixed(1)} out of 5
                </span>
              </div>
            </div>
            
            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterRating || ''}
                onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All ratings</option>
                <option value="5">5 stars</option>
                <option value="4">4 stars</option>
                <option value="3">3 stars</option>
                <option value="2">2 stars</option>
                <option value="1">1 star</option>
              </select>
            </div>
          </div>

          <RatingBreakdown stats={stats} />
        </div>
      )}

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            showCarInfo={showCarInfo}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            disabled={loading}
            className="px-8"
          >
            {loading ? 'Loading...' : 'Load More Reviews'}
          </Button>
        </div>
      )}
    </div>
  );
}
