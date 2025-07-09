
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
// ✅ Configuration
const email_id = process.env.EMAIL_ID;
const password = process.env.EMAIL_PASS;
const userName = process.env.USER_NAME;       // Swapnil
const userSurname = process.env.USER_SURNAME; // Darshanale
const resumeFileName = `${userName}_${userSurname}.pdf`;

const emailLimit = 50;
const alwaysAllowEmails = [
  'darshanaleswapnil36@gmail.com',
  'darshanaleswapnil48@gmail.com'
];

// ✅ Load email lists
const emailFilePath = path.join(__dirname, 'email.txt');
const sentEmailsFile = path.join(__dirname, 'sent_emails.txt');
const resumePath = path.join(__dirname, resumeFileName);
const emailList = fs.readFileSync(emailFilePath, 'utf-8')
  .split('\n')
  .map(email => email.trim())
  .filter(email => email.length > 0);

let sentEmails = [];
if (fs.existsSync(sentEmailsFile)) {
  sentEmails = fs.readFileSync(sentEmailsFile, 'utf-8')
    .split('\n')
    .map(email => email.trim())
    .filter(email => email.length > 0);
}

// ✅ Filter emails to send (avoid duplicates)
const emailListToSend = emailList
  .filter(email =>
    alwaysAllowEmails.includes(email) || !sentEmails.includes(email)
  )
  .slice(0, emailLimit);


// ✅ Email Body (HTML)
const emailBody = `
<html>
  <body style="font-family: Arial, sans-serif; color: #000000; font-size: 14px;">
    <p>Hi Recruiter,</p>
    <p>I hope you are doing well.</p>
    <p>
      I am writing to express my interest in React or Full Stack Developer opportunities within your organization.
      I have a total of <strong>3 years and 10 months</strong> of professional experience, with a strong focus on frontend development.
      I believe my skills and adaptability can add value to your team.
    </p>
    <p><strong>Summary:</strong></p>
    <ul style="list-style-type: disc; padding-left: 20px;">
      <li><strong>Total Experience:</strong> 3 Years 10 Months</li>
      <li><strong>Current Role:</strong> Full Stack Developer (Frontend Heavy)</li>
      <li><strong>Notice Period:</strong> 30 Days (Negotiable up to 15 Days)</li>
      <li><strong>Current Location:</strong> Pune, Maharashtra</li>
    </ul>
    <p><strong>Frontend Tech Stack:</strong></p>
    <p>React.js (Hooks, Context API, Redux), Next.js, JavaScript (ES6+), TypeScript, HTML5, CSS3, Responsive Design, Material UI, Tailwind CSS</p>
    <p><strong>Backend Tech Stack:</strong></p>
    <p>Node.js, Express.js, RESTful APIs, GraphQL</p>
    <p><strong>Database & Tools:</strong></p>
    <p>MongoDB, SQL (MySQL, PostgreSQL basics), Redis, Git, GitHub, VS Code, Postman, Figma, Cursor</p>
    <p>
      I have attached my updated resume for your kind consideration. I would appreciate the opportunity to discuss how I can contribute to your team.
    </p>
    <p>
      Best regards,<br>
      <strong>Swapnil Darshanale</strong><br>
      Phone: 9284138841<br>
      LinkedIn: <a href="https://www.linkedin.com/in/swapnil-darshanale-77422a16b/" style="color: #0000EE;">Swapnil's LinkedIn</a><br>
      Email: darshanaleswapnil9@gmail.com
    </p>
  </body>
</html>
`;

// ✅ Setup transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email_id,
    pass: password
  }
});

// ✅ Function to send confirmation email
async function sendConfirmationEmail(successCount, failCount) {
  const summary = `
Hi Swapnil,

Your daily email job completed.

✅ Emails Sent Successfully: ${successCount}
❌ Emails Failed: ${failCount}

Total attempted: ${successCount + failCount}

Regards,
Your Automated Email System
  `;

  const mailOptions = {
    from: email_id,
    to: email_id,
    subject: 'Daily Email Job Summary – Swapnil Darshanale',
    text: summary
  };

  await transporter.sendMail(mailOptions);
}

// ✅ Function to send emails
async function sendEmails() {
  let successCount = 0;
  let failCount = 0;
  if (emailListToSend.length === 0) {
    console.log('⚠️ No new emails to send today.');
    return;
  }
  
  for (let i = 0; i < emailListToSend.length; i++) {
    const recipient = emailListToSend[i];

    const mailOptions = {
      from: email_id,
      to: recipient,
      subject: 'Application for React / Full Stack Developer Role – 3.10 Years Experience – Swapnil Darshanale',
      html: emailBody,
      attachments: [
        {
          filename: resumeFileName,
          path: resumePath
        }
      ]
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${recipient}: ${info.response}`);
      if (!alwaysAllowEmails.includes(recipient)) {
        fs.appendFileSync(sentEmailsFile, recipient + '\n');
      }      
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to send to ${recipient}:`, error.message);
      failCount++;
    }

    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 sec delay
  }

  // ✅ Send confirmation to yourself
  await sendConfirmationEmail(successCount, failCount);
}

// ✅ Schedule to run every day at 5:22 AM IST
cron.schedule('30 4 * * *', () => {
  console.log(`⏰ Email job started at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  sendEmails();
});


// ✅ Optional: Uncomment below to test manually right now
// sendEmails();
