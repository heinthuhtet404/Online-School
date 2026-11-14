import { buildCollection, buildProperty } from "@firecms/core";

export const lessonsCollection = buildCollection({
  name: "Lessons",
  singularName: "Lesson",
  path: "lessons",
  icon: "Book",
  id: "id", // ⭐ Top-level မှာ ထည့်ပါ
  properties: {
    title: buildProperty({
      name: "Title",
      dataType: "string",
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
      validation: { required: true },
    }),
    subject: buildProperty({
      name: "Subject",
      dataType: "string",
      enumValues: {
        myanmar: "မြန်မာစာ",
        english: "English",
        math: "Math",
        science: "Science",
        history: "History",
        geography: "Geography",
      },
      validation: { required: true },
    }),
    youtubeUrl: buildProperty({
      name: "YouTube URL",
      dataType: "string",
      description: "Unlisted YouTube video URL",
    }),
    content: buildProperty({
      name: "Content",
      dataType: "string",
      multiline: true,
    }),
    order: buildProperty({
      name: "Order",
      dataType: "number",
    }),
    isPremium: buildProperty({
      name: "Premium",
      dataType: "boolean",
    }),
    published: buildProperty({
      name: "Published",
      dataType: "boolean",
      defaultValue: true,
    }),
    teacherId: buildProperty({
      name: "Teacher ID",
      dataType: "string",
    }),
    createdAt: buildProperty({
      name: "Created At",
      dataType: "date",
      autoValue: "on_create",
    }),
  },
});