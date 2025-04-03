/**
 * Airtable Client
 * 
 * This client provides methods to interact with Airtable for community content,
 * events, and resources. It supports multiple Airtable bases.
 */

import Airtable from 'airtable';
import { logError, logInfo } from '../../services/errorLogging';

// Maximum number of retry attempts
const MAX_RETRIES = 3;

// Retry delay in milliseconds (starts at 1s, then exponential backoff)
const INITIAL_RETRY_DELAY = 1000;

// Base configurations
const BASES = {
  MEMBERS: {
    // @ts-ignore - Vite provides import.meta.env
    API_KEY: import.meta.env.VITE_AIRTABLE_API_KEY,
    // @ts-ignore - Vite provides import.meta.env
    BASE_ID: import.meta.env.VITE_AIRTABLE_BASE_ID,
    TABLES: ['Members', 'Communities', 'UserRoles', 'Badges', 'Rewards']
  },
  EVENTS: {
    // @ts-ignore - Vite provides import.meta.env
    API_KEY: import.meta.env.VITE_AIRTABLE_EVENTS_API_KEY,
    // @ts-ignore - Vite provides import.meta.env
    BASE_ID: import.meta.env.VITE_AIRTABLE_EVENTS_BASE_ID,
    TABLES: ['Events', 'Venues', 'Categories', 'Organizers', 'EventImages']
  }
};

// Check if configurations are valid
const isConfigValid = {
  MEMBERS: !!(BASES.MEMBERS.API_KEY && BASES.MEMBERS.BASE_ID),
  EVENTS: !!(BASES.EVENTS.API_KEY && BASES.EVENTS.BASE_ID)
};

// Log configuration status
if (!isConfigValid.MEMBERS) {
  console.warn('⚠️ Missing Airtable Members base configuration. Check your .env file.');
  console.warn('⚠️ Using mock data mode for Members base.');
} else {
  console.log('✅ Airtable Members base configuration found.');
}

if (!isConfigValid.EVENTS) {
  console.warn('⚠️ Missing Airtable Events base configuration. Check your .env file.');
  console.warn('⚠️ Using mock data mode for Events base.');
} else {
  console.log('✅ Airtable Events base configuration found.');
}

// Configure Airtable bases
const airtableBases = {
  MEMBERS: isConfigValid.MEMBERS 
    ? Airtable.base(BASES.MEMBERS.BASE_ID) 
    : null,
  EVENTS: isConfigValid.EVENTS 
    ? Airtable.base(BASES.EVENTS.BASE_ID) 
    : null
};

// Set API keys for each base
if (isConfigValid.MEMBERS) {
  Airtable.configure({
    apiKey: BASES.MEMBERS.API_KEY,
    requestTimeout: 30000,
    endpointUrl: 'https://api.airtable.com',
  });
}

if (isConfigValid.EVENTS) {
  Airtable.configure({
    apiKey: BASES.EVENTS.API_KEY,
    requestTimeout: 30000,
    endpointUrl: 'https://api.airtable.com',
  });
}

/**
 * Delay execution for a specified time
 * @param ms - Milliseconds to delay
 */
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute a function with retry logic
 * @param fn - Function to execute
 * @param retries - Number of retries
 * @param retryDelay - Delay between retries in ms
 * @returns Result of the function
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  retryDelay = INITIAL_RETRY_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    // Exponential backoff
    await delay(retryDelay);
    
    // Log retry attempt
    logInfo(`Retrying Airtable operation. Attempts remaining: ${retries}`, { error });
    
    return withRetry(fn, retries - 1, retryDelay * 2);
  }
}

