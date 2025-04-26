// src/api/scheduleApi.ts
import type {
  StaffMember,
  Unavailability,
  WeeklyNeeds,
  ApiResponse,
  Schedule,
} from "../types"; // Ensure ApiResponse and Schedule are imported
import { API_BASE_URL } from "../config";

interface RequestData {
  staffList: StaffMember[];
  unavailabilityList: Unavailability[];
  weeklyNeeds: WeeklyNeeds;
}

export const generateScheduleAPI = async (
  requestData: RequestData
): Promise<ApiResponse> => {
  const apiUrl = `${API_BASE_URL}/api/schedule`;
  console.log(`[API] Sending POST request to ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    console.log("[API] Received response status:", response.status);

    let responseData: any = {};
    let parseError = null;

    try {
      // Check if response body exists before trying to parse
      const text = await response.text();
      if (text) {
        responseData = JSON.parse(text);
        console.log("[API] Received response data:", responseData);
      } else {
        console.log("[API] Received empty response body.");
        if (response.ok) {
          return {
            success: true,
            schedule: {},
            warnings: ["Warning: Received empty success response from server."],
            calculationTimeMs: 0,
          };
        }
      }
    } catch (jsonError) {
      console.error("[API] Failed to parse JSON response:", jsonError);
      parseError = jsonError;
    }

    if (!response.ok) {
      // If HTTP status indicates an error
      const errorMessage =
        responseData?.message ||
        `HTTP error ${response.status}${
          parseError ? " (Failed to parse error details)" : ""
        }`;
      console.error(`[API] Error response received: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // If response is OK (2xx)
    const apiResponse: ApiResponse = {
      success: responseData?.success ?? true,
      schedule: responseData?.schedule ?? null,
      warnings: Array.isArray(responseData?.warnings)
        ? responseData.warnings
        : [],
      calculationTimeMs:
        typeof responseData?.calculationTimeMs === "number"
          ? responseData.calculationTimeMs
          : undefined,
      message:
        typeof responseData?.message === "string"
          ? responseData.message
          : undefined,
    };
    return apiResponse;
  } catch (error) {
    console.error("[API] Fetch error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown network error occurred.";
    throw new Error(errorMessage);
  }
};
