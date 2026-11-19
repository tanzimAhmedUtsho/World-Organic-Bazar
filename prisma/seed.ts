import { PrismaClient, type Prisma } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const permissions = [
  ["dashboard.read", "View dashboard"],
  ["products.read", "View products"], ["products.manage", "Manage products"],
  ["categories.read", "View categories"], ["categories.manage", "Manage categories"],
  ["orders.read", "View orders"], ["orders.manage", "Manage orders"],
  ["customers.read", "View customers"], ["inventory.read", "View inventory"], ["inventory.manage", "Manage inventory"],
  ["content.manage", "Manage stories and blog"], ["homepage.manage", "Manage homepage"],
  ["coupons.manage", "Manage coupons"], ["reviews.manage", "Moderate reviews"],
  ["shipping.manage", "Manage shipping"], ["settings.manage", "Manage settings"],
  ["users.manage", "Manage admin users"], ["reports.read", "View and export reports"],
] as const;

const rolePermissions: Record<string, string[]> = {
  SUPER_ADMIN: permissions.map(([key]) => key),
  ADMIN: permissions.filter(([key]) => key !== "users.manage").map(([key]) => key),
  ORDER_MANAGER: ["dashboard.read", "orders.read", "orders.manage", "customers.read", "reports.read"],
  PRODUCT_MANAGER: ["dashboard.read", "products.read", "products.manage", "categories.read", "categories.manage", "inventory.read", "inventory.manage", "reports.read"],
  CONTENT_MANAGER: ["dashboard.read", "content.manage", "homepage.manage", "reviews.manage"],
};