// Mock data for when Airtable configuration is invalid
const MOCK_DATA: {[key: string]: any[]} = {
  // Members base tables
  Members: [
    {
      id: 'rec123456',
      Name: 'John Doe',
      Email: 'john.doe@example.com',
      Role: 'Member',
      Points: 150,
      Level: 'Silver',
      JoinDate: '2024-10-01'
    }
  ],
  // Events base tables
  Events: [
    {
      id: 'evt-001',
      Title: 'BLKOUT Community Mixer',
      Description: 'Join us for a night of networking, music, and connection with the BLKOUT community.',
      Start_Date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      End_Date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
      Location_Name: 'The Community Hub',
      Location_Address: '123 Main Street, London',
      Location_Type: 'in-person',
      Is_Online: false,
      Category: 'networking',
      Is_BLKOUT_Event: true,
      Approval_Status: 'pending',
      Organizer_Name: 'BLKOUT Events Team',
      Image_URL: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622',
      Website_URL: 'https://example.com/events/community-mixer',
      Ticket_URL: 'https://example.com/events/community-mixer/tickets',
      Price_Info: 'Free',
      Source: 'eventbrite',
      Created_At: new Date().toISOString(),
      Updated_At: new Date().toISOString(),
      External_ID: 'evt-eb-001'
    },
    {
      id: 'evt-003',
      Title: 'BLKOUT Dance Party',
      Description: 'Monthly dance party celebrating Black LGBTQ+ music and culture.',
      Start_Date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      End_Date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
      Location_Name: 'Club Harmony',
      Location_Address: '78 Beat Street, London',
      Location_Type: 'in-person',
      Is_Online: false,
      Category: 'party',
      Is_BLKOUT_Event: true,
      Approval_Status: 'approved',
      Organizer_Name: 'BLKOUT Events Team',
      Image_URL: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec',
      Website_URL: 'https://example.com/events/dance-party',
      Ticket_URL: 'https://example.com/events/dance-party/tickets',
      Price_Info: '£10-15',
      Source: 'eventbrite',
      Created_At: new Date().toISOString(),
      Updated_At: new Date().toISOString(),
      External_ID: 'evt-eb-003'
    },
  ]
};

/**
 * Determines which base to use for a specific table
 * @param tableName - Name of the table to access
 * @returns The base type (MEMBERS or EVENTS)
 */
const getBaseTypeForTable = (tableName: string): 'MEMBERS' | 'EVENTS' => {
  if (BASES.MEMBERS.TABLES.includes(tableName)) {
    return 'MEMBERS';
  }
  if (BASES.EVENTS.TABLES.includes(tableName)) {
    return 'EVENTS';
  }
  
  // Default to EVENTS for tables like 'Events'
  return tableName === 'Events' ? 'EVENTS' : 'MEMBERS';
};

// Helper to filter mock data based on options
function filterMockData(tableName: string, options?: any): any[] {
  const data = MOCK_DATA[tableName] || [];
  
  if (!options) return data;
  
  let filteredData = [...data];
  
  // Filter by formula (basic support for approval status)
  if (options.filterByFormula) {
    if (options.filterByFormula.includes("Approval_Status='pending'")) {
      filteredData = filteredData.filter((item: any) => item.Approval_Status === 'pending');
    } else if (options.filterByFormula.includes("Approval_Status='approved'")) {
      filteredData = filteredData.filter((item: any) => item.Approval_Status === 'approved');
    }
  }
  
  // Sort (basic implementation)
  if (options.sort && options.sort.length) {
    const { field, direction } = options.sort[0];
    filteredData.sort((a: any, b: any) => {
      if (direction === 'desc') {
        return a[field] > b[field] ? -1 : 1;
      }
      return a[field] > b[field] ? 1 : -1;
    });
  }
  
  return filteredData;
}

/**
 * Get records from an Airtable table
 * @param tableName - The name of the table
 * @param options - Query options
 * @returns Array of records
 */
const getRecords = async (tableName: string, options?: any): Promise<any[]> => {
  const baseType = getBaseTypeForTable(tableName);
  
  // If configuration is invalid, use mock data
  if (!isConfigValid[baseType]) {
    logInfo(`Using mock data for Airtable ${baseType} base`, { tableName, options });
    return filterMockData(tableName, options);
  }
  
  try {
    // Configure Airtable with correct API key
    Airtable.configure({
      apiKey: BASES[baseType].API_KEY,
      requestTimeout: 30000,
      endpointUrl: 'https://api.airtable.com',
    });
    
    // Use retry logic for API calls
    return await withRetry(async () => {
      const base = airtableBases[baseType];
      
      if (!base) {
        throw new Error(`Airtable ${baseType} base is not initialized`);
      }
      
      // Validate table name to avoid errors
      if (!tableName || typeof tableName !== 'string') {
        throw new Error('Invalid table name provided to getRecords');
      }
      
      // Get records from Airtable and convert to array
      const recordsResponse = await base(tableName).select(options).all();
      
      // Map records to our format
      return Array.from(recordsResponse).map((record: any) => ({
        id: record.id,
        ...record.fields,
      }));
    });
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error fetching records';
    
    // Include detailed information in the error log
    logError(`Error fetching records from ${tableName} in ${baseType} base: ${errorMessage}`, { 
      tableName, 
      baseType,
      options,
      apiKey: BASES[baseType].API_KEY ? 'present' : 'missing',
      baseId: BASES[baseType].BASE_ID ? 'present' : 'missing'
    });
    
    // Return empty array instead of throwing to prevent app crashes
    console.warn(`Airtable API error: ${errorMessage}`);
    return [];
  }
};

