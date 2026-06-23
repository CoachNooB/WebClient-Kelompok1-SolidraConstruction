import {describe,expect,it} from "vitest";
import {Prisma} from "@/generated/prisma/client";
import {createStaffAccountErrorResponse} from "@/lib/auth/staff-create";

describe("staff account creation errors",()=>{
  it("reports duplicate staff emails clearly",()=>{
    const error=new Prisma.PrismaClientKnownRequestError("Unique constraint failed",{code:"P2002",clientVersion:"test",meta:{target:["email"]}});

    expect(createStaffAccountErrorResponse(error)).toEqual({error:"A staff account with this email already exists",status:409});
  });

  it("uses a generic conflict for other creation failures",()=>{
    expect(createStaffAccountErrorResponse(new Error("database unavailable"))).toEqual({error:"Unable to create staff account",status:409});
  });
});
