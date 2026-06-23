import { expect, it } from "vitest";
import { describeIntegration, prisma } from "./helpers";

describeIntegration("database schema", () => {
  it("keeps application tables in solidra schema", async () => {
    const schemas = await prisma.$queryRaw<Array<{ schema_name: string }>>`select schema_name from information_schema.schemata where schema_name = 'solidra'`;
    expect(schemas).toHaveLength(1);

    const publicTables = await prisma.$queryRaw<Array<{ table_name: string }>>`select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE'`;
    expect(publicTables).toHaveLength(0);

    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`select table_name from information_schema.tables where table_schema = 'solidra' and table_type = 'BASE TABLE'`;
    const tableNames = new Set(tables.map((table) => table.table_name));
    ["users", "sessions", "pages", "page_revisions", "page_revision_translations", "page_sections", "investor_documents", "career_applications", "audit_logs"].forEach((name) => expect(tableNames.has(name)).toBe(true));
  });

  it("uses snake_case columns for mapped fields", async () => {
    const columns = await prisma.$queryRaw<Array<{ table_name: string; column_name: string }>>`select table_name, column_name from information_schema.columns where table_schema = 'solidra'`;
    const names = new Set(columns.map((column) => `${column.table_name}.${column.column_name}`));
    expect(names.has("contact_messages.created_at")).toBe(true);
    expect(names.has("career_applications.cv_storage_path")).toBe(true);
    expect(names.has("page_revisions.published_at")).toBe(true);
  });
});
