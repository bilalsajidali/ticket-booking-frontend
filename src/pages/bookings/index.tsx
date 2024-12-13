import { useEffect, useState } from "react";
import { Inter } from 'next/font/google';
import { useRouter } from 'next/router';
import { Calendar, Ticket, LogOut, Home } from 'lucide-react';
import api from "../../utils/api";

// Custom font configuration
const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  display: 'swap'
});

interface Booking {
  id: number;
  eventId: number;
  quantity: number;
  eventName?: string;
  event: {
    name: string;
    description: string;
    date: string;
    location: string;
    price: number;
    imageUrl?: string;
  };
  createdAt: string;
}

export default function BookingHistory() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Logout function
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    // Redirect to login page
    router.push('/');
  };

  useEffect(() => {
    async function fetchBookings() {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        setError("User not logged in or token expired.");
        setLoading(false);
        router.push('/');
        return;
      }

      try {
        const response = await api.get(`/bookings?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setBookings(response.data);
        setLoading(false);
      } catch (err) {
        setError("Error fetching booking history.");
        console.error(err);
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className={`${inter.className} min-h-screen bg-slate-50 flex items-center justify-center`}>
        <p className="text-2xl text-slate-500">Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${inter.className} min-h-screen bg-slate-50 flex items-center justify-center`}>
        <p className="text-2xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={`${inter.className} min-h-screen bg-slate-50 p-6 md:p-10`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-slate-900 mb-4 md:mb-0">
              My Bookings
            </h1>
            <div className="flex space-x-4 items-center">
              <button 
                onClick={() => router.push('/events')}
                className="bg-indigo-500 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition-colors flex items-center mr-2"
                title="Home"
              >
                <Home className="w-5 h-5 mr-2" />
                Events
              </button>
              <button 
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors flex items-center"
                title="Logout"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Grid */}
        {bookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-2xl text-slate-500">You have no bookings yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div 
                key={booking.id} 
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                {/* Event Image */}
                <div className="relative h-48 w-full">
                  <img 
                    src={booking.event.imageUrl || `events.png`} 
                    alt={booking.event.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/80 px-3 py-1 rounded-full flex items-center">
                    <Ticket className="w-4 h-4 mr-2 text-indigo-600" />
                    <span className="font-semibold text-slate-800">
                      {booking.quantity} Ticket{booking.quantity > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{booking.event.name}</h2>
                  <p className="text-slate-600 mb-4 line-clamp-2">{booking.event.description}</p>

                  {/* Event Meta */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-slate-600">
                      <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                      <span>{new Date(booking.event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <Ticket className="w-5 h-5 mr-2 text-indigo-500" />
                      <span>
                        Total: PKR {(booking.event.price * booking.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Booking Meta */}
                  <div className="text-sm text-slate-500">
                    Booked on: {new Date(booking.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}