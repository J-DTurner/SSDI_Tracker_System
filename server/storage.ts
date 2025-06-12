import { users, sections, documents, type User, type InsertUser, type Section, type InsertSection, type Document, type InsertDocument } from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sections: Map<number, Section>;
  private documents: Map<number, Document>;
  private currentUserId: number;
  private currentSectionId: number;
  private currentDocumentId: number;

  constructor() {
    this.users = new Map();
    this.sections = new Map();
    this.documents = new Map();
    this.currentUserId = 1;
    this.currentSectionId = 1;
    this.currentDocumentId = 1;
    
    // Initialize with sample user and sections
    this.initializeSampleData();
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
          notes: "Official copy from vital records office"
        });
        
        await this.createDocument({
          sectionId: section.id,
          name: "W-2 Forms (Last 2 Years)",
          description: "Shows your recent work history and earnings",
          fileName: "w2_forms_2022_2023.pdf",
          fileSize: 1536000,
          status: "uploaded",
          notes: "Forms from ABC Manufacturing"
        });
        
        await this.createDocument({
          sectionId: section.id,
          name: "Tax Returns (Last 2 Years)",
          description: "Additional proof of income and work history",
          fileName: "tax_returns_2022_2023.pdf",
          fileSize: 3072000,
          status: "uploaded",
          notes: "Filed jointly with spouse"
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
          notes: "Records from 2022-2024"
        });
        
        await this.createDocument({
          sectionId: section.id,
          name: "Specialist Reports",
          description: "Reports from specialists who treated your condition",
          status: "missing",
          contactInfo: "Dr. Martinez's office - (555) 123-4567",
          notes: "Need orthopedic specialist reports"
        });
      } else if (section.name === "Work History Documentation") {
        await this.createDocument({
          sectionId: section.id,
          name: "Employment Records (ABC Manufacturing)",
          description: "Job description and employment dates: 2018-2023",
          fileName: "abc_employment_records.pdf",
          fileSize: 1024000,
          status: "uploaded",
          notes: "HR department provided complete records"
        });
        
        await this.createDocument({
          sectionId: section.id,
          name: "Job Description Letters",
          description: "Detailed description of daily tasks and physical requirements",
          fileName: "job_descriptions.pdf",
          fileSize: 512000,
          status: "uploaded",
          notes: "Includes physical demands analysis"
        });
      } else if (section.name === "Appeals Process Documents") {
        await this.createDocument({
          sectionId: section.id,
          name: "Denial Letter",
          description: "Official denial letter explaining why your application was rejected",
          status: "missing",
          notes: "Required to start appeal process - deadline May 15, 2024"
        });
      }
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getSectionsByUserId(userId: number): Promise<Section[]> {
    return Array.from(this.sections.values())
      .filter(section => section.userId === userId)
      .sort((a, b) => a.order - b.order);
  }

  async getSection(id: number): Promise<Section | undefined> {
    return this.sections.get(id);
  }

  async createSection(section: InsertSection): Promise<Section> {
    const id = this.currentSectionId++;
    const newSection: Section = { ...section, id };
    this.sections.set(id, newSection);
    return newSection;
  }

  async updateSectionStatus(id: number, status: string): Promise<Section | undefined> {
    const section = this.sections.get(id);
    if (!section) return undefined;
    
    const updatedSection = { ...section, status };
    this.sections.set(id, updatedSection);
    return updatedSection;
  }

  async getDocumentsBySectionId(sectionId: number): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.sectionId === sectionId);
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const newDocument: Document = { 
      ...document, 
      id,
      uploadedAt: document.status === 'uploaded' ? new Date() : null
    };
    this.documents.set(id, newDocument);
    return newDocument;
  }

  async updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined> {
    const existing = this.documents.get(id);
    if (!existing) return undefined;
    
    const updatedDocument = { 
      ...existing, 
      ...document,
      uploadedAt: document.status === 'uploaded' ? new Date() : existing.uploadedAt
    };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
}

export const storage = new MemStorage();
