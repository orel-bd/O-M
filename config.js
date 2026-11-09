// =====================================================
//  O&M — פרטי האירוע. זה הקובץ היחיד שצריך לערוך.
// =====================================================
window.EVENT = {
  babyName: "דיוויד פנחס",
  parents: "מיכל ואופק פנחס",
  day: "יום חמישי",
  hebrewDate: "ב׳ בכסלו תשפ״ז",
  date: "12.11.2026",
  time: "18:00",
  venue: "בית הכנסת הגדול עין יעקב",
  address: "שינקין 43, גבעתיים",
  parking: "יש חנייה ברחוב",
  parkingPaid: "ולמעדיפים חניון בתשלום ברחוב המקביל, ",
  parkingAddress: "כצנלסון 103",
  parkingUrl: "https://waze.com/ul?ll=32.0766339,34.8128307&navigate=yes&zoom=17",
  mapsUrl: "https://waze.com/ul?ll=32.0759035,34.8133192&navigate=yes&zoom=17",

  // לאן נשלחים האישורים. ב-Vercel זה "/api/rsvp".
  // אם ריק (למשל בפתיחה מקומית או ב-GitHub Pages) — מצב הדגמה ששומר רק בדפדפן.
  apiUrl: location.protocol.startsWith("http") && !location.hostname.endsWith("github.io") ? "/api/rsvp" : ""
};
