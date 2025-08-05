import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { createSession, getSession } from "@/lib/auth";

// Mock dependencies
vi.mock("server-only", () => ({}));
vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue("mocked-jwt-token"),
  })),
  jwtVerify: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    set: vi.fn(),
    get: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

test("creates session with correct JWT payload", async () => {
  const { SignJWT } = await import("jose");
  const SignJWTMock = vi.mocked(SignJWT);

  await createSession("user123", "test@example.com");

  expect(SignJWTMock).toHaveBeenCalledWith({
    userId: "user123",
    email: "test@example.com",
    expiresAt: new Date("2024-01-08T00:00:00Z"), // 7 days from mocked date
  });
});

test("sets JWT with correct configuration", async () => {
  const mockJwtInstance = {
    setProtectedHeader: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue("mocked-jwt-token"),
  };

  const { SignJWT } = await import("jose");
  vi.mocked(SignJWT).mockImplementation(() => mockJwtInstance);

  await createSession("user123", "test@example.com");

  expect(mockJwtInstance.setProtectedHeader).toHaveBeenCalledWith({
    alg: "HS256",
  });
  expect(mockJwtInstance.setExpirationTime).toHaveBeenCalledWith("7d");
  expect(mockJwtInstance.setIssuedAt).toHaveBeenCalled();
  expect(mockJwtInstance.sign).toHaveBeenCalledWith(
    new TextEncoder().encode("development-secret-key")
  );
});

test("sets cookie with correct configuration in development", async () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";

  const { cookies } = await import("next/headers");
  const mockCookies = vi.mocked(cookies);
  const mockCookieStore = { set: vi.fn() };
  mockCookies.mockResolvedValue(mockCookieStore);

  await createSession("user123", "test@example.com");

  expect(mockCookieStore.set).toHaveBeenCalledWith(
    "auth-token",
    "mocked-jwt-token",
    {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      expires: new Date("2024-01-08T00:00:00Z"),
      path: "/",
    }
  );

  process.env.NODE_ENV = originalEnv;
});

test("sets cookie with correct configuration in production", async () => {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  await createSession("user123", "test@example.com");

  expect(mockCookieStore.set).toHaveBeenCalledWith(
    "auth-token",
    "mocked-jwt-token",
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      expires: new Date("2024-01-08T00:00:00Z"),
      path: "/",
    }
  );

  process.env.NODE_ENV = originalEnv;
});

test("uses custom JWT secret from environment", async () => {
  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "custom-secret-key";

  const mockJwtInstance = {
    setProtectedHeader: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue("mocked-jwt-token"),
  };

  const { SignJWT } = await import("jose");
  vi.mocked(SignJWT).mockImplementation(() => mockJwtInstance);

  await createSession("user123", "test@example.com");

  expect(mockJwtInstance.sign).toHaveBeenCalledWith(
    new TextEncoder().encode("custom-secret-key")
  );

  process.env.JWT_SECRET = originalSecret;
});

test("handles email with special characters", async () => {
  const { SignJWT } = await import("jose");
  const SignJWTMock = vi.mocked(SignJWT);

  await createSession("user123", "test+tag@example.co.uk");

  expect(SignJWTMock).toHaveBeenCalledWith({
    userId: "user123",
    email: "test+tag@example.co.uk",
    expiresAt: new Date("2024-01-08T00:00:00Z"),
  });
});

test("calculates expiration date correctly", async () => {
  vi.setSystemTime(new Date("2024-06-15T12:30:45Z"));

  const { SignJWT } = await import("jose");
  const SignJWTMock = vi.mocked(SignJWT);

  await createSession("user123", "test@example.com");

  expect(SignJWTMock).toHaveBeenCalledWith({
    userId: "user123",
    email: "test@example.com",
    expiresAt: new Date("2024-06-22T12:30:45Z"), // 7 days later
  });
});

// getSession tests
test("returns session payload when valid token exists", async () => {
  const mockPayload = {
    userId: "user123",
    email: "test@example.com",
    expiresAt: new Date("2024-01-08T00:00:00Z"),
  };

  const { cookies } = await import("next/headers");
  const { jwtVerify } = await import("jose");
  
  const mockCookies = vi.mocked(cookies);
  const mockJwtVerify = vi.mocked(jwtVerify);
  
  mockCookies.mockResolvedValue({
    set: vi.fn(),
    get: vi.fn().mockReturnValue({ value: "valid-jwt-token" }),
  });
  
  mockJwtVerify.mockResolvedValue({ payload: mockPayload });

  const result = await getSession();

  expect(result).toEqual(mockPayload);
  expect(mockJwtVerify).toHaveBeenCalledWith(
    "valid-jwt-token",
    new TextEncoder().encode("development-secret-key")
  );
});

test("returns null when no token exists in cookies", async () => {
  const { cookies } = await import("next/headers");
  const mockCookies = vi.mocked(cookies);
  
  mockCookies.mockResolvedValue({
    set: vi.fn(),
    get: vi.fn().mockReturnValue(undefined),
  });

  const result = await getSession();

  expect(result).toBeNull();
});

test("returns null when token value is undefined", async () => {
  const { cookies } = await import("next/headers");
  const mockCookies = vi.mocked(cookies);
  
  mockCookies.mockResolvedValue({
    set: vi.fn(),
    get: vi.fn().mockReturnValue({ value: undefined }),
  });

  const result = await getSession();

  expect(result).toBeNull();
});

test("returns null when JWT verification fails", async () => {
  const { cookies } = await import("next/headers");
  const { jwtVerify } = await import("jose");
  
  const mockCookies = vi.mocked(cookies);
  const mockJwtVerify = vi.mocked(jwtVerify);
  
  mockCookies.mockResolvedValue({
    set: vi.fn(),
    get: vi.fn().mockReturnValue({ value: "invalid-jwt-token" }),
  });
  
  mockJwtVerify.mockRejectedValue(new Error("Invalid token"));

  const result = await getSession();

  expect(result).toBeNull();
});

test("uses custom JWT secret when verifying token", async () => {
  const originalSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = "custom-secret-key";

  const mockPayload = {
    userId: "user123",
    email: "test@example.com",
    expiresAt: new Date("2024-01-08T00:00:00Z"),
  };

  const { cookies } = await import("next/headers");
  const { jwtVerify } = await import("jose");
  
  const mockCookies = vi.mocked(cookies);
  const mockJwtVerify = vi.mocked(jwtVerify);
  
  mockCookies.mockResolvedValue({
    set: vi.fn(),
    get: vi.fn().mockReturnValue({ value: "valid-jwt-token" }),
  });
  
  mockJwtVerify.mockResolvedValue({ payload: mockPayload });

  await getSession();

  expect(mockJwtVerify).toHaveBeenCalledWith(
    "valid-jwt-token",
    new TextEncoder().encode("custom-secret-key")
  );

  process.env.JWT_SECRET = originalSecret;
});

test("handles different JWT verification error types", async () => {
  const { cookies } = await import("next/headers");
  const { jwtVerify } = await import("jose");
  
  const mockCookies = vi.mocked(cookies);
  const mockJwtVerify = vi.mocked(jwtVerify);
  
  mockCookies.mockResolvedValue({
    set: vi.fn(),
    get: vi.fn().mockReturnValue({ value: "expired-token" }),
  });

  // Test with different error types
  const errorTypes = [
    new Error("Token expired"),
    new Error("Invalid signature"),
    new Error("Malformed token"),
    "String error",
    null,
  ];

  for (const error of errorTypes) {
    mockJwtVerify.mockRejectedValue(error);
    const result = await getSession();
    expect(result).toBeNull();
  }
});