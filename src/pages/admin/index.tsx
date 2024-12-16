import { useEffect, useState } from "react";
import { Inter } from 'next/font/google';
import { Edit, Trash2, LogOut, PlusCircle, Save } from 'lucide-react';
import { useRouter } from 'next/router';
import api from "../../utils/api";

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

  const handleAddEvent = async () => {
    const token = localStorage.getItem("token");
    if (!token || !newEvent.name || !newEvent.date || !newEvent.location || !newEvent.description) {
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
      setIsEditModalOpen(false);  
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

  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className={`${inter.className} min-h-screen bg-slate-50 p-4 md:p-10`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <h1 className="text-2xl md:text-4xl font-bold text-slate-900">Manage Events</h1>
            <div className="flex flex-col md:flex-row md:space-x-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search"
                className="px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-grow md:flex-grow-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                title="Logout"
              >
                <LogOut className="w-5 h-5 md:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
              {error}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-8">
          <h2 className="text-lg md:text-2xl font-bold text-slate-900 mb-4">Create New Event</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="Price"
              value={newEvent.price || ""}
              onChange={(e) => setNewEvent({ ...newEvent, price: parseFloat(e.target.value) })}
              required
            />
            <textarea
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 col-span-1 md:col-span-2"
              placeholder="Event Description"
              value={newEvent.description || ""}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              required
            />
          </div>
          <button
            onClick={handleAddEvent}
            className="mt-4 w-full md:w-auto px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
          >
            <PlusCircle className="w-5 h-5 inline-block mr-2" />
            Add Event
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h2 className="text-lg md:text-2xl font-bold text-slate-900 mb-4">Event List</h2>
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="border border-slate-300 rounded-lg overflow-hidden shadow-md bg-white"
                >
                  <img
                    src={event.imageUrl || "/events.png"}
                    alt={event.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-900">{event.name}</h3>
                    <p className="text-slate-600">{event.description}</p>
                    <p className="mt-2 text-sm text-slate-500">
                    <strong>Date:</strong> {new Date(event.date).toLocaleDateString("en-GB")}
                    </p>
                    <p className="text-sm text-slate-500">
                      <strong>Location:</strong> {event.location}
                    </p>
                    <p className="text-sm text-slate-500">
                      <strong>Price:</strong> PKR {event.price? event.price : 0}
                    </p>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-100">
                    <button
                      onClick={() => {
                        setEditEvent(event);
                        setIsEditModalOpen(true);
                      }}
                      className="text-blue-500 hover:text-blue-600"
                      title="Edit Event"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-500 hover:text-red-600"
                      title="Delete Event"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500">No events found.</div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/2">
            <h2 className="text-lg md:text-2xl font-bold text-slate-900 mb-4">Edit Event</h2>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Event Name"
                value={editEvent.name || ""}
                onChange={(e) => setEditEvent({ ...editEvent, name: e.target.value })}
                required
              />
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Event Location"
                value={editEvent.location || ""}
                onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
                required
              />
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Image URL (Optional)"
                value={editEvent.imageUrl || ""}
                onChange={(e) => setEditEvent({ ...editEvent, imageUrl: e.target.value })}
              />
              <input
                type="date"
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={editEvent.date || ""}
                onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
                required
              />
              <input
                type="number"
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Price"
                value={editEvent.price || ""}
                onChange={(e) => setEditEvent({ ...editEvent, price: parseFloat(e.target.value) })}
                required
              />
              <textarea
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Event Description"
                value={editEvent.description || ""}
                onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-gray-200 px-4 py-2 rounded-md text-slate-700 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEvent}
                className="bg-indigo-500 px-4 py-2 rounded-md text-white hover:bg-indigo-600 transition-colors"
              >
                <Save className="w-5 h-5 inline-block mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

