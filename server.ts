/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.use(express.json());

const dbPath = path.join(process.cwd(), "src", "db.json");

// Helper to read database
function readDatabase() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading db.json, returning default:", error);
  }
  return { patients: [], appointments: [] };
}

// Helper to write database
function writeDatabase(data: any) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing to db.json:", error);
    return false;
  }
}

// Helper to lazy-load Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    throw new Error("GEMINI_API_KEY is not configured in the secrets dashboard.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// API: Get Full DB State
app.get("/api/db", (req, res) => {
  const db = readDatabase();
  res.json(db);
});

// API: Get Patient List
app.get("/api/patients", (req, res) => {
  const db = readDatabase();
  res.json(db.patients || []);
});

// API: Create new patient
app.post("/api/patients", (req, res) => {
  const db = readDatabase();
  const { name, age, gender, email, phone, medicalHistory, currentCondition, completedSessions, recommendedSessions, conditionStatus, notes } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: "Patient name and email are required." });
  }

  const newPatient = {
    id: `pat_${Date.now()}`,
    name,
    age: Number(age) || 30,
    gender: gender || "Male",
    email,
    phone: phone || "",
    medicalHistory: medicalHistory || "No historical pathology noted.",
    currentCondition: currentCondition || "Undergoing evaluation.",
    completedSessions: Number(completedSessions) || 0,
    recommendedSessions: Number(recommendedSessions) || 10,
    conditionStatus: conditionStatus || "active-rehab",
    notes: notes || ""
  };

  db.patients = db.patients || [];
  db.patients.push(newPatient);
  writeDatabase(db);
  res.status(201).json(newPatient);
});

// API: Update patient (For completed sessions counts / EMR adjustments)
app.put("/api/patients/:id", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const index = db.patients.findIndex((p: any) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Patient not found." });
  }

  const updatedPatient = {
    ...db.patients[index],
    ...req.body,
    age: req.body.age !== undefined ? Number(req.body.age) : db.patients[index].age,
    completedSessions: req.body.completedSessions !== undefined ? Number(req.body.completedSessions) : db.patients[index].completedSessions,
    recommendedSessions: req.body.recommendedSessions !== undefined ? Number(req.body.recommendedSessions) : db.patients[index].recommendedSessions,
  };

  db.patients[index] = updatedPatient;
  writeDatabase(db);
  res.json(updatedPatient);
});

// API: List Appointments
app.get("/api/appointments", (req, res) => {
  const db = readDatabase();
  res.json(db.appointments || []);
});

// API: Book Appointment
app.post("/api/appointments", (req, res) => {
  const db = readDatabase();
  const { patientName, email, phone, doctorId, type, date, timeSlot, paymentStatus, paymentId, notes } = req.body;

  if (!patientName || !email || !date || !timeSlot || !type) {
    return res.status(400).json({ error: "Required details: Name, email, type, date, and slot must be provided." });
  }

  db.appointments = db.appointments || [];

  // Check slot availability (collision detection)
  const isSlotTaken = db.appointments.some((apt: any) => 
    apt.date === date && 
    apt.timeSlot === timeSlot && 
    apt.type === type &&
    apt.status !== 'cancelled'
  );

  if (isSlotTaken) {
    return res.status(409).json({ error: "The selected appointment time slot is already booked. Please choose another." });
  }

  const newApt = {
    id: `apt_${Date.now()}`,
    patientName,
    email,
    phone: phone || "+91 99999 99999",
    doctorId: doctorId || "any",
    type, // 'in-clinic' | 'home-visit'
    date,
    timeSlot,
    paymentStatus: paymentStatus || "pending",
    paymentId: paymentId || "",
    status: "scheduled",
    notes: notes || ""
  };

  db.appointments.push(newApt);

  // Auto-create in patient database list if they don't exist yet for smooth clinical EMR workflow!
  db.patients = db.patients || [];
  const exists = db.patients.some((p: any) => p.email.toLowerCase() === email.toLowerCase());
  if (!exists) {
    const ageOptions = [28, 35, 47, 52, 64];
    const dummyAge = ageOptions[Math.floor(Math.random() * ageOptions.length)];
    const dummyGender = indexToSuffix(patientName);
    
    db.patients.push({
      id: `pat_${Date.now() + 1}`,
      name: patientName,
      age: dummyAge,
      gender: dummyGender,
      email: email,
      phone: phone || "+91 99999 99999",
      medicalHistory: "First-time patient booker via portal.",
      currentCondition: `Patient registered for appointment type: ${type === 'in-clinic' ? 'In-Clinic Consultation' : 'Physiotherapy Home Visit'}. Initial diagnostic screening pending.`,
      completedSessions: 0,
      recommendedSessions: 10,
      conditionStatus: "stable",
      notes: notes || ""
    });
  }

  writeDatabase(db);
  res.status(201).json(newApt);
});

