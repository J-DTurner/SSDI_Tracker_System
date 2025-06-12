import { google } from 'googleapis';
import { storage } from './storage';
import { decrypt } from './encryption';
import nodemailer from 'nodemailer';
import { Document } from '@shared/schema';
import fs from 'fs';
import path from 'path';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export const googleAuthUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/gmail.send'
  ],
  prompt: 'consent',
});

export async function getTokensFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

async function getAuthenticatedClient(userId: number) {
  const integration = await storage.getGoogleIntegration(userId);
  if (!integration) {
    throw new Error('Google integration not found for this user.');
  }

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const tokens = {
    access_token: integration.accessToken,
    refresh_token: decrypt(integration.refreshToken),
    expiry_date: new Date(integration.expiryDate).getTime(),
    token_type: 'Bearer',
  };

  client.setCredentials(tokens);

  // Auto-refresh token if needed
  client.on('tokens', async (newTokens) => {
    let updatedTokens = { ...tokens, ...newTokens };
    
    // Google doesn't always send a new refresh token
    if (!newTokens.refresh_token) {
        newTokens.refresh_token = tokens.refresh_token;
    }
    
    await storage.updateGoogleIntegration(userId, {
        accessToken: newTokens.access_token!,
        refreshToken: newTokens.refresh_token!, // This will be re-encrypted by storage layer
        expiryDate: new Date(newTokens.expiry_date!),
    });

    client.setCredentials(updatedTokens);
  });

  // Check if token is expired and refresh if necessary
  if (new Date() > integration.expiryDate) {
    const { credentials } = await client.refreshAccessToken();
    client.setCredentials(credentials);
  }

  return client;
}

export async function createCalendarEvent(userId: number, event: { summary: string; description: string; start: { dateTime: string; timeZone: string; }; end: { dateTime: string; timeZone: 'America/Los_Angeles'; }; }) {
    try {
        const auth = await getAuthenticatedClient(userId);
        const calendar = google.calendar({ version: 'v3', auth });
        
        await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to create calendar event:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function sendEmail(userId: number, to: string, subject: string, body: string, attachments: Document[]) {
    try {
        const auth = await getAuthenticatedClient(userId);
        const integration = await storage.getGoogleIntegration(userId);
        if (!integration) throw new Error("User not integrated with Google");

        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: integration.email,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: decrypt(integration.refreshToken),
                accessToken: integration.accessToken,
            },
        });

        const mailOptions = {
            from: integration.email,
            to: to,
            subject: subject,
            html: body,
            attachments: attachments.map(doc => {
              const filePath = path.join(process.cwd(), 'uploads', doc.fileName!);
              return {
                filename: doc.name + path.extname(doc.fileName!),
                content: fs.createReadStream(filePath),
              }
            })
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function getUserInfo(tokens: { access_token: string }) {
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    oauth2Client.setCredentials(tokens);
    const { data } = await oauth2.userinfo.get();
    return data;
}