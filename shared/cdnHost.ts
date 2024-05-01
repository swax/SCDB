//import ProcessEnv from "./ProcessEnv";

// the || is here only for 'find all references' to work, process.env... is inlined at build time
const awsBucket = process.env.NEXT_PUBLIC_AWS_BUCKET; // || ProcessEnv.NEXT_PUBLIC_AWS_BUCKET;
const awsRegion = process.env.NEXT_PUBLIC_AWS_REGION; // || ProcessEnv.NEXT_PUBLIC_AWS_REGION;

const s3url = `https://${awsBucket}.s3.${awsRegion}.amazonaws.com`;
export default s3url;