// Re-export from enhanced-email-utils for compatibility
export { getEmailConfig, createEmailTransport, sendEnhancedEmail, sendEnhancedPasswordResetEmail, sendTestEmail } from './enhanced-email-utils'

// Alias for common usage
import { sendEnhancedEmail } from './enhanced-email-utils'
export const sendEmail = sendEnhancedEmail
