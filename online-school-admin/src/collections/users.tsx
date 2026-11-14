import { buildCollection, buildProperty } from "@firecms/core";

export const usersCollection = buildCollection({
  name: "Users",
  singularName: "User",
  path: "users",
  icon: "Person",
  id: "id", // ⭐ Top-level မှာ ထည့်ပါ
  properties: {
    name: buildProperty({
      name: "Name",
      dataType: "string",
      validation: { required: true },
    }),
    email: buildProperty({
      name: "Email",
      dataType: "string",
      email: true,
      validation: { required: true },
    }),
    role: buildProperty({
      name: "Role",
      dataType: "string",
      enumValues: {
        student: "Student",
        teacher: "Teacher",
        admin: "Admin",
      },
      validation: { required: true },
    }),
    grade: buildProperty({
      name: "Grade",
      dataType: "string",
      enumValues: {
        kg: "KG",
        g1: "Grade 1",
        g2: "Grade 2",
        g3: "Grade 3",
        g4: "Grade 4",
        g5: "Grade 5",
        g6: "Grade 6",
      },
    }),
    phone: buildProperty({
      name: "Phone",
      dataType: "string",
    }),
    isPremium: buildProperty({
      name: "Premium",
      dataType: "boolean",
    }),
    isActive: buildProperty({
      name: "Active",
      dataType: "boolean",
      defaultValue: true,
    }),
    createdAt: buildProperty({
      name: "Created At",
      dataType: "date",
      autoValue: "on_create",
    }),
  },
});