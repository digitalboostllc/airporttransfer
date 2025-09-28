'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  MessageCircle, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  category: string;
  priority: string;
  status: string;
  subject: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  customerSatisfaction?: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
  assignedTo?: {
    id: string;
    email: string;
    fullName: string;
  };
  relatedBooking?: {
    id: string;
    bookingReference: string;
  };
  messages: Array<{
    id: string;
    message: string;
    createdAt: string;
    user: {
      id: string;
      fullName: string;
    };
  }>;
  _count: {
    messages: number;
  };
}

interface TicketsResponse {
  success: boolean;
  tickets: SupportTicket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  waiting_customer: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

const categoryLabels = {
  booking_issue: 'Booking Issue',
  payment_problem: 'Payment Problem',
  car_problem: 'Car Problem',
  website_bug: 'Website Bug',
  account_issue: 'Account Issue',
  general_inquiry: 'General Inquiry',
  technical_support: 'Technical Support',
  other: 'Other'
};

export default function SupportPage() {
  const { user, token } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (token) {
      loadTickets();
    }
  }, [token, statusFilter, categoryFilter]);

  const loadTickets = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const response = await fetch(`/api/support/tickets?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data: TicketsResponse = await response.json();

      if (data.success) {
        setTickets(data.tickets);
      } else {
        setError('Failed to load tickets');
      }
    } catch (err) {
      console.error('Error loading tickets:', err);
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    searchTerm === '' || 
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'waiting_customer': return <User className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">Please log in to access support.</p>
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
              <p className="text-gray-600 mt-2">Get help with your bookings and account</p>
            </div>
            <Link href="/support/new">
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                New Ticket
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="waiting_customer">Waiting</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tickets List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading tickets...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={loadTickets}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                    ? 'No tickets match your current filters.' 
                    : 'You haven\'t created any support tickets yet.'}
                </p>
                <Link href="/support/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Ticket
                  </Button>
                </Link>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">
                            <Link 
                              href={`/support/${ticket.id}`}
                              className="hover:text-red-600 transition-colors"
                            >
                              {ticket.subject}
                            </Link>
                          </CardTitle>
                          {ticket.relatedBooking && (
                            <Badge variant="outline" className="text-xs">
                              Booking #{ticket.relatedBooking.bookingReference}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>#{ticket.ticketNumber}</span>
                          <span>{categoryLabels[ticket.category as keyof typeof categoryLabels]}</span>
                          <span>
                            Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                          </span>
                          {ticket._count.messages > 1 && (
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {ticket._count.messages - 1} replies
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={`${priorityColors[ticket.priority as keyof typeof priorityColors]} border-0`}
                        >
                          {ticket.priority}
                        </Badge>
                        <Badge 
                          className={`${statusColors[ticket.status as keyof typeof statusColors]} border-0 flex items-center gap-1`}
                        >
                          {getStatusIcon(ticket.status)}
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 line-clamp-2 mb-4">{ticket.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {ticket.assignedTo && (
                          <span>Assigned to {ticket.assignedTo.fullName}</span>
                        )}
                        {ticket.resolvedAt && (
                          <span>
                            Resolved {formatDistanceToNow(new Date(ticket.resolvedAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <Link href={`/support/${ticket.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
