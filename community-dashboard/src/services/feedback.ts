import { logError, logMessage } from './errorLogging';
import airtableClient from '../integrations/airtable/client';
import engagementTrackingService from './engagementTracking';

/**
 * Types for feedback collection
 */

export interface FeedbackSubmission {
  id?: string;
  userId: string;
  userName?: string;
  type: 'general' | 'feature' | 'bug' | 'content' | 'event' | 'survey';
  rating?: number; // 1-5 star rating
  text: string;
  metadata?: Record<string, any>;
  timestamp: string;
  synced?: boolean;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'text' | 'rating' | 'multiple_choice' | 'checkbox';
  options?: string[]; // For multiple_choice and checkbox types
  required: boolean;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  isActive: boolean;
  startDate: string;
  endDate?: string;
  targetAudience?: string; // Optional filter for who should see this survey
}

export interface SurveyResponse {
  id?: string;
  surveyId: string;
  userId: string;
  userName?: string;
  answers: {
    questionId: string;
    answer: string | number | string[]; // Text, rating, or selected options
  }[];
  timestamp: string;
  synced?: boolean;
}

/**
 * Heartbeat API client configuration
 * This should be updated with actual API details when available
 */
// @ts-ignore - Vite provides import.meta.env but TypeScript doesn't recognize it
const HEARTBEAT_API_URL = 'https://api.heartbeatchat.com/v2';
// @ts-ignore - Vite provides import.meta.env but TypeScript doesn't recognize it
const HEARTBEAT_API_KEY = import.meta.env.VITE_HEARTBEAT_API_KEY || '';

/**
 * Submit user feedback
 * This function records the feedback in Airtable and sends it to Heartbeat API
 */
