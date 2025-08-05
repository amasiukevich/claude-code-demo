import { renderHook, act, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAuth } from "../use-auth";
import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

// Mock all dependencies
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/lib/anon-work-tracker", () => ({
  getAnonWorkData: vi.fn(),
  clearAnonWork: vi.fn(),
}));

vi.mock("@/actions/get-projects", () => ({
  getProjects: vi.fn(),
}));

vi.mock("@/actions/create-project", () => ({
  createProject: vi.fn(),
}));

const mockPush = vi.fn();
const mockSignInAction = vi.mocked(signInAction);
const mockSignUpAction = vi.mocked(signUpAction);
const mockGetAnonWorkData = vi.mocked(getAnonWorkData);
const mockClearAnonWork = vi.mocked(clearAnonWork);
const mockGetProjects = vi.mocked(getProjects);
const mockCreateProject = vi.mocked(createProject);
const mockUseRouter = vi.mocked(useRouter);

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should return initial loading state as false", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
    });

    it("should provide signIn and signUp functions", () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.signIn).toBe("function");
      expect(typeof result.current.signUp).toBe("function");
    });
  });

  describe("signIn", () => {
    it("should set loading to true during sign in and false after completion", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockResolvedValue({ id: "new-project-id" });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      let signInPromise: Promise<any>;
      act(() => {
        signInPromise = result.current.signIn("test@example.com", "password");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await signInPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should call signInAction with correct parameters", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockResolvedValue({ id: "new-project-id" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(mockSignInAction).toHaveBeenCalledWith("test@example.com", "password123");
    });

    it("should return the result from signInAction", async () => {
      const mockResult = { success: false, error: "Invalid credentials" };
      mockSignInAction.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useAuth());

      const signInResult = await act(async () => {
        return await result.current.signIn("test@example.com", "wrongpassword");
      });

      expect(signInResult).toEqual(mockResult);
    });

    it("should handle post-sign-in flow when sign in is successful", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([{ id: "existing-project" }]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "password");
      });

      expect(mockPush).toHaveBeenCalledWith("/existing-project");
    });

    it("should not handle post-sign-in flow when sign in fails", async () => {
      mockSignInAction.mockResolvedValue({ success: false, error: "Invalid credentials" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn("test@example.com", "wrongpassword");
      });

      expect(mockGetAnonWorkData).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should set loading to false even if signIn throws an error", async () => {
      mockSignInAction.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signIn("test@example.com", "password");
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("signUp", () => {
    it("should set loading to true during sign up and false after completion", async () => {
      mockSignUpAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockResolvedValue({ id: "new-project-id" });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      let signUpPromise: Promise<any>;
      act(() => {
        signUpPromise = result.current.signUp("test@example.com", "password");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await signUpPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should call signUpAction with correct parameters", async () => {
      mockSignUpAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockResolvedValue({ id: "new-project-id" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("new@example.com", "password123");
      });

      expect(mockSignUpAction).toHaveBeenCalledWith("new@example.com", "password123");
    });

    it("should return the result from signUpAction", async () => {
      const mockResult = { success: false, error: "Email already registered" };
      mockSignUpAction.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useAuth());

      const signUpResult = await act(async () => {
        return await result.current.signUp("existing@example.com", "password");
      });

      expect(signUpResult).toEqual(mockResult);
    });

    it("should handle post-sign-in flow when sign up is successful", async () => {
      mockSignUpAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([{ id: "existing-project" }]);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("new@example.com", "password");
      });

      expect(mockPush).toHaveBeenCalledWith("/existing-project");
    });

    it("should not handle post-sign-in flow when sign up fails", async () => {
      mockSignUpAction.mockResolvedValue({ success: false, error: "Email already registered" });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp("existing@example.com", "password");
      });

      expect(mockGetAnonWorkData).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should set loading to false even if signUp throws an error", async () => {
      mockSignUpAction.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signUp("test@example.com", "password");
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("handlePostSignIn", () => {
    describe("with anonymous work", () => {
      it("should create project from anonymous work and navigate to it", async () => {
        const anonWorkData = {
          messages: [{ role: "user", content: "Create a button" }],
          fileSystemData: { "/": {}, "/Button.tsx": "export default function Button() {}" },
        };
        const createdProject = { id: "anon-project-id" };

        mockSignInAction.mockResolvedValue({ success: true });
        mockGetAnonWorkData.mockReturnValue(anonWorkData);
        mockCreateProject.mockResolvedValue(createdProject);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          await result.current.signIn("test@example.com", "password");
        });

        expect(mockCreateProject).toHaveBeenCalledWith({
          name: expect.stringMatching(/^Design from \d{1,2}:\d{2}:\d{2}/),
          messages: anonWorkData.messages,
          data: anonWorkData.fileSystemData,
        });
        expect(mockClearAnonWork).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/anon-project-id");
      });

      it("should not proceed to get existing projects when anonymous work exists", async () => {
        const anonWorkData = {
          messages: [{ role: "user", content: "Create a button" }],
          fileSystemData: { "/": {} },
        };

        mockSignInAction.mockResolvedValue({ success: true });
        mockGetAnonWorkData.mockReturnValue(anonWorkData);
        mockCreateProject.mockResolvedValue({ id: "anon-project-id" });

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          await result.current.signIn("test@example.com", "password");
        });

        expect(mockGetProjects).not.toHaveBeenCalled();
      });
    });

    describe("with existing projects", () => {
      it("should navigate to most recent project when projects exist", async () => {
        const existingProjects = [
          { id: "project-1", createdAt: "2024-01-02" },
          { id: "project-2", createdAt: "2024-01-01" },
        ];

        mockSignInAction.mockResolvedValue({ success: true });
        mockGetAnonWorkData.mockReturnValue(null);
        mockGetProjects.mockResolvedValue(existingProjects);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          await result.current.signIn("test@example.com", "password");
        });

        expect(mockPush).toHaveBeenCalledWith("/project-1");
        expect(mockCreateProject).not.toHaveBeenCalled();
      });
    });

    describe("with no existing projects", () => {
      it("should create a new project and navigate to it", async () => {
        const newProject = { id: "new-project-id" };

        mockSignInAction.mockResolvedValue({ success: true });
        mockGetAnonWorkData.mockReturnValue(null);
        mockGetProjects.mockResolvedValue([]);
        mockCreateProject.mockResolvedValue(newProject);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          await result.current.signIn("test@example.com", "password");
        });

        expect(mockCreateProject).toHaveBeenCalledWith({
          name: expect.stringMatching(/^New Design #\d+$/),
          messages: [],
          data: {},
        });
        expect(mockPush).toHaveBeenCalledWith("/new-project-id");
      });

      it("should generate random project names", async () => {
        mockSignInAction.mockResolvedValue({ success: true });
        mockGetAnonWorkData.mockReturnValue(null);
        mockGetProjects.mockResolvedValue([]);
        mockCreateProject.mockResolvedValue({ id: "new-project-id" });

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          await result.current.signIn("test@example.com", "password");
        });

        expect(mockCreateProject).toHaveBeenCalledWith({
          name: expect.stringMatching(/^New Design #\d+$/),
          messages: [],
          data: {},
        });
      });
    });

    describe("edge cases", () => {
      it("should handle empty anonymous messages array", async () => {
        mockSignInAction.mockResolvedValue({ success: true });
        mockGetAnonWorkData.mockReturnValue({ messages: [], fileSystemData: {} });
        mockGetProjects.mockResolvedValue([{ id: "existing-project" }]);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          await result.current.signIn("test@example.com", "password");
        });

        expect(mockGetProjects).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/existing-project");
      });

      it("should handle null anonymous work data", async () => {
        mockSignInAction.mockResolvedValue({ success: true });
        mockGetAnonWorkData.mockReturnValue(null);
        mockGetProjects.mockResolvedValue([{ id: "existing-project" }]);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
          await result.current.signIn("test@example.com", "password");
        });

        expect(mockGetProjects).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith("/existing-project");
      });

      it("should handle createProject failure by not clearing anonymous work", async () => {
        const anonWorkData = {
          messages: [{ role: "user", content: "Create a button" }],
          fileSystemData: { "/": {} },
        };

        mockSignInAction.mockResolvedValue({ success: true });
        mockGetAnonWorkData.mockReturnValue(anonWorkData);
        mockCreateProject.mockRejectedValue(new Error("Database error"));

        const { result } = renderHook(() => useAuth());

        await expect(
          act(async () => {
            await result.current.signIn("test@example.com", "password");
          })
        ).rejects.toThrow("Database error");

        expect(mockClearAnonWork).not.toHaveBeenCalled();
      });

      it("should handle getProjects failure gracefully", async () => {
        mockSignInAction.mockResolvedValue({ success: true });
        mockGetAnonWorkData.mockReturnValue(null);
        mockGetProjects.mockRejectedValue(new Error("Database error"));

        const { result } = renderHook(() => useAuth());

        await expect(
          act(async () => {
            await result.current.signIn("test@example.com", "password");
          })
        ).rejects.toThrow("Database error");
      });
    });
  });

  describe("loading state management", () => {
    it("should maintain loading state correctly with sequential calls", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockSignUpAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([{ 
        id: "project-1", 
        name: "Test Project", 
        createdAt: new Date(), 
        updatedAt: new Date() 
      }]);

      const { result } = renderHook(() => useAuth());

      // First call
      await act(async () => {
        await result.current.signIn("test1@example.com", "password");
      });

      expect(result.current.isLoading).toBe(false);

      // Second call
      await act(async () => {
        await result.current.signUp("new@example.com", "password");
      });

      expect(mockSignInAction).toHaveBeenCalledTimes(1);
      expect(mockSignUpAction).toHaveBeenCalledTimes(1);
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle rapid sequential authentication calls", async () => {
      mockSignInAction.mockResolvedValue({ success: false, error: "Invalid credentials" });
      mockSignUpAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([{ 
        id: "project-1", 
        name: "Test Project", 
        createdAt: new Date(), 
        updatedAt: new Date() 
      }]);

      const { result } = renderHook(() => useAuth());

      // Failed sign in
      await act(async () => {
        const result1 = await result.current.signIn("wrong@example.com", "wrongpassword");
        expect(result1.success).toBe(false);
      });

      expect(result.current.isLoading).toBe(false);

      // Successful sign up
      await act(async () => {
        const result2 = await result.current.signUp("new@example.com", "password");
        expect(result2.success).toBe(true);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});