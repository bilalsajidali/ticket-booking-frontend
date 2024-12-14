import { useEffect, useState } from "react";
import { Inter } from 'next/font/google';
import { Edit, Trash2, LogOut, PlusCircle, Save } from 'lucide-react';
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

export default function AdminEvents() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({});
  const [editEvent, setEditEvent] = useState<Partial<Event>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [authLoading, setAuthLoading] = useState(true);


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
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("userRole");
      if (!token) {
        setError("No token found, please log in.");
        setLoading(false);
        router.push("/");
        return;
      }
      if (userRole !== "admin") {
        router.push("/");
        return;
      } setAuthLoading(false);

      try {
        const response = await api.get("/events", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEvents(response.data);
      } catch (err) {
        setError("Error fetching events.");
        console.error(err);
        handleLogout();
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

// Loader
if (authLoading || loading) {
  return <div className="text-center py-12">Loading...</div>;
}

  const handleAddEvent = async () => {
    const token = localStorage.getItem("token");
    if (!token || !newEvent.name || !newEvent.date || !newEvent.location) {
      setError("Please fill in all required fields.");
      return;
    }    
    try {
      const response = await api.post("/events", newEvent, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents([...events, response.data]);
      setNewEvent({});
    } catch (err) {
      setError("Error adding event.");
      console.error(err);
    }
  };

  const handleUpdateEvent = async () => {
    const token = localStorage.getItem("token");
    if (!token || !editEvent.name || !editEvent.date || !editEvent.location) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const response = await api.put(`/events/${editEvent.id}`, editEvent, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(events.map(event => event.id === editEvent.id ? response.data : event));
      setIsEditModalOpen(false);  // Close modal after save
      setEditEvent({});
    } catch (err) {
      setError("Error updating event.");
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found, please log in.");
      return;
    }

    try {
      await api.delete(`/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEvents(events.filter(event => event.id !== id));
    } catch (err) {
      setError("Error deleting event.");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

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
              Manage Events
            </h1>
            <input 
                type="text" 
                placeholder="Search" 
                className="px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors flex items-center"
              title="Logout"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>

          {/* Error Handling */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              {error}
            </div>
          )}
        </div>

        {/* Create Event Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Create New Event</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Event Name"
              value={newEvent.name || ""}
              onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
              required
            />
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Event Location"
              value={newEvent.location || ""}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              required
            />
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Image URL (Optional)"
              value={newEvent.imageUrl || ""}
              onChange={(e) => setNewEvent({ ...newEvent, imageUrl: e.target.value })}
            />
            <input
              type="date"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newEvent.date || ""}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              required
            />
            <input
              type="number"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Event Price (Optional)"
              value={newEvent.price || ""}
              onChange={(e) => setNewEvent({ ...newEvent, price: parseFloat(e.target.value) })}
            />
            <textarea
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 md:col-span-2"
              placeholder="Event Description"
              value={newEvent.description || ""}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              rows={3}
            />
          </div>
          <button
            onClick={handleAddEvent}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Event
          </button>
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
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Event Details */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{event.name}</h3>
                  <p className="text-sm text-slate-600 mb-4">{event.description}</p>
                  <div className="text-sm text-slate-500 mb-2">Location: {event.location}</div>
                  <div className="text-sm text-slate-500 mb-2">Date: {new Date(event.date).toLocaleDateString("en-GB")}</div>
                  <div className="text-sm text-slate-500 mb-2">Price: PKR {event.price ? event.price.toFixed(2) : '0'}</div>
                </div>
                {/* Actions */}
                <div className="flex justify-between items-center p-4 border-t border-slate-200">
                  <button 
                    onClick={() => {
                      setEditEvent(event);
                      setIsEditModalOpen(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    <Edit className="w-4 h-4 inline-block mr-1" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4 inline-block mr-1" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">Edit Event</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Event Name"
                  value={editEvent.name || ""}
                  onChange={(e) => setEditEvent({ ...editEvent, name: e.target.value })}
                />
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Event Location"
                  value={editEvent.location || ""}
                  onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
                />
                <textarea
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Event Description"
                  value={editEvent.description || ""}
                  onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
                  rows={3}
                />
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editEvent.date || ""}
                  onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                />
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={editEvent.price || ""}
                  onChange={(e) => setEditEvent({ ...editEvent, price: parseFloat(e.target.value) })}
                  placeholder="Price"
                />
              </div>
              <div className="mt-4 flex justify-end space-x-4">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateEvent}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                >
                  <Save className="w-5 h-5 mr-2" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