function indexToSuffix(name: string) {
  const femaleKeywords = ["sra", "devi", "mrs", "sunita", "leetali", "priya", "pooja", "anita", "sneha", "aishwarya"];
  const lower = name.toLowerCase();
  for (const kw of femaleKeywords) {
    if (lower.includes(kw)) return "Female";
  }
  return "Male";
}

// API: Update Appointment Status / Completion / Cancellation
app.put("/api/appointments/:id", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const index = db.appointments.findIndex((a: any) => a.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Appointment not found." });
  }

  db.appointments[index] = {
    ...db.appointments[index],
    ...req.body
  };

  writeDatabase(db);
  res.json(db.appointments[index]);
});

// API: Doctor AI Diagnostic Assistant (powered by server-side @google/genai SDK)
app.post("/api/ai/diagnose", async (req, res) => {
  const { notes, symptoms, mobilityRestrictions } = req.body;

  if (!notes || !symptoms) {
    return res.status(400).json({ error: "Patient current condition/notes and symptoms are required for clinical analysis." });
  }

  try {
    const client = getGeminiClient();
    const prompt = `
      You are highly specialized clinical rehabilitation AI. You assist physiotherapists at 'Rehabnest Physiotherapy Clinic' (Nashik).
      Your core colleagues are Dr. Hrushikesh Deshmukh and Dr. Leetali Mahajan.
      
      Conduct an advanced physiotherapy screening and diagnostic analysis for the following practitioner inputs:
      - Clinical observations: "${notes}"
      - Reported Symptoms & Pain levels: "${symptoms}"
      - Range of motion / Mobility restrictions: "${mobilityRestrictions || 'None reported'}"
      
      Generate a comprehensive and robust rehabilitation recommendation.
      
      You must reply in strictly formatted, valid JSON. Do not write any markdown quotes, backticks (such as \`\`\`json), comments, or prefaces. Start with { and end with }.

      The JSON structure MUST follow this schema exactly:
      {
        "condition": "Specific, authoritative clinical name of the musculoskeletal, sports or neurological condition",
        "severity": "Mild" or "Moderate" or "Severe",
        "estimatedSessions": 12, // Suggested integer for recommended physiotherapy visits
        "treatmentPlan": [
          "Phase 1 relief therapy step",
          "Phase 2 mobility reactivation step",
          "Phase 3 strength and stabilizer training detail"
        ],
        "recommendedModality": "Specify high-efficacy modalities like: IFT (Interferential Therapy), Therapeutic Ultrasound, Cervical/Lumbar Traction, Laser Therapy, Dry Needling, TENS, Joint mobilization",
        "homeCareAdvice": [
          "Thermic protocol guidelines (Hot water fomentation vs Ice packs)",
          "Daily active-assisted stretch pattern with frequency"
        ],
        "contraindications": [
          "Movement, posture, or weight-bearing actions that the patient MUST avoid"
        ]
      }
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const responseText = response.text || "";
    const cleanText = responseText.replace(/```json/gi, "").replace(/```/gi, "").trim();
    
    // Parse it
    const diagnostic = JSON.parse(cleanText);
    res.json(diagnostic);

  } catch (error: any) {
    console.error("Clinical Assistant Error:", error);
    res.status(500).json({
      error: error.message || "Failed to utilize clinical assistant. Please ensure your GEMINI_API_KEY is configured in the Secrets Dashboard."
    });
  }
});

// Setup development server or serve build assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite middleware for React Dev Mode");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static files from /dist compiler folder");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Rehabnest server successfully booted on http://localhost:${PORT}`);
  });
}

startServer();
