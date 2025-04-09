// This is a simple test function for n8n to verify Google Sheets connection
// Create a new workflow with a Google Sheets node and a Function node
// Put this code in the Function node

// Log the input data structure
const inputData = $input.all();
console.log("Input data type:", typeof inputData);
console.log("Input data is array:", Array.isArray(inputData));
console.log("Input data length:", inputData ? inputData.length : 0);

// Try to extract the first item
if (Array.isArray(inputData) && inputData.length > 0) {
  console.log("First item type:", typeof inputData[0]);
  console.log("First item has json property:", inputData[0].hasOwnProperty('json'));
  
  if (inputData[0].json) {
    console.log("json property type:", typeof inputData[0].json);
    console.log("json is array:", Array.isArray(inputData[0].json));
    console.log("json length:", Array.isArray(inputData[0].json) ? inputData[0].json.length : 'N/A');
    
    // Log the first few items if it's an array
    if (Array.isArray(inputData[0].json) && inputData[0].json.length > 0) {
      console.log("First item in json array:", JSON.stringify(inputData[0].json[0], null, 2));
      
      // Check if the first item has the expected properties
      const firstItem = inputData[0].json[0];
      if (firstItem) {
        console.log("First item has Email property:", firstItem.hasOwnProperty('Email'));
        console.log("First item has FirstName property:", firstItem.hasOwnProperty('FirstName'));
        console.log("First item has Role property:", firstItem.hasOwnProperty('Role'));
        console.log("First item has OnboardingStatus property:", firstItem.hasOwnProperty('OnboardingStatus'));
      }
    }
  }
}

// Return the data unchanged
return $input.item;
