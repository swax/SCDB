//import ProcessEnv from "./ProcessEnv";

// the || is here only for 'find all references' to work, process.env... is inlined at build time
const staticUrl = `https://${process.env.NEXT_PUBLIC_STATIC_HOSTNAME}`; // || ProcessEnv.NEXT_PUBLIC_STATIC_HOSTNAME;
export default staticUrl;