export const submitFeedback = async (feedback: FeedbackSubmission): Promise<FeedbackSubmission> => {
  try {
    // Ensure timestamp is set
    const feedbackWithTimestamp = {
      ...feedback,
      timestamp: feedback.timestamp || new Date().toISOString(),
    };

    // Store in Airtable
    const record = await airtableClient.createRecord('Member Feedback', {
      UserId: feedbackWithTimestamp.userId,
      UserName: feedbackWithTimestamp.userName || '',
      Type: feedbackWithTimestamp.type,
      Rating: feedbackWithTimestamp.rating || null,
      Text: feedbackWithTimestamp.text,
      Metadata: JSON.stringify(feedbackWithTimestamp.metadata || {}),
      Timestamp: feedbackWithTimestamp.timestamp,
      Synced: false,
    });

    // Try to sync with Heartbeat API
    let synced = false;
    try {
      await syncFeedbackWithHeartbeat(feedbackWithTimestamp);
      synced = true;
      
      // Update the record to mark as synced
      await airtableClient.updateRecord('Member Feedback', record.id, {
        Synced: true,
      });
    } catch (syncError) {
      logError(syncError instanceof Error ? syncError : new Error('Error syncing with Heartbeat API'), {
        feedback: feedbackWithTimestamp,
      });
      // We'll continue even if sync fails - it can be retried later
    }

    // Track this as an engagement event
    try {
      await engagementTrackingService.trackEngagement({
        userId: feedbackWithTimestamp.userId,
        action: `feedback_${feedbackWithTimestamp.type}`,
        timestamp: feedbackWithTimestamp.timestamp,
        metadata: {
          feedbackId: record.id,
          rating: feedbackWithTimestamp.rating,
        },
      });
    } catch (engagementError) {
      logError(engagementError instanceof Error ? engagementError : new Error('Error tracking feedback engagement'), {
        feedback: feedbackWithTimestamp,
      });
      // Continue even if engagement tracking fails
    }

    return {
      id: record.id,
      ...feedbackWithTimestamp,
      synced,
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error submitting feedback');
    logError(errorObj, { feedback });
    throw errorObj;
  }
};

/**
 * Sync feedback with the Heartbeat API
 * This is a placeholder implementation that should be updated with actual API details
 */
const syncFeedbackWithHeartbeat = async (feedback: FeedbackSubmission): Promise<void> => {
  try {
    // This is a placeholder implementation
    // In a real implementation, you would use fetch or axios to send the feedback to the Heartbeat API
    
    logMessage(`Would send feedback to Heartbeat API: ${JSON.stringify(feedback)}`, 'info');
    
    // Placeholder for actual API call
    // const response = await fetch(`${HEARTBEAT_API_URL}/submit`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-API-Key': HEARTBEAT_API_KEY,
    //   },
    //   body: JSON.stringify(feedback),
    // });
    
    // if (!response.ok) {
    //   throw new Error(`Heartbeat API error: ${response.status} ${response.statusText}`);
    // }
    
    // return await response.json();
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error syncing with Heartbeat API');
    throw errorObj;
  }
};

/**
 * Get all feedback for a specific user
 */
export const getUserFeedback = async (userId: string): Promise<FeedbackSubmission[]> => {
  try {
    const records = await airtableClient.getRecords('Member Feedback', {
      filterByFormula: `{UserId}='${userId}'`,
      sort: [{ field: 'Timestamp', direction: 'desc' }],
    });

    return records.map((record: any) => ({
      id: record.id,
      userId: record.get('UserId') as string,
      userName: record.get('UserName') as string,
      type: record.get('Type') as FeedbackSubmission['type'],
      rating: record.get('Rating') as number | undefined,
      text: record.get('Text') as string,
      metadata: JSON.parse(record.get('Metadata') || '{}'),
      timestamp: record.get('Timestamp') as string,
      synced: record.get('Synced') as boolean,
    }));
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error(`Error getting feedback for user ${userId}`);
    logError(errorObj, { userId });
    throw errorObj;
  }
};

/**
 * Get all feedback (with optional filtering)
 */
export const getAllFeedback = async (options?: {
  type?: FeedbackSubmission['type'];
  minRating?: number;
  limit?: number;
}): Promise<FeedbackSubmission[]> => {
  try {
    let filterFormula = '';
    
    if (options?.type) {
      filterFormula = `{Type}='${options.type}'`;
    }
    
    if (options?.minRating) {
      const ratingFilter = `{Rating}>=${options.minRating}`;
      filterFormula = filterFormula 
        ? `AND(${filterFormula}, ${ratingFilter})` 
        : ratingFilter;
    }

    const records = await airtableClient.getRecords('Member Feedback', {
      filterByFormula: filterFormula || '',
      sort: [{ field: 'Timestamp', direction: 'desc' }],
      maxRecords: options?.limit || 100,
    });

    return records.map((record: any) => ({
      id: record.id,
      userId: record.get('UserId') as string,
      userName: record.get('UserName') as string,
      type: record.get('Type') as FeedbackSubmission['type'],
      rating: record.get('Rating') as number | undefined,
      text: record.get('Text') as string,
      metadata: JSON.parse(record.get('Metadata') || '{}'),
      timestamp: record.get('Timestamp') as string,
      synced: record.get('Synced') as boolean,
    }));
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error getting all feedback');
    logError(errorObj, { options });
    throw errorObj;
  }
};

/**
 * Get feedback metrics
 */
export const getFeedbackMetrics = async (): Promise<Record<string, any>> => {
  try {
    const allFeedback = await getAllFeedback();
    
    // Calculate metrics
    const totalFeedback = allFeedback.length;
    const uniqueUsers = new Set(allFeedback.map((f: FeedbackSubmission) => f.userId)).size;
    
    // Count by type
    const typeCount: Record<string, number> = {};
    allFeedback.forEach((feedback: FeedbackSubmission) => {
      typeCount[feedback.type] = (typeCount[feedback.type] || 0) + 1;
    });
    
    // Calculate average rating
    const ratingsCount = allFeedback.filter(f => f.rating !== undefined).length;
    const ratingsSum = allFeedback.reduce((sum, f) => sum + (f.rating || 0), 0);
    const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;
    
    // Count by rating
    const ratingDistribution: Record<string, number> = {
      '1': 0, '2': 0, '3': 0, '4': 0, '5': 0
    };
    
    allFeedback.forEach((feedback: FeedbackSubmission) => {
      if (feedback.rating) {
        ratingDistribution[feedback.rating.toString()] = 
          (ratingDistribution[feedback.rating.toString()] || 0) + 1;
      }
    });
    
    // Count by day for the last 30 days
    const dailyFeedback: Record<string, number> = {};
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    
    // Initialize daily feedback with zeros
    last30Days.forEach(day => {
      dailyFeedback[day] = 0;
    });
    
    // Count feedback by day
    allFeedback.forEach((feedback: FeedbackSubmission) => {
      const day = feedback.timestamp.split('T')[0];
      if (dailyFeedback[day] !== undefined) {
        dailyFeedback[day] += 1;
      }
    });

    return {
      totalFeedback,
      uniqueUsers,
      typeCount,
      averageRating,
      ratingDistribution,
      dailyFeedback,
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error getting feedback metrics');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Create a new survey
 */
export const createSurvey = async (survey: Omit<Survey, 'id'>): Promise<Survey> => {
  try {
    const record = await airtableClient.createRecord('Community Surveys', {
      Title: survey.title,
      Description: survey.description,
      Questions: JSON.stringify(survey.questions),
      IsActive: survey.isActive,
      StartDate: survey.startDate,
      EndDate: survey.endDate || null,
      TargetAudience: survey.targetAudience || null,
    });

    return {
      id: record.id,
      title: survey.title,
      description: survey.description,
      questions: survey.questions,
      isActive: survey.isActive,
      startDate: survey.startDate,
      endDate: survey.endDate,
      targetAudience: survey.targetAudience,
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error creating survey');
    logError(errorObj, { survey });
    throw errorObj;
  }
};

/**
 * Get all active surveys
 */
export const getActiveSurveys = async (): Promise<Survey[]> => {
  try {
    const now = new Date().toISOString();
    
    const records = await airtableClient.getRecords('Community Surveys', {
      filterByFormula: `AND({IsActive}=TRUE(), {StartDate}<='${now}', OR({EndDate}='', {EndDate}>='${now}'))`,
    });

    return records.map((record: any) => ({
      id: record.id,
      title: record.get('Title') as string,
      description: record.get('Description') as string,
      questions: JSON.parse(record.get('Questions') || '[]'),
      isActive: record.get('IsActive') as boolean,
      startDate: record.get('StartDate') as string,
      endDate: record.get('EndDate') as string | undefined,
      targetAudience: record.get('TargetAudience') as string | undefined,
    }));
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error getting active surveys');
    logError(errorObj);
    throw errorObj;
  }
};

/**
 * Get a specific survey by ID
 */
export const getSurveyById = async (surveyId: string): Promise<Survey | null> => {
  try {
    const record = await airtableClient.getRecord('Community Surveys', surveyId);
    
    return {
      id: record.id,
      title: record.get('Title') as string,
      description: record.get('Description') as string,
      questions: JSON.parse(record.get('Questions') || '[]'),
      isActive: record.get('IsActive') as boolean,
      startDate: record.get('StartDate') as string,
      endDate: record.get('EndDate') as string | undefined,
      targetAudience: record.get('TargetAudience') as string | undefined,
    };
  } catch (error) {
    if ((error as any)?.statusCode === 404) {
      return null;
    }
    
    const errorObj = error instanceof Error 
      ? error 
      : new Error(`Error getting survey ${surveyId}`);
    logError(errorObj, { surveyId });
    throw errorObj;
  }
};

/**
 * Submit a survey response
 */
export const submitSurveyResponse = async (response: Omit<SurveyResponse, 'id'>): Promise<SurveyResponse> => {
  try {
    // Ensure timestamp is set
    const responseWithTimestamp = {
      ...response,
      timestamp: response.timestamp || new Date().toISOString(),
    };

    // Store in Airtable
    const record = await airtableClient.createRecord('Survey Responses', {
      SurveyId: responseWithTimestamp.surveyId,
      UserId: responseWithTimestamp.userId,
      UserName: responseWithTimestamp.userName || '',
      Answers: JSON.stringify(responseWithTimestamp.answers),
      Timestamp: responseWithTimestamp.timestamp,
      Synced: false,
    });

    // Try to sync with Heartbeat API
    let synced = false;
    try {
      await syncSurveyResponseWithHeartbeat(responseWithTimestamp);
      synced = true;
      
      // Update the record to mark as synced
      await airtableClient.updateRecord('Survey Responses', record.id, {
        Synced: true,
      });
    } catch (syncError) {
      logError(syncError instanceof Error ? syncError : new Error('Error syncing with Heartbeat API'), {
        response: responseWithTimestamp,
      });
      // We'll continue even if sync fails - it can be retried later
    }

    // Track this as an engagement event
    try {
      await engagementTrackingService.trackEngagement({
        userId: responseWithTimestamp.userId,
        action: 'survey_complete',
        timestamp: responseWithTimestamp.timestamp,
        metadata: {
          surveyId: responseWithTimestamp.surveyId,
          responseId: record.id,
        },
      });
    } catch (engagementError) {
      logError(engagementError instanceof Error ? engagementError : new Error('Error tracking survey engagement'), {
        response: responseWithTimestamp,
      });
      // Continue even if engagement tracking fails
    }

    return {
      id: record.id,
      ...responseWithTimestamp,
      synced,
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error submitting survey response');
    logError(errorObj, { response });
    throw errorObj;
  }
};

/**
 * Sync survey response with the Heartbeat API
 * This is a placeholder implementation that should be updated with actual API details
 */
const syncSurveyResponseWithHeartbeat = async (response: SurveyResponse): Promise<void> => {
  try {
    // This is a placeholder implementation
    // In a real implementation, you would use fetch or axios to send the response to the Heartbeat API
    
    logMessage(`Would send survey response to Heartbeat API: ${JSON.stringify(response)}`, 'info');
    
    // Placeholder for actual API call
    // const apiResponse = await fetch(`${HEARTBEAT_API_URL}/survey-responses`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-API-Key': HEARTBEAT_API_KEY,
    //   },
    //   body: JSON.stringify(response),
    // });
    
    // if (!apiResponse.ok) {
    //   throw new Error(`Heartbeat API error: ${apiResponse.status} ${apiResponse.statusText}`);
    // }
    
    // return await apiResponse.json();
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error('Error syncing with Heartbeat API');
    throw errorObj;
  }
};

/**
 * Get survey responses for a specific survey
 */
export const getSurveyResponses = async (surveyId: string): Promise<SurveyResponse[]> => {
  try {
    const records = await airtableClient.getRecords('Survey Responses', {
      filterByFormula: `{SurveyId}='${surveyId}'`,
      sort: [{ field: 'Timestamp', direction: 'desc' }],
    });

    return records.map((record: any) => ({
      id: record.id,
      surveyId: record.get('SurveyId') as string,
      userId: record.get('UserId') as string,
      userName: record.get('UserName') as string,
      answers: JSON.parse(record.get('Answers') || '[]'),
      timestamp: record.get('Timestamp') as string,
      synced: record.get('Synced') as boolean,
    }));
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error(`Error getting responses for survey ${surveyId}`);
    logError(errorObj, { surveyId });
    throw errorObj;
  }
};

/**
 * Get survey metrics
 */
export const getSurveyMetrics = async (surveyId: string): Promise<Record<string, any>> => {
  try {
    const survey = await getSurveyById(surveyId);
    
    if (!survey) {
      throw new Error(`Survey ${surveyId} not found`);
    }
    
    const responses = await getSurveyResponses(surveyId);
    
    // Calculate metrics
    const totalResponses = responses.length;
    const uniqueUsers = new Set(responses.map(r => r.userId)).size;
    
    // Calculate completion rate (if we know how many users were targeted)
    let completionRate = null;
    // This would require knowing how many users were targeted
    
    // Analyze answers for each question
    const questionMetrics: Record<string, any> = {};
    
    survey.questions.forEach(question => {
      const answers = responses
        .map(r => r.answers.find(a => a.questionId === question.id)?.answer)
        .filter(a => a !== undefined);
      
      if (question.type === 'rating') {
        // Calculate average rating
        const numericAnswers = answers
          .filter((val): val is number => typeof val === 'number')
          .map(val => val as number);
        
        const sum = numericAnswers.reduce((acc, val) => acc + val, 0);
        const average = numericAnswers.length > 0 ? sum / numericAnswers.length : 0;
        
        // Calculate rating distribution
        const distribution: Record<string, number> = {};
        answers.forEach(answer => {
          if (typeof answer === 'number') {
            distribution[answer.toString()] = (distribution[answer.toString()] || 0) + 1;
          }
        });
        
        questionMetrics[question.id] = {
          questionText: question.text,
          responseCount: answers.length,
          averageRating: average,
          distribution,
        };
      } else if (question.type === 'multiple_choice' || question.type === 'checkbox') {
        // Calculate option distribution
        const distribution: Record<string, number> = {};
        
        answers.forEach(answer => {
          if (Array.isArray(answer)) {
            // Checkbox (multiple selections)
            answer.forEach(option => {
              distribution[option] = (distribution[option] || 0) + 1;
            });
          } else if (typeof answer === 'string') {
            // Multiple choice (single selection)
            distribution[answer] = (distribution[answer] || 0) + 1;
          }
        });
        
        questionMetrics[question.id] = {
          questionText: question.text,
          responseCount: answers.length,
          distribution,
        };
      } else {
        // Text responses - just count them
        questionMetrics[question.id] = {
          questionText: question.text,
          responseCount: answers.length,
          // We could include the actual text responses here, but that might be a lot of data
        };
      }
    });
    
    return {
      surveyId,
      surveyTitle: survey.title,
      totalResponses,
      uniqueUsers,
      completionRate,
      questionMetrics,
    };
  } catch (error) {
    const errorObj = error instanceof Error 
      ? error 
      : new Error(`Error getting metrics for survey ${surveyId}`);
    logError(errorObj, { surveyId });
    throw errorObj;
  }
};

// Export the service functions
const feedbackService = {
  submitFeedback,
  getUserFeedback,
  getAllFeedback,
  getFeedbackMetrics,
  createSurvey,
  getActiveSurveys,
  getSurveyById,
  submitSurveyResponse,
  getSurveyResponses,
  getSurveyMetrics,
};

export default feedbackService;