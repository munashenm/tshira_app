import { prisma } from "./db";

interface MessagePayload {
  to: string;
  name: string;
  caseRef: string;
  message: string;
  type: "EMAIL" | "WHATSAPP" | "BOTH";
}

export async function sendSystemNotification(payload: MessagePayload) {
  const settings = await prisma.systemSettings.findUnique({
    where: { id: "singleton" }
  });

  if (!settings) {
    console.warn("No system settings found for notifications.");
    return;
  }

  const { to, name, caseRef, message, type } = payload;

  // 1. Handle Email
  if ((type === "EMAIL" || type === "BOTH") && settings.emailEnabled) {
    console.log(`[EMAIL] Sending to ${to} (${name}): ${message}`);
    // Integration point: SendGrid, Resend, etc.
    // Example:
    // await resend.emails.send({ from: settings.emailFrom, to, subject: `Update: ${caseRef}`, text: message });
  }

  // 2. Handle WhatsApp
  if ((type === "WHATSAPP" || type === "BOTH") && settings.whatsappEnabled) {
    console.log(`[WHATSAPP] Sending to ${to} (${name}): ${message}`);
    // Integration point: Twilio, WhatsApp Business API
    // Example:
    // await twilio.messages.create({ from: settings.whatsappNumber, to, body: message });
  }
}

export const notificationTemplates = {
  caseAssigned: (role: string, ref: string) => 
    `Hello, a new case (${ref}) has been assigned to you as ${role}. Please log in to the Tshira Portal to view details.`,
  
  returnedForCorrection: (ref: string, comments: string) => 
    `Project ${ref} has been returned for corrections. Comments: ${comments}`,
  
  invoiceGenerated: (ref: string, amount: string) => 
    `An invoice has been generated for project ${ref} in the amount of R${amount}.`,
  
  paymentReceived: (ref: string) => 
    `Payment has been confirmed for project ${ref}. Thank you!`,
  
  slaWarning: (ref: string, days: number) => 
    `URGENT: Project ${ref} is approaching its SLA deadline in ${days} days.`
};
