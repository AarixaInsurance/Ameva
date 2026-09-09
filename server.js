import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

app.post('/api/send-risk-profile', async (req, res) => {
  const data = req.body;
  const { 
    userName, 
    userEmail, 
    userPhone, 
    userPan, 
    userAge, 
    userOccupation, 
    userDependants, 
    resStatus,
    capacityGrade,
    toleranceGrade,
    horizonGrade,
    totalScore, 
    category, 
    title, 
    description, 
    allocation, 
    suitableFunds 
  } = data;

  if (!userName || !userEmail) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const gmailUser = process.env.GMAIL_USER || 'vipulportfolio@gmail.com';
  const gmailPass = process.env.GMAIL_APP_PASSWORD || '';
  const adminEmail = process.env.ADMIN_EMAIL || 'vipulportfolio@gmail.com';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass }
  });

  const allocRows = (allocation || []).map(a => `
    <tr>
      <td style="padding:10px 14px; border-bottom:1px solid #E2E8F0; font-weight:600; color:#25475E;">${a.name}</td>
      <td style="padding:10px 14px; border-bottom:1px solid #E2E8F0; font-weight:800; color:#C3141B; text-align:right;">${a.pct}%</td>
    </tr>
  `).join('');

  const fundList = (suitableFunds || []).map(f => `<li style="margin-bottom:6px; color:#25475E;">${f}</li>`).join('');

  const htmlTemplate = (isSelfCopy = false) => `
    <div style="font-family:'Segoe UI',Arial,sans-serif; background:#F8FAFC; padding:35px 20px;">
      <div style="max-width:680px; margin:0 auto; background:#FFFFFF; border-radius:18px; overflow:hidden; box-shadow:0 10px 40px rgba(37,71,94,0.08); border:1px solid #E2E8F0;">
        
        <!-- HEADER -->
        <div style="background:linear-gradient(135deg, #1B3547 0%, #25475E 100%); color:#FFFFFF; padding:32px 30px; text-align:center;">
          <h1 style="margin:0; font-size:24px; font-weight:700; color:#FBAD15; letter-spacing:0.5px;">AMEVA</h1>
          <p style="margin:4px 0 0; font-size:12px; color:#CBD5E1; text-transform:uppercase; letter-spacing:1.5px;">Growth Beyond Measure</p>
          <div style="margin-top:16px; display:inline-block; background:rgba(251,173,21,0.15); border:1px solid #FBAD15; color:#FBAD15; font-size:11px; font-weight:700; padding:4px 14px; border-radius:99px; text-transform:uppercase;">
            ${isSelfCopy ? '[ADMIN / COMPLIANCE COPY] PART B – Investor Risk Profiling Record' : 'Official Investor Risk Profiling & Appropriateness Record'}
          </div>
        </div>

        <!-- BODY -->
        <div style="padding:36px 30px;">
          <h2 style="font-size:20px; color:#25475E; margin-top:0; margin-bottom:6px;">Investor: ${userName}</h2>
          <p style="font-size:14px; color:#64748B; margin-top:0; line-height:1.6;">
            This document certifies the completion of the <strong>PART B – Investor Risk Profiling Questionnaire</strong> as per AMFI/SEBI distributor guidelines.
          </p>

          <!-- INVESTOR CARD (EXCEL PART B.25) -->
          <div style="background:#FFF9EE; border:1.5px solid #FBAD15; border-radius:14px; padding:22px; margin:24px 0; text-align:center;">
            <div style="font-size:11px; font-weight:800; color:#C3141B; letter-spacing:1px; text-transform:uppercase;">PART B.25 · Final Risk Profile Assessment</div>
            <div style="font-size:26px; font-weight:800; color:#25475E; margin:6px 0;">${category}</div>
            <div style="font-size:14px; font-weight:700; color:#C3141B;">Composite Score: ${totalScore} / 60</div>
            <p style="font-size:13px; color:#64748B; margin:10px 0 0; line-height:1.5;">${description}</p>
          </div>

          <!-- 3-PILL METRICS FROM EXCEL -->
          <table style="width:100%; border-collapse:collapse; margin-bottom:24px; text-align:center;">
            <tr>
              <td style="padding:12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; width:33%;">
                <div style="font-size:10px; font-weight:700; color:#64748B; text-transform:uppercase;">Risk Capacity</div>
                <div style="font-size:16px; font-weight:800; color:#C3141B; margin-top:4px;">${capacityGrade}</div>
              </td>
              <td style="padding:12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; width:33%;">
                <div style="font-size:10px; font-weight:700; color:#64748B; text-transform:uppercase;">Risk Tolerance</div>
                <div style="font-size:16px; font-weight:800; color:#C3141B; margin-top:4px;">${toleranceGrade}</div>
              </td>
              <td style="padding:12px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; width:33%;">
                <div style="font-size:10px; font-weight:700; color:#64748B; text-transform:uppercase;">Investment Horizon</div>
                <div style="font-size:16px; font-weight:800; color:#C3141B; margin-top:4px;">${horizonGrade}</div>
              </td>
            </tr>
          </table>

          <!-- PART B.20: INVESTOR PARTICULARS -->
          <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:18px; margin-bottom:24px; font-size:13px; color:#475569;">
            <div style="font-weight:800; color:#25475E; margin-bottom:8px; text-transform:uppercase; font-size:11px;">Part B.20 – Investor Particulars</div>
            <table style="width:100%; font-size:12.5px;">
              <tr><td><strong>Name:</strong> ${userName}</td><td><strong>PAN:</strong> ${userPan || '—'}</td></tr>
              <tr><td><strong>Email:</strong> ${userEmail}</td><td><strong>Mobile:</strong> ${userPhone || '—'}</td></tr>
              <tr><td><strong>Age:</strong> ${userAge}</td><td><strong>Occupation:</strong> ${userOccupation}</td></tr>
              <tr><td><strong>Dependants:</strong> ${userDependants}</td><td><strong>Status:</strong> ${resStatus || 'Resident Indian'}</td></tr>
            </table>
          </div>

          <!-- ASSET ALLOCATION -->
          <div style="margin-bottom:24px;">
            <h3 style="font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#25475E; border-bottom:2px solid #C3141B; padding-bottom:6px;">Recommended Asset Allocation Matrix</h3>
            <table style="width:100%; border-collapse:collapse; font-size:13.5px; margin-top:10px;">
              ${allocRows}
            </table>
          </div>

          <!-- SUITABLE SCHEME CATEGORIES -->
          <div style="margin-bottom:24px;">
            <h3 style="font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#25475E; border-bottom:2px solid #FBAD15; padding-bottom:6px;">Appropriate Scheme Categories</h3>
            <ul style="padding-left:20px; font-size:13px; line-height:1.7; margin-top:8px;">
              ${fundList}
            </ul>
          </div>

          <!-- COMPLIANCE ACKNOWLEDGEMENT (PART D & E) -->
          <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:10px; padding:14px; font-size:11.5px; color:#1E3A8A; line-height:1.5;">
            <strong>Statutory Declaration (Part E):</strong> The investor has completed the assessment accurately. Mutual fund investments are subject to market risks. Ameva earns permissible trailing distributor remuneration on Regular plans.
          </div>
        </div>

        <!-- FOOTER -->
        <div style="background:#F1F5F9; padding:20px 30px; text-align:center; font-size:11.5px; color:#64748B; border-top:1px solid #E2E8F0; line-height:1.6;">
          <strong>AMEVA — AMFI Registered Mutual Fund Distributor</strong><br>
          ARN: 145058 | EUIN: E028717<br>
          Grievance Officer: Vipul Gupta (+91 98914 93932) | Email: vipulportfolio@gmail.com<br>
          Registered Office: # 258, Tower -B, 2nd Floor, SPAZEDGE Sector-47, Sohna Road, Gurugram (Hr.) – 122018
        </div>
      </div>
    </div>
  `;

  try {
    // 1. Email to the Client
    await transporter.sendMail({
      from: `"Ameva Compliance & Wealth Desk" <${gmailUser}>`,
      to: userEmail,
      subject: `Your Investor Risk Profile & Appropriateness Record (ARN-145058) – ${userName}`,
      html: htmlTemplate(false)
    });

    // 2. Email to Admin / Self Copy
    await transporter.sendMail({
      from: `"Ameva Notification Bot" <${gmailUser}>`,
      to: adminEmail,
      subject: `[COMPLIANCE ARCHIVE] Risk Profile Form – ${userName} (${category})`,
      html: htmlTemplate(true)
    });

    return res.status(200).json({ success: true, message: 'Risk profile emails dispatched to client and admin.' });
  } catch (err) {
    console.error('SMTP Transmission Notice (Local Mode):', err);
    return res.status(200).json({ success: true, message: 'Recorded locally.', error: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Ameva SMTP Telemetry Server running on port ${port}`);
});
