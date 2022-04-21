const path = require("path");
const fs = require("fs").promises;


//Usage: see the README.md file.
 
const DIR = path.join(app.vault.adapter.basePath, "misc");
const FILE = path.join(DIR, "fitbit.json");
const LANG = "de-CH";

/**
 * Format a fitbit activity item to a string.
 * This function can be edited to customise how the output is formatted.
 * For a list of available properties, see https://dev.fitbit.com/build/reference/web-api/activity/get-activity-log-list#Response
 */
function format(a) {
  a.activityName = activitiesNames(a.activityName);
  const dur = moment.duration(a.activeDuration).asMinutes();
  const hr = a.averageHeartRate ? `${a.averageHeartRate}` : "";
  const dist = a.distance
    ? `${Math.ceil(toMeter(a.distance, a.distanceUnit))}`
    : "";
  return `
### **${a.activityName}**
🕰 Start Time:: ${moment(a.startTime).format("HH:mm")}
🤸‍♂️ Sport:: ${a.activityName}
📏 Time:: ${Math.ceil(dur)}
⏱️ Distance:: ${dist}
💓 Heartrate:: ${hr}
✨ Motivation::

\`\`\`${a.activityName.toLowerCase()}\n\n\`\`\`
`;
}

function activitiesNames(name) {
  return (
    {
      Workout: "Fitness",
      "Outdoor Bike": "Bike",
    }[name] || name
  );
}

// TODO: Add support for other units.
function toMeter(dist, unit) {
  if (unit === "Kilometer") {
    return dist * 1000;
  }
  return dist;
}

async function fitbit(date) {
  fitbitData = await getFitbitData();
  await fitbitAuth(fitbitData);
  const start = moment(date)
    .utcOffset("+0000", true)
    .startOf("day")
    .toISOString()
    .replace(/\.\d{3}Z/, "");

  const end = moment(date).utcOffset("+0000", true).endOf("day");

  const data = await fitbitCall(
    `https://api.fitbit.com/1/user/-/activities/list.json?afterDate=${start}&offset=0&limit=100&sort=asc`,
    fitbitData
  );

  if (!data.activities) {
    return JSON.stringify(data);
  }

  const activities = data.activities.filter((a) =>
    moment(a.startTime).isBefore(end)
  );

  const d = activities.map(format);

  return d.join("");
}

async function getFitbitData() {
  let fitbitData = {
    code: "Enter your code here",
    client_id: "Enter your client_id here",
    client_secret: "Enter your client_secret here",
    access_token: "",
    refresh_token: "",
    redirect_uri: "Enter your redirect_uri here",
  };

  try {
    await fs.access(DIR);
  } catch (err) {
    await fs.mkdir(DIR, { recursive: true });
  }

  try {
    await fs.access(FILE);
  } catch (err) {
    await saveFitbitData(fitbitData);
  }

  const data = await fs.readFile(FILE);
  fitbitData = JSON.parse(data);

  return fitbitData;
}

async function saveFitbitData(data) {
  data.updated = new Date().toISOString();
  try {
    await fs.access(DIR);
  } catch (err) {
    await fs.mkdir(DIR, { recursive: true });
  }
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), { flag: "w" });
}

async function fitbitAuth(data) {
  if (!data.code && !data.access_token && !data.refresh_token) {
    throw new Error("No code or access token found");
  }
  if (!data.client_id || !data.client_secret) {
    throw new Error("No client_id or client_secret found");
  }

  const basic = Buffer.from(`${data.client_id}:${data.client_secret}`)
    .toString("base64")
    .replace(/==$/, "");

  if (data.code) {
    const url =
      `https://api.fitbit.com/oauth2/token?code=${data.code}` +
      `&grant_type=authorization_code&client_id=${data.client_id}` +
      `&redirect_uri=${encodeURIComponent(data.redirect_uri)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }).then((res) => res.json());
    data.access_token = res.access_token;
    data.refresh_token = res.refresh_token;
    data.code = null;
    await saveFitbitData(data);
  }

  const url = `https://api.fitbit.com/1/user/-/profile.json`;
  await fitbitCall(url, data);
}

async function refreshToken(data) {
  if (!data.refresh_token) {
    throw new Error("No refresh token found");
  }
  if (!data.client_id || !data.client_secret) {
    throw new Error("No client_id or client_secret found");
  }

  const basic = Buffer.from(`${data.client_id}:${data.client_secret}`)
    .toString("base64")
    .replace(/==$/, "");
  const url =
    `https://api.fitbit.com/oauth2/token?grant_type=refresh_token&refresh_token=${data.refresh_token}` +
    `&client_id=${data.client_id}` +
    `&redirect_uri=${encodeURIComponent(data.redirect_uri)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).then((res) => res.json());
  data.access_token = res.access_token;
  data.refresh_token = res.refresh_token;
  data.code = null;
  saveFitbitData(data);
}

async function fitbitCall(url, data) {
  if (!data.access_token) {
    throw new Error("No access token found");
  }
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
      "Accept-Language": LANG,
    },
    mode: "cors",
    method: "GET",
  }).then((res) => res.json());
  if (res.errors) {
    if (data.recursive) {
      return res;
    }
    await refreshToken(data);
    return fitbitCall(url, { ...data, recursive: true });
  }

  return res;
}

module.exports = fitbit;
