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

  // Logout function
  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    
    // Redirect to login page
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
          } setAuthLoading(false);
        } catch (error) {
          console.error("Error fetching events: ", error);
          // If token is invalid, redirect to login
          handleLogout();
        }
      } else {
        // If no token, redirect to login
        router.push('/');
      }
    }
  
    fetchEvents();
  }, []);

  //Loader
  if (authLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }
  // Function to create booking
  const createBooking = async (eventId: number) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const quantity = quantities[eventId] || 1;

    if (!token) {
      console.log("No token found, please log in.");
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
      console.log("Booking successful:", response.data);
      // TODO: Add success notification
    } catch (error) {
      console.error("Error creating booking:", error);
      // TODO: Add error notification
    }
  };

  // Filter events
  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  return (
    <div className={`${inter.className} min-h-screen bg-slate-50 p-6 md:p-10`}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-slate-900 mb-4 md:mb-0">
              Discover Events
            </h1>
            <div className="flex space-x-4 items-center">
              <input 
                type="text" 
                placeholder="Search" 
                className="px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                onClick={() => router.push('/bookings')}
                className="bg-indigo-500 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition-colors flex items-center mr-2"
                title="My Bookings"
              >
                <TicketCheck className="w-5 h-5 mr-2" />
                My Bookings
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

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <p className="text-2xl text-slate-500">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div 
                key={event.id} 
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
              >
                {/* Event Image */}
                <div className="relative h-48 w-full">
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
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{event.name}</h2>
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
                  <div className="flex items-center space-x-3">
                    <div className="flex-grow">
                      <label className="block text-sm text-slate-700 mb-1">Tickets</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={quantities[event.id] || 1}
                        onChange={(e) => setQuantities({
                          ...quantities,
                          [event.id]: Number(e.target.value)
                        })}
                        min={1}
                        required
                      />
                    </div>
                    <button 
                      className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
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