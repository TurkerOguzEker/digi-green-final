import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { to, subject, text } = body;

    if (!to || !text) {
      return NextResponse.json({ error: 'Alıcı veya mesaj içeriği eksik.' }, { status: 400 });
    }

    // Şifredeki olası boşlukları otomatik temizler
    const cleanPassword = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : '';

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: cleanPassword,
      },
    });

    await transporter.sendMail({
      from: `"DIGI-GREEN FUTURE" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      text: text,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mail gönderme hatası (Detaylı):', error);
    return NextResponse.json({ error: error.message || 'Bilinmeyen bir sunucu hatası oluştu.' }, { status: 500 });
  }
}