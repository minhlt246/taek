import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validation
    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { success: false, message: "Vui lòng điền đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Sanitize inputs để tránh XSS
    const sanitize = (str: string) => {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    const sanitizedName = sanitize(name.trim());
    const sanitizedEmail = sanitize(email.trim());
    const sanitizedPhone = sanitize(phone.trim());
    const sanitizedMessage = sanitize(message.trim());

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Email không hợp lệ" },
        { status: 400 }
      );
    }

    // Validate length
    if (sanitizedName.length > 100) {
      return NextResponse.json(
        { success: false, message: "Họ tên không được quá 100 ký tự" },
        { status: 400 }
      );
    }
    if (sanitizedMessage.length > 2000) {
      return NextResponse.json(
        { success: false, message: "Tin nhắn không được quá 2000 ký tự" },
        { status: 400 }
      );
    }

    // Kiểm tra và validate email credentials
    // LƯU Ý: Gmail yêu cầu sử dụng App Password (không phải mật khẩu thường)
    // Để tạo App Password: Google Account > Security > 2-Step Verification > App passwords
    const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
    const emailPassword =
      process.env.EMAIL_APP_PASSWORD ||
      process.env.GMAIL_APP_PASSWORD ||
      process.env.EMAIL_PASSWORD ||
      process.env.GMAIL_PASSWORD;

    if (!emailUser || !emailPassword) {
      console.error("Email credentials missing:", {
        EMAIL_USER: !!emailUser,
        EMAIL_APP_PASSWORD: !!process.env.EMAIL_APP_PASSWORD,
        GMAIL_APP_PASSWORD: !!process.env.GMAIL_APP_PASSWORD,
        EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD,
        GMAIL_PASSWORD: !!process.env.GMAIL_PASSWORD,
        "Available env vars": Object.keys(process.env)
          .filter((key) => key.includes("EMAIL") || key.includes("GMAIL"))
          .join(", "),
      });
      return NextResponse.json(
        {
          success: false,
          message:
            "Cấu hình email chưa được thiết lập. Vui lòng kiểm tra file .env.local hoặc .env",
        },
        { status: 500 }
      );
    }

    // Log để debug (không log password đầy đủ)
    console.log("Email config loaded:", {
      user: emailUser.trim(),
      passwordLength: emailPassword.trim().length,
      passwordPrefix: emailPassword.trim().substring(0, 2) + "...",
      "Using App Password": emailPassword.length >= 16,
    });

    // Tạo transporter cho Gmail
    // Sử dụng cấu hình SMTP trực tiếp để có kiểm soát tốt hơn
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true cho 465, false cho các port khác
      auth: {
        user: emailUser.trim(),
        pass: emailPassword.trim(),
      },
      tls: {
        rejectUnauthorized: false, // Cho phép self-signed certificates
      },
      // Thêm timeout để tránh treo
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    // Bỏ qua verify() vì có thể fail nhưng sendMail vẫn hoạt động
    // Verify chỉ để test connection, không bắt buộc
    // Nếu cần verify, có thể bật lại nhưng sẽ fail nếu chưa có App Password đúng

    // Nội dung email gửi đến taekwondodongphu@gmail.com
    const mailOptions = {
      from: emailUser,
      to: "taekwondodongphu@gmail.com",
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
              <p style="margin: 0; line-height: 1.6; color: #555; white-space: pre-wrap;">${sanitizedMessage.replace(/\n/g, "<br>")}</p>
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
            <p>Tin nhắn này được gửi từ form liên hệ trên website.</p>
            <p>Thời gian: ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</p>
          </div>
        </div>
      `,
    };

    // Gửi email
    console.log("Attempting to send email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);

    return NextResponse.json(
      {
        success: true,
        message:
          "Tin nhắn đã được gửi thành công! Chúng tôi sẽ liên hệ lại với bạn sớm nhất.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    console.error("Error details:", {
      code: error.code,
      responseCode: error.responseCode,
      command: error.command,
      response: error.response?.substring(0, 200), // Chỉ log 200 ký tự đầu
    });

    // Xử lý các loại lỗi cụ thể
    let errorMessage = "Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.";

    // Kiểm tra mã lỗi từ response hoặc code
    const errorCode = error.code || error.responseCode;

    if (errorCode === "EAUTH" || errorCode === 535) {
      errorMessage =
        "Lỗi xác thực email. Vui lòng kiểm tra lại EMAIL_USER và EMAIL_APP_PASSWORD trong cấu hình.";
      console.error(
        "EAUTH Error - Cần sử dụng App Password. Response:",
        error.response?.substring(0, 200)
      );
    } else if (errorCode === "ECONNECTION") {
      errorMessage =
        "Không thể kết nối đến dịch vụ email. Vui lòng kiểm tra kết nối mạng.";
    } else if (errorCode === "ETIMEDOUT") {
      errorMessage = "Kết nối email quá thời gian. Vui lòng thử lại sau.";
    } else if (error.response && error.response.includes("BadCredentials")) {
      errorMessage =
        "Thông tin đăng nhập không đúng. Vui lòng kiểm tra lại EMAIL_USER và EMAIL_APP_PASSWORD trong biến môi trường.";
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
