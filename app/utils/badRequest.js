import { json } from "@remix-run/node";

export default function badRequest(data) {
  return json(data, { status: 400 });
}