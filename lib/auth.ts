import NextAuth, { type NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist Google sub on initial sign in
      if (account && profile) {
        token.sub = token.sub || (profile as any).sub
        token.email = token.email || (profile as any).email
        token.name = token.name || (profile as any).name
        token.picture = token.picture || (profile as any).picture
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string | undefined
        session.user.email = (token.email as string) || session.user.email
        session.user.name = (token.name as string) || session.user.name
        session.user.image = (token.picture as string) || session.user.image
      }
      return session
    },
  },
}

export const { auth } = NextAuth(authConfig)
