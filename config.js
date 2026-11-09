// =====================================================
//  O&M — פרטי האירוע. זה הקובץ היחיד שצריך לערוך.
// =====================================================
window.EVENT = {
  babyName: "דיוויד פינחס",
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
  parkingUrl: "https://waze.com/ul?q=%D7%9B%D7%A6%D7%A0%D7%9C%D7%A1%D7%95%D7%9F%20103%20%D7%92%D7%91%D7%A2%D7%AA%D7%99%D7%99%D7%9D&navigate=yes",
  mapsUrl: "https://waze.com/ul?q=%D7%A9%D7%99%D7%A0%D7%A7%D7%99%D7%9F%2043%20%D7%92%D7%91%D7%A2%D7%AA%D7%99%D7%99%D7%9D&navigate=yes",

  // לאן נשלחים האישורים. ב-Vercel זה "/api/rsvp".
  // אם ריק (למשל בפתיחה מקומית או ב-GitHub Pages) — מצב הדגמה ששומר רק בדפדפן.
  apiUrl: location.protocol.startsWith("http") && !location.hostname.endsWith("github.io") ? "/api/rsvp" : ""
};
