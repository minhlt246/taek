import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validation
    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ thông tin' },
        { status: 400 }
      );
    }

    // Sanitize inputs để tránh XSS
    const sanitize = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const sanitizedName = sanitize(name.trim());
    const sanitizedEmail = sanitize(email.trim());
    const sanitizedPhone = sanitize(phone.trim());
    const sanitizedMessage = sanitize(message.trim());

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    // Validate length
    if (sanitizedName.length > 100) {
      return NextResponse.json(
        { success: false, message: 'Họ tên không được quá 100 ký tự' },
        { status: 400 }
      );
    }
    if (sanitizedMessage.length > 2000) {
      return NextResponse.json(
        { success: false, message: 'Tin nhắn không được quá 2000 ký tự' },
        { status: 400 }
      );
    }

    // Kiểm tra và validate email credentials
    const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD;

    if (!emailUser || !emailPassword) {
      console.error('Email credentials missing. EMAIL_USER:', !!emailUser, 'EMAIL_PASSWORD:', !!emailPassword);
      return NextResponse.json(
        {
          success: false,
          message: 'Cấu hình email chưa được thiết lập. Vui lòng liên hệ quản trị viên.',
        },
        { status: 500 }
      );
    }

    // Tạo transporter cho Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser.trim(),
        pass: emailPassword.trim(),
      },
    });

    // Verify transporter connection
    try {
      await transporter.verify();
    } catch (verifyError: any) {
      console.error('Email transporter verification failed:', verifyError);
      return NextResponse.json(
        {
          success: false,
          message: 'Không thể kết nối đến dịch vụ email. Vui lòng kiểm tra lại cấu hình.',
        },
        { status: 500 }
      );
    }

    // Nội dung email gửi đến taekwondodongphu@gmail.com
    const mailOptions = {
      from: emailUser,
      to: 'taekwondodongphu@gmail.com',
      subject: `Tin nhắn liên hệ từ ${sanitizedName} - ${sanitizedEmail}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #4a90e2; padding-bottom: 10px;">
            Tin Nhắn Liên Hệ Mới
          </h2>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Họ và Tên:</strong> ${sanitizedName}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${sanitizedEmail}</p>
            <p style="margin: 10px 0;"><strong>Số Điện Thoại:</strong> ${sanitizedPhone}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 10px;">Tin Nhắn:</h3>
            <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #4a90e2; border-radius: 3px;">
              <p style="margin: 0; line-height: 1.6; color: #555; white-space: pre-wrap;">${sanitizedMessage.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
            <p>Tin nhắn này được gửi từ form liên hệ trên website.</p>
            <p>Thời gian: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
          </div>
        </div>
      `,
    };

    // Gửi email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      {
        success: true,
        message: 'Tin nhắn đã được gửi thành công! Chúng tôi sẽ liên hệ lại với bạn sớm nhất.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending email:', error);
    
    // Xử lý các loại lỗi cụ thể
    let errorMessage = 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Lỗi xác thực email. Vui lòng kiểm tra lại thông tin đăng nhập trong cấu hình.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Không thể kết nối đến dịch vụ email. Vui lòng thử lại sau.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Kết nối email quá thời gian. Vui lòng thử lại sau.';
    }
    
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

