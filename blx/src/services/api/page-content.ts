import http from "@/services/http";
import { BENEFITS, Benefit } from "@/constants/benefits";
import { TRAINING_PROGRAMS, TrainingProgram } from "@/constants/training-programs";
import { FAQS, FAQ } from "@/constants/faqs";

/**
 * API response interfaces
 */
export interface BenefitsResponse {
  data: Benefit[];
  message?: string;
}

export interface TrainingProgramsResponse {
  data: TrainingProgram[];
  message?: string;
}

export interface FAQsResponse {
  data: FAQ[];
  message?: string;
}

/**
 * API service for page content (benefits, training programs, FAQs)
 * Currently returns static data, but can be extended to fetch from API
 */
export const pageContentApi = {
  /**
   * Get benefits
   * @returns Promise<Benefit[]>
   */
  getBenefits: async (): Promise<Benefit[]> => {
    try {
      // TODO: Replace with actual API call when endpoint is available
      // const response = await http.get<BenefitsResponse | Benefit[]>("/page-content/benefits");
      // if (Array.isArray(response.data)) {
      //   return response.data;
      // }
      // return (response.data as BenefitsResponse)?.data || [];
      
      // Return static data for now
      return BENEFITS;
    } catch (error: any) {
      console.warn("Error fetching benefits, using static data:", error);
      return BENEFITS;
    }
  },

  /**
   * Get training programs
   * @returns Promise<TrainingProgram[]>
   */
  getTrainingPrograms: async (): Promise<TrainingProgram[]> => {
    try {
      // TODO: Replace with actual API call when endpoint is available
      // const response = await http.get<TrainingProgramsResponse | TrainingProgram[]>("/page-content/training-programs");
      // if (Array.isArray(response.data)) {
      //   return response.data;
      // }
      // return (response.data as TrainingProgramsResponse)?.data || [];
      
      // Return static data for now
      return TRAINING_PROGRAMS;
    } catch (error: any) {
      console.warn("Error fetching training programs, using static data:", error);
      return TRAINING_PROGRAMS;
    }
  },

  /**
   * Get FAQs
   * @returns Promise<FAQ[]>
   */
  getFAQs: async (): Promise<FAQ[]> => {
    try {
      // TODO: Replace with actual API call when endpoint is available
      // const response = await http.get<FAQsResponse | FAQ[]>("/page-content/faqs");
      // if (Array.isArray(response.data)) {
      //   return response.data;
      // }
      // return (response.data as FAQsResponse)?.data || [];
      
      // Return static data for now
      return FAQS;
    } catch (error: any) {
      console.warn("Error fetching FAQs, using static data:", error);
      return FAQS;
    }
  },
};

export default pageContentApi;

