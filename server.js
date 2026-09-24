import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// In-memory OTP storage with 10-minute expiration
const otpStore = new Map();

// Helper to create nodemailer transporter
const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || 'kshatriyautkarsh404@gmail.com';
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: {
      user,
      pass,
    },
  });
};

// Helper to generate clean, exactly 2-page PDF Buffer of Risk Profile Assessment
const generateRiskProfilePDF = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 0, size: 'A4', autoFirstPage: true });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const primaryColor = '#1B3547';
      const accentGold = '#FBAD15';
      const accentRed = '#C3141B';
      const textDark = '#25475E';
      const textMuted = '#64748B';
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const contentWidth = pageWidth - 72; // margin 36 on each side

      // ==================== PAGE 1 ====================
      // Header Banner
      doc.rect(0, 0, pageWidth, 80).fill(primaryColor);
      doc.fillColor(accentGold).fontSize(20).font('Helvetica-Bold').text('AMEVA', 36, 16, { lineBreak: false });
      doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold').text('AMFI REGISTERED MUTUAL FUND DISTRIBUTOR (ARN-145058 | EUIN-E028717)', 36, 40, { lineBreak: false });
      doc.fillColor('#CBD5E1').fontSize(8).font('Helvetica').text('Investor Risk Profile Record (ARN-145058 | EUIN-E028717)', 36, 54, { lineBreak: false });

      let y = 90;

      // Investor Particulars Box
      doc.rect(36, y, contentWidth, 76).fillAndStroke('#F8FAFC', '#E2E8F0');
      doc.fillColor(primaryColor).fontSize(9.5).font('Helvetica-Bold').text('INVESTOR PARTICULARS', 46, y + 8, { lineBreak: false });

      doc.fontSize(8).font('Helvetica');
      const col1 = 46, col2 = 160, col3 = 300, col4 = 410;

      doc.fillColor(textMuted).text('Investor Name:', col1, y + 24, { lineBreak: false });
      doc.fillColor(textDark).font('Helvetica-Bold').text(data.userName || '—', col2, y + 24, { lineBreak: false });

      doc.font('Helvetica').fillColor(textMuted).text('Email (OTP Verified):', col1, y + 38, { lineBreak: false });
      doc.fillColor('#15803D').font('Helvetica-Bold').text((data.userEmail || '—') + ' [VERIFIED]', col2, y + 38, { lineBreak: false });

      doc.font('Helvetica').fillColor(textMuted).text('Mobile Number:', col1, y + 52, { lineBreak: false });
      doc.fillColor(textDark).font('Helvetica-Bold').text(data.userPhone || '—', col2, y + 52, { lineBreak: false });

      doc.font('Helvetica').fillColor(textMuted).text('PAN Number:', col3, y + 24, { lineBreak: false });
      doc.fillColor(textDark).font('Helvetica-Bold').text(data.userPan || '—', col4, y + 24, { lineBreak: false });

      doc.font('Helvetica').fillColor(textMuted).text('Age Group / Occupation:', col3, y + 38, { lineBreak: false });
      doc.fillColor(textDark).font('Helvetica-Bold').text((data.userAge || '—') + ' / ' + (data.userOccupation || '—'), col4, y + 38, { lineBreak: false, width: 145 });

      doc.font('Helvetica').fillColor(textMuted).text('Residential Status:', col3, y + 52, { lineBreak: false });
      doc.fillColor(textDark).font('Helvetica-Bold').text(data.resStatus || 'Resident Indian', col4, y + 52, { lineBreak: false });

      y += 86;

      // Risk Assessment Box
      doc.rect(36, y, contentWidth, 68).fillAndStroke('#FFF9EE', accentGold);
      doc.fillColor(accentRed).fontSize(8).font('Helvetica-Bold').text('ASSESSED RISK PROFILE CATEGORY', 46, y + 8, { align: 'center', width: contentWidth - 20, lineBreak: false });
      doc.fillColor(primaryColor).fontSize(16).font('Helvetica-Bold').text(data.category || 'MODERATE', 46, y + 20, { align: 'center', width: contentWidth - 20, lineBreak: false });
      doc.fillColor(accentRed).fontSize(9.5).font('Helvetica-Bold').text('Composite Score: ' + (data.totalScore || 0) + ' / 60', 46, y + 38, { align: 'center', width: contentWidth - 20, lineBreak: false });
      doc.fillColor(textMuted).fontSize(7.5).font('Helvetica').text(data.description || '', 46, y + 50, { align: 'center', width: contentWidth - 20, lineBreak: false });

      y += 76;

      // 3 Pillar Score Badges
      const boxW = (contentWidth - 16) / 3;
      const pillars = [
        { label: 'Risk Capacity', val: data.capacityGrade || 'MODERATE' },
        { label: 'Risk Tolerance', val: data.toleranceGrade || 'MODERATE' },
        { label: 'Investment Horizon', val: data.horizonGrade || 'MEDIUM' }
      ];

      pillars.forEach((p, idx) => {
        const bx = 36 + idx * (boxW + 8);
        doc.rect(bx, y, boxW, 38).fillAndStroke('#F8FAFC', '#E2E8F0');
        doc.fillColor(textMuted).fontSize(7).font('Helvetica-Bold').text(p.label.toUpperCase(), bx, y + 6, { align: 'center', width: boxW, lineBreak: false });
        doc.fillColor(accentRed).fontSize(11).font('Helvetica-Bold').text(p.val, bx, y + 17, { align: 'center', width: boxW, lineBreak: false });
      });

      y += 46;

      // Suggested Broad Asset Allocation
      doc.fillColor(primaryColor).fontSize(9).font('Helvetica-Bold').text('SUGGESTED BROAD ASSET ALLOCATION MATRIX', 36, y, { lineBreak: false });
      doc.strokeColor(accentRed).lineWidth(1.2).moveTo(36, y + 12).lineTo(pageWidth - 36, y + 12).stroke();
      y += 18;

      (data.allocation || []).forEach(alloc => {
        doc.rect(36, y, contentWidth, 18).fillAndStroke('#FFFFFF', '#F1F5F9');
        doc.fillColor(textDark).fontSize(8).font('Helvetica-Bold').text(alloc.name, 44, y + 5, { lineBreak: false });
        doc.fillColor(accentRed).fontSize(8).font('Helvetica-Bold').text(alloc.pct + '%', pageWidth - 80, y + 5, { align: 'right', width: 36, lineBreak: false });
        y += 20;
      });

      y += 6;

      // Suitable Scheme Categories
      doc.fillColor(primaryColor).fontSize(9).font('Helvetica-Bold').text('SUITABLE SCHEME CATEGORIES', 36, y, { lineBreak: false });
      doc.strokeColor(accentGold).lineWidth(1.2).moveTo(36, y + 12).lineTo(pageWidth - 36, y + 12).stroke();
      y += 18;

      (data.suitableFunds || []).forEach(fund => {
        doc.fillColor(accentRed).fontSize(8).font('Helvetica-Bold').text('• ', 42, y, { lineBreak: false });
        doc.fillColor(textDark).fontSize(8).font('Helvetica').text(fund, 52, y, { lineBreak: false });
        y += 12;
      });

      y += 8;

      // SEBI Statutory Notice Box
      doc.rect(36, y, contentWidth, 40).fillAndStroke('#EFF6FF', '#BFDBFE');
      doc.fillColor('#1E3A8A').fontSize(7).font('Helvetica-Bold').text('SEBI / AMFI STATUTORY NOTICE & DISTRIBUTOR REMUNERATION:', 44, y + 5, { lineBreak: false });
      doc.fillColor('#1E3A8A').fontSize(6.5).font('Helvetica').text(
        'Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Ameva acts solely as an AMFI Registered Mutual Fund Distributor (ARN-145058) distributing regular plans and earning permissible distributor commission. This record reflects the investor self-assessment and authenticated OTP verification.',
        44, y + 15, { width: contentWidth - 16, lineGap: 1.5 }
      );

      // Page 1 Footer
      const footerY1 = pageHeight - 34;
      doc.rect(0, footerY1, pageWidth, 34).fill('#F1F5F9');
      doc.fillColor(textMuted).fontSize(7).font('Helvetica').text(
        'AMEVA (ARN-145058, EUIN-E028717) | Grievance: Rajesh Kumar Gupta (+91 98100 47256, rajeshgupta@ameva.in, amevamfd@gmail.com) | Page 1 of 2',
        36, footerY1 + 10, { align: 'center', width: contentWidth, lineBreak: false }
      );

      // ==================== PAGE 2 ====================
      doc.addPage({ margin: 0, size: 'A4' });

      // Page 2 Header Banner
      doc.rect(0, 0, pageWidth, 54).fill(primaryColor);
      doc.fillColor(accentGold).fontSize(16).font('Helvetica-Bold').text('AMEVA', 36, 12, { lineBreak: false });
      doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold').text('DETAILED INVESTOR QUESTIONNAIRE & SELECTED RESPONSES RECORD', 36, 28, { lineBreak: false });
      doc.fillColor('#CBD5E1').fontSize(7.5).font('Helvetica').text('Client: ' + (data.userName || '') + ' | Email: ' + (data.userEmail || '') + ' | Authenticated via Email OTP', 36, 40, { lineBreak: false });

      let y2 = 64;

      (data.responses || []).forEach((sec) => {
        doc.rect(36, y2, contentWidth, 16).fill('#25475E');
        doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold').text(sec.section.toUpperCase(), 44, y2 + 4, { lineBreak: false });
        y2 += 19;

        sec.items.forEach((item) => {
          const qHeight = 24;
          doc.rect(36, y2, contentWidth, qHeight).fillAndStroke('#F8FAFC', '#E2E8F0');
          doc.fillColor(textDark).fontSize(7).font('Helvetica-Bold').text(item.q, 44, y2 + 3, { width: contentWidth - 16, lineBreak: false });
          doc.fillColor('#15803D').fontSize(7).font('Helvetica-Bold').text('✓ Selected: ', 44, y2 + 13, { lineBreak: false });
          doc.fillColor('#25475E').font('Helvetica').text(item.a, 92, y2 + 13, { width: contentWidth - 60, lineBreak: false });
          y2 += qHeight + 3;
        });

        y2 += 3;
      });

      // Statutory Declarations Confirmed Box
      doc.rect(36, y2, contentWidth, 46).fillAndStroke('#FFF9EE', accentGold);
      doc.fillColor(accentRed).fontSize(7.2).font('Helvetica-Bold').text('INVESTOR STATUTORY DECLARATIONS CONFIRMED VIA OTP:', 44, y2 + 5, { lineBreak: false });
      doc.fillColor(textDark).fontSize(6.5).font('Helvetica').text(
        '1. Confirmed information is true, complete and accurately reflects investment objectives.\n' +
        '2. Confirmed understanding of market risks and past performance disclaimers.\n' +
        '3. Confirmed understanding of Regular vs Direct plans and distributor trailing remuneration model.',
        44, y2 + 15, { width: contentWidth - 16, lineGap: 1.5 }
      );

      // Page 2 Footer
      const footerY2 = pageHeight - 34;
      doc.rect(0, footerY2, pageWidth, 34).fill('#F1F5F9');
      doc.fillColor(textMuted).fontSize(7).font('Helvetica').text(
        'AMEVA (ARN-145058, EUIN-E028717) | Aspen greens 99, Nirvana Country, Sector 50, Gurgaon | Page 2 of 2',
        36, footerY2 + 10, { align: 'center', width: contentWidth, lineBreak: false }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// 1. Send OTP Endpoint
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || 'Valued Investor').trim();

    // Generate 6-digit cryptographic-random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    otpStore.set(cleanEmail, {
      otp,
      expiresAt,
      name: cleanName,
    });

    const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'rajeshgupta@ameva.in';

    const otpHtml = `
      <div style="font-family:'Segoe UI',Arial,sans-serif; background:#F8FAFC; padding:30px 15px;">
        <div style="max-width:550px; margin:0 auto; background:#FFFFFF; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(37,71,94,0.08); border:1px solid #E2E8F0;">
          
          <div style="background:linear-gradient(135deg, #1B3547 0%, #25475E 100%); color:#FFFFFF; padding:28px 24px; text-align:center;">
            <h1 style="margin:0; font-size:22px; font-weight:700; color:#FBAD15; letter-spacing:0.5px;">AMEVA</h1>
            <p style="margin:4px 0 0; font-size:11px; color:#CBD5E1; text-transform:uppercase; letter-spacing:1px;">AMFI Registered Mutual Fund Distributor (ARN-145058)</p>
          </div>

          <div style="padding:30px 24px; text-align:center;">
            <h2 style="font-size:18px; color:#25475E; margin-top:0;">Investor Verification OTP</h2>
            <p style="font-size:14px; color:#64748B; line-height:1.6; margin-bottom:24px;">
              Dear <strong>${cleanName}</strong>,<br>
              Use the One-Time Password (OTP) below to verify your <strong>Investor Risk Profiling Assessment</strong>:
            </p>

            <div style="display:inline-block; background:#FFF5F5; border:2px dashed #C3141B; border-radius:12px; padding:14px 28px; margin-bottom:20px;">
              <span style="font-size:32px; font-weight:800; letter-spacing:6px; color:#C3141B;">${otp}</span>
            </div>

            <p style="font-size:12px; color:#94A3B8; margin-top:0;">
              This OTP is valid for <strong>10 minutes</strong>. Please do not share this OTP with anyone.
            </p>

            <div style="margin-top:24px; padding:12px; background:#F8FAFC; border-radius:8px; font-size:11.5px; color:#64748B; text-align:left; line-height:1.5;">
              <strong>SEBI / AMFI Statutory Notice:</strong> Mutual Fund investments are subject to market risks. Ameva acts solely as an AMFI Registered Mutual Fund Distributor (ARN-145058).
            </div>
          </div>

          <div style="background:#F1F5F9; padding:16px 20px; text-align:center; font-size:11px; color:#94A3B8; border-top:1px solid #E2E8F0;">
            Ameva Mutual Fund Distributors · Aspen greens 99, Nirvana Country, Sector 50, Gurgaon<br>
            Contact: +91 98100 47256 | rajeshgupta@ameva.in, amevamfd@gmail.com
          </div>
        </div>
      </div>
    `;

    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"Ameva Verification" <${senderEmail}>`,
        to: cleanEmail,
        subject: `${otp} is your Ameva Verification OTP`,
        html: otpHtml,
      });
      console.log(`[OTP SENT] Sent OTP to ${cleanEmail}`);
    } catch (mailErr) {
      console.error('[SMTP SEND ERROR]:', mailErr);
      return res.status(500).json({ success: false, message: `Failed to deliver OTP: ${mailErr.message}` });
    }

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${cleanEmail}`,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to dispatch verification OTP.' });
  }
});

