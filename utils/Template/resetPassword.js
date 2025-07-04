export const resetPasswordEmail = (resetPasswordLink) => {
  return `
  <!DOCTYPE html>
  <html lang="en" style="font-family: 'Segoe UI', 'Cabin', sans-serif;">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f4f4" style="padding: 30px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <tr>
                <td align="center" style="background-color: #14a2af; padding: 30px;">
                  <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Thought-Nest 🧠</h1>
                  <p style="margin: 5px 0 0; font-size: 16px; color: #e0f7f9;">Reset Your Password</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 35px; font-size: 16px; color: #333333;">
                  <p style="margin-top: 0;">Hi there,</p>
                  <p>We received a request to reset your password. Click the button below to set a new one:</p>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetPasswordLink}" target="_blank" style="background-color: #14a2af; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-size: 16px; text-decoration: none; display: inline-block;">Reset Password</a>
                  </div>

                  <p style="color: #666666; font-size: 14px;">
                    If you didn’t request this, you can safely ignore this email. This link will expire in 1 minutes for your security.
                  </p>
                  <p style="margin-bottom: 0;">Stay thoughtful,<br /><strong>Thought-Nest Team</strong></p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="background-color: #f0f0f0; padding: 20px; font-size: 12px; color: #777;">
                  &copy; ${new Date().getFullYear()} Thought-Nest. All rights reserved.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};
