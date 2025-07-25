// src/api/scheduleApi.ts
import type {
  StaffMember,
  Unavailability,
  WeeklyNeeds,
  ApiResponse,
  ShiftDefinitions,
  Schedule,
} from "../types";
import { API_BASE_URL } from "../config";
import { logger } from "../utils/logger";

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
  logger.log(`[API] Sending POST request to ${apiUrl}`);

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    });

    logger.log(
      "[API] Received response status:",
      response.status,
      response.statusText
    );

    let responseData: unknown = {};
    let parseError = null;

    try {
      const text = await response.text();
      if (text) {
        responseData = JSON.parse(text);
      } else {
        logger.log("[API] Received empty response body.");
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
      logger.error("[API] Failed to parse JSON response:", jsonError);
      parseError = jsonError;
    }

    // Check response status AFTER attempting to parse JSON
    if (!response.ok) {
      const parsedData = responseData as { message?: string; warnings?: string[] };
      const errorMessage =
        parsedData?.message ||
        `HTTP error ${response.status}${
          parseError ? " (Failed to parse error details)" : ""
        }`;
      logger.error(`[API] Error response received: ${errorMessage}`);
      const warnings = Array.isArray(parsedData?.warnings)
        ? parsedData.warnings
        : [];
      throw { message: errorMessage, warnings: warnings };
    }

    // If response is OK (2xx), construct a well-formed ApiResponse
    const parsedData = responseData as { 
      success?: boolean; 
      schedule?: unknown; 
      warnings?: string[];
      calculationTimeMs?: number;
      message?: string;
    };
    const apiResponse: ApiResponse = {
      success: parsedData?.success ?? true,
      schedule: (parsedData?.schedule as Schedule) ?? null,
      warnings: Array.isArray(parsedData?.warnings)
        ? parsedData.warnings
        : [],
      calculationTimeMs:
        typeof parsedData?.calculationTimeMs === "number"
          ? parsedData.calculationTimeMs
          : undefined,
      message:
        typeof parsedData?.message === "string"
          ? parsedData.message
          : undefined,
    };
    return apiResponse;
  } catch (error: unknown) {
    logger.error("[API] Fetch/Processing error:", error);
    throw {
      message:
        (error as { message?: string })?.message ?? "An unknown network or processing error occurred.",
      warnings: (error as { warnings?: string[] })?.warnings ?? [],
    };
  }
};
