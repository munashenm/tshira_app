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
    console.log(`[EMAIL] To: ${name} (${to}) | Ref: ${caseRef} | Content: ${message}`);
    // Integration point: Resend / SendGrid
  }

  // 2. WhatsApp Channel
  if ((type === "WHATSAPP" || type === "BOTH") && (settings?.whatsappEnabled ?? false)) {
    console.log(`[WHATSAPP] To: ${name} (${to}) | Ref: ${caseRef} | Content: ${message}`);
    // Integration point: Twilio
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
