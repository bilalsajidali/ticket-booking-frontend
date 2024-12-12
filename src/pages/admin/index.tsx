import { useEffect, useState } from "react";
import api from "../../utils/api";

interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  price: number;
  location: string;
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({});
  const [editEvent, setEditEvent] = useState<Partial<Event>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchEvents() {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token found, please log in.");
        setLoading(false);
        return;
      }

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
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const handleAddEvent = async () => {
    const token = localStorage.getItem("token");
    if (!token || !newEvent.name || !newEvent.date || !newEvent.price || !newEvent.location) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const response = await api.post(
        "/events",
        newEvent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEvents([...events, response.data]);
      setNewEvent({});
    } catch (err) {
      setError("Error adding event.");
      console.error(err);
    }
  };

  const handleUpdateEvent = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token || !editEvent.name || !editEvent.date || !editEvent.price || !editEvent.location) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const response = await api.put(
        `/events/${id}`,
        editEvent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEvents(events.map(event => event.id === id ? response.data : event));
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin - Manage Events</h1>

      {/* Create Event Form */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Create Event</h2>
        <input
          type="text"
          className="w-full p-2 mb-2 border rounded"
          placeholder="Event Name"
          value={newEvent.name || ""}
          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
        />
        <input
          type="text"
          className="w-full p-2 mb-2 border rounded"
          placeholder="Event Description"
          value={newEvent.description || ""}
          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
        />
        <input
          type="text"
          className="w-full p-2 mb-2 border rounded"
          placeholder="Event Location"
          value={newEvent.location || ""}
          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
        />
        <input
          type="date"
          className="w-full p-2 mb-2 border rounded"
          value={newEvent.date || ""}
          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
        />
        <input
          type="number"
          className="w-full p-2 mb-2 border rounded"
          placeholder="Event Price"
          value={newEvent.price || ""}
          onChange={(e) => setNewEvent({ ...newEvent, price: parseFloat(e.target.value) })}
        />
        <button
          onClick={handleAddEvent}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
        >
          Add Event
        </button>
      </div>

      {/* Event List */}
      <h2 className="text-2xl font-bold mb-4">Existing Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <div key={event.id} className="p-4 bg-white shadow rounded">
            <h3 className="text-xl font-bold">{event.name}</h3>
            <p>{event.description}</p>
            <p>{event.location}</p>
            <p>{new Date(event.date).toLocaleDateString()}</p>
            <p className="text-green-500 font-bold">${event.price}</p>

            {/* Edit Form */}
            <button
              onClick={() => setEditEvent(event)}
              className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Edit
            </button>

            {/* Delete Button */}
            <button
              onClick={() => handleDeleteEvent(event.id)}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Edit Event Form */}
      {editEvent.id && (
        <div className="mt-6">
          <h2 className="text-2xl font-bold mb-2">Edit Event</h2>
          <input
            type="text"
            className="w-full p-2 mb-2 border rounded"
            value={editEvent.name || ""}
            onChange={(e) => setEditEvent({ ...editEvent, name: e.target.value })}
          />
          <input
            type="text"
            className="w-full p-2 mb-2 border rounded"
            value={editEvent.description || ""}
            onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
          />
          <input
            type="text"
            className="w-full p-2 mb-2 border rounded"
            value={editEvent.location || ""}
            onChange={(e) => setEditEvent({ ...editEvent, location: e.target.value })}
          />
          <input
            type="date"
            className="w-full p-2 mb-2 border rounded"
            value={editEvent.date || ""}
            onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
          />
          <input
            type="number"
            className="w-full p-2 mb-2 border rounded"
            value={editEvent.price || ""}
            onChange={(e) => setEditEvent({ ...editEvent, price: parseFloat(e.target.value) })}
          />
          <button
            onClick={() => handleUpdateEvent(editEvent.id as number)}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            Update Event
          </button>
        </div>
      )}
    </div>
  );
}
