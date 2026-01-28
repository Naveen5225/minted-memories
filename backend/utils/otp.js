// Simple in-memory OTP storage (for production, use Redis or database)
const otpStore = new Map()

// Generate 6-digit OTP
export const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000)
  const otpString = otp.toString()
  
  // Ensure it's exactly 6 digits
  if (otpString.length !== 6) {
    // Fallback: pad with zeros or regenerate
    return otpString.padStart(6, '0').slice(0, 6)
  }
  
  return otpString
}

// Store OTP with expiration (5 minutes)
export const storeOTP = (phone, otp) => {
  if (!phone || !otp) {
    throw new Error('Phone and OTP are required')
  }
  
  otpStore.set(phone, {
    otp: otp.toString(),
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
  })
  
  console.log(`OTP stored for ${phone}, expires in 5 minutes`)
}

// Verify OTP (without consuming it - for checking if valid)
export const verifyOTP = (phone, otp, consume = true) => {
  const stored = otpStore.get(phone)
  
  if (!stored) {
    return { valid: false, message: 'OTP not found or expired' }
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phone)
    return { valid: false, message: 'OTP expired' }
  }

  if (stored.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' }
  }

  // OTP verified, remove it only if consume is true
  if (consume) {
    otpStore.delete(phone)
  }
  return { valid: true }
}

// Clean expired OTPs (optional cleanup function)
export const cleanExpiredOTPs = () => {
  for (const [phone, data] of otpStore.entries()) {
    if (Date.now() > data.expiresAt) {
      otpStore.delete(phone)
    }
  }
}

// Run cleanup every 10 minutes
setInterval(cleanExpiredOTPs, 10 * 60 * 1000)
