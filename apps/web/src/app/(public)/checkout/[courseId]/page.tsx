'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  priceCents: number;
  isPremium: boolean;
  instructor: {
    name: string;
  };
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [params.courseId]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/${params.courseId}`
      );
      setCourse(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const createPaymentIntent = async () => {
    setProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        router.push(`/login?redirect=/checkout/${params.courseId}`);
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/create-intent`,
        {
          courseId: params.courseId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setClientSecret(response.data.clientSecret);
      setPaymentIntentId(response.data.paymentIntentId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create payment intent');
      setProcessing(false);
    }
  };

  const handleSimulatePayment = async () => {
    // For testing purposes - simulate successful payment
    if (!paymentIntentId) return;

    setProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/confirm`,
        {
          paymentIntentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Redirect to success page or course
      router.push(`/checkout/success?courseId=${params.courseId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment confirmation failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card>
          <CardContent className="pt-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <div className="mt-4 text-center">
              <Link href="/courses">
                <Button variant="outline">Back to Courses</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!course) return null;

  if (!course.isPremium) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">This course is free!</h2>
            <p className="text-gray-600 mb-6">You can enroll without payment.</p>
            <Link href={`/courses/${course.id}`}>
              <Button className="bg-green-600 hover:bg-green-700">
                Go to Course
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase to access the course</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Summary */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  {course.thumbnailUrl && (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{course.shortDescription}</p>
                    <p className="text-sm text-gray-500 mt-2">by {course.instructor.name}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Course Price</span>
                    <span className="font-medium">${(course.priceCents / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold border-t pt-4 mt-4">
                    <span>Total</span>
                    <span>${(course.priceCents / 100).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            {!clientSecret ? (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={createPaymentIntent}
                    disabled={processing}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {processing ? 'Processing...' : 'Proceed to Payment'}
                  </Button>

                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Secure payment powered by Stripe
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <h4 className="font-medium text-blue-900 mb-2">Test Mode</h4>
                    <p className="text-sm text-blue-800 mb-3">
                      This is a development environment. In production, you would enter real card details here using Stripe Elements.
                    </p>
                    <p className="text-xs text-blue-700">
                      Payment Intent ID: {paymentIntentId}
                    </p>
                  </div>

                  <Button
                    onClick={handleSimulatePayment}
                    disabled={processing}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {processing ? 'Processing Payment...' : 'Simulate Payment (Test Mode)'}
                  </Button>

                  <p className="text-xs text-gray-500 mt-4 text-center">
                    In production, Stripe Elements would appear here for secure card input
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Purchase Info */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Lifetime access to course content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>All video lectures and materials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Coding exercises and quizzes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Track your progress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Certificate of completion</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="pt-6">
                <p className="text-xs text-gray-500 text-center">
                  🔒 Secure checkout. Your payment information is encrypted and secure.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
