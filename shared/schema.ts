import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  jsonb,
  real,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// USER - Keep existing structure and add Replit Auth fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 256 }).unique().notNull(),
  password: text("password").notNull(),
  name: varchar("name", { length: 256 }),
  applicationId: varchar("application_id", { length: 256 }),
  // Auth fields
  email: varchar("email"),
  createdAt: timestamp("createdat").defaultNow(),
  updatedAt: timestamp("updatedat").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
        sections: many(sections),
  documents: many(documents),
  retirementTrackings: many(retirementTracking),
  googleIntegrations: many(googleIntegrations),
  contacts: many(contacts),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UpsertUser = typeof users.$inferInsert;
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// GOOGLE INTEGRATIONS
export const googleIntegrations = pgTable("google_integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  email: varchar("email", { length: 256 }).notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(), // This will be encrypted
  expiryDate: timestamp("expiry_date", { withTimezone: true }).notNull(),
  scopes: text("scopes").notNull(), // Store scopes as a space-separated string
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: index("google_integrations_user_id_idx").on(table.userId),
  };
});

export const googleIntegrationsRelations = relations(googleIntegrations, ({ one }) => ({
  user: one(users, {
    fields: [googleIntegrations.userId],
    references: [users.id],
  }),
}));

export type GoogleIntegration = typeof googleIntegrations.$inferSelect;
export type InsertGoogleIntegration = typeof googleIntegrations.$inferInsert;
export const insertGoogleIntegrationSchema = createInsertSchema(googleIntegrations);
export const selectGoogleIntegrationSchema = createSelectSchema(googleIntegrations);

// CONTACTS
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 256 }).notNull(),
  role: varchar("role", { length: 256 }),
  email: varchar("email", { length: 256 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    userIdx: index("contacts_user_id_idx").on(table.userId),
  };
});

export const contactsRelations = relations(contacts, ({ one }) => ({
  user: one(users, {
    fields: [contacts.userId],
    references: [users.id],
  }),
}));

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;
export const insertContactSchema = createInsertSchema(contacts);
export const selectContactSchema = createSelectSchema(contacts);


// SECTIONS
export const sectionStatusEnum = pgEnum("section_status", ["complete", "in-progress", "needs-attention"]);

export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  status: sectionStatusEnum("status").notNull(),
  order: integer("order").notNull(),
});

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  user: one(users, {
    fields: [sections.userId],
    references: [users.id],
  }),
  documents: many(documents),
}));

export type Section = typeof sections.$inferSelect;
export type InsertSection = typeof sections.$inferInsert;
export const insertSectionSchema = createInsertSchema(sections);
export const selectSectionSchema = createSelectSchema(sections);


// DOCUMENTS
export const documentStatusEnum = pgEnum("document_status", ["uploaded", "pending", "missing"]);
export const documentCategoryEnum = pgEnum("document_category", ["personal", "medical", "legal", "employment", "government"]);

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").notNull().references(() => sections.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  status: documentStatusEnum("status").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }),
  contactInfo: text("contact_info"),
  notes: text("notes"),
  category: documentCategoryEnum("category").notNull(),
});

export const documentsRelations = relations(documents, ({ one }) => ({
  section: one(sections, {
    fields: [documents.sectionId],
    references: [sections.id],
  }),
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
}));

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export const insertDocumentSchema = createInsertSchema(documents);
export const selectDocumentSchema = createSelectSchema(documents);


// RETIREMENT TRACKING
export const communicationTypeEnum = pgEnum("communication_type", ["email", "letter", "phone_call", "online_message", "deadline", "appointment"]);
export const sourceEnum = pgEnum("source", ["social_security", "ssa_gov", "phone", "mail", "email"]);
export const priorityEnum = pgEnum("priority", ["high", "medium", "low"]);

export const retirementTracking = pgTable("retirement_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: communicationTypeEnum("type").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull(),
  source: sourceEnum("source").notNull(),
  priority: priorityEnum("priority").notNull(),
  isActionRequired: boolean("is_action_required").default(false).notNull(),
  actionDeadline: timestamp("action_deadline", { withTimezone: true }),
  actionCompletedAt: timestamp("action_completed_at", { withTimezone: true }),
  notes: text("notes"),
  attachmentFileName: text("attachment_file_name"),
  attachmentFileSize: integer("attachment_file_size"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const retirementTrackingRelations = relations(retirementTracking, ({ one }) => ({
  user: one(users, {
    fields: [retirementTracking.userId],
    references: [users.id],
  }),
}));

export type RetirementTracking = typeof retirementTracking.$inferSelect;
export type InsertRetirementTracking = typeof retirementTracking.$inferInsert;
export const insertRetirementTrackingSchema = createInsertSchema(retirementTracking);
export const selectRetirementTrackingSchema = createSelectSchema(retirementTracking);