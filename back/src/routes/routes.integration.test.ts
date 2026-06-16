import request from "supertest";
import app from "../server";

describe("API integration", () => {
  it("POST /users/register returns 400 when fields are missing", async () => {
    const res = await request(app).post("/users/register").send({ email: "a@b.c" });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("required");
  });
  it("POST /orders returns 400 without a token", async () => {
    const res = await request(app).post("/orders").send({ products: [1] });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Token is required");
  });

  it("PATCH /products/:id returns 400 without a token", async () => {
    const res = await request(app).patch("/products/1").send({ stock: 5 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Token is required");
  });
  it("serves Swagger UI at /api-docs", async () => {
    const res = await request(app).get("/api-docs/").redirects(1);
    expect(res.status).toBe(200);
    expect(res.text).toContain("Swagger UI");
  });
});
