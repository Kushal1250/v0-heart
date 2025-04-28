"use nodejs"

import { execSync } from "child_process"
import fs from "fs"

console.log("Email Authentication Setup Guide")
console.log("===============================")
console.log("\nThis script will help you set up proper email authentication to improve deliverability.\n")

// Check if environment variables are set
const emailServer = process.env.EMAIL_SERVER
const emailFrom = process.env.EMAIL_FROM

if (!emailServer || !emailFrom) {
  console.log("❌ EMAIL_SERVER or EMAIL_FROM environment variables are not set.")
  console.log("Please set these variables before continuing.\n")
  process.exit(1)
}

// Extract domain from EMAIL_FROM
const emailDomain = emailFrom.split("@")[1]

if (!emailDomain) {
  console.log("❌ Could not extract domain from EMAIL_FROM. Please check the format.")
  process.exit(1)
}

console.log("✅ Found email configuration:")
console.log(`   - Email server: ${emailServer}`)
console.log(`   - Email domain: ${emailDomain}\n`)

// Generate DKIM keys
console.log("Generating DKIM keys...")
try {
  // Create directory for keys if it doesn't exist
  if (!fs.existsSync("./email-keys")) {
    fs.mkdirSync("./email-keys")
  }

  // Generate private key
  execSync("openssl genrsa -out ./email-keys/dkim-private.key 2048", { stdio: "inherit" })

  // Generate public key
  execSync("openssl rsa -in ./email-keys/dkim-private.key -pubout -out ./email-keys/dkim-public.key", {
    stdio: "inherit",
  })

  // Read public key
  const publicKey = fs.readFileSync("./email-keys/dkim-public.key", "utf8")

  // Format for DNS record
  const dnsRecord = publicKey
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\n/g, "")

  console.log("\n✅ DKIM keys generated successfully!\n")

  // Output DNS records to set up
  console.log("DNS Records to Add")
  console.log("=================\n")

  console.log("1. SPF Record (add to your domain's DNS as a TXT record):")
  console.log(`   Name: @`)
  console.log(`   Value: v=spf1 a mx include:${emailServer} ~all\n`)

  console.log("2. DKIM Record (add to your domain's DNS as a TXT record):")
  console.log(`   Name: heartpredict._domainkey.${emailDomain}`)
  console.log(`   Value: v=DKIM1; k=rsa; p=${dnsRecord}\n`)

  console.log("3. DMARC Record (add to your domain's DNS as a TXT record):")
  console.log(`   Name: _dmarc.${emailDomain}`)
  console.log(`   Value: v=DMARC1; p=none; sp=none; rua=mailto:admin@${emailDomain};\n`)

  console.log("After adding these records, email deliverability should improve significantly.")
  console.log("Note: DNS changes may take 24-48 hours to propagate fully.\n")

  // Save instructions to a file
  const instructions = `
# Email Authentication Setup for HeartPredict

## DNS Records to Add

### 1. SPF Record (add to your domain's DNS as a TXT record):
   Name: @
   Value: v=spf1 a mx include:${emailServer} ~all

### 2. DKIM Record (add to your domain's DNS as a TXT record):
   Name: heartpredict._domainkey.${emailDomain}
   Value: v=DKIM1; k=rsa; p=${dnsRecord}

### 3. DMARC Record (add to your domain's DNS as a TXT record):
   Name: _dmarc.${emailDomain}
   Value: v=DMARC1; p=none; sp=none; rua=mailto:admin@${emailDomain};

After adding these records, email deliverability should improve significantly.
Note: DNS changes may take 24-48 hours to propagate fully.
  `

  fs.writeFileSync("./email-auth-instructions.md", instructions)
  console.log("✅ Instructions saved to email-auth-instructions.md")
} catch (error) {
  console.error("❌ Error generating DKIM keys:", error)
}
