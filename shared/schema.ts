import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  applicationId: text("application_id").notNull(),
});

export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // 'complete', 'in-progress', 'needs-attention'
  order: integer("order").notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  uploadedAt: timestamp("uploaded_at"),
  status: text("status").notNull(), // 'uploaded', 'missing', 'pending'
  contactInfo: text("contact_info"),
  notes: text("notes"),
  category: text("category").notNull(), // 'personal', 'medical', 'legal', 'employment', 'government'
});

export const retirementTracking = pgTable("retirement_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'email', 'letter', 'phone_call', 'online_message', 'deadline', 'appointment'
  title: text("title").notNull(),
  description: text("description").notNull(),
  receivedAt: timestamp("received_at").notNull(),
  source: text("source").notNull(), // 'social_security', 'ssa_gov', 'phone', 'mail', 'email'
  priority: text("priority").notNull(), // 'high', 'medium', 'low'
  isActionRequired: boolean("is_action_required").notNull().default(false),
  actionDeadline: timestamp("action_deadline"),
  notes: text("notes"),
  attachmentFileName: text("attachment_file_name"),
  attachmentFileSize: integer("attachment_file_size"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertSectionSchema = createInsertSchema(sections).omit({
  id: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export const insertRetirementTrackingSchema = createInsertSchema(retirementTracking).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Section = typeof sections.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

export type InsertRetirementTracking = z.infer<typeof insertRetirementTrackingSchema>;
export type RetirementTracking = typeof retirementTracking.$inferSelect;
