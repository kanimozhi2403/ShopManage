async function testApi() {
  try {
    console.log("Sending POST to /api/auth/login...");
    const res = await fetch('http://localhost:5002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@shop.com', password: 'password' })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch(err) {
    console.error("Fetch error:", err);
  }
}
testApi();