/**
 * Get a single record from an Airtable table
 * @param tableName - The name of the table
 * @param recordId - The ID of the record
 * @returns The record
 */
const getRecord = async (tableName: string, recordId: string): Promise<any | null> => {
  const baseType = getBaseTypeForTable(tableName);
  
  // If configuration is invalid, use mock data
  if (!isConfigValid[baseType]) {
    logInfo(`Using mock data for Airtable ${baseType} base`, { tableName, recordId });
    const mockRecords = MOCK_DATA[tableName] || [];
    const mockRecord = mockRecords.find((r: any) => r.id === recordId);
    
    if (!mockRecord) {
      return null;
    }
    
    return mockRecord;
  }
  
  try {
    // Configure Airtable with correct API key
    Airtable.configure({
      apiKey: BASES[baseType].API_KEY,
      requestTimeout: 30000,
      endpointUrl: 'https://api.airtable.com',
    });
    
    // Use retry logic for API calls
    return await withRetry(async () => {
      const base = airtableBases[baseType];
      
      if (!base) {
        throw new Error(`Airtable ${baseType} base is not initialized`);
      }
      
      // Use any type to avoid TypeScript errors
      const record: any = await base(tableName).find(recordId);
      
      return {
        id: record.id,
        ...record.fields,
      };
    });
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error fetching record';
    
    logError(`Error fetching record from ${tableName} in ${baseType} base: ${errorMessage}`, { 
      tableName, 
      recordId,
      baseType
    });
    
    // Return null instead of throwing to prevent app crashes
    console.warn(`Airtable API error: ${errorMessage}`);
    return null;
  }
};

/**
 * Create a record in an Airtable table
 * @param tableName - The name of the table
 * @param fields - The fields to create
 * @returns The created record
 */