// 2. Verify OTP & Submit Risk Profile
app.post('/api/verify-risk-profile', async (req, res) => {
  try {
    const { otp, data } = req.body;
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
      suitableFunds,
      responses,
    } = data || {};

    if (!userEmail || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const cleanEmail = userEmail.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const record = otpStore.get(cleanEmail);

    if (!record) {
      return res.status(400).json({ success: false, message: 'No OTP requested for this email or OTP expired. Please request a new OTP.' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new OTP.' });
    }

    if (record.otp !== cleanOtp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please check and try again.' });
    }

    // OTP is valid! Remove used OTP
    otpStore.delete(cleanEmail);

    // Send complete Risk Profile report with PDF to Client & Admin
    const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'rajeshgupta@ameva.in';
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'rajeshgupta@ameva.in';

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
          
          <div style="background:linear-gradient(135deg, #1B3547 0%, #25475E 100%); color:#FFFFFF; padding:32px 30px; text-align:center;">
            <h1 style="margin:0; font-size:24px; font-weight:700; color:#FBAD15; letter-spacing:0.5px;">AMEVA</h1>
            <p style="margin:4px 0 0; font-size:12px; color:#CBD5E1; text-transform:uppercase; letter-spacing:1.5px;">AMFI Registered Mutual Fund Distributor (ARN-145058)</p>
            <div style="margin-top:16px; display:inline-block; background:rgba(251,173,21,0.15); border:1px solid #FBAD15; color:#FBAD15; font-size:11px; font-weight:700; padding:4px 14px; border-radius:99px; text-transform:uppercase;">
              ${isSelfCopy ? '[COMPLIANCE ARCHIVE] Verified Investor Risk Profile Record' : 'Investor Risk Profile Record'}
            </div>
          </div>

          <div style="padding:36px 30px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #E2E8F0; padding-bottom:12px; margin-bottom:20px;">
              <div>
                <h2 style="font-size:20px; color:#25475E; margin:0;">Investor: ${userName}</h2>
                <div style="font-size:12px; color:#64748B; margin-top:2px;">Email Verified via OTP: <strong style="color:#15803D;">✓ Verified</strong></div>
              </div>
              <div style="font-size:12px; color:#64748B; text-align:right;">
                Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>

            <div style="background:#FFF9EE; border:1.5px solid #FBAD15; border-radius:14px; padding:22px; margin:20px 0; text-align:center;">
              <div style="font-size:11px; font-weight:800; color:#C3141B; letter-spacing:1px; text-transform:uppercase;">Assessed Risk Profile Category</div>
              <div style="font-size:26px; font-weight:800; color:#25475E; margin:6px 0;">${category}</div>
              <div style="font-size:14px; font-weight:700; color:#C3141B;">Score: ${totalScore} / 60</div>
              <p style="font-size:13px; color:#64748B; margin:10px 0 0; line-height:1.5;">${description}</p>
            </div>

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

            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:12px; padding:18px; margin-bottom:24px; font-size:13px; color:#475569;">
              <div style="font-weight:800; color:#25475E; margin-bottom:8px; text-transform:uppercase; font-size:11px;">Investor Particulars</div>
              <table style="width:100%; font-size:12.5px;">
                <tr><td><strong>Name:</strong> ${userName}</td><td><strong>PAN:</strong> ${userPan || '—'}</td></tr>
                <tr><td><strong>Email:</strong> ${userEmail}</td><td><strong>Mobile:</strong> ${userPhone || '—'}</td></tr>
                <tr><td><strong>Age:</strong> ${userAge}</td><td><strong>Occupation:</strong> ${userOccupation}</td></tr>
                <tr><td><strong>Dependants:</strong> ${userDependants}</td><td><strong>Status:</strong> ${resStatus || 'Resident Indian'}</td></tr>
              </table>
            </div>

            <div style="margin-bottom:24px;">
              <h3 style="font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#25475E; border-bottom:2px solid #C3141B; padding-bottom:6px;">Suggested Broad Asset Allocation Matrix</h3>
              <table style="width:100%; border-collapse:collapse; font-size:13.5px; margin-top:10px;">
                ${allocRows}
              </table>
            </div>

            <div style="margin-bottom:24px;">
              <h3 style="font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#25475E; border-bottom:2px solid #FBAD15; padding-bottom:6px;">Suitable Scheme Categories</h3>
              <ul style="padding-left:20px; font-size:13px; line-height:1.7; margin-top:8px;">
                ${fundList}
              </ul>
            </div>

            <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:10px; padding:14px; font-size:11.5px; color:#1E3A8A; line-height:1.5;">
              <strong>SEBI Statutory Notice:</strong> The investor has completed the assessment and authenticated identity via OTP. Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Ameva Mutual Fund Distributors acts solely as a distributor of Regular Plans earning permissible trailing distributor remuneration.
            </div>
          </div>

          <div style="background:#F1F5F9; padding:20px 30px; text-align:center; font-size:11.5px; color:#64748B; border-top:1px solid #E2E8F0; line-height:1.6;">
            <strong>AMEVA — AMFI Registered Mutual Fund Distributor</strong><br>
            ARN: 145058 | EUIN: E028717<br>
            Grievance Officer: Rajesh Kumar Gupta (+91 98100 47256) | Email: rajeshgupta@ameva.in, amevamfd@gmail.com<br>
            Distribution Office: Aspen greens 99, Nirvana Country, Sector 50, Gurgaon
          </div>
        </div>
      </div>
    `;

    // Generate PDF copy
    let pdfBuffer = null;
    try {
      pdfBuffer = await generateRiskProfilePDF(data);
      console.log('[PDF GENERATED] Successfully built 2-page PDF copy, size:', pdfBuffer.length, 'bytes');
    } catch (pdfErr) {
      console.error('[PDF ERROR]:', pdfErr);
    }

    // PDF filename starts with client name as requested
    const safeClientName = (userName || 'Investor').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    const pdfFilename = `${safeClientName}_Ameva_Risk_Profile.pdf`;

    const attachments = pdfBuffer ? [
      {
        filename: pdfFilename,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ] : [];

    try {
      const transporter = getTransporter();

      // 1. Send to Client
      await transporter.sendMail({
        from: `"Ameva Compliance Desk" <${senderEmail}>`,
        to: cleanEmail,
        subject: `Your Verified Investor Risk Profile Record (ARN-145058) – ${userName}`,
        html: htmlTemplate(false),
        attachments,
      });
      console.log(`[REPORT SENT] Emailed report with PDF (${pdfFilename}) to Client: ${cleanEmail}`);

      // 2. Send to Admin
      await transporter.sendMail({
        from: `"Ameva Notification" <${senderEmail}>`,
        to: adminEmail,
        subject: `[VERIFIED SUBMISSION] Risk Profile Form – ${userName} (${category})`,
        html: htmlTemplate(true),
        attachments,
      });
      console.log(`[REPORT SENT] Emailed report with PDF (${pdfFilename}) to Admin: ${adminEmail}`);

    } catch (err) {
      console.error('[REPORT DISPATCH ERROR]:', err);
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Risk profile successfully verified and copy sent with PDF.',
    });
  } catch (error) {
    console.error('Verify Risk Profile Error:', error);
    return res.status(500).json({ success: false, message: 'Verification processing failed.' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Ameva SMTP Verification Server running on port ${port}`);
});
