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
  it("POST /products returns 400 without a token", async () => {
    const res = await request(app).post("/products").send({ name: "X" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Token is required");
  });
  it("DELETE /products/:id returns 400 without a token", async () => {
    const res = await request(app).delete("/products/1");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Token is required");
  });
  it("POST /products/image returns 400 without a token", async () => {
    const res = await request(app).post("/products/image");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Token is required");
  });
  it("POST /payments/create-preference returns 400 without a token", async () => {
    const res = await request(app)
      .post("/payments/create-preference")
      .send({ products: [1] });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Token is required");
  });

  it("GET /payments/confirm returns 400 without a token", async () => {
    const res = await request(app).get("/payments/confirm?payment_id=123");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Token is required");
  });

  // The webhook is public (MP calls it server-to-server) — unlike the routes
  // above it must NOT require a token. A non-payment event short-circuits to 200
  // without touching Mercado Pago.
  it("POST /payments/webhook is public (no token required)", async () => {
    const res = await request(app).post("/payments/webhook?type=test");
    expect(res.status).toBe(200);
  });

  it("GET /cart returns 400 without a token", async () => {
    const res = await request(app).get("/cart");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Token is required");
  });
  it("POST /cart/items returns 400 without a token", async () => {
    const res = await request(app).post("/cart/items").send({ productId: 1 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Token is required");
  });
  it("DELETE /cart returns 400 without a token", async () => {
    const res = await request(app).delete("/cart");
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Token is required");
  });

  it("serves Swagger UI at /api-docs", async () => {
    const res = await request(app).get("/api-docs/").redirects(1);
    expect(res.status).toBe(200);
    expect(res.text).toContain("Swagger UI");
  });
});
