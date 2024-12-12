import { useEffect, useState } from "react";
import api from "../../utils/api";

interface Booking {
  id: number;
  eventId: number; // Assuming you get eventId from the booking response
  quantity: number;
  price: number;
  createdAt: string;
  eventName?: string; // This will be populated after fetching event details
}

export default function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchBookings() {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        setError("User not logged in or token expired.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/bookings?userId=${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
        });

        const bookingsWithEventNames = await Promise.all(
          response.data.map(async (booking: Booking) => {
            // Fetch event details for each booking's eventId
            const eventResponse = await api.get(`/events/${booking.eventId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            // Add event name to the booking
            return { ...booking, eventName: eventResponse.data.name };
          })
        );

        setBookings(bookingsWithEventNames); // Assuming response data is the bookings list
      } catch (err) {
        setError("Error fetching booking history.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Your Booking History</h1>
      {bookings.length === 0 ? (
        <p>You have no bookings yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="p-4 bg-white shadow rounded">
              <h2 className="text-xl font-bold">{booking.eventName}</h2> {/* Display event name */}
              <p className="text-gray-500">Quantity: {booking.quantity}</p>
              {/* <p className="text-green-500 font-bold">Total: ${booking.price}</p> */}
              <p className="text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</p>
              </div>
          ))}
        </div>
      )}
    </div>
  );
}
