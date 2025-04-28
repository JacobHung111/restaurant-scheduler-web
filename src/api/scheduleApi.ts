// src/api/scheduleApi.ts
import type {
  StaffMember,
  Unavailability,
  WeeklyNeeds,
  ApiResponse,
  ShiftDefinitions,
} from "../types";
import { API_BASE_URL } from "../config";

// Interface for the data sent in the request body
interface RequestData {
  staffList: StaffMember[];
  unavailabilityList: Unavailability[];
  weeklyNeeds: WeeklyNeeds;
  shiftDefinitions: ShiftDefinitions;
  shiftPreference: "PRIORITIZE_FULL_DAYS" | "PRIORITIZE_HALF_DAYS" | "NONE";
  staffPriority: string[];
}

// Function to call the backend API
export const generateScheduleAPI = async (
  requestData: RequestData
): Promise<ApiResponse> => {
  const apiUrl = `${API_BASE_URL}/api/schedule`;
  console.log(`[API] Sending POST request to ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    console.log(
      "[API] Received response status:",
      response.status,
      response.statusText
    );

    let responseData: any = {};
    let parseError = null;

    try {
      const text = await response.text();
      if (text) {
        responseData = JSON.parse(text);
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

    // Check response status AFTER attempting to parse JSON
    if (!response.ok) {
      const errorMessage =
        responseData?.message ||
        `HTTP error ${response.status}${
          parseError ? " (Failed to parse error details)" : ""
        }`;
      console.error(`[API] Error response received: ${errorMessage}`);
      const warnings = Array.isArray(responseData?.warnings)
        ? responseData.warnings
        : [];
      throw { message: errorMessage, warnings: warnings };
    }

    // If response is OK (2xx), construct a well-formed ApiResponse
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
  } catch (error: any) {
    console.error("[API] Fetch/Processing error:", error);
    throw {
      message:
        error?.message ?? "An unknown network or processing error occurred.",
      warnings: error?.warnings ?? [],
    };
  }
};
