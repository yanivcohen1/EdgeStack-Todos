import { config as loadEnv } from "dotenv";
import "reflect-metadata";
loadEnv();
loadEnv({ path: ".env.development", override: false });
loadEnv({ path: ".env.local", override: false });
import bcrypt from "bcryptjs";
import { MikroORM } from "@mikro-orm/mongodb";
import config from "../mikro-orm.config";
import { User } from "../src/lib/db/entities/User";
import { Todo } from "../src/lib/db/entities/Todo";
import { RefreshToken } from "../src/lib/db/entities/RefreshToken";
import { TODO_STATUSES } from "../src/types/todo";

const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL ?? "demo@todo.dev").toLowerCase();
const ADMIN_NAME = process.env.SEED_ADMIN_NAME ?? process.env.SEED_DEMO_USER_NAME ?? "Demo Admin";
const USER_EMAIL = (process.env.SEED_USER_EMAIL ?? "user1@todo.dev").toLowerCase();
const USER_NAME = process.env.SEED_USER_NAME ?? "Workspace User";

const demoTodos = [
  {
    title: "Wire up MikroORM + Mongo",
    description: "Ensure database connection + migrations are configured.",
    status: TODO_STATUSES[1],
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
    duration: 2, // 2 hours
    tags: ["infra", "orm"]
  },
  {
    title: "Implement JWT auth",
    description: "Short-lived access tokens paired with refresh rotation.",
    status: TODO_STATUSES[0],
    duration: 3, // 3 hours
    tags: ["auth"]
  },
  {
    title: "Polish dashboard UI",
    description: "Filters, dialogs, and optimistic interactions.",
    status: TODO_STATUSES[2],
    duration: 4, // 4 hours
    tags: ["ui"]
  },
  {
    title: "Setup CI/CD Pipeline",
    description: "Configure GitHub Actions for build and test automation.",
    status: TODO_STATUSES[0],
    duration: 5, // 5 hours
    tags: ["devops"]
  },
  {
    title: "Write E2E Tests",
    description: "Cover critical user flows with Cypress.",
    status: TODO_STATUSES[1],
    duration: 8, // 8 hours
    tags: ["testing"]
  }
];

async function seed() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  await em.nativeDelete(RefreshToken, {});
  await em.nativeDelete(Todo, {});
  await em.nativeDelete(User, {});

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? process.env.SEED_DEMO_PASSWORD ?? "ChangeMe123!";
  const userPassword = process.env.SEED_USER_PASSWORD ?? adminPassword;
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
  const hashedUserPassword = await bcrypt.hash(userPassword, 10);

  const now = new Date();
  const adminUser = em.create(User, {
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    password: hashedAdminPassword,
    createdAt: now,
    updatedAt: now,
    role: "admin"
  });
  const regularUser = em.create(User, {
    email: USER_EMAIL,
    name: USER_NAME,
    password: hashedUserPassword,
    createdAt: now,
    updatedAt: now,
    role: "user"
  });
  await em.persistAndFlush([adminUser, regularUser]);

  demoTodos.forEach((todo) => {
    // const timestamps = { createdAt: new Date(), updatedAt: new Date() };
    const entity = em.create(Todo, { ...todo, owner: adminUser, createdAt: new Date(), updatedAt: new Date() });
    em.persist(entity);
  });
  await em.flush();

  await orm.close(true);
  console.log(`Seeded admin account ${ADMIN_EMAIL} with password ${adminPassword}`);
  console.log(`Seeded user account ${USER_EMAIL} with password ${userPassword}`);
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
