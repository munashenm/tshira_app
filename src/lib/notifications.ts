import { prisma } from "./db";
import { Resend } from "resend";
import twilio from "twilio";

// Initialize APIs if keys are available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
  : null;

interface NotificationPayload {
  to: string;
  name: string;
  type: "EMAIL" | "WHATSAPP" | "BOTH";
  caseRef?: string;
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
  const emailFrom = settings?.emailFrom || "noreply@tshira.co.za";
  const twilioNumber = settings?.whatsappNumber || process.env.TWILIO_WHATSAPP_NUMBER || "";
  
  const resendKey = settings?.resendApiKey || process.env.RESEND_API_KEY;
  const twilioSid = settings?.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = settings?.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN;

  const resend = resendKey ? new Resend(resendKey) : null;
  const twilioClient = twilioSid && twilioAuth ? twilio(twilioSid, twilioAuth) : null;

  // 0. Save to Database for UI Bell icon
  try {
    // Attempt to map 'to' (email) or 'name' to a user ID to link the notification.
    const user = await prisma.user.findFirst({ where: { OR: [{ email: to }, { name: name }] } });
    const caseRec = caseRef ? await prisma.case.findFirst({ where: { id: caseRef } }) : null;
    
    await prisma.notification.create({
      data: {
        userId: user?.id,
        caseId: caseRec?.id,
        type: type,
        message: message
      }
    });
  } catch (err) {
    console.error("Failed to save DB notification:", err);
  }

  // 1. Email Channel
  if ((type === "EMAIL" || type === "BOTH") && (settings?.emailEnabled ?? true)) {
    console.log(`[EMAIL DISPATCH] Executing SendGrid/Resend API Call to ${to}`);
    if (resend) {
      try {
        const subject = caseRef ? `Update on NYDA Project: ${caseRef}` : `Tshira Management Systems Notification`;
        await resend.emails.send({
          from: emailFrom,
          to: to,
          subject: subject,
          html: `<p>Dear ${name},</p><p>${message}</p><p>Regards,<br>Tshira Management Systems</p>`,
        });
        console.log(` -> Email successfully dispatched via Resend.`);
      } catch (error) {
        console.error(` -> Failed to send email via Resend:`, error);
      }
    } else {
      console.log(` -> [MOCK] Email would be sent here (Missing RESEND_API_KEY in settings or .env)`);
    }
  }

  // 2. WhatsApp Channel
  if ((type === "WHATSAPP" || type === "BOTH") && (settings?.whatsappEnabled ?? true)) { 
    console.log(`[WHATSAPP DISPATCH] Executing Twilio WhatsApp API Call to mapped number`);
    if (twilioClient && twilioNumber) {
      try {
        const userPhone = process.env.TEST_WHATSAPP_NUMBER || "+27820000000"; // fallback for demo
        await twilioClient.messages.create({
          body: `📢 Tshira Alert [${caseRef}]:\n\n${message}`,
          from: `whatsapp:${twilioNumber}`,
          to: `whatsapp:${userPhone}`
        });
        console.log(` -> WhatsApp message successfully dispatched via Twilio.`);
      } catch (error) {
        console.error(` -> Failed to send WhatsApp message via Twilio:`, error);
      }
    } else {
      console.log(` -> [MOCK] WhatsApp message would be sent here (Missing TWILIO credentials in settings or .env)`);
    }
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

  clientRegistered: (clientName: string) =>
    `Welcome to Tshira Management Systems! We have successfully registered your details (${clientName}) in our database.`,
  
  teamMemberAdded: (role: string, pass: string) =>
    `Welcome to the team! You have been added to the Tshira Workflow Management System as a ${role.replace(/_/g, ' ')}. Your temporary password is: ${pass}. Please log in and change your password immediately.`,
};
