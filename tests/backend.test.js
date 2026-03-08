const request = require("supertest");
const express = require("express");

const app = express();
app.use(express.static("src/frontend"));

describe("GET /", () => {
  it("responds with 200", (done) => {
    request(app).get("/").expect(200, done);
  });
});
