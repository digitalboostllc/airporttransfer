'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  FileText,
  CreditCard,
  Car,
  Bug,
  User,
  Wrench,
  MoreHorizontal
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface Booking {
  id: string;
  bookingReference: string;
  carMake: string;
  carModel: string;
  carYear: number;
  pickupDatetime: string;
  status: string;
}

const categories = [
  { value: 'booking_issue', label: 'Booking Issue', icon: FileText, description: 'Problems with your reservation' },
  { value: 'payment_problem', label: 'Payment Problem', icon: CreditCard, description: 'Billing and payment issues' },
  { value: 'car_problem', label: 'Car Problem', icon: Car, description: 'Issues with the vehicle' },
  { value: 'website_bug', label: 'Website Bug', icon: Bug, description: 'Technical problems with the site' },
  { value: 'account_issue', label: 'Account Issue', icon: User, description: 'Profile and account problems' },
  { value: 'general_inquiry', label: 'General Inquiry', icon: HelpCircle, description: 'Questions and information' },
  { value: 'technical_support', label: 'Technical Support', icon: Wrench, description: 'Technical assistance needed' },
  { value: 'other', label: 'Other', icon: MoreHorizontal, description: 'Something else' }
];

const priorities = [
  { value: 'low', label: 'Low', description: 'Non-urgent, can wait a few days' },
  { value: 'medium', label: 'Medium', description: 'Normal priority' },
  { value: 'high', label: 'High', description: 'Urgent, needs attention soon' },
  { value: 'urgent', label: 'Urgent', description: 'Critical, needs immediate attention' }
];

export default function NewTicketPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    category: '',
    priority: 'medium',
    subject: '',
    description: '',
    relatedBookingId: ''
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const loadBookings = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadBookings();
    }
  }, [token, loadBookings]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const validFiles = newFiles.filter(file => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/', 'application/pdf', 'text/', 'application/msword', 'application/vnd.openxmlformats-officedocument'];
        
        if (file.size > maxSize) {
          setError(`File ${file.name} is too large. Maximum size is 10MB.`);
          return false;
        }
        
        if (!allowedTypes.some(type => file.type.startsWith(type))) {
          setError(`File ${file.name} is not a supported format.`);
          return false;
        }
        
        return true;
      });

      if (attachments.length + validFiles.length > 5) {
        setError('Maximum 5 files allowed.');
        return;
      }

      setAttachments(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.category || !formData.subject.trim() || !formData.description.trim()) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      // For now, we'll handle attachments as URLs (placeholder)
      // In a real implementation, you'd upload files first and get URLs
      const attachmentUrls: string[] = [];

      const ticketData = {
        category: formData.category,
        priority: formData.priority,
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        relatedBookingId: formData.relatedBookingId || null,
        attachments: attachmentUrls
      };

      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(ticketData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Support ticket created successfully!');
        setTimeout(() => {
          router.push(`/support/${data.ticket.id}`);
        }, 2000);
      } else {
        setError(data.error || 'Failed to create ticket');
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      setError('Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">Please log in to create a support ticket.</p>
            <Link href="/login">
              <Button>Log In</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/support">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Support
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Support Ticket</h1>
              <p className="text-gray-600 mt-2">Describe your issue and we&apos;ll help you resolve it</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Category Selection */}
            <Card>
              <CardHeader>
                <CardTitle>What can we help you with?</CardTitle>
                <CardDescription>
                  Select the category that best describes your issue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <div
                        key={category.value}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          formData.category === category.value
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleInputChange('category', category.value)}
                      >
                        <div className="flex items-start gap-3">
                          <IconComponent className={`w-5 h-5 mt-0.5 ${
                            formData.category === category.value ? 'text-red-600' : 'text-gray-500'
                          }`} />
                          <div>
                            <h3 className={`font-medium ${
                              formData.category === category.value ? 'text-red-900' : 'text-gray-900'
                            }`}>
                              {category.label}
                            </h3>
                            <p className={`text-sm mt-1 ${
                              formData.category === category.value ? 'text-red-700' : 'text-gray-600'
                            }`}>
                              {category.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Priority & Related Booking */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Priority Level</CardTitle>
                  <CardDescription>How urgent is this issue?</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div>
                            <div className="font-medium">{priority.label}</div>
                            <div className="text-sm text-gray-600">{priority.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Related Booking</CardTitle>
                  <CardDescription>Select a booking if this issue is related to one</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={formData.relatedBookingId} 
                    onValueChange={(value) => handleInputChange('relatedBookingId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a booking (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No related booking</SelectItem>
                      {bookings.map((booking) => (
                        <SelectItem key={booking.id} value={booking.id}>
                          <div>
                            <div className="font-medium">#{booking.bookingReference}</div>
                            <div className="text-sm text-gray-600">
                              {booking.carMake} {booking.carModel} {booking.carYear}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Subject & Description */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Details</CardTitle>
                <CardDescription>
                  Provide a clear subject and detailed description of your issue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject" className="text-base font-medium">
                    Subject <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Brief summary of your issue"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-base font-medium">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide as much detail as possible about your issue. Include any error messages, steps you've taken, and what you expected to happen."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Attachments */}
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
                <CardDescription>
                  Upload screenshots, documents, or other files that might help us understand your issue (Max 5 files, 10MB each)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <input
                      type="file"
                      id="attachments"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                    <label htmlFor="attachments">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Click to upload files or drag and drop</p>
                        <p className="text-sm text-gray-500 mt-1">PNG, JPG, PDF, DOC, TXT up to 10MB</p>
                      </div>
                    </label>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-sm text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-600">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Link href="/support">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading || !formData.category || !formData.subject.trim() || !formData.description.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Ticket'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
