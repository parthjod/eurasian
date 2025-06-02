"use server";

import { z } from "zod";
import { MongoClient } from "mongodb";

const feedbackSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  feedbackType: z.enum(["bug", "feature", "general"], { message: "Please select a feedback type." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters long." }).max(1000, { message: "Message must be at most 1000 characters." }),
});

export interface FeedbackFormState {
  message: string;
  error?: string;
  fields?: {
    email?: string;
    feedbackType?: string;
    message?: string;
  };
  issues?: string[];
}

// MongoDB connection URI from environment variable
const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

export async function submitFeedback(
  prevState: FeedbackFormState,
  formData: FormData
): Promise<FeedbackFormState> {
  const rawData = {
    email: formData.get("email"),
    feedbackType: formData.get("feedbackType"),
    message: formData.get("message"),
  };

  const validatedFields = feedbackSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const fieldErrors: Record<string, string> = {};
    validatedFields.error.issues.forEach(issue => {
      const path = issue.path.join(".");
      if (path) {
        fieldErrors[path] = issue.message;
      }
    });

    return {
      message: "",
      error: "Please correct the errors below.",
      fields: {
        email: typeof rawData.email === "string" ? rawData.email : "",
        feedbackType: typeof rawData.feedbackType === "string" ? rawData.feedbackType : "",
        message: typeof rawData.message === "string" ? rawData.message : "",
      },
      issues: validatedFields.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`),
    };
  }

  try {
    const client = await connectToDatabase();
    const db = client.db(); // default DB from URI or specify like client.db('your-db-name')

    // Insert feedback document
    await db.collection("feedback").insertOne({
      email: validatedFields.data.email,
      feedbackType: validatedFields.data.feedbackType,
      message: validatedFields.data.message,
      createdAt: new Date(),
    });

    return {
      message: "Feedback submitted successfully! Thank you.",
      error: undefined,
      fields: {},
      issues: [],
    };
  } catch (error) {
    console.error("Failed to save feedback:", error);
    return {
      message: "",
      error: "Failed to submit feedback. Please try again later.",
      fields: {
        email: validatedFields.data.email,
        feedbackType: validatedFields.data.feedbackType,
        message: validatedFields.data.message,
      },
      issues: [],
    };
  }
}
