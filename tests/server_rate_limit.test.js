import request from "supertest";
import { app } from "../src/backend/server.js";
import { jest } from "@jest/globals";

describe("Server Rate Limiting", () => {
  it("should allow requests within the limit", async () => {
    // Send a few requests, they should pass
    for (let i = 0; i < 5; i++) {
      const response = await request(app).get("/healthz");
      expect(response.status).toBe(200);
    }
  });

  it("should block requests exceeding the limit", async () => {
    // We set the limit to 100 per 15 mins.
    // We need to send enough requests to trigger the limit.
    // Since we already sent 5 in the previous test (if state persists), we need 96 more.
    // But let's just send 110 total in this test to be sure.

    const requests = [];
    for (let i = 0; i < 110; i++) {
      requests.push(request(app).get("/healthz"));
    }

    const responses = await Promise.all(requests);

    const rateLimited = responses.filter((r) => r.status === 429);
    const success = responses.filter((r) => r.status === 200);

    console.log(
      `Success: ${success.length}, Rate Limited: ${rateLimited.length}`,
    );

    expect(rateLimited.length).toBeGreaterThan(0);
  }, 15000);
});
