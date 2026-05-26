import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedData = [
  {
    name: "Hospitality & Hotel Jobs",
    subcategories: ["Food Service", "Hotel Waiter", "Restaurant Server", "Banquet Server", "Room Service Staff", "Food Runner", "Busser / Table Cleaner", "Kitchen Staff", "Kitchen Helper", "Assistant Cook", "Cook", "Head Chef", "Tandoor Chef", "South Indian Cook", "North Indian Cook", "Chinese Cook", "Bakery Chef", "Pastry Chef", "Sweet Master (Mithai)", "Tea Master", "Juice Maker", "Cleaning & Maintenance", "Dishwasher", "Kitchen Cleaner", "Hotel Cleaner", "Laundry Staff", "Housekeeping Staff", "Front Desk & Support", "Receptionist", "Cashier", "Billing Assistant", "Store Keeper"]
  },
  {
    name: "Domestic Help Jobs",
    subcategories: ["Home Cleaning", "House Maid", "Full-Time Maid", "Part-Time Maid", "House Cleaner", "Cooking", "Home Cook", "Vegetarian Cook", "Non-Vegetarian Cook", "Elderly Meal Cook", "Childcare", "Babysitter", "Nanny", "Child Care Assistant", "Elder Care", "Elder Care Helper", "Patient Care Assistant", "Home Nurse Assistant", "Other Home Support", "Driver for Family", "Gardener", "Security Watchman", "Pet Care Helper"]
  },
  {
    name: "Construction Jobs",
    subcategories: ["Masonry", "Mason", "Mason Helper", "Tile Worker", "Concrete Worker", "Painting", "Painter", "Painting Helper", "Wall Finishing Worker", "Plumbing", "Plumber", "Plumbing Helper", "Electrical", "Electrician", "Electrician Helper", "Wiring Technician", "Carpentry", "Carpenter", "Carpenter Helper", "Furniture Installer", "Heavy Work", "General Labor", "Demolition Worker", "Scaffolding Worker", "Steel Fixer"]
  },
  {
    name: "Factory & Industrial Jobs",
    subcategories: ["Production", "Factory Helper", "Assembly Line Worker", "Machine Operator", "Machine Helper", "Packing", "Packing Worker", "Labeling Worker", "Quality Checker", "Warehouse", "Loading Worker", "Unloading Worker", "Warehouse Helper", "Inventory Assistant", "Manufacturing", "Welding Helper", "Fabrication Worker", "CNC Machine Helper"]
  },
  {
    name: "Security & Maintenance Jobs",
    subcategories: ["Security", "Security Guard", "Watchman", "Night Watchman", "Gatekeeper", "Cleaning", "Office Cleaner", "Building Cleaner", "Toilet Cleaner", "Janitor", "Facility Support", "Office Boy", "Pantry Boy", "Maintenance Helper", "Lift Operator"]
  },
  {
    name: "Transport & Delivery Jobs",
    subcategories: ["Driving", "Car Driver", "Taxi Driver", "Auto Driver", "Van Driver", "Truck Driver", "Delivery Driver", "Delivery", "Delivery Boy", "Courier Staff", "Parcel Delivery Helper", "Loading", "Loader", "Transport Helper", "Moving Assistant"]
  },
  {
    name: "Retail & Shop Jobs",
    subcategories: ["Store Staff", "Shop Helper", "Sales Assistant", "Floor Staff", "Store Attendant", "Billing", "Cash Counter Assistant", "Cashier", "Billing Executive", "Stock", "Warehouse Helper", "Shelf Stacker", "Inventory Helper"]
  },
  {
    name: "Healthcare Support Jobs",
    subcategories: ["Patient Support", "Hospital Attendant", "Ward Boy", "Ward Girl", "Patient Helper", "Clinical Support", "Lab Assistant Helper", "Pharmacy Assistant", "Elder & Home Health", "Home Care Assistant", "Patient Care Worker"]
  },
  {
    name: "Beauty & Personal Care Jobs",
    subcategories: ["Salon", "Hairdresser Assistant", "Barber", "Beautician", "Spa Helper", "Home Services", "Home Beauty Assistant", "Bridal Makeup Assistant"]
  },
  {
    name: "Agriculture & Outdoor Jobs",
    subcategories: ["Farming", "Farm Worker", "Harvester", "Plantation Worker", "Outdoor Maintenance", "Gardener", "Landscaping Worker"]
  },
  {
    name: "Event & Temporary Jobs",
    subcategories: ["Event Setup", "Decoration Helper", "Stage Setup Worker", "Cleaning Crew", "Hospitality Temporary", "Temporary Waiter", "Temporary Kitchen Helper"]
  }
];

async function main() {
  // Clear all users, which will cascade and remove jobs, applications, profiles, notifications, etc.
  await prisma.user.deleteMany();
  
  // Clear existing categories and subcategories
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();

  for (const category of seedData) {
    const createdCategory = await prisma.category.create({
      data: { name: category.name }
    });

    for (const subcategory of category.subcategories) {
      await prisma.subcategory.create({
        data: {
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
