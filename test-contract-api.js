// Simple test script for the contract creation API
const testMessage = async () => {
  try {
    console.log("Testing contract creation API...");
    
    const response = await fetch('http://localhost:3000/api/contract/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: "I need an employment contract for a software developer",
      }),
    });

    const data = await response.json();
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("API Error:", data);
    } else {
      console.log("API Success!");
    }
  } catch (error) {
    console.error("Network error:", error);
  }
};

// For Node.js environment
if (typeof window === 'undefined') {
  // Use node-fetch for Node.js
  const fetch = require('node-fetch');
  testMessage();
}

module.exports = { testMessage };