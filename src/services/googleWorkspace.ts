import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App safely (singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Provider with explicit Google Workspace scopes
export const googleWorkspaceProvider = new GoogleAuthProvider();
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/drive');
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/gmail.modify');
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/calendar.events');
googleWorkspaceProvider.addScope('https://www.googleapis.com/auth/contacts');

// Mandatory In-Memory Token Cache (Never persist in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleWorkspaceProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Workspace access token from Firebase credential.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Workspace Sign-in Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

// ============================================================================
// 1. Google Drive API (drive.googleapis.com/v3)
// ============================================================================
export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
}

export async function listDriveFiles(pageSize = 20): Promise<DriveFileItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const url = `https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink)&q=trashed=false&orderBy=modifiedTime desc`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Google Drive error: ${res.statusText}`);
  }
  const data = await res.json();
  return data.files || [];
}

export async function searchDriveFiles(query: string): Promise<DriveFileItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const safeQuery = query.replace(/'/g, "\\'");
  const url = `https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,modifiedTime,size,webViewLink,iconLink)&q=name contains '${safeQuery}' and trashed=false&orderBy=modifiedTime desc`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Google Drive error: ${res.statusText}`);
  }
  const data = await res.json();
  return data.files || [];
}

export async function uploadDriveTextFile(fileName: string, content: string): Promise<DriveFileItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const metadata = {
    name: fileName,
    mimeType: 'text/plain',
  };

  const boundary = '-------WadeOSMultipartBoundary' + Math.random().toString(36).substring(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
    content +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Google Drive upload error: ${res.statusText}`);
  }
  return await res.json();
}

export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Google Drive delete error: ${res.statusText}`);
  }
}

// ============================================================================
// 2. Gmail API (gmail.googleapis.com/v1)
// ============================================================================
export interface GmailMessageItem {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  date?: string;
}

export async function listGmailMessages(maxResults = 15): Promise<GmailMessageItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const listUrl = `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=label:INBOX`;
  const res = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gmail API error: ${res.statusText}`);
  }

  const listData = await res.json();
  const messagesMeta: { id: string; threadId: string }[] = listData.messages || [];

  const detailed = await Promise.all(
    messagesMeta.slice(0, 8).map(async (m) => {
      try {
        const msgRes = await fetch(
          `https://www.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!msgRes.ok) return { id: m.id, threadId: m.threadId };
        const msgData = await msgRes.json();
        const headers: { name: string; value: string }[] = msgData.payload?.headers || [];
        const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || '(Sin asunto)';
        const from = headers.find((h) => h.name.toLowerCase() === 'from')?.value || 'Desconocido';
        const date = headers.find((h) => h.name.toLowerCase() === 'date')?.value || '';
        return {
          id: m.id,
          threadId: m.threadId,
          snippet: msgData.snippet,
          subject,
          from,
          date,
        };
      } catch {
        return { id: m.id, threadId: m.threadId };
      }
    })
  );

  return detailed;
}

export async function sendGmailMessage(params: { to: string; subject: string; body: string }): Promise<any> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  // RFC 2822 base64url encoded email
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(params.subject)))}?=`;
  const messageParts = [
    `To: ${params.to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${utf8Subject}`,
    '',
    params.body,
  ];
  const message = messageParts.join('\r\n');
  const base64UrlMessage = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: base64UrlMessage }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gmail send error: ${res.statusText}`);
  }

  return await res.json();
}

export async function trashGmailMessage(messageId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const res = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Gmail trash error: ${res.statusText}`);
  }
}

// ============================================================================
// 3. Google Calendar API (calendar.googleapis.com/v3)
// ============================================================================
export interface CalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}

export async function listCalendarEvents(timeMin?: string): Promise<CalendarEventItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const startIso = timeMin || new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(startIso)}&maxResults=20&singleEvents=true&orderBy=startTime`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Calendar error: ${res.statusText}`);
  }

  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    id: item.id,
    summary: item.summary || '(Sin título)',
    description: item.description,
    location: item.location,
    start: item.start || {},
    end: item.end || {},
    htmlLink: item.htmlLink,
  }));
}

export async function createCalendarEvent(params: {
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string; // ISO string
  endDateTime: string;   // ISO string
}): Promise<CalendarEventItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const body = {
    summary: params.summary,
    description: params.description || '',
    location: params.location || '',
    start: { dateTime: params.startDateTime },
    end: { dateTime: params.endDateTime },
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Calendar creation error: ${res.statusText}`);
  }

  return await res.json();
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Calendar deletion error: ${res.statusText}`);
  }
}

// ============================================================================
// 4. Google Contacts (People API - people.googleapis.com/v1)
// ============================================================================
export interface ContactItem {
  resourceName: string;
  etag?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
}

export async function listContacts(pageSize = 30): Promise<ContactItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const url = `https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos&pageSize=${pageSize}&sortOrder=FIRST_NAME_ASCENDING`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Contacts API error: ${res.statusText}`);
  }

  const data = await res.json();
  const connections: any[] = data.connections || [];

  return connections.map((c) => {
    const name = c.names?.[0]?.displayName || 'Sin nombre';
    const email = c.emailAddresses?.[0]?.value || '';
    const phone = c.phoneNumbers?.[0]?.value || '';
    const photoUrl = c.photos?.[0]?.url || '';
    return {
      resourceName: c.resourceName,
      etag: c.etag,
      displayName: name,
      email,
      phone,
      photoUrl,
    };
  });
}

export async function createContact(params: {
  givenName: string;
  familyName?: string;
  email?: string;
  phone?: string;
}): Promise<ContactItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const personBody: any = {
    names: [
      {
        givenName: params.givenName,
        familyName: params.familyName || '',
      },
    ],
  };
  if (params.email) {
    personBody.emailAddresses = [{ value: params.email, type: 'work' }];
  }
  if (params.phone) {
    personBody.phoneNumbers = [{ value: params.phone, type: 'mobile' }];
  }

  const res = await fetch('https://people.googleapis.com/v1/people:createContact?personFields=names,emailAddresses,phoneNumbers,photos', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(personBody),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Contact creation error: ${res.statusText}`);
  }

  const created = await res.json();
  return {
    resourceName: created.resourceName,
    displayName: created.names?.[0]?.displayName || params.givenName,
    email: created.emailAddresses?.[0]?.value || params.email,
    phone: created.phoneNumbers?.[0]?.value || params.phone,
  };
}

export async function deleteContact(resourceName: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google Workspace');

  const res = await fetch(`https://people.googleapis.com/v1/${resourceName}:deleteContact`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 200 && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Contact deletion error: ${res.statusText}`);
  }
}
