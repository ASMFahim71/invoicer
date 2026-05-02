import { Resend } from "resend";
import { env } from "~/env.js";

const resend = new Resend(env.RESEND_API_KEY);
const FROM = env.RESEND_FROM_EMAIL;

// ---------------------------------------------------------------------------
// Shared layout helpers
// ---------------------------------------------------------------------------

const INDIGO = "#4f46e5";

function emailWrapper(body: string): string {
  return `
    <div style="background:#f1f5f9;padding:32px 16px;font-family:'Segoe UI',Arial,sans-serif">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        ${body}
      </div>
      <p style="text-align:center;margin:20px 0 0;font-size:11px;color:#94a3b8">
        Powered by nanitex.com &nbsp;·&nbsp; ${new Date().getFullYear()}
      </p>
    </div>
  `;
}

function header(label: string): string {
  return `
    <div style="background:${INDIGO};padding:28px 32px 24px">
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px">
        <tr>
          <td style="vertical-align:middle;padding-right:10px">
            <div style="width:28px;height:28px;background:rgba(255,255,255,0.2);border-radius:7px;text-align:center;line-height:28px">
              <span style="color:#fff;font-size:15px">&#128196;</span>
            </div>
          </td>
          <td style="vertical-align:middle">
            <span style="color:rgba(255,255,255,0.95);font-size:16px;font-weight:700;letter-spacing:0.5px">invoicer</span>
          </td>
        </tr>
      </table>
      <p style="margin:0;color:rgba(255,255,255,0.6);font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase">${label}</p>
    </div>
  `;
}

function badge(text: string, color: string, bg: string): string {
  return `
    <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table">
      <tr>
        <td style="background:${bg};padding:5px 13px;border-radius:999px;vertical-align:middle;white-space:nowrap">
          <span style="width:7px;height:7px;background:${color};border-radius:50%;display:inline-block;vertical-align:middle;margin-right:6px"></span>
          <span style="color:${color};font-size:12px;font-weight:700;vertical-align:middle">${text}</span>
        </td>
      </tr>
    </table>
  `;
}

function row(label: string, value: string, mono = false): string {
  return `
    <tr>
      <td style="padding:11px 0;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;width:45%">${label}</td>
      <td style="padding:11px 0;color:#0f172a;font-size:14px;font-weight:600;text-align:right${mono ? ";font-family:monospace" : ""}">${value}</td>
    </tr>
    <tr><td colspan="2" style="padding:0"><div style="border-top:1.5px dashed #e2e8f0"></div></td></tr>
  `;
}

function totalRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:16px 0 0;color:#0f172a;font-size:14px;font-weight:700">${label}</td>
      <td style="padding:16px 0 0;color:${INDIGO};font-size:24px;font-weight:800;text-align:right">${value}</td>
    </tr>
  `;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

function invoiceSentToClient(p: {
  clientName: string;
  senderName: string;
  invoiceNumber: string;
  projectTitle: string;
  total: string;
  invoiceUrl: string;
}): { subject: string; html: string } {
  return {
    subject: `Invoice ${p.invoiceNumber} from ${p.senderName}`,
    html: emailWrapper(`
      ${header("Invoice Receipt")}
      <div style="padding:28px 32px 32px">
        ${badge("New Invoice", INDIGO, "#eff6ff")}
        <p style="margin:16px 0 4px;color:#0f172a;font-size:22px;font-weight:800">${p.clientName}</p>
        <p style="margin:0 0 24px;color:#64748b;font-size:14px">${p.senderName} has sent you an invoice for review.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px">
          <tr><td colspan="2" style="padding:0 0 8px"><div style="border-top:1.5px dashed #e2e8f0"></div></td></tr>
          ${row("From", p.senderName)}
          ${row("Invoice", p.invoiceNumber, true)}
          ${row("Project", p.projectTitle)}
          ${totalRow("Total Due", p.total)}
        </table>
        <div style="margin-top:28px">
          <a href="${p.invoiceUrl}" style="display:inline-block;background:${INDIGO};color:#fff;text-decoration:none;padding:13px 32px;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.3px">View &amp; Sign Invoice →</a>
        </div>
        <p style="margin:20px 0 0;color:#94a3b8;font-size:12px">Enter your email on the invoice page to confirm your agreement.</p>
      </div>
    `),
  };
}

function invoiceAcceptedToClient(p: {
  clientName: string;
  senderName: string;
  invoiceNumber: string;
  projectTitle: string;
  total: string;
  acceptedAt: string;
}): { subject: string; html: string } {
  return {
    subject: `Confirmed — Invoice ${p.invoiceNumber} accepted`,
    html: emailWrapper(`
      ${header("Receipt Copy")}
      <div style="padding:28px 32px 32px">
        ${badge("Agreement Confirmed", "#16a34a", "#f0fdf4")}
        <p style="margin:16px 0 4px;color:#0f172a;font-size:22px;font-weight:800">${p.clientName}</p>
        <p style="margin:0 0 24px;color:#64748b;font-size:14px">You've successfully agreed to the invoice from ${p.senderName}.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px">
          <tr><td colspan="2" style="padding:0 0 8px"><div style="border-top:1.5px dashed #e2e8f0"></div></td></tr>
          ${row("From", p.senderName)}
          ${row("Invoice", p.invoiceNumber, true)}
          ${row("Project", p.projectTitle)}
          ${row("Accepted On", p.acceptedAt)}
          ${totalRow("Total Amount", p.total)}
        </table>
        <p style="margin:24px 0 0;color:#94a3b8;font-size:12px">Keep this email as your record of agreement. The sender has also been notified.</p>
      </div>
    `),
  };
}

function invoiceAcceptedToSender(p: {
  senderName: string;
  clientName: string;
  clientEmail: string;
  invoiceNumber: string;
  projectTitle: string;
  total: string;
  acceptedAt: string;
}): { subject: string; html: string } {
  return {
    subject: `${p.clientName} accepted invoice ${p.invoiceNumber}`,
    html: emailWrapper(`
      ${header("Receipt Copy")}
      <div style="padding:28px 32px 32px">
        ${badge("Invoice Accepted", "#16a34a", "#f0fdf4")}
        <p style="margin:16px 0 4px;color:#0f172a;font-size:22px;font-weight:800">Great news, ${p.senderName}!</p>
        <p style="margin:0 0 24px;color:#64748b;font-size:14px">${p.clientName} has agreed to and accepted your invoice.</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px">
          <tr><td colspan="2" style="padding:0 0 8px"><div style="border-top:1.5px dashed #e2e8f0"></div></td></tr>
          ${row("Invoice", p.invoiceNumber, true)}
          ${row("Project", p.projectTitle)}
          ${row("Client", p.clientName)}
          ${row("Client Email", p.clientEmail)}
          ${row("Accepted On", p.acceptedAt)}
          ${totalRow("Total Amount", p.total)}
        </table>
      </div>
    `),
  };
}

// ---------------------------------------------------------------------------
// Send functions
// ---------------------------------------------------------------------------

export async function sendInvoiceSentEmail(p: {
  clientEmail: string;
  clientName: string;
  senderName: string;
  invoiceNumber: string;
  projectTitle: string;
  total: string;
  invoiceUrl: string;
}) {
  const { subject, html } = invoiceSentToClient(p);
  await resend.emails.send({
    from: FROM,
    to: p.clientEmail,
    subject,
    html,
  });
}

export async function sendInvoiceAcceptedEmails(p: {
  clientEmail: string;
  clientName: string;
  senderEmail: string;
  senderName: string;
  invoiceNumber: string;
  projectTitle: string;
  total: string;
  acceptedAt: string;
}) {
  const clientTemplate = invoiceAcceptedToClient(p);
  const senderTemplate = invoiceAcceptedToSender(p);

  await Promise.all([
    resend.emails.send({
      from: FROM,
      to: p.clientEmail,
      subject: clientTemplate.subject,
      html: clientTemplate.html,
    }),
    resend.emails.send({
      from: FROM,
      to: p.senderEmail,
      subject: senderTemplate.subject,
      html: senderTemplate.html,
    }),
  ]);
}
