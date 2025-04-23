fetch('https://ipinfo.io/json?token=63a8dcd6912be8')
  .then(res => res.json())
  .then(data => {
    const ip = data.ip;
    const city = data.city;
    const region = data.region;
    const country = data.country;
    const userAgent = navigator.userAgent;

    const visitorData = {
      ip,
      city,
      region,
      country,
      userAgent
    };

    // Send visitor data to Google Apps Script
    fetch('https://script.google.com/macros/s/AKfycbyrnPxocF6iYRllFB8ATk584g-pnnxMABGNhqErp8i4zovcBYMGtnqsSdfcJDuy7zt-/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitorData)
    })
    .then(() => console.log('Visitor data sent successfully.'))
    .catch(err => console.warn('Failed to send visitor data:', err));
  })
  .catch(err => {
    console.warn('Failed to fetch IP info:', err);
  });
