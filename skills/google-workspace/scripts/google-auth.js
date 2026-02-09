#!/usr/bin/env node
/**
 * Google Workspace - Shared Auth Library
 *
 * Creates authenticated Google API clients using OAuth2 credentials
 * from environment variables. Handles token refresh automatically.
 *
 * Usage:
 *   const { getGmail, getCalendar } = require('./google-auth');
 *   const gmail = getGmail();
 *   const calendar = getCalendar();
 */

const { google } = require('googleapis');

function getAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    const missing = [];
    if (!clientId) missing.push('GOOGLE_CLIENT_ID');
    if (!clientSecret) missing.push('GOOGLE_CLIENT_SECRET');
    if (!refreshToken) missing.push('GOOGLE_REFRESH_TOKEN');
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

function getGmail() {
  return google.gmail({ version: 'v1', auth: getAuth() });
}

function getCalendar() {
  return google.calendar({ version: 'v3', auth: getAuth() });
}

module.exports = { getAuth, getGmail, getCalendar };