const createRecord = async (tableName: string, fields: any): Promise<any | null> => {
  const baseType = getBaseTypeForTable(tableName);
  
  // If configuration is invalid, use mock data
  if (!isConfigValid[baseType]) {
    logInfo(`Using mock data for Airtable ${baseType} base (create)`, { tableName, fields });
    
    // Generate a mock ID
    const mockId = `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create a mock record
    const mockRecord = {
      id: mockId,
      ...fields,
      Created_At: new Date().toISOString(),
      Updated_At: new Date().toISOString(),
    };
    
    // Add to mock data if the table exists
    if (MOCK_DATA[tableName]) {
      MOCK_DATA[tableName].push(mockRecord);
    } else {
      MOCK_DATA[tableName] = [mockRecord];
    }
    
    return mockRecord;
  }
  
  try {
    // Configure Airtable with correct API key
    Airtable.configure({
      apiKey: BASES[baseType].API_KEY,
      requestTimeout: 30000,
      endpointUrl: 'https://api.airtable.com',
    });
    
    // Use retry logic for API calls
    return await withRetry(async () => {
      const base = airtableBases[baseType];
      
      if (!base) {
        throw new Error(`Airtable ${baseType} base is not initialized`);
      }
      
      // Use any type to avoid TypeScript errors
      const record: any = await base(tableName).create(fields);
      
      return {
        id: record.id,
        ...record.fields,
      };
    });
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error creating record';
    
    logError(`Error creating record in ${tableName} in ${baseType} base: ${errorMessage}`, { 
      tableName, 
      fields,
      baseType
    });
    
    // Return null instead of throwing to prevent app crashes
    console.warn(`Airtable API error: ${errorMessage}`);
    return null;
  }
};

/**
 * Update a record in an Airtable table
 * @param tableName - The name of the table
 * @param recordId - The ID of the record
 * @param fields - The fields to update
 * @returns The updated record
 */
const updateRecord = async (tableName: string, recordId: string, fields: any): Promise<any | null> => {
  const baseType = getBaseTypeForTable(tableName);
  
  // If configuration is invalid, use mock data
  if (!isConfigValid[baseType]) {
    logInfo(`Using mock data for Airtable ${baseType} base (update)`, { tableName, recordId, fields });
    
    const tableData = MOCK_DATA[tableName] || [];
    const recordIndex = tableData.findIndex((r: any) => r.id === recordId);
    
    if (recordIndex === -1) {
      return null;
    }
    
    // Update the mock record
    const updatedRecord = {
      ...tableData[recordIndex],
      ...fields,
      Updated_At: new Date().toISOString()
    };
    
    // Update the record in the mock data
    MOCK_DATA[tableName][recordIndex] = updatedRecord;
    
    return updatedRecord;
  }
  
  try {
    // Configure Airtable with correct API key
    Airtable.configure({
      apiKey: BASES[baseType].API_KEY,
      requestTimeout: 30000,
      endpointUrl: 'https://api.airtable.com',
    });
    
    // Use retry logic for API calls
    return await withRetry(async () => {
      const base = airtableBases[baseType];
      
      if (!base) {
        throw new Error(`Airtable ${baseType} base is not initialized`);
      }
      
      // Use any type to avoid TypeScript errors
      const record: any = await base(tableName).update(recordId, fields);
      
      return {
        id: record.id,
        ...record.fields,
      };
    });
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error updating record';
    
    logError(`Error updating record in ${tableName} in ${baseType} base: ${errorMessage}`, { 
      tableName, 
      recordId, 
      fields,
      baseType
    });
    
    // Return null instead of throwing to prevent app crashes
    console.warn(`Airtable API error: ${errorMessage}`);
    return null;
  }
};

/**
 * Delete a record from an Airtable table
 * @param tableName - The name of the table
 * @param recordId - The ID of the record
 * @returns Success status
 */
const deleteRecord = async (tableName: string, recordId: string) => {
  const baseType = getBaseTypeForTable(tableName);
  
  // If configuration is invalid, use mock data
  if (!isConfigValid[baseType]) {
    logInfo(`Using mock data for Airtable ${baseType} base (delete)`, { tableName, recordId });
    
    const tableData = MOCK_DATA[tableName] || [];
    const recordIndex = tableData.findIndex((r: any) => r.id === recordId);
    
    if (recordIndex === -1) {
      return { success: false, id: recordId, error: 'Record not found' };
    }
    
    // Remove the record from the mock data
    MOCK_DATA[tableName].splice(recordIndex, 1);
    
    return { success: true, id: recordId };
  }
  
  try {
    // Configure Airtable with correct API key
    Airtable.configure({
      apiKey: BASES[baseType].API_KEY,
      requestTimeout: 30000,
      endpointUrl: 'https://api.airtable.com',
    });
    
    // Use retry logic for API calls
    return await withRetry(async () => {
      const base = airtableBases[baseType];
      
      if (!base) {
        throw new Error(`Airtable ${baseType} base is not initialized`);
      }
      
      await base(tableName).destroy(recordId);
      return { success: true, id: recordId };
    });
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error deleting record';
    
    logError(`Error deleting record from ${tableName} in ${baseType} base: ${errorMessage}`, { 
      tableName, 
      recordId,
      baseType
    });
    
    // Return failure instead of throwing to prevent app crashes
    console.warn(`Airtable API error: ${errorMessage}`);
    return { success: false, id: recordId, error: errorMessage };
  }
};

/**
 * Check if an Airtable base is configured and available
 * @param baseType - The base type to check
 * @returns Boolean indicating if the base is available
 */
const isBaseAvailable = async (baseType: 'MEMBERS' | 'EVENTS'): Promise<boolean> => {
  if (!isConfigValid[baseType]) {
    return false;
  }
  
  try {
    // Configure Airtable with correct API key
    Airtable.configure({
      apiKey: BASES[baseType].API_KEY,
      requestTimeout: 30000,
      endpointUrl: 'https://api.airtable.com',
    });
    
    // Try to fetch a single record from a table to test the connection
    const testTable = BASES[baseType].TABLES[0];
    await getRecords(testTable, { maxRecords: 1 });
    return true;
  } catch (error) {
    return false;
  }
};

// Create the client object
const airtableClient = {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  isBaseAvailable,
  bases: BASES,
  airtableBases
};

// Export as default for backward compatibility
export default airtableClient;

// Also export individual functions for direct import
export {
  getRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
  isBaseAvailable,
  BASES
};