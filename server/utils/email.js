const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
   return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
      auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASS
      }
   });
};

// Send email
const sendEmail = async (options) => {
   try {
      const transporter = createTransporter();

      const mailOptions = {
         from: `${process.env.EMAIL_FROM_NAME || 'Mowana Spa'} <${process.env.EMAIL_FROM}>`,
         to: options.email,
         subject: options.subject,
         text: options.message,
         html: options.html || options.message.replace(/\n/g, '<br>')
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
   } catch (error) {
      console.error('Email sending error:', error);
      throw error;
   }
};

// Send welcome email template
const sendWelcomeEmail = async (user) => {
   const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #F24B99, #ff6b9d); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Mowana Spa</h1>
      </div>
      <div style="padding: 30px; background: #f8f9ff;">
        <h2 style="color: #333; margin-bottom: 20px;">Dear ${user.firstName},</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Welcome to Mowana Spa! We're thrilled to have you join our wellness community.
        </p>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Your account has been successfully created. You can now:
        </p>
        <ul style="color: #666; line-height: 1.6; margin-bottom: 30px;">
          <li>Book spa treatments online</li>
          <li>View your booking history</li>
          <li>Receive exclusive offers and updates</li>
          <li>Manage your wellness preferences</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/login" 
             style="background: #F24B99; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
            Login to Your Account
          </a>
        </div>
        <p style="color: #666; line-height: 1.6; margin-top: 30px;">
          If you have any questions, please don't hesitate to contact us at +27 (0)11 840 6780.
        </p>
        <p style="color: #666; line-height: 1.6;">
          Best regards,<br>
          The Mowana Spa Team
        </p>
      </div>
    </div>
  `;

   return sendEmail({
      email: user.email,
      subject: 'Welcome to Mowana Spa - Your Wellness Journey Begins',
      html
   });
};

// Send booking confirmation email
const sendBookingConfirmation = async (booking) => {
   const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #F24B99, #ff6b9d); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed</h1>
      </div>
      <div style="padding: 30px; background: #f8f9ff;">
        <h2 style="color: #333; margin-bottom: 20px;">Dear ${booking.customer.firstName},</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Your spa appointment has been confirmed! We look forward to providing you with an exceptional wellness experience.
        </p>
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #F24B99; margin-top: 0;">Booking Details</h3>
          <p style="margin: 5px 0;"><strong>Booking Number:</strong> ${booking.bookingNumber}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${booking.formattedDate}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p style="margin: 5px 0;"><strong>Services:</strong></p>
          <ul style="margin: 5px 0; padding-left: 20px;">
            ${booking.services.map(service => `<li>${service.service.name}</li>`).join('')}
          </ul>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> R${booking.finalAmount}</p>
        </div>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Please arrive 15 minutes before your appointment time. If you need to reschedule or cancel, 
          please contact us at least 24 hours in advance.
        </p>
        <p style="color: #666; line-height: 1.6;">
          Best regards,<br>
          The Mowana Spa Team<br>
          Phone: +27 (0)11 840 6780
        </p>
      </div>
    </div>
  `;

   return sendEmail({
      email: booking.customer.email,
      subject: `Booking Confirmation - ${booking.bookingNumber}`,
      html
   });
};

// Send appointment reminder email
const sendAppointmentReminder = async (booking) => {
   const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #F24B99, #ff6b9d); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Appointment Reminder</h1>
      </div>
      <div style="padding: 30px; background: #f8f9ff;">
        <h2 style="color: #333; margin-bottom: 20px;">Dear ${booking.customer.firstName},</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          This is a friendly reminder about your upcoming spa appointment at Mowana Spa.
        </p>
        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #F24B99; margin-top: 0;">Appointment Details</h3>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${booking.formattedDate}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p style="margin: 5px 0;"><strong>Services:</strong></p>
          <ul style="margin: 5px 0; padding-left: 20px;">
            ${booking.services.map(service => `<li>${service.service.name}</li>`).join('')}
          </ul>
        </div>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          We recommend arriving 15 minutes early to complete any necessary paperwork and begin your relaxation journey.
        </p>
        <p style="color: #666; line-height: 1.6;">
          We look forward to seeing you soon!<br><br>
          Best regards,<br>
          The Mowana Spa Team
        </p>
      </div>
    </div>
  `;

   return sendEmail({
      email: booking.customer.email,
      subject: `Appointment Reminder - ${booking.formattedDate}`,
      html
   });
};

module.exports = {
   sendEmail,
   sendWelcomeEmail,
   sendBookingConfirmation,
   sendAppointmentReminder
};
