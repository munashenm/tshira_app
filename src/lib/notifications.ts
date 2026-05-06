/**
 * Notification Service Mockup
 * In a production environment, you would integrate this with:
 * - SendGrid / Postmark for Emails
 * - Twilio / WhatsApp Business API for WhatsApp
 */

export async function sendNotification({
  to,
  name,
  type,
  caseRef,
  message,
}: {
  to: string;
  name: string;
  type: "EMAIL" | "WHATSAPP" | "BOTH";
  caseRef: string;
  message: string;
}) {
  const timestamp = new Date().toLocaleString();
  
  const logMessage = `
[NOTIFICATION SENT] - ${timestamp}
-----------------------------------
TO: ${name} (${to})
METHOD: ${type}
CASE REF: ${caseRef}
CONTENT: ${message}
-----------------------------------
  `;

  // Log to console for the demo
  console.log(logMessage);

  // In a real app, you would perform the HTTP calls to the providers here
  return { success: true };
}

export const notificationTemplates = {
  caseAssigned: (role: string, ref: string) => 
    `You have been assigned as the ${role} for NYDA project ${ref}. Please log in to the system to begin.`,
  
  statusUpdated: (ref: string, newStatus: string) => 
    `Project ${ref} has progressed to stage: ${newStatus.replace(/_/g, ' ')}.`,
  
  returnedForCorrection: (ref: string, comments: string) => 
    `Project ${ref} has been returned for correction. Feedback: "${comments}"`,
};