const categorySeed = [
  { nameEn: "Date palm jaggery", nameBn: "????? ??????? ????", slug: "date-palm-jaggery", description: "????? ?????????? ??????? ????? ????; ???????? ??? ?????? ? ??? ????? ?????", imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85" },
  { nameEn: "Honey & natural sweets", nameBn: "??? ? ????????? ??????", slug: "honey-natural-sweets", description: "????????? ??????? ??????? ?????? ???? ???????? ??? ????? ?????", imageUrl: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=900&q=85" },
  { nameEn: "Rice & lentils", nameBn: "???? ??? ? ???", slug: "rice-lentils", description: "????? ??? ???? ?????????? ??? ? ???? ????? ?????", imageUrl: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=900&q=85" },
  { nameEn: "Mustard oil", nameBn: "???????? ?????? ???", slug: "mustard-oil", description: "????? ????? ??????, ???????????????? ? ???????? ???? ???????? ??? ????? ?????", imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=85" },
  { nameEn: "Ghee & dairy", nameBn: "?? ? ???????? ????", slug: "ghee-dairy", description: "?????????? ???????? ?????? ????? ?????", imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=85" },
  { nameEn: "Local spices", nameBn: "???? ????", slug: "local-spices", description: "?????????? ??????? ?????? ????? ????? ?????", imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=85" },
  { nameEn: "Dried foods & nuts", nameBn: "????? ????? ? ?????", slug: "dried-foods-nuts", description: "?????????? ???? ????? ????? ??? ?????? ????? ?????", imageUrl: "https://images.unsplash.com/photo-1505576399274-565b52d4ac71?auto=format&fit=crop&w=900&q=85" },
  { nameEn: "More from Bangladesh", nameBn: "?????????? ??? ?????", slug: "more-from-bangladesh", description: "?????????? ???? ????????? ????? ? ?????? ????? ?????", imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85" },
];

const productSeed = [
  { nameEn: "Date palm patali jaggery", nameBn: "????? ??????? ?????? ????", slug: "date-palm-patali-gur", category: "date-palm-jaggery", description: "????? ????? ???????? ??? ??????, ?????, ??????? ? ???????? ???? ????? ?????", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=85", variants: [{ label: "??? ?????", grams: 500, price: 360 }, { label: "? ????", grams: 1000, price: 690 }] },
  { nameEn: "Liquid date palm jaggery", nameBn: "???? ??????? ????", slug: "liquid-date-palm-gur", category: "date-palm-jaggery", description: "????? ????? ???????? ??? ??????, ?????, ??????? ? ???????? ???? ????? ?????", image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1000&q=85", variants: [{ label: "??? ?????", grams: 250, price: 220 }, { label: "??? ?????", grams: 500, price: 410 }] },
  { nameEn: "Sundarbans wildflower honey", nameBn: "?????????? ???? ????? ???", slug: "sundarbans-honey", category: "honey-natural-sweets", description: "????? ????? ???, ???????????? ? ?????? ???? ???????? ??? ????? ?????", image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1000&q=85", variants: [{ label: "??? ?????", grams: 350, price: 520 }, { label: "??? ?????", grams: 700, price: 980 }] },
  { nameEn: "Cold-pressed mustard oil", nameBn: "???????? ?????? ???", slug: "mustard-oil", category: "mustard-oil", description: "????? ????? ??????, ???????????????? ? ???????? ???? ???????? ??? ????? ?????", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1000&q=85", variants: [{ label: "??? ????", grams: 500, price: 290 }, { label: "? ?????", grams: 1000, price: 540 }] },
  { nameEn: "Farm-style ghee", nameBn: "????? ?????? ??", slug: "farm-style-ghee", category: "ghee-dairy", description: "????? ????? ?????, ???????? ????? ??????????? ? ???????? ???? ????? ?????", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1000&q=85", variants: [{ label: "??? ?????", grams: 250, price: 420 }, { label: "??? ?????", grams: 500, price: 790 }] },
  { nameEn: "Traditional aromatic rice", nameBn: "?????????? ??????? ???", slug: "traditional-aromatic-rice", category: "rice-lentils", description: "????? ????? ????? ???, ??? ? ???????? ???? ???????? ??? ????? ?????", image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=1000&q=85", variants: [{ label: "? ????", grams: 1000, price: 240 }, { label: "? ????", grams: 2000, price: 450 }] },
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword || adminPassword.length < 12) {
    throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD with at least 12 characters before seeding.");
  }

  for (const [key, label] of permissions) {
    await prisma.adminPermission.upsert({ where: { key }, create: { key, label }, update: { label } });
  }
  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin", ADMIN: "Admin", ORDER_MANAGER: "Order Manager", PRODUCT_MANAGER: "Product Manager", CONTENT_MANAGER: "Content Manager",
  };
  for (const [name, label] of Object.entries(roleLabels)) {
    const role = await prisma.adminRole.upsert({ where: { name }, create: { name, label }, update: { label } });
    for (const key of rolePermissions[name]) {
      const permission = await prisma.adminPermission.findUniqueOrThrow({ where: { key } });
      await prisma.adminRolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        create: { roleId: role.id, permissionId: permission.id },
        update: {},
      });
    }
  }

  const passwordHash = await hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    create: { email: adminEmail, name: process.env.ADMIN_NAME || "World Organic Bazar Admin", passwordHash, active: true },
    update: { name: process.env.ADMIN_NAME || "World Organic Bazar Admin", passwordHash, active: true },
  });
  const superAdmin = await prisma.adminRole.findUniqueOrThrow({ where: { name: "SUPER_ADMIN" } });
  await prisma.userAdminRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: superAdmin.id } },
    create: { userId: admin.id, roleId: superAdmin.id },
    update: {},
  });

  for (const [index, item] of categorySeed.entries()) {
    await prisma.category.upsert({
      where: { slug: item.slug },
      create: { ...item, displayOrder: index },
      update: { ...item, displayOrder: index },
    });
  }

  for (const [index, item] of productSeed.entries()) {
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: item.category } });
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      create: {
        nameEn: item.nameEn,
        nameBn: item.nameBn,
        slug: item.slug,
        description: item.description,
        shortDescription: "Development sample — verify product and sourcing information before publishing.",
        status: "ACTIVE",
        featured: index < 4,
        bestSeller: index < 3,
        sortPrice: Math.min(...item.variants.map((variant) => variant.price)),
        categories: { create: { categoryId: category.id } },
        images: { create: { url: item.image, alt: `${item.nameEn} — sample catalog image`, featured: true } },
      },
      update: { nameEn: item.nameEn, nameBn: item.nameBn, description: item.description, status: "ACTIVE", featured: index < 4, bestSeller: index < 3, sortPrice: Math.min(...item.variants.map((variant) => variant.price)) },
    });
    const categoryLink = await prisma.productCategory.findUnique({ where: { productId_categoryId: { productId: product.id, categoryId: category.id } } });
    if (!categoryLink) await prisma.productCategory.create({ data: { productId: product.id, categoryId: category.id } });
    const image = await prisma.productImage.findFirst({ where: { productId: product.id, url: item.image } });
    if (!image) await prisma.productImage.create({ data: { productId: product.id, url: item.image, alt: `${item.nameEn} — sample catalog image`, featured: true } });
    for (const [variantIndex, variant] of item.variants.entries()) {
      await prisma.productVariant.upsert({
        where: { sku: `${item.slug.toUpperCase()}-${variant.grams}` },
        create: {
          productId: product.id,
          sku: `${item.slug.toUpperCase()}-${variant.grams}`,
          label: variant.label,
          weightGrams: variant.grams,
          price: variant.price,
          compareAtPrice: variantIndex === 1 ? variant.price + 80 : undefined,
          stockQuantity: 20,
          lowStockThreshold: 5,
        },
        update: { productId: product.id, label: variant.label, weightGrams: variant.grams, price: variant.price },
      });
    }
  }

  const banner = {
    key: "hero",
    headlineEn: "Bring good food back to its roots.",
    headlineBn: "????? ??????? ????? ????? ??????",
    description: "A thoughtfully curated collection of Bangladesh's traditional foods. Sample launch content; replace with verified brand copy.",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=90",
    primaryLabel: "????? ???? ?????",
    primaryUrl: "/shop",
    secondaryLabel: "?????? ????",
    secondaryUrl: "/our-story",
  };
  await prisma.banner.upsert({ where: { key: "hero" }, create: banner, update: banner });
  const sections: Array<[string, string, Prisma.InputJsonValue]> = [
    ["announcement", "?????", { message: "?????? ?????????? ?????, ????? ????? ???", demo: true }],
    ["why-choose-us", "??? ?????? ???? ?????", { cards: ["????? ????? ??? ????", "?????? ?????? ?????", "??????? ????? ???", "???????? ??? ???????? ???????"], demo: true }],
    ["seasonal", "Seasonal collection", { title: "Winter harvest", visible: false, demo: true }],
    ["our-story", "?????? ????", { founders: ["?????? ????? ??????", "????? ????? ??????"], demo: true }],
    ["footer", "Footer", { email: "", phone: "", address: "", social: {}, demo: true }],
  ];
  for (const [key, title, content] of sections) {
    await prisma.homepageSection.upsert({ where: { key }, create: { key, title, content }, update: { title, content } });
  }

  const videoCategory = await prisma.videoCategory.upsert({ where: { slug: "producer-stories" }, create: { name: "উৎপাদকদের গল্প", slug: "producer-stories" }, update: { name: "উৎপাদকদের গল্প" } });
  await prisma.video.upsert({
    where: { slug: "taste-of-tradition-demo" },
    create: { title: "Taste of tradition (demo)", slug: "taste-of-tradition-demo", description: "Unpublished sample record. Add a real farmer or producer story and approved media before publishing.", videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", categoryId: videoCategory.id, published: false },
    update: { title: "Taste of tradition (demo)", published: false },
  });
  const blogCategory = await prisma.blogCategory.upsert({ where: { slug: "food-stories" }, create: { name: "Food stories", slug: "food-stories" }, update: { name: "Food stories" } });
  await prisma.blogPost.upsert({
    where: { slug: "sample-food-story" },
    create: { titleEn: "A story from the Bangladeshi pantry (demo)", titleBn: "?????? ??????? ???? (?????)", slug: "sample-food-story", excerpt: "Unpublished sample content.", content: "Draft placeholder. Replace with an approved, fact-checked story before publication.", status: "DRAFT", categoryId: blogCategory.id },
    update: { titleEn: "A story from the Bangladeshi pantry (demo)", status: "DRAFT" },
  });
  await prisma.coupon.upsert({
    where: { code: "DEMO10" },
    create: { code: "DEMO10", discountType: "PERCENTAGE", value: 10, minimumOrderAmount: 500, maximumDiscount: 300, active: false },
    update: { active: false },
  });

  if (process.env.SEED_DEMO_DATA === "true") {
    for (const zone of [
      { district: "Dhaka", deliveryFee: 70, estimatedDays: "1–2 days", freeThreshold: 2500 },
      { district: "Chattogram", deliveryFee: 130, estimatedDays: "2–4 days", freeThreshold: null },
    ]) {
      await prisma.shippingZone.upsert({
        where: { district: zone.district },
        create: { ...zone, demo: true },
        update: { ...zone, demo: true, active: true },
      });
    }
  }

  const firstProduct = await prisma.product.findUniqueOrThrow({ where: { slug: productSeed[0].slug } });
  const demoReview = await prisma.review.findFirst({ where: { productId: firstProduct.id, demo: true } });
  if (!demoReview) {
    await prisma.review.create({ data: { productId: firstProduct.id, customerName: "Sample customer (demo)", rating: 5, content: "Demo review — replace with verified customer feedback before publication.", status: "PENDING", demo: true } });
  }

  console.info(`Seeded ${categorySeed.length} sample categories, ${productSeed.length} sample products, CMS records, permissions, and Super Admin ${adminEmail}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
