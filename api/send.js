import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

app.post("/send", async (req, res) => {
  try {
    const { name, email, message } = req.body;

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
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on 5000");
});