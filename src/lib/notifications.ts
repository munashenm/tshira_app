import { prisma } from "./db";

interface NotificationPayload {
  to: string;
  name: string;
  type: "EMAIL" | "WHATSAPP" | "BOTH";
  caseRef: string;
  message: string;
}

export async function sendNotification(payload: NotificationPayload) {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "singleton" }
  });

  if (!settings) {
    console.warn("No system settings found for notifications. Using defaults.");
  }

  const { to, name, type, caseRef, message } = payload;
  const timestamp = new Date().toLocaleString();
  
  // 1. Email Channel
  if ((type === "EMAIL" || type === "BOTH") && (settings?.emailEnabled ?? true)) {
    console.log(`[EMAIL DISPATCH] Executing SendGrid API Call:`);
    console.log(` -> To: ${name} <${to}>`);
    console.log(` -> Subject: Assignment / Update for ${caseRef}`);
    console.log(` -> Body: ${message}`);
    // Integration point: resend.emails.send(...) or sendgrid.send(...)
  }

  // 2. WhatsApp Channel
  if ((type === "WHATSAPP" || type === "BOTH") && (settings?.whatsappEnabled ?? true)) { // default to true for demonstration
    // Since phone numbers might not be fully populated in the 'to' field (which uses email by default here),
    // in a real environment we would fetch the user's phone number using their email or ID.
    console.log(`[WHATSAPP DISPATCH] Executing Twilio WhatsApp API Call:`);
    console.log(` -> To: ${name} (WhatsApp Number mapped from profile)`);
    console.log(` -> Message: 📢 Tshira Alert [${caseRef}]: ${message}`);
    // Integration point: twilio.messages.create({ from: 'whatsapp:+...', to: 'whatsapp:+...', body: ... })
  }

  return { success: true };
}

export const notificationTemplates = {
  caseAssigned: (role: string, ref: string) => 
    `You have been assigned as the ${role} for NYDA project ${ref}. Please log in to the system to begin.`,
  
  statusUpdated: (ref: string, newStatus: string) => 
    `Project ${ref} has progressed to stage: ${newStatus.replace(/_/g, ' ')}.`,
  
  returnedForCorrection: (ref: string, comments: string) => 
    `Project ${ref} has been returned for correction. Feedback: "${comments}"`,

  invoiceGenerated: (ref: string, amount: string) => 
    `An invoice has been generated for project ${ref} in the amount of R${amount}.`,
  
  paymentReceived: (ref: string) => 
    `Payment has been confirmed for project ${ref}. Thank you!`,
};
