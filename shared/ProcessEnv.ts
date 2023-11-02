interface ProcessEnv extends NodeJS.ProcessEnv {
  readonly GOOGLE_CLIENT_ID: string;
  readonly GOOGLE_CLIENT_SECRET: string;
  readonly NEXTAUTH_SECRET: string;
}

// todo easier way to force cast?
// also this won't work in client side code

const ProcessEnv = process.env as ProcessEnv;

export default ProcessEnv;
