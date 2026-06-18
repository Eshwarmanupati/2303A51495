/**
 * Token Generator Helper Script
 * 
 * This script automates the Affordmed register & auth process to obtain
 * your JWT token for the evaluation API.
 * 
 * Usage:
 *   node get_token.js
 */

const readline = require("readline");

const API_BASE = "http://4.224.186.213/evaluation-service";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const studentDetails = {
  name: "Eshwar Manupati",
  email: "eshwarmanupati@gmail.com",
  rollNo: "2303A51495",
  githubUsername: "Eshwarmanupati",
};

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  console.log("==========================================");
  console.log("    Affordmed API Token Generator Tool    ");
  console.log("==========================================\n");

  try {
    const mobileNo = await askQuestion("📱 Enter your Mobile Number: ");
    if (!mobileNo) {
      throw new Error("Mobile number is required.");
    }

    const accessCode = await askQuestion("🔑 Enter your Access Code (provided by your college/test portal): ");
    if (!accessCode) {
      throw new Error("Access Code is required.");
    }

    rl.close();

    const registrationPayload = {
      ...studentDetails,
      mobileNo: mobileNo.trim(),
      accessCode: accessCode.trim(),
    };

    console.log("\n📡 Step 1: Registering with Affordmed service...");
    const regResponse = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registrationPayload),
    });

    const regData = await regResponse.json();

    if (!regResponse.ok) {
      console.error("\n❌ Registration Failed:", JSON.stringify(regData.errors || regData));
      return;
    }

    const { clientID, clientSecret } = regData;
    if (!clientID || !clientSecret) {
      throw new Error("Registration succeeded but did not return clientID and clientSecret.");
    }

    console.log("✅ Registration Successful!");
    console.log(`   Client ID: ${clientID}`);

    console.log("\n📡 Step 2: Authenticating to obtain JWT token...");
    const authPayload = {
      ...studentDetails,
      accessCode: accessCode.trim(),
      clientID,
      clientSecret,
    };

    const authResponse = await fetch(`${API_BASE}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authPayload),
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      console.error("\n❌ Authentication Failed:", JSON.stringify(authData.errors || authData));
      return;
    }

    const token = authData.token || authData.access_token;
    if (!token) {
      throw new Error("Authentication succeeded but did not return a token.");
    }

    console.log("\n======================================================================");
    console.log("🎉 SUCCESS! Your JWT Authorization Token has been generated:");
    console.log("======================================================================\n");
    console.log(token);
    console.log("\n======================================================================");
    console.log("👉 Copy this token and paste it into the React UI's 'Authorization Credentials' box!");
    console.log("======================================================================\n");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    rl.close();
  }
}

main();
