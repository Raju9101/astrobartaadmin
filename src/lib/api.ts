import { AstrologerApiResponse, Expertise, BookingApiResponse, CallRequestApiResponse } from "./types";

const API_BASE_URL = "https://api.astrobarta.com";
const API_KEY = "ee54848dsqwdeeegdeeffg654987545564%%";

export async function getAstrologers(): Promise<AstrologerApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/get_astrologer.php?api_key=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch astrologers: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching astrologers:", error);
    return { status: "error", total: 0, data: [] };
  }
}

export async function getExpertise(): Promise<Expertise[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/expertise.php?api_key=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch expertise list: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching expertise:", error);
    return [];
  }
}

export async function getBookings(): Promise<BookingApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/get_booking.php?api_key=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return { bookings: [] };
  }
}

export async function getCallRequests(): Promise<CallRequestApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api_get_call_request.php?api_key=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch call requests: ${response.statusText}`);
    }
    const data = await response.json();
    // The API returns a 'message' key, but the structure is similar to other 'data' responses
    // For consistency, let's ensure it fits the expected structure.
    if (data.data) {
        return data;
    }
    return { message: data.message, data: [] };
  } catch (error) {
    console.error("Error fetching call requests:", error);
    return { message: "error", data: [] };
  }
}
