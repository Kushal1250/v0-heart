"use server"

import { sendVerificationCode, verifyOTP, resendVerificationCode } from "@/lib/auth-utils"

export async function sendVerificationAction(identifier: string, method: "email" | "sms") {
  return await sendVerificationCode(identifier, method)
}

export async function verifyOTPAction(identifier: string, code: string) {
  return await verifyOTP(identifier, code)
}

export async function resendVerificationAction(identifier: string, method: "email" | "sms") {
  return await resendVerificationCode(identifier, method)
}
