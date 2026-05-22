import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, message } = req.body;

  try {
    const data = await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: "poojasahdevram@gmail.com",
      subject: `Message from ${name}`,
      html: `
        <h3>New Contact</h3>
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
        <p>${message}</p>
      `,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
