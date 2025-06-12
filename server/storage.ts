import { users, sections, documents, retirementTracking, type User, type InsertUser, type Section, type InsertSection, type Document, type InsertDocument, type RetirementTracking, type InsertRetirementTracking } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Section operations
  getSectionsByUserId(userId: number): Promise<Section[]>;
  getSection(id: number): Promise<Section | undefined>;
  createSection(section: InsertSection): Promise<Section>;
  updateSectionStatus(id: number, status: string): Promise<Section | undefined>;
  
  // Document operations
  getDocumentsBySectionId(sectionId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;

  // Retirement tracking operations
  getRetirementTrackingByUserId(userId: number): Promise<RetirementTracking[]>;
  getRetirementTracking(id: number): Promise<RetirementTracking | undefined>;
  createRetirementTracking(tracking: InsertRetirementTracking): Promise<RetirementTracking>;
  updateRetirementTracking(id: number, tracking: Partial<InsertRetirementTracking>): Promise<RetirementTracking | undefined>;
  deleteRetirementTracking(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize with sample data if needed
    this.initializeSampleData();
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getSectionsByUserId(userId: number): Promise<Section[]> {
    return await db.select().from(sections).where(eq(sections.userId, userId)).orderBy(sections.order);
  }

  async getSection(id: number): Promise<Section | undefined> {
    const [section] = await db.select().from(sections).where(eq(sections.id, id));
    return section || undefined;
  }

  async createSection(section: InsertSection): Promise<Section> {
    const [newSection] = await db
      .insert(sections)
      .values(section)
      .returning();
    return newSection;
  }

  async updateSectionStatus(id: number, status: string): Promise<Section | undefined> {
    const [updatedSection] = await db
      .update(sections)
      .set({ status })
      .where(eq(sections.id, id))
      .returning();
    return updatedSection || undefined;
  }

  async getDocumentsBySectionId(sectionId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.sectionId, sectionId));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || undefined;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const documentToInsert = {
      ...document,
      uploadedAt: document.status === 'uploaded' ? new Date() : null
    };
    
    const [newDocument] = await db
      .insert(documents)
      .values(documentToInsert)
      .returning();
    return newDocument;
  }

  async updateDocument(id: number, documentUpdate: Partial<InsertDocument>): Promise<Document | undefined> {
    const updateData = {
      ...documentUpdate,
      uploadedAt: documentUpdate.status === 'uploaded' ? new Date() : undefined
    };
    
    const [updatedDocument] = await db
      .update(documents)
      .set(updateData)
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument || undefined;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getRetirementTrackingByUserId(userId: number): Promise<RetirementTracking[]> {
    return await db.select().from(retirementTracking).where(eq(retirementTracking.userId, userId)).orderBy(desc(retirementTracking.receivedAt));
  }

  async getRetirementTracking(id: number): Promise<RetirementTracking | undefined> {
    const [tracking] = await db.select().from(retirementTracking).where(eq(retirementTracking.id, id));
    return tracking || undefined;
  }

  async createRetirementTracking(tracking: InsertRetirementTracking): Promise<RetirementTracking> {
    const [newTracking] = await db
      .insert(retirementTracking)
      .values(tracking)
      .returning();
    return newTracking;
  }

  async updateRetirementTracking(id: number, trackingUpdate: Partial<InsertRetirementTracking>): Promise<RetirementTracking | undefined> {
    const [updatedTracking] = await db
      .update(retirementTracking)
      .set(trackingUpdate)
      .where(eq(retirementTracking.id, id))
      .returning();
    return updatedTracking || undefined;
  }

  async deleteRetirementTracking(id: number): Promise<boolean> {
    const result = await db.delete(retirementTracking).where(eq(retirementTracking.id, id));
    return (result.rowCount || 0) > 0;
  }

  private async initializeSampleData() {
    // Create sample user
    const user = await this.createUser({
      username: "john.smith",
      password: "password",
      name: "John Smith",
      applicationId: "SS-2024-001234"
    });

    // Create initial sections
    const sectionsData = [
      {
        userId: user.id,
        name: "Initial Application Documents",
        description: "Basic information to start your application",
        status: "complete",
        order: 1
      },
      {
        userId: user.id,
        name: "Medical Evidence",
        description: "Documents that prove your disability",
        status: "in-progress",
        order: 2
      },
      {
        userId: user.id,
        name: "Work History Documentation",
        description: "Proof of your past employment and job duties",
        status: "complete",
        order: 3
      },
      {
        userId: user.id,
        name: "Appeals Process Documents",
        description: "Documents needed if your application is denied",
        status: "needs-attention",
        order: 4
      }
    ];

    for (const sectionData of sectionsData) {
      const section = await this.createSection(sectionData);
      
      // Create sample documents for each section
      if (section.name === "Initial Application Documents") {
        await this.createDocument({
          sectionId: section.id,
          name: "Birth Certificate",
          description: "Proves your age and citizenship status",
          fileName: "birth_certificate.pdf",
          fileSize: 2048000,
          status: "uploaded",
          notes: "Official copy from vital records office",
          category: "government"
        });
        
        await this.createDocument({
          sectionId: section.id,
          name: "W-2 Forms (Last 2 Years)",
          description: "Shows your recent work history and earnings",
          fileName: "w2_forms_2022_2023.pdf",
          fileSize: 1536000,
          status: "uploaded",
          notes: "Forms from ABC Manufacturing",
          category: "employment"
        });
        
        await this.createDocument({
          sectionId: section.id,
          name: "Tax Returns (Last 2 Years)",
          description: "Additional proof of income and work history",
          fileName: "tax_returns_2022_2023.pdf",
          fileSize: 3072000,
          status: "uploaded",
          notes: "Filed jointly with spouse",
          category: "personal"
        });
      } else if (section.name === "Medical Evidence") {
        await this.createDocument({
          sectionId: section.id,
          name: "Primary Care Physician Records",
          description: "Records from Dr. Johnson showing ongoing treatment",
          fileName: "dr_johnson_records.pdf",
          fileSize: 4096000,
          status: "uploaded",
          contactInfo: "Dr. Johnson's office - (555) 123-4567",
          notes: "Records from 2022-2024",
          category: "medical"
        });
        
        await this.createDocument({
          sectionId: section.id,
          name: "Specialist Reports",
          description: "Reports from specialists who treated your condition",
          status: "missing",
          contactInfo: "Dr. Martinez's office - (555) 123-4567",
          notes: "Need orthopedic specialist reports",
          category: "medical"
        });
      } else if (section.name === "Work History Documentation") {
        await this.createDocument({
          sectionId: section.id,
          name: "Employment Records (ABC Manufacturing)",
          description: "Job description and employment dates: 2018-2023",
          fileName: "abc_employment_records.pdf",
          fileSize: 1024000,
          status: "uploaded",
          notes: "HR department provided complete records",
          category: "employment"
        });
        
        await this.createDocument({
          sectionId: section.id,
          name: "Job Description Letters",
          description: "Detailed description of daily tasks and physical requirements",
          fileName: "job_descriptions.pdf",
          fileSize: 512000,
          status: "uploaded",
          notes: "Includes physical demands analysis",
          category: "employment"
        });
      } else if (section.name === "Appeals Process Documents") {
        await this.createDocument({
          sectionId: section.id,
          name: "Denial Letter",
          description: "Official denial letter explaining why your application was rejected",
          status: "missing",
          notes: "Required to start appeal process - deadline May 15, 2024",
          category: "legal"
        });
      }
    }

    // Create sample retirement tracking entries
    await this.createRetirementTracking({
      userId: user.id,
      type: "email",
      title: "Early Retirement Application Received",
      description: "Confirmation that your early retirement application has been received and is being processed",
      receivedAt: new Date("2024-01-15T10:30:00Z"),
      source: "ssa_gov",
      priority: "medium",
      isActionRequired: false,
      notes: "Application reference: ER-2024-001234"
    });

    await this.createRetirementTracking({
      userId: user.id,
      type: "letter",
      title: "Request for Additional Documentation",
      description: "Social Security Administration requesting additional employment verification documents",
      receivedAt: new Date("2024-02-01T14:00:00Z"),
      source: "mail",
      priority: "high",
      isActionRequired: true,
      actionDeadline: new Date("2024-03-01T23:59:59Z"),
      notes: "Need to provide W-2 forms from 2019-2023 and employment verification letter"
    });

    await this.createRetirementTracking({
      userId: user.id,
      type: "phone_call",
      title: "Status Update Call",
      description: "Called SSA to check on application status - told processing is taking 3-4 months",
      receivedAt: new Date("2024-02-15T11:15:00Z"),
      source: "phone",
      priority: "low",
      isActionRequired: false,
      notes: "Spoke with representative Sarah Johnson. Case number: ER-2024-001234. Expected decision by April 2024."
    });

    await this.createRetirementTracking({
      userId: user.id,
      type: "deadline",
      title: "Medical Exam Appointment",
      description: "Scheduled medical examination required for early retirement application",
      receivedAt: new Date("2024-02-20T09:00:00Z"),
      source: "social_security",
      priority: "high",
      isActionRequired: true,
      actionDeadline: new Date("2024-03-15T14:00:00Z"),
      notes: "Appointment with Dr. Wilson at Downtown Medical Center. Bring ID and insurance cards."
    });
  }
}

export const storage = new DatabaseStorage();