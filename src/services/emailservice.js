import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generic email sending function
export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    // Don't throw - email sending should not block the main operation
  }
};

// Email template for payment success (buyer)
export const sendPaymentSuccessEmail = async (buyerEmail, buyerName, auctionTitle, amount) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #28a745; margin: 0;">✅ Payment Successful</h1>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Hi <strong>${buyerName}</strong>,
        </p>
        
        <p style="color: #666; font-size: 15px; line-height: 1.6;">
          Your payment has been successfully processed. You are now the owner of the following item:
        </p>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Item:</strong> ${auctionTitle}</p>
          <p style="margin: 8px 0;"><strong>Amount Paid:</strong> ₹${amount.toLocaleString('en-IN')}</p>
          <p style="margin: 8px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
        </div>
        
        <p style="color: #666; font-size: 15px; line-height: 1.6;">
          Thank you for your purchase! If you have any questions, please don't hesitate to contact us.
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: buyerEmail,
    subject: "💳 Payment Successful - Auction Item Confirmed",
    html
  });
};

// Email template for payment received (seller)
export const sendPaymentReceivedEmail = async (sellerEmail, sellerName, auctionTitle, buyerName, amount) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #007bff; margin: 0;">💰 Payment Received</h1>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Hi <strong>${sellerName}</strong>,
        </p>
        
        <p style="color: #666; font-size: 15px; line-height: 1.6;">
          Great news! The buyer has completed the payment for your auction item. Here are the details:
        </p>
        
        <div style="background-color: #f0f8ff; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Item:</strong> ${auctionTitle}</p>
          <p style="margin: 8px 0;"><strong>Buyer:</strong> ${buyerName}</p>
          <p style="margin: 8px 0;"><strong>Amount Received:</strong> ₹${amount.toLocaleString('en-IN')}</p>
          <p style="margin: 8px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
        </div>
        
        <p style="color: #666; font-size: 15px; line-height: 1.6;">
          Please arrange to deliver the item to the buyer as per your agreement. Keep the payment reference safe for your records.
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: sellerEmail,
    subject: "💰 Payment Received - Auction Complete",
    html
  });
};

// Email template for direct payment pending (seller)
export const sendDirectPaymentPendingEmail = async (sellerEmail, sellerName, auctionTitle, buyerName, amount) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ffc107; margin: 0;">⏳ Payment Pending</h1>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Hi <strong>${sellerName}</strong>,
        </p>
        
        <p style="color: #666; font-size: 15px; line-height: 1.6;">
          A buyer has initiated a direct payment for your auction item. Please confirm the payment once you receive it.
        </p>
        
        <div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Item:</strong> ${auctionTitle}</p>
          <p style="margin: 8px 0;"><strong>Buyer:</strong> ${buyerName}</p>
          <p style="margin: 8px 0;"><strong>Amount Expected:</strong> ₹${amount.toLocaleString('en-IN')}</p>
        </div>
        
        <p style="color: #666; font-size: 15px; line-height: 1.6;">
          Please confirm the payment in your dashboard once you receive the funds from the buyer.
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: sellerEmail,
    subject: "⏳ Payment Pending Confirmation - Action Required",
    html
  });
};

// Email template for auction winner notification
export const sendAuctionWinnerEmail = async (winnerEmail, winnerName, auctionTitle, winningBid) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ffd700; margin: 0;">🎉 Congratulations! You Won!</h1>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Hi <strong>${winnerName}</strong>,
        </p>
        
        <p style="color: #666; font-size: 15px; line-height: 1.6;">
          Congratulations! You have successfully won the auction for the following item:
        </p>
        
        <div style="background-color: #fffacd; padding: 20px; border-left: 4px solid #ffd700; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Item:</strong> ${auctionTitle}</p>
          <p style="margin: 8px 0;"><strong>Your Winning Bid:</strong> ₹${winningBid.toLocaleString('en-IN')}</p>
          <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">AUCTION CLOSED</span></p>
        </div>
        
        <p style="color: #666; font-size: 15px; line-height: 1.6;">
          Proceed to the payment section in your dashboard to complete the purchase. You have 7 days to complete the payment.
        </p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/auctions" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: winnerEmail,
    subject: "🎉 Congratulations! You Won the Auction",
    html
  });
};

// Email template for auction closed notification (seller)
export const sendAuctionClosedEmail = async (sellerEmail, sellerName, auctionTitle, winnerName, winningBid) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #17a2b8; margin: 0;">✅ Your Auction Has Ended</h1>
        </div>
        
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Hi <strong>${sellerName}</strong>,
        </p>
        
        <p style="color: #666; font-size: 15px; line-height: 1.6;">
          Your auction has ended successfully with a winner. Here are the details:
        </p>
        
        <div style="background-color: #e7f3ff; padding: 20px; border-left: 4px solid #17a2b8; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Item:</strong> ${auctionTitle}</p>
          <p style="margin: 8px 0;"><strong>Winner:</strong> ${winnerName}</p>
          <p style="margin: 8px 0;"><strong>Final Bid Amount:</strong> ₹${winningBid.toLocaleString('en-IN')}</p>
          <p style="margin: 8px 0;"><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">AWAITING PAYMENT</span></p>
        </div>
        
        <p style="color: #666; font-size: 15px; line-height: 1.6;">
          The winner will be notified about the payment. Once they complete the payment, you'll receive a confirmation email. Monitor your dashboard for updates.
        </p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #999; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: sellerEmail,
    subject: "✅ Your Auction Has Ended Successfully",
    html
  });
};