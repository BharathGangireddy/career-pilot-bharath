const fetch = require("node-fetch");

const API_KEY = "AIzaSyDD6YunxezbAq0LGW7g8oDyL-z6DHpwmyc";

async function test() {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`
    );

    const data = await res.json();

    console.log("🔍 RESPONSE:");
    console.log(JSON.stringify(data, null, 2));

  } catch (err) {
    console.error("❌ ERROR:", err);
  }
}

test();