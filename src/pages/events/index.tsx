import { useEffect, useState } from "react";
import { Inter } from 'next/font/google';
import { Calendar, MapPin, DollarSign, Ticket, LogOut, TicketCheck } from 'lucide-react';
import { useRouter } from 'next/router';
import api from "../../utils/api";

// Custom font configuration
const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  display: 'swap'
});

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  price: number;
  location: string;
  imageUrl?: string;
}

export default function Events() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null); // For messages (error/success)

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    router.push('/');
  };

  useEffect(() => {
    async function fetchEvents() {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem("userRole");

      if (token) {
        try {
          const response = await api.get("/events", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setEvents(response.data);
          if (userRole !== "user") {
            router.push("/");
            return;
          }
          setAuthLoading(false);
        } catch (error) {
          console.error("Error fetching events: ", error);
          handleLogout();
        }
      } else {
        router.push('/');
      }
    }

    fetchEvents();
  }, []);

  if (authLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }
  // Function to create booking
  const createBooking = async (eventId: number) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const quantity = quantities[eventId] || 1;
  
    if (!token) {
      setMessage("No token found, please log in.");
      setTimeout(() => setMessage(null), 5000);  // Clear message after 5 seconds
      handleLogout();
      return;
    }
  
    try {
      const response = await api.post(
        "/bookings",
        {
          userId,
          eventId,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Booking successful!");
      setTimeout(() => setMessage(null), 5000);  // Clear message after 5 seconds
    } catch (error: unknown) {
      if (error instanceof Error) {
        // If the error is an instance of Error, access the message
        setMessage("" + error.message);
      } else if (error && typeof error === "object" && "response" in error) {
        // If the error has a 'response' field, handle it accordingly
        setMessage("" + (error as any).response?.data?.message || "Unknown error");
      } else {
        // Generic error message if type is not recognized
        setMessage("An unknown error occurred.");
      }
      setTimeout(() => setMessage(null), 5000);  // Clear message after 5 seconds
    }
  };
  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`${inter.className} min-h-screen bg-slate-50 p-4 md:p-6 lg:p-10`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
              Discover Events
            </h1>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 w-full md:w-auto">
              <input 
                type="text" 
                placeholder="Search" 
                className="px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                onClick={() => router.push('/bookings')}
                className="bg-indigo-500 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition-colors flex items-center justify-center"
                title="My Bookings"
              >
                <TicketCheck className="w-5 h-5 mr-2" />
                My Bookings
              </button>
              <button 
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                title="Logout"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 text-center rounded-md ${message.includes("successful") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {message}
          </div>
        )}

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-lg sm:text-2xl text-slate-500">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div 
                key={event.id} 
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                {/* Event Image */}
                <div className="relative h-40 sm:h-48 w-full">
                  <img 
                    src={event.imageUrl || `events.png`} 
                    alt={event.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/80 px-3 py-1 rounded-full flex items-center">
                    <Ticket className="w-4 h-4 mr-2 text-indigo-600" />
                    <span className="font-semibold text-slate-800">{event.price > 0 ? `PKR ${event.price}` : 'Free'}</span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-2">{event.name}</h2>
                  <p className="text-slate-600 mb-4 line-clamp-2">{event.description}</p>

                  {/* Event Meta */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-slate-600">
                      <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                      <span>{new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  {/* Booking Section */}
                  <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
                    <div className="flex-grow w-full sm:w-auto">
                      <label className="block text-sm text-slate-700 mb-1">Tickets</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={quantities[event.id]}
                        placeholder=" '1' Ticket is default"
                        onChange={(e) => setQuantities({
                          ...quantities,
                          [event.id]: Number(e.target.value)
                        })}
                        min={1}
                        required
                      />
                    </div>
                    <button 
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors w-full sm:w-auto"
                      onClick={() => createBooking(event.id)}
                    >
                      Book Now
                    </button>
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
