import { uploadImageService } from "./cloudinary.service";
import { cloudinary } from "../config/cloudinary";

// Impostor for the Cloudinary client: we decide what the upload "returns",
// so the test never hits the real Cloudinary API.
jest.mock("../config/cloudinary", () => ({
  cloudinary: { uploader: { upload: jest.fn() } },
}));

const upload = cloudinary.uploader.upload as jest.Mock;

describe("uploadImageService", () => {
  beforeEach(() => upload.mockReset());

  it("returns the secure_url from Cloudinary", async () => {
    upload.mockResolvedValue({
      secure_url: "https://res.cloudinary.com/demo/image/upload/abc.jpg",
    });

    const url = await uploadImageService({
      buffer: Buffer.from("img"),
      mimetype: "image/png",
    });

    expect(url).toBe("https://res.cloudinary.com/demo/image/upload/abc.jpg");
  });

  it("uploads the buffer as a base64 data URI into the products folder", async () => {
    upload.mockResolvedValue({ secure_url: "https://res.cloudinary.com/x.jpg" });

    await uploadImageService({
      buffer: Buffer.from("hello"),
      mimetype: "image/jpeg",
    });

    const [dataUri, options] = upload.mock.calls[0];
    expect(dataUri).toBe(
      `data:image/jpeg;base64,${Buffer.from("hello").toString("base64")}`
    );
    expect(options).toEqual({ folder: "soundnest/products" });
  });
});
