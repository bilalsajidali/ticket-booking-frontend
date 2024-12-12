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

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [Quantity, setQuantity] = useState(0)

useEffect(() => {
    async function fetchEvents() {
      const token = localStorage.getItem('token'); // Get the token from localStorage
  
      if (token) {
        try {
          const response = await api.get("/events", {
            headers: {
              Authorization: `Bearer ${token}`,  // Send token in the Authorization header
            },
          });
          setEvents(response.data);
        } catch (error) {
          console.error("Error fetching events: ", error);
          // Handle error (e.g., redirect to login if unauthorized)
        }
      } else {
        console.log("No token found, please log in.");
        // Optionally redirect to login page if no token is present
      }
    }
  
    fetchEvents();
  }, []);


   // Function to create booking
   const createBooking = async (eventId: number, quantity: number) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token) {
      console.log("No token found, please log in.");
      return; // Exit if no token is present
    }

    try {
      const response = await api.post(
        "/bookings", // Assuming the API endpoint for booking is '/bookings'
        {
          userId,  // The userId should be obtained from the logged-in user
          eventId,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the Authorization header
          },
        }
      );
      console.log("Booking successful:", response.data);
      // Optionally, handle success (e.g., show a confirmation message)
    } catch (error) {
      console.error("Error creating booking:", error);
      // Handle error (e.g., show an error message)
    }
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Available Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <div key={event.id} className="p-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold">{event.name}</h2>
            <p>{event.description}</p>
            <p className="text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
            <p className="text-green-500 font-bold">${event.price}</p>
            <div className="mb-4">
          <label className="block text-gray-700">Quantity</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={Quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min={1}
            required
          />
        </div>
            <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded" onClick={() => createBooking(event.id, Quantity)} 
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}