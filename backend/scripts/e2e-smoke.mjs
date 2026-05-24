import { PrismaClient } from "@prisma/client";
import { io } from "socket.io-client";

const baseUrl = process.env.E2E_BASE_URL ?? "http://localhost:5000";
const prisma = new PrismaClient();

const checks = [];

const record = (name, details = "ok") => {
  checks.push({ name, details });
  console.log(`PASS ${name}: ${details}`);
};

const fail = (name, message) => {
  throw new Error(`${name}: ${message}`);
};

const request = async (method, path, { token, body, expectedStatus } = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (expectedStatus && response.status !== expectedStatus) {
    fail(`${method} ${path}`, `expected ${expectedStatus}, got ${response.status}: ${text}`);
  }

  if (!expectedStatus && !response.ok) {
    fail(`${method} ${path}`, `got ${response.status}: ${text}`);
  }

  return { response, payload };
};

const login = async (role, phone, otp) => {
  const { payload } = await request("POST", "/api/auth/login", {
    body: { role, phone, otp },
    expectedStatus: 200
  });

  if (!payload?.data?.token) {
    fail(`${role} login`, "missing token");
  }

  if (!payload?.data?.user?.id || payload.data.user.role !== role || payload.data.user.phone !== phone) {
    fail(`${role} login`, "missing or incorrect user info");
  }

  record(`${role.toLowerCase()} login`, `user ${payload.data.user.id}`);
  return payload.data;
};

const waitForSocketEvent = (socket, eventName, action) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(eventName, onEvent);
      reject(new Error(`Timed out waiting for ${eventName}`));
    }, 5000);

    const onEvent = (payload) => {
      clearTimeout(timer);
      resolve(payload);
    };

    socket.once(eventName, onEvent);
    Promise.resolve(action()).catch((error) => {
      clearTimeout(timer);
      socket.off(eventName, onEvent);
      reject(error);
    });
  });

try {
  const health = await request("GET", "/health", { expectedStatus: 200 });
  if (health.payload?.data?.status !== "ok") {
    fail("health", "unexpected health payload");
  }
  record("backend health");

  const invalidOtp = await request("POST", "/api/auth/login", {
    body: { role: "WORKER", phone: "9876543210", otp: "0000" },
    expectedStatus: 401
  });
  if (invalidOtp.payload?.success !== false) {
    fail("invalid OTP", "expected failure response");
  }
  record("invalid OTP rejected");

  const worker = await login("WORKER", "9876543210", "1234");
  const employer = await login("EMPLOYER", "9999999999", "1234");

  const category = await prisma.category.findFirst({
    include: { subcategories: { take: 1 } },
    orderBy: { createdAt: "asc" }
  });

  if (!category?.subcategories?.[0]) {
    fail("category seed data", "no category with subcategory found; run prisma seed");
  }

  const title = `E2E Sample Job ${Date.now()}`;
  const createJob = await request("POST", "/api/employer/jobs", {
    token: employer.token,
    body: {
      categoryId: category.id,
      subcategoryId: category.subcategories[0].id,
      title,
      description: "End-to-end smoke test sample job for Juara WorkBridge.",
      location: "Chennai",
      state: "Tamil Nadu",
      wage: 850,
      wageType: "daily",
      jobType: "full-time"
    },
    expectedStatus: 201
  });
  const job = createJob.payload.data;
  record("employer create job", job.id);

  const jobs = await request("GET", "/api/worker/jobs", {
    token: worker.token,
    expectedStatus: 200
  });
  const browsedJob = jobs.payload.data.find((item) => item.id === job.id);
  if (!browsedJob) {
    fail("worker browse jobs", "new job not returned");
  }
  if (Object.hasOwn(browsedJob.employer ?? {}, "employerPhone")) {
    fail("phone hidden before apply", "employerPhone should not be present");
  }
  record("worker browse jobs", `${jobs.payload.data.length} jobs`);

  const apply = await request("POST", `/api/worker/jobs/${job.id}/apply`, {
    token: worker.token,
    expectedStatus: 201
  });
  const application = apply.payload.data;
  record("worker apply to job", application.id);

  const requestPhone = await request("POST", `/api/worker/jobs/${job.id}/request-phone`, {
    token: worker.token,
    expectedStatus: 200
  });
  if (requestPhone.payload.data.phoneRequestStatus !== "PENDING") {
    fail("worker request employer phone", "request was not marked pending");
  }
  record("worker request employer phone", requestPhone.payload.data.phoneRequestStatus);

  const beforeApproval = await request("GET", `/api/worker/jobs/${job.id}`, {
    token: worker.token,
    expectedStatus: 200
  });
  if (Object.hasOwn(beforeApproval.payload.data.employer ?? {}, "employerPhone")) {
    fail("employer phone hidden before approval", "employerPhone should not be present");
  }
  record("employer phone hidden before approval");

  const socket = io(baseUrl, {
    auth: { token: worker.token },
    transports: ["websocket", "polling"],
    timeout: 5000
  });

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Socket connection timed out")), 5000);
    socket.once("connect", () => {
      clearTimeout(timer);
      resolve();
    });
    socket.once("connect_error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
  record("socket connected", socket.id);

  const approvedEvent = await waitForSocketEvent(socket, "phone_request.approved", async () => {
    const approval = await request("POST", `/api/employer/phone-requests/${application.id}/approve`, {
      token: employer.token,
      expectedStatus: 200
    });
    if (approval.payload.data.phoneRequestStatus !== "APPROVED") {
      fail("employer approve phone request", "request was not approved");
    }
    record("employer approve phone request", approval.payload.data.id);
  });

  if (approvedEvent.applicationId !== application.id || approvedEvent.employerPhone !== "9999999999") {
    fail("socket phone_request.approved", "event payload did not match approved request");
  }
  record("socket phone_request.approved", approvedEvent.applicationId);
  socket.disconnect();

  const afterApproval = await request("GET", `/api/worker/jobs/${job.id}`, {
    token: worker.token,
    expectedStatus: 200
  });
  if (afterApproval.payload.data.employer?.employerPhone !== "9999999999") {
    fail("employer phone visible after approval", "employerPhone was not returned");
  }
  record("employer phone visible after approval", afterApproval.payload.data.employer.employerPhone);

  const notifications = await request("GET", "/api/notifications", {
    token: worker.token,
    expectedStatus: 200
  });
  const notification = notifications.payload.data.find(
    (item) =>
      item.type === "PHONE_REQUEST_APPROVED" &&
      item.metadata?.applicationId === application.id
  );
  if (!notification) {
    fail("notifications list", "approval notification not found");
  }
  record("notifications list", notification.id);

  const readOne = await request("POST", `/api/notifications/${notification.id}/read`, {
    token: worker.token,
    expectedStatus: 200
  });
  if (!readOne.payload.data.readAt) {
    fail("notification mark read", "readAt was not set");
  }
  record("notification mark read", readOne.payload.data.id);

  const readAll = await request("POST", "/api/notifications/read-all", {
    token: worker.token,
    expectedStatus: 200
  });
  if (!Array.isArray(readAll.payload.data)) {
    fail("notifications read all", "expected notification array");
  }
  record("notifications read all", `${readAll.payload.data.length} notifications`);

  console.log(JSON.stringify({ success: true, checks }, null, 2));
} finally {
  await prisma.$disconnect();
}
