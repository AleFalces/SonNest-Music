import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SoundNest API",
      version: "1.0.0",
      description:
        "REST API for SoundNest, a full-stack musical instruments e-commerce. " +
        "Provides authentication, product browsing and order management.",
      contact: { name: "Ale Falces", url: "https://github.com/AleFalces" },
      license: { name: "MIT", url: "https://opensource.org/licenses/MIT" },
    },
    servers: [{ url: "http://localhost:8080", description: "Local development" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
          description: "JWT received from the /users/login endpoint",
        },
      },
      schemas: {
        Product: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Fender Stratocaster" },
            description: { type: "string", example: "Classic electric guitar" },
            price: { type: "number", example: 1200 },
            stock: { type: "integer", example: 10 },
            image: { type: "string", example: "https://..." },
            categoryId: { type: "integer", example: 2 },
          },
        },
        RegisterUser: {
          type: "object",
          required: ["email", "password", "name", "address", "phone"],
          properties: {
            name: { type: "string", example: "Jane Doe" },
            email: { type: "string", example: "jane@example.com" },
            password: { type: "string", example: "Str0ngPass!" },
            address: { type: "string", example: "123 Music St" },
            phone: { type: "string", example: "+1 555 0100" },
          },
        },
        LoginUser: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "jane@example.com" },
            password: { type: "string", example: "Str0ngPass!" },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            login: { type: "boolean", example: true },
            user: { type: "object" },
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIs..." },
          },
        },
        CreateOrder: {
          type: "object",
          required: ["products"],
          properties: {
            products: { type: "array", items: { type: "integer" }, example: [1, 2] },
          },
        },
        CartItem: {
          type: "object",
          properties: {
            id: { type: "integer", example: 5 },
            quantity: { type: "integer", example: 2 },
            product: { $ref: "#/components/schemas/Product" },
          },
        },
        Cart: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            items: {
              type: "array",
              items: { $ref: "#/components/schemas/CartItem" },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            statusCode: { type: "integer", example: 400 },
            message: { type: "string", example: "Bad request" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.ts", "./dist/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
