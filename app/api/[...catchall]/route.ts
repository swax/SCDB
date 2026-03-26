import { NextRequest, NextResponse } from "next/server";

function notFound(request: NextRequest) {
  return NextResponse.json(
    {
      error: "API endpoint not found",
      path: request.nextUrl.pathname,
      hint: "GET /api for available endpoints",
    },
    { status: 404 },
  );
}

export function GET(request: NextRequest) {
  return notFound(request);
}
export function POST(request: NextRequest) {
  return notFound(request);
}
export function PUT(request: NextRequest) {
  return notFound(request);
}
export function DELETE(request: NextRequest) {
  return notFound(request);
}
