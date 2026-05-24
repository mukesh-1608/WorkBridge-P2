import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedData = [
  {
    name: "Construction",
    subcategories: ["Mason", "Painter", "Helper", "Electrician"]
  },
  {
    name: "Manufacturing",
    subcategories: ["Machine Operator", "Packer", "Quality Checker"]
  },
  {
    name: "Hospitality",
    subcategories: ["Housekeeping", "Kitchen Helper", "Cleaner"]
  },
  {
    name: "Logistics",
    subcategories: ["Loader", "Driver", "Warehouse Assistant"]
  }
];

async function main() {
  for (const category of seedData) {
    const createdCategory = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: { name: category.name }
    });

    for (const subcategory of category.subcategories) {
      await prisma.subcategory.upsert({
        where: {
          categoryId_name: {
            categoryId: createdCategory.id,
            name: subcategory
          }
        },
        update: {},
        create: {
          categoryId: createdCategory.id,
          name: subcategory
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
