"use server";

export async function validateEmail(email: string) {
  const apiKey = process.env.EMAIL_API_KEY;
  if (!apiKey) {
    console.error("EMAIL_API key is not defined in environment variables.");
    return { success: false, error: "Configuration error" };
  }
  const url = `https://apilayer.net/api/check?access_key=${apiKey}&email=${email}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Mailboxlayer returns 'format_valid' and 'smtp_check'
    // consider it valid if both format and SMTP (mailbox exists) are true (maybe)
    const isValid = data.format_valid && data.smtp_check;

    return {
      success: true,
      isValid,
      details: data,
    };
  } catch (error: any) {
    console.error("Email validation failed:", error);
    return {
      success: false,
      error: error.message || "Failed to validate email",
    };
  }
}
