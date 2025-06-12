import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { googleAuthUrl, getTokensFromCode, getUserInfo, createCalendarEvent, sendEmail } from "./google";
import { insertDocumentSchema, insertRetirementTrackingSchema, insertContactSchema } from "@shared/schema";
import { setupAuth, requireAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPG, PNG, and Word files are allowed.'));
    }
  }
});

const USER_ID = 1; // For demo purposes, all operations are for user ID 1

export async function registerRoutes(app: Express): Promise<Server> {
  // --- GOOGLE INTEGRATION ROUTES ---

  // Redirect to Google's OAuth consent screen
  app.get("/api/auth/google", (req, res) => {
    res.redirect(googleAuthUrl);
  });

  // Handle the callback from Google
  app.get("/api/auth/google/callback", async (req, res) => {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).send("Authorization code missing.");
    }

    try {
      const tokens = await getTokensFromCode(code);
      const userInfo = await getUserInfo(tokens);
      
      if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date || !tokens.scope || !userInfo.email) {
          throw new Error("Failed to retrieve complete token information.");
      }
      
      await storage.createOrUpdateGoogleIntegration({
        userId: USER_ID,
        email: userInfo.email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: new Date(tokens.expiry_date),
        scopes: tokens.scope,
      });

      res.redirect("/integrations?status=success");
    } catch (error) {
      console.error("Google auth callback error:", error);
      res.redirect("/integrations?status=error");
    }
  });
  
  // Get Google integration status
  app.get("/api/integrations/google", async (req, res) => {
    try {
      const integration = await storage.getGoogleIntegration(USER_ID);
      if (integration) {
        res.json({ isConnected: true, email: integration.email });
      } else {
        res.json({ isConnected: false });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get integration status" });
    }
  });

  // Disconnect Google account
  app.delete("/api/integrations/google", async (req, res) => {
    try {
      await storage.deleteGoogleIntegration(USER_ID);
      res.json({ message: "Google account disconnected successfully." });
    } catch (error) {
      res.status(500).json({ message: "Failed to disconnect Google account." });
    }
  });

  app.get("/api/user/action-items", async (req, res) => {
    try {
      const actionItems = await storage.getActionItems(USER_ID);
      res.json(actionItems);
    } catch (error) {
      console.error("Failed to get action items:", error);
      res.status(500).json({ message: "Failed to get action items" });
    }
  });

  // --- USER & APPLICATION ROUTES ---

  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser(USER_ID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.get("/api/sections", async (req, res) => {
    try {
      const sections = await storage.getSectionsByUserId(USER_ID);
      res.json(sections);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sections" });
    }
  });

  app.get("/api/sections/:sectionId/documents", async (req, res) => {
    try {
      const sectionId = parseInt(req.params.sectionId);
      const documents = await storage.getDocumentsBySectionId(sectionId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Failed to get documents" });
    }
  });

  app.post("/api/sections/:sectionId/documents", upload.single('file'), async (req, res) => {
    try {
      const sectionId = parseInt(req.params.sectionId);
      const { name, description, notes, category } = req.body;
      
      if (!name || !description || !category) {
        return res.status(400).json({ message: "Name, description, and category are required" });
      }

      const documentData = {
        sectionId,
        name,
        description,
        fileName: req.file?.filename || null,
        fileSize: req.file?.size || null,
        status: req.file ? 'uploaded' : 'pending',
        notes: notes || null,
        contactInfo: null,
        category
      };

      const document = await storage.createDocument(documentData);
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDocument(id);
      
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // --- RETIREMENT TRACKING ROUTES ---

  app.get("/api/retirement-tracking", async (req, res) => {
    try {
      const trackings = await storage.getRetirementTrackingByUserId(USER_ID);
      res.json(trackings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get retirement tracking" });
    }
  });

  app.post("/api/retirement-tracking", upload.single('attachment'), async (req, res) => {
    try {
      const { type, title, description, receivedAt, source, priority, isActionRequired, actionDeadline, notes } = req.body;
      
      if (!type || !title || !description || !receivedAt || !source || !priority) {
        return res.status(400).json({ message: "Required fields missing" });
      }

      const trackingData = {
        userId: USER_ID,
        type,
        title,
        description,
        receivedAt: new Date(receivedAt),
        source,
        priority,
        isActionRequired: isActionRequired === 'true',
        actionDeadline: actionDeadline ? new Date(actionDeadline) : null,
        notes: notes || null,
        attachmentFileName: req.file?.filename || null,
        attachmentFileSize: req.file?.size || null,
      };

      const tracking = await storage.createRetirementTracking(trackingData);

      let calendarEventCreated = false;
      if (tracking.isActionRequired && tracking.actionDeadline) {
        const integration = await storage.getGoogleIntegration(USER_ID);
        if (integration) {
          const event = {
            summary: tracking.title,
            description: `${tracking.description}\n\nNotes: ${tracking.notes || 'N/A'}`,
            start: {
              dateTime: tracking.actionDeadline.toISOString(),
              timeZone: 'America/Los_Angeles' // Should ideally be user's timezone
            },
            end: {
              dateTime: new Date(tracking.actionDeadline.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
              timeZone: 'America/Los_Angeles'
            }
          };
          const result = await createCalendarEvent(USER_ID, event);
          calendarEventCreated = result.success;
        }
      }
      
      res.json({ ...tracking, calendarEventCreated });
    } catch (error) {
      res.status(500).json({ message: "Failed to create retirement tracking entry" });
    }
  });

  app.delete("/api/retirement-tracking/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteRetirementTracking(id);
      
      if (!success) {
        return res.status(404).json({ message: "Retirement tracking entry not found" });
      }
      
      res.json({ message: "Retirement tracking entry deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete retirement tracking entry" });
    }
  });

  app.patch("/api/retirement-tracking/:id/complete", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedTracking = await storage.markRetirementTrackingAsComplete(id, USER_ID);

      if (!updatedTracking) {
        return res.status(404).json({ message: "Tracking item not found or you do not have permission to update it." });
      }

      res.json(updatedTracking);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark tracking item as complete." });
    }
  });
  
  // --- CONTACTS ROUTES ---

  app.get("/api/contacts", async (req, res) => {
    try {
        const contacts = await storage.getContactsByUserId(USER_ID);
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: "Failed to get contacts." });
    }
  });

  app.post("/api/contacts", async (req, res) => {
      try {
          const contactData = insertContactSchema.parse({ ...req.body, userId: USER_ID });
          const newContact = await storage.createContact(contactData);
          res.status(201).json(newContact);
      } catch (error) {
          res.status(400).json({ message: "Invalid contact data.", error });
      }
  });

  app.patch("/api/contacts/:id", async (req, res) => {
      try {
          const id = parseInt(req.params.id);
          const contactData = insertContactSchema.partial().parse(req.body);
          const updatedContact = await storage.updateContact(id, contactData);
          if (!updatedContact) {
              return res.status(404).json({ message: "Contact not found." });
          }
          res.json(updatedContact);
      } catch (error) {
          res.status(400).json({ message: "Invalid contact data.", error });
      }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
      try {
          const id = parseInt(req.params.id);
          const success = await storage.deleteContact(id);
          if (!success) {
              return res.status(404).json({ message: "Contact not found." });
          }
          res.status(204).send();
      } catch (error) {
          res.status(500).json({ message: "Failed to delete contact." });
      }
  });

  // --- EMAIL ROUTE ---
  
  app.post("/api/email/send", async (req, res) => {
    try {
      const { to, subject, body, attachmentIds } = req.body; // attachmentIds is an array of document IDs
      if (!to || !subject || !body) {
        return res.status(400).json({ message: "To, subject, and body are required." });
      }

      const attachments = [];
      if (attachmentIds && Array.isArray(attachmentIds)) {
        for (const id of attachmentIds) {
          const doc = await storage.getDocument(id);
          if (doc && doc.fileName) {
            attachments.push(doc);
          }
        }
      }

      const result = await sendEmail(USER_ID, to, subject, body, attachments);
      if (result.success) {
        res.json({ message: "Email sent successfully." });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to send email.", error: (error as Error).message });
    }
  });

  // --- OTHER ROUTES ---

  app.get("/api/files/:filename", (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(uploadDir, filename);
    
    if (fs.existsSync(filepath)) {
      res.sendFile(filepath);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}