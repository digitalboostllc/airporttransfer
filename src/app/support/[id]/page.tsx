'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Send, 
  User, 
  Clock, 
  Star,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  Tag,
  Flag,
  Eye,
  EyeOff
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  internalNotes?: string;
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
    customerName: string;
  };
  messages: Array<{
    id: string;
    message: string;
    isInternal: boolean;
    createdAt: string;
    attachments: string;
    user: {
      id: string;
      fullName: string;
      role: string;
    };
  }>;
}

interface SupportMessage {
  id: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  attachments: string;
  user: {
    id: string;
    fullName: string;
    role: string;
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

export default function SupportTicketPage() {
  const { user, token } = useAuth();
  const params = useParams();
  const ticketId = params?.id as string;
  
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>('');
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [showInternalNotes, setShowInternalNotes] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token && ticketId) {
      loadTicket();
    }
  }, [token, ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadTicket = async () => {
    if (!token || !ticketId) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setTicket(data.ticket);
        setMessages(data.ticket.messages || []);
        if (data.ticket.customerSatisfaction) {
          setSatisfaction(data.ticket.customerSatisfaction);
        }
      } else {
        setError(data.error || 'Failed to load ticket');
      }
    } catch (err) {
      console.error('Error loading ticket:', err);
      setError('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!token || !ticketId || !newMessage.trim()) return;

    try {
      setSending(true);
      setError('');

      const response = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: newMessage.trim(),
          attachments: [],
          isInternal: false
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        // Reload ticket to get updated status
        loadTicket();
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const submitSatisfaction = async (rating: number) => {
    if (!token || !ticketId) return;

    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerSatisfaction: rating
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSatisfaction(rating);
        setTicket(prev => prev ? { ...prev, customerSatisfaction: rating } : null);
      }
    } catch (err) {
      console.error('Error submitting satisfaction:', err);
    }
  };

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

  const isTicketClosed = ticket?.status === 'closed';
  const canRate = ticket?.status === 'resolved' || ticket?.status === 'closed';
  const isMyTicket = ticket?.user.id === user?.id;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">Please log in to view this ticket.</p>
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link href="/support">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Support
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading ticket...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">{error}</p>
              <Button 
                variant="outline" 
                onClick={loadTicket}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : !ticket ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-yellow-600">Ticket not found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Ticket Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-2xl">{ticket.subject}</CardTitle>
                        {ticket.relatedBooking && (
                          <Badge variant="outline">
                            Booking #{ticket.relatedBooking.bookingReference}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          #{ticket.ticketNumber}
                        </span>
                        <span>{categoryLabels[ticket.category as keyof typeof categoryLabels]}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${priorityColors[ticket.priority as keyof typeof priorityColors]} border-0`}>
                        <Flag className="w-3 h-3 mr-1" />
                        {ticket.priority}
                      </Badge>
                      <Badge className={`${statusColors[ticket.status as keyof typeof statusColors]} border-0 flex items-center gap-1`}>
                        {getStatusIcon(ticket.status)}
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  {ticket.assignedTo && (
                    <div className="text-sm text-gray-600">
                      Assigned to <span className="font-medium">{ticket.assignedTo.fullName}</span>
                    </div>
                  )}

                  {ticket.resolvedAt && (
                    <div className="text-sm text-green-600">
                      ✓ Resolved {formatDistanceToNow(new Date(ticket.resolvedAt), { addSuffix: true })}
                    </div>
                  )}
                </CardHeader>
              </Card>

              {/* Messages */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Conversation ({messages.filter(m => !m.isInternal).length})
                    </CardTitle>
                    {user?.role === 'admin' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowInternalNotes(!showInternalNotes)}
                        className="text-blue-600"
                      >
                        {showInternalNotes ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                        Internal Notes
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 max-h-96 overflow-y-auto">
                    {messages.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No messages yet</p>
                    ) : (
                      messages
                        .filter(message => !message.isInternal || showInternalNotes)
                        .map((message, index) => {
                          const isStaff = message.user.role === 'admin';
                          const isInternal = message.isInternal;
                          
                          return (
                            <div
                              key={message.id}
                              className={cn(
                                "flex gap-3",
                                isStaff ? "justify-end" : "justify-start"
                              )}
                            >
                              <div className={cn(
                                "max-w-[80%] rounded-lg px-4 py-3",
                                isInternal 
                                  ? "bg-blue-50 border border-blue-200" 
                                  : isStaff 
                                    ? "bg-red-600 text-white" 
                                    : "bg-gray-100 text-gray-900"
                              )}>
                                {isInternal && (
                                  <div className="text-xs text-blue-600 mb-1 font-medium">
                                    🔒 Internal Note
                                  </div>
                                )}
                                <div className="text-sm mb-2">{message.message}</div>
                                <div className={cn(
                                  "text-xs flex items-center justify-between gap-2",
                                  isInternal 
                                    ? "text-blue-600" 
                                    : isStaff 
                                      ? "text-red-100" 
                                      : "text-gray-500"
                                )}>
                                  <span>{message.user.fullName}</span>
                                  <span>{format(new Date(message.createdAt), 'MMM d, h:mm a')}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <Separator className="my-6" />

                  {/* Message Input */}
                  {!isTicketClosed && (
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={3}
                        disabled={sending}
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={sendMessage}
                          disabled={sending || !newMessage.trim()}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {sending ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {isTicketClosed && (
                    <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                      <XCircle className="w-6 h-6 mx-auto mb-2" />
                      This ticket is closed. No new messages can be added.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Customer Satisfaction */}
              {canRate && isMyTicket && (
                <Card>
                  <CardHeader>
                    <CardTitle>Rate Your Experience</CardTitle>
                    <CardDescription>
                      How satisfied are you with the resolution of your issue?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {satisfaction ? (
                      <div className="text-center">
                        <div className="flex justify-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "w-6 h-6",
                                star <= satisfaction
                                  ? "text-yellow-500 fill-current"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-green-600 font-medium">
                          Thank you for rating your experience!
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="flex justify-center gap-1 mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => submitSatisfaction(star)}
                              className="transition-colors hover:scale-110"
                            >
                              <Star
                                className="w-8 h-8 text-gray-300 hover:text-yellow-500"
                              />
                            </button>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">
                          Click on a star to rate (1 = Poor, 5 = Excellent)
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
