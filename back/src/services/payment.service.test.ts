import { createPreferenceService } from "./payment.service";
import { ProductRepository } from "../repositories/product.repository";
import { ClientError } from "../utils/errors";

// Impostor for the product repository: we decide what the DB "returns".
jest.mock("../repositories/product.repository", () => ({
  ProductRepository: {
    findOneBy: jest.fn(),
  },
}));

// Impostor for the Mercado Pago SDK. `Preference` becomes a fake class whose
// `create` method is a jest mock we control. This way the test never hits the
// real Mercado Pago API.
const mpPreferenceCreate = jest.fn();
jest.mock("mercadopago", () => ({
  MercadoPagoConfig: jest.fn(),
  Preference: jest.fn().mockImplementation(() => ({
    create: mpPreferenceCreate,
  })),
}));

const findOneBy = ProductRepository.findOneBy as jest.Mock;

describe("createPreferenceService", () => {
  const guitar = {
    id: 1,
    name: "Fender Stratocaster",
    price: 1200,
    image: "https://example.com/strat.jpg",
  };
  const bass = {
    id: 2,
    name: "Fender Jazz Bass",
    price: 900,
    image: "https://example.com/jazz.jpg",
  };

  beforeEach(() => {
    findOneBy.mockReset();
    mpPreferenceCreate.mockReset();
    // Default: Mercado Pago returns a preference with an id and a checkout URL.
    mpPreferenceCreate.mockResolvedValue({
      id: "pref_123",
      init_point: "https://www.mercadopago.com/checkout?pref_id=pref_123",
    });
  });

  it("returns the preference id and init_point from Mercado Pago", async () => {
    findOneBy.mockImplementation(async ({ id }) =>
      id === 1 ? guitar : bass
    );

    const result = await createPreferenceService([1, 2], 42);

    expect(result).toEqual({
      id: "pref_123",
      init_point: "https://www.mercadopago.com/checkout?pref_id=pref_123",
    });
  });

  it("builds one item per product with title and unit_price", async () => {
    findOneBy.mockImplementation(async ({ id }) => (id === 1 ? guitar : bass));

    await createPreferenceService([1, 2], 42);

    const body = mpPreferenceCreate.mock.calls[0][0].body;
    expect(body.items).toEqual([
      expect.objectContaining({ title: "Fender Stratocaster", unit_price: 1200, quantity: 1 }),
      expect.objectContaining({ title: "Fender Jazz Bass", unit_price: 900, quantity: 1 }),
    ]);
  });

  it("carries the userId and product ids in metadata", async () => {
    findOneBy.mockImplementation(async ({ id }) => (id === 1 ? guitar : bass));

    await createPreferenceService([1, 2], 42);

    const body = mpPreferenceCreate.mock.calls[0][0].body;
    expect(body.metadata).toMatchObject({
      user_id: 42,
      product_ids: [1, 2],
    });
  });

  it("sets the three back_urls (success, pending, failure)", async () => {
    findOneBy.mockResolvedValue(guitar);

    await createPreferenceService([1], 42);

    const body = mpPreferenceCreate.mock.calls[0][0].body;
    expect(body.back_urls.success).toContain("/checkout/success");
    expect(body.back_urls.pending).toContain("/checkout/pending");
    expect(body.back_urls.failure).toContain("/checkout/failure");
  });

  it("de-duplicates repeated product ids", async () => {
    findOneBy.mockImplementation(async ({ id }) => (id === 1 ? guitar : bass));

    await createPreferenceService([1, 1, 2], 42);

    // unique ids only -> two DB lookups, two items
    expect(findOneBy).toHaveBeenCalledTimes(2);
    const body = mpPreferenceCreate.mock.calls[0][0].body;
    expect(body.items).toHaveLength(2);
  });

  it("throws a 404 ClientError when a product does not exist", async () => {
    findOneBy.mockResolvedValue(null);

    await expect(createPreferenceService([99], 42)).rejects.toBeInstanceOf(
      ClientError
    );
    await expect(createPreferenceService([99], 42)).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(mpPreferenceCreate).not.toHaveBeenCalled();
  });
});
