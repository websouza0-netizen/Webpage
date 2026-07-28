import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error(
      "GMAIL_USER / GMAIL_APP_PASSWORD are not set — see .env.local",
    );
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return transporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const from = process.env.GMAIL_USER;
  await getTransporter().sendMail({
    from: `WebSouza <${from}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}

export async function sendWelcomeEmail(
  to: string,
  name?: string | null,
  locale: "en" | "pt" = "en",
) {
  if (locale === "pt") {
    const greeting = name ? `Olá, ${name}!` : "Olá!";
    await sendEmail({
      to,
      subject: "Bem-vindo à WebSouza",
      html: `<p>${greeting}</p><p>A sua conta foi criada com sucesso. Já pode aceder ao seu painel para gerir o seu site.</p>`,
      text: `${greeting} A sua conta foi criada com sucesso.`,
    });
    return;
  }

  const greeting = name ? `Hi, ${name}!` : "Hi!";
  await sendEmail({
    to,
    subject: "Welcome to WebSouza",
    html: `<p>${greeting}</p><p>Your account was created successfully. You can now access your dashboard to manage your site.</p>`,
    text: `${greeting} Your account was created successfully.`,
  });
}

export async function notifyAdmin(subject: string, text: string) {
  const admin = process.env.ADMIN_EMAIL;
  if (!admin) return;
  await sendEmail({ to: admin, subject, html: `<p>${text}</p>`, text });
}
