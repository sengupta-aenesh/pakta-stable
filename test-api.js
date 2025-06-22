const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log("Testing minimal API...");
    
    const response = await fetch('http://localhost:3000/api/contract/create-minimal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: "test message",
      }),
    });

    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Response data:", JSON.stringify(data, null, 2));

  } catch (error) {
    console.error("Test failed:", error);
  }
}

testAPI();