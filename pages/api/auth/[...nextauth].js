import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    EmailProvider({
      server: {
        host: "smtp-relay.brevo.com",
        port: 587,
        auth: {
          user: process.env.BREVO_USER,
          pass: process.env.BREVO_PASS,
        },
      },
      from: process.env.EMAIL_FROM,
      maxAge: 10 * 60, // 10 Minuten gültig

      async sendVerificationRequest({ identifier, url, provider }) {
        const { server, from } = provider;
        const nodemailer = require("nodemailer");

        const transport = nodemailer.createTransport(server);

        const plainText = `Login-Link (gültig für 10 Minuten):\n\n${url}\n\nFalls du das nicht warst, ignoriere diese E-Mail.`;

        await transport.sendMail({
          to: identifier,
          from,
          subject: "Dein Flexblock Login",
          text: plainText,
        });
      },
    }),
  ],

  // 👉 JWT muss aktiv sein, damit Middleware und Login funktionieren
  session: {
    strategy: "jwt",
    maxAge: 10 * 60, // 10 Minuten
  },

  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },

    // 🚀 ALWAYS redirect to /dashboard after Magic Link
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/dashboard`;
    },
  },
};

export default NextAuth(authOptions);
