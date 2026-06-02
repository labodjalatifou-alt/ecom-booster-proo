const fetch = require('node-fetch');

async function testTTS() {
  try {
    const res = await fetch('https://tiktok-tts.weilnet.workers.dev/api/generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: "Bonjour les amis",
        voice: "fr_001"
      })
    });
    const data = await res.json();
    console.log(data.success ? 'SUCCESS' : 'FAILED');
    if (data.success) {
      console.log('Audio base64 length:', data.data.length);
    } else {
      console.log('Error:', data);
    }
  } catch (e) {
    console.error('Fetch failed:', e);
  }
}

testTTS();
