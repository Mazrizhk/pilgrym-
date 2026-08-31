import { PrismaClient, Role, VerificationStatus, PackageType, PackageStatus, BookingStatus, SubscriptionPlan } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@pilgrym.lk" },
    update: {},
    create: {
      name: "Pilgrym Admin",
      email: "admin@pilgrym.lk",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  // Platform settings
  await prisma.platformSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      commissionRate: 0.05,
      payoutCycleDays: 14,
      platformName: "Pilgrym",
      contactEmail: "hello@pilgrym.lk",
    },
  });

  // Agency users
  const agencyPassword = await bcrypt.hash("agency123", 12);

  const agencyUser1 = await prisma.user.upsert({
    where: { email: "info@alamantravels.lk" },
    update: {},
    create: {
      name: "Al Aman Travels",
      email: "info@alamantravels.lk",
      password: agencyPassword,
      role: Role.AGENCY,
      phone: "+94 11 234 5678",
    },
  });

  const agencyUser2 = await prisma.user.upsert({
    where: { email: "info@noorpilgrimage.lk" },
    update: {},
    create: {
      name: "Noor Pilgrimage Services",
      email: "info@noorpilgrimage.lk",
      password: agencyPassword,
      role: Role.AGENCY,
      phone: "+94 81 234 5678",
    },
  });

  const agencyUser3 = await prisma.user.upsert({
    where: { email: "info@barakahtravels.lk" },
    update: {},
    create: {
      name: "Barakah Travel & Tours",
      email: "info@barakahtravels.lk",
      password: agencyPassword,
      role: Role.AGENCY,
      phone: "+94 91 234 5678",
    },
  });

  // Agency 1 - Al Aman Travels
  const agency1 = await prisma.agency.upsert({
    where: { userId: agencyUser1.id },
    update: {},
    create: {
      userId: agencyUser1.id,
      name: "Al Aman Travels",
      slug: "al-aman-travels",
      logo: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=200&h=200&fit=crop",
      description:
        "Al Aman Travels has been serving Sri Lankan pilgrims for over 22 years. We are a trusted name in Umrah and Hajj travel, known for our personalised service, experienced guides, and commitment to making your spiritual journey seamless and blessed.",
      phone: "+94 11 234 5678",
      email: "info@alamantravels.lk",
      address: "145 Galle Road, Colombo 03",
      city: "Colombo",
      yearsInBusiness: 22,
      verificationStatus: VerificationStatus.APPROVED,
      verifiedAt: new Date("2024-01-15"),
      rating: 4.8,
      totalReviews: 142,
      socialWhatsapp: "+94771234567",
      socialFacebook: "https://facebook.com/alamantravels",
    },
  });

  await prisma.agencySubscription.upsert({
    where: { agencyId: agency1.id },
    update: {},
    create: {
      agencyId: agency1.id,
      plan: SubscriptionPlan.PRO,
      startDate: new Date("2024-01-01"),
      active: true,
    },
  });

  // Agency 2 - Noor Pilgrimage
  const agency2 = await prisma.agency.upsert({
    where: { userId: agencyUser2.id },
    update: {},
    create: {
      userId: agencyUser2.id,
      name: "Noor Pilgrimage Services",
      slug: "noor-pilgrimage-services",
      logo: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop",
      description:
        "Noor Pilgrimage Services, based in Kandy, has guided over 3,000 pilgrims on their sacred journeys. Our dedicated team of scholars and travel experts ensure every aspect of your Umrah is handled with care and spirituality.",
      phone: "+94 81 234 5678",
      email: "info@noorpilgrimage.lk",
      address: "23 Dalada Veediya, Kandy",
      city: "Kandy",
      yearsInBusiness: 15,
      verificationStatus: VerificationStatus.APPROVED,
      verifiedAt: new Date("2024-02-10"),
      rating: 4.6,
      totalReviews: 89,
      socialWhatsapp: "+94711234567",
    },
  });

  await prisma.agencySubscription.upsert({
    where: { agencyId: agency2.id },
    update: {},
    create: {
      agencyId: agency2.id,
      plan: SubscriptionPlan.BASIC,
      startDate: new Date("2024-02-01"),
      active: true,
    },
  });

  // Agency 3 - Barakah
  const agency3 = await prisma.agency.upsert({
    where: { userId: agencyUser3.id },
    update: {},
    create: {
      userId: agencyUser3.id,
      name: "Barakah Travel & Tours",
      slug: "barakah-travel-tours",
      logo: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200&h=200&fit=crop",
      description:
        "Barakah Travel & Tours is a young, dynamic agency based in Galle, bringing fresh energy to Umrah travel. Our modern approach combined with deep Islamic values ensures your pilgrimage is both smooth and spiritually enriching.",
      phone: "+94 91 234 5678",
      email: "info@barakahtravels.lk",
      address: "67 Church Street, Galle",
      city: "Galle",
      yearsInBusiness: 8,
      verificationStatus: VerificationStatus.APPROVED,
      verifiedAt: new Date("2024-03-05"),
      rating: 4.4,
      totalReviews: 51,
    },
  });

  await prisma.agencySubscription.upsert({
    where: { agencyId: agency3.id },
    update: {},
    create: {
      agencyId: agency3.id,
      plan: SubscriptionPlan.FREE,
      startDate: new Date("2024-03-01"),
      active: true,
    },
  });

  // Packages
  const packages = [
    {
      agencyId: agency1.id,
      title: "Standard Umrah — July 2026",
      slug: "standard-umrah-july-2026-al-aman",
      description:
        "Experience the blessed journey of Umrah with Al Aman Travels' most popular Standard package. Departing in July 2026, this 12-day journey includes 4-star accommodation in both Makkah and Madinah, return flights from Colombo, and all necessary transportation. Our experienced guides will be with you every step of the way, ensuring a spiritually fulfilling and comfortable pilgrimage.",
      shortDescription: "12-day Umrah with 4-star hotels, flights, visa & transport included",
      type: PackageType.UMRAH,
      durationDays: 12,
      durationNights: 11,
      departureCity: "Colombo",
      departureDate: new Date("2026-07-15"),
      returnDate: new Date("2026-07-27"),
      seatsTotal: 60,
      seatsAvailable: 42,
      pricePerPerson: 335000,
      originalPrice: 365000,
      status: PackageStatus.ACTIVE,
      featured: true,
      hotelMakkah: "Dar Al Tawhid Intercontinental",
      hotelMakkahStars: 4,
      hotelMadinah: "Anwar Al Madinah Mövenpick",
      hotelMadinahStars: 4,
      hotelDistanceMakkah: "200m from Masjid al-Haram",
      hotelDistanceMadinah: "350m from Masjid al-Nabawi",
      visaIncluded: true,
      flightIncluded: true,
      transportIncluded: true,
      mealsIncluded: false,
    },
    {
      agencyId: agency1.id,
      title: "Premium Umrah — August 2026",
      slug: "premium-umrah-august-2026-al-aman",
      description:
        "Elevate your Umrah experience with our Premium package. Stay in luxurious 5-star hotels steps from the Haram, enjoy business class flights, and receive VIP treatment throughout your 14-day journey. Includes dedicated personal guide, private airport transfers, and special Ziyarat tours of historic Islamic sites in both Makkah and Madinah.",
      shortDescription: "14-day premium Umrah with 5-star hotels, business class & personal guide",
      type: PackageType.UMRAH,
      durationDays: 14,
      durationNights: 13,
      departureCity: "Colombo",
      departureDate: new Date("2026-08-03"),
      returnDate: new Date("2026-08-17"),
      seatsTotal: 30,
      seatsAvailable: 18,
      pricePerPerson: 475000,
      originalPrice: 520000,
      status: PackageStatus.ACTIVE,
      featured: true,
      hotelMakkah: "Fairmont Makkah Clock Royal Tower",
      hotelMakkahStars: 5,
      hotelMadinah: "Oberoi Madinah",
      hotelMadinahStars: 5,
      hotelDistanceMakkah: "50m from Masjid al-Haram",
      hotelDistanceMadinah: "100m from Masjid al-Nabawi",
      visaIncluded: true,
      flightIncluded: true,
      transportIncluded: true,
      mealsIncluded: true,
    },
    {
      agencyId: agency1.id,
      title: "Economy Umrah — September 2026",
      slug: "economy-umrah-september-2026-al-aman",
      description:
        "Our Economy package makes Umrah accessible without compromising on the essentials. This 10-day package includes comfortable 3-star accommodation, economy class flights, visa processing, and all required transportation. Perfect for pilgrims seeking an affordable yet complete Umrah experience.",
      shortDescription: "10-day budget-friendly Umrah with all essentials included",
      type: PackageType.UMRAH,
      durationDays: 10,
      durationNights: 9,
      departureCity: "Colombo",
      departureDate: new Date("2026-09-20"),
      returnDate: new Date("2026-09-30"),
      seatsTotal: 80,
      seatsAvailable: 55,
      pricePerPerson: 310000,
      status: PackageStatus.ACTIVE,
      featured: false,
      hotelMakkah: "Al Marwa Rayhaan by Rotana",
      hotelMakkahStars: 3,
      hotelMadinah: "Dallah Taibah Hotel",
      hotelMadinahStars: 3,
      hotelDistanceMakkah: "500m from Masjid al-Haram",
      hotelDistanceMadinah: "600m from Masjid al-Nabawi",
      visaIncluded: true,
      flightIncluded: true,
      transportIncluded: true,
      mealsIncluded: false,
    },
    {
      agencyId: agency2.id,
      title: "Premium Family Umrah — August 2026",
      slug: "premium-family-umrah-august-2026-noor",
      description:
        "Designed for families, our Premium Family Umrah package ensures every member of your family — from young children to elders — has a comfortable and spiritually meaningful journey. Features family rooms, child-friendly scheduling, dedicated family guide, and special attention to elderly pilgrims.",
      shortDescription: "14-day family-focused premium Umrah with family suites & child care",
      type: PackageType.UMRAH,
      durationDays: 14,
      durationNights: 13,
      departureCity: "Colombo",
      departureDate: new Date("2026-08-22"),
      returnDate: new Date("2026-09-05"),
      seatsTotal: 20,
      seatsAvailable: 12,
      pricePerPerson: 490000,
      originalPrice: 540000,
      status: PackageStatus.ACTIVE,
      featured: true,
      hotelMakkah: "Conrad Makkah",
      hotelMakkahStars: 5,
      hotelMadinah: "Pullman Zamzam Madinah",
      hotelMadinahStars: 5,
      hotelDistanceMakkah: "150m from Masjid al-Haram",
      hotelDistanceMadinah: "200m from Masjid al-Nabawi",
      visaIncluded: true,
      flightIncluded: true,
      transportIncluded: true,
      mealsIncluded: true,
    },
    {
      agencyId: agency2.id,
      title: "Ramadan Umrah 2027",
      slug: "ramadan-umrah-2027-noor",
      description:
        "Fulfil your dream of performing Umrah during the blessed month of Ramadan. Experience the extraordinary atmosphere of Makkah and Madinah during this holiest of months, with special Taraweeh prayers, Iftar gatherings, and the unparalleled spiritual energy of Ramadan. This 21-day journey is a once-in-a-lifetime experience.",
      shortDescription: "21-day Ramadan Umrah — experience the holiest month in the holy cities",
      type: PackageType.RAMADAN_UMRAH,
      durationDays: 21,
      durationNights: 20,
      departureCity: "Colombo",
      departureDate: new Date("2027-02-20"),
      returnDate: new Date("2027-03-13"),
      seatsTotal: 40,
      seatsAvailable: 28,
      pricePerPerson: 580000,
      originalPrice: 650000,
      status: PackageStatus.ACTIVE,
      featured: true,
      hotelMakkah: "Hilton Suites Makkah",
      hotelMakkahStars: 5,
      hotelMadinah: "Anwar Al Madinah Mövenpick",
      hotelMadinahStars: 4,
      hotelDistanceMakkah: "100m from Masjid al-Haram",
      hotelDistanceMadinah: "300m from Masjid al-Nabawi",
      visaIncluded: true,
      flightIncluded: true,
      transportIncluded: true,
      mealsIncluded: true,
    },
    {
      agencyId: agency2.id,
      title: "Budget Umrah — October 2026",
      slug: "budget-umrah-october-2026-noor",
      description:
        "Noor Pilgrimage Services presents an affordable Umrah package without compromising on the spiritual experience. This 10-day group package is ideal for first-time pilgrims and those seeking value for money. Includes accommodation, flights, visa, and ground transportation.",
      shortDescription: "10-day affordable group Umrah — ideal for first-time pilgrims",
      type: PackageType.UMRAH,
      durationDays: 10,
      durationNights: 9,
      departureCity: "Colombo",
      departureDate: new Date("2026-10-10"),
      returnDate: new Date("2026-10-20"),
      seatsTotal: 80,
      seatsAvailable: 65,
      pricePerPerson: 295000,
      status: PackageStatus.ACTIVE,
      featured: false,
      hotelMakkah: "Al Safwah Royale Orchid",
      hotelMakkahStars: 3,
      hotelMadinah: "Dallah Taibah Hotel",
      hotelMadinahStars: 3,
      hotelDistanceMakkah: "700m from Masjid al-Haram",
      hotelDistanceMadinah: "800m from Masjid al-Nabawi",
      visaIncluded: true,
      flightIncluded: true,
      transportIncluded: true,
      mealsIncluded: false,
    },
    {
      agencyId: agency3.id,
      title: "Standard Umrah — November 2026",
      slug: "standard-umrah-november-2026-barakah",
      description:
        "Barakah Travel brings you a well-rounded 12-day Umrah package departing November 2026. Enjoy comfortable 4-star accommodation, guided Ziyarat tours, and a warm community atmosphere with fellow Sri Lankan pilgrims. Our young, energetic team ensures a modern, connected experience while keeping the spiritual essence at the forefront.",
      shortDescription: "12-day Umrah with 4-star hotels, Ziyarat tours & experienced guides",
      type: PackageType.UMRAH,
      durationDays: 12,
      durationNights: 11,
      departureCity: "Colombo",
      departureDate: new Date("2026-11-05"),
      returnDate: new Date("2026-11-17"),
      seatsTotal: 50,
      seatsAvailable: 35,
      pricePerPerson: 350000,
      originalPrice: 380000,
      status: PackageStatus.ACTIVE,
      featured: false,
      hotelMakkah: "Swissotel Al Maqam Makkah",
      hotelMakkahStars: 4,
      hotelMadinah: "Crowne Plaza Madinah",
      hotelMadinahStars: 4,
      hotelDistanceMakkah: "300m from Masjid al-Haram",
      hotelDistanceMadinah: "400m from Masjid al-Nabawi",
      visaIncluded: true,
      flightIncluded: true,
      transportIncluded: true,
      mealsIncluded: false,
    },
    {
      agencyId: agency3.id,
      title: "VIP Umrah Experience — December 2026",
      slug: "vip-umrah-december-2026-barakah",
      description:
        "The ultimate Umrah experience for those who seek nothing but the best. Our exclusive VIP package accommodates just 10 pilgrims, ensuring personalised attention at every step. Private transfers, butler service, luxury suites, private Ziyarat in air-conditioned vehicles, and a dedicated scholar-guide make this the most premium Umrah offering in Sri Lanka.",
      shortDescription: "Exclusive 14-day VIP Umrah for 10 pilgrims — ultimate luxury & personalised service",
      type: PackageType.UMRAH,
      durationDays: 14,
      durationNights: 13,
      departureCity: "Colombo",
      departureDate: new Date("2026-12-01"),
      returnDate: new Date("2026-12-15"),
      seatsTotal: 10,
      seatsAvailable: 8,
      pricePerPerson: 620000,
      originalPrice: 700000,
      status: PackageStatus.ACTIVE,
      featured: true,
      hotelMakkah: "Raffles Makkah Palace",
      hotelMakkahStars: 5,
      hotelMadinah: "The Oberoi Madinah",
      hotelMadinahStars: 5,
      hotelDistanceMakkah: "10m from Masjid al-Haram",
      hotelDistanceMadinah: "50m from Masjid al-Nabawi",
      visaIncluded: true,
      flightIncluded: true,
      transportIncluded: true,
      mealsIncluded: true,
    },
  ];

  const createdPackages = [];
  for (const pkg of packages) {
    const existing = await prisma.package.findUnique({ where: { slug: pkg.slug } });
    if (!existing) {
      const created = await prisma.package.create({ data: pkg });
      createdPackages.push(created);
    } else {
      createdPackages.push(existing);
    }
  }

  // Add images to packages
  const makkahImages = [
    "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=450&fit=crop",
    "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=450&fit=crop",
  ];

  for (const pkg of createdPackages) {
    const existing = await prisma.packageImage.findFirst({ where: { packageId: pkg.id } });
    if (!existing) {
      await prisma.packageImage.createMany({
        data: makkahImages.map((url, i) => ({
          packageId: pkg.id,
          url,
          alt: `${pkg.title} - Image ${i + 1}`,
          isPrimary: i === 0,
          order: i,
        })),
      });
    }
  }

  // Add inclusions to first package as example
  for (const pkg of createdPackages) {
    const existing = await prisma.packageInclusion.findFirst({ where: { packageId: pkg.id } });
    if (!existing) {
      await prisma.packageInclusion.createMany({
        data: [
          { packageId: pkg.id, label: "Return Flights from Colombo (CMB)", included: pkg.flightIncluded, icon: "plane" },
          { packageId: pkg.id, label: "Hotel Accommodation in Makkah", included: true, icon: "hotel" },
          { packageId: pkg.id, label: "Hotel Accommodation in Madinah", included: true, icon: "hotel" },
          { packageId: pkg.id, label: "Umrah Visa Processing", included: pkg.visaIncluded, icon: "document" },
          { packageId: pkg.id, label: "Airport Transfers", included: pkg.transportIncluded, icon: "transport" },
          { packageId: pkg.id, label: "Makkah–Madinah Transport", included: pkg.transportIncluded, icon: "transport" },
          { packageId: pkg.id, label: "Meals", included: pkg.mealsIncluded, icon: "meals" },
          { packageId: pkg.id, label: "Ziyarat Tour (Makkah)", included: true, icon: "tour" },
          { packageId: pkg.id, label: "Ziyarat Tour (Madinah)", included: true, icon: "tour" },
          { packageId: pkg.id, label: "Group Guide (Sinhala/Tamil/English)", included: true, icon: "guide" },
        ],
      });
    }
  }

  // Add itinerary to packages
  for (const pkg of createdPackages) {
    const existing = await prisma.itineraryDay.findFirst({ where: { packageId: pkg.id } });
    if (!existing) {
      await prisma.itineraryDay.createMany({
        data: [
          {
            packageId: pkg.id,
            dayNumber: 1,
            title: "Departure from Colombo",
            description: "Assemble at Bandaranaike International Airport, Colombo. After check-in and farewell prayers, depart for Jeddah/Madinah. Inflight meals served.",
            location: "Colombo, Sri Lanka",
          },
          {
            packageId: pkg.id,
            dayNumber: 2,
            title: "Arrival in Madinah — The City of the Prophet ﷺ",
            description: "Arrive at Prince Mohammad Bin Abdulaziz Airport, Madinah. Transfer to hotel. Rest and freshen up. Perform Salah at Masjid al-Nabawi. Visit Raudhah (with permit).",
            location: "Madinah, Saudi Arabia",
          },
          {
            packageId: pkg.id,
            dayNumber: 3,
            title: "Madinah Ziyarat",
            description: "Morning Ziyarat tour: Masjid Quba, Masjid al-Qiblatayn, Jabal Uhud, and dates market. Afternoon free for personal worship and shopping.",
            location: "Madinah, Saudi Arabia",
          },
          {
            packageId: pkg.id,
            dayNumber: 4,
            title: "Travel to Makkah — The Mother of Cities",
            description: "After Fajr, don Ihram and make Niyyah for Umrah. Travel by coach to Makkah (approximately 4-5 hours). Upon arrival, proceed directly to Masjid al-Haram to perform Tawaf, Sa'i, and Halq/Taqseer.",
            location: "Makkah, Saudi Arabia",
          },
          {
            packageId: pkg.id,
            dayNumber: 5,
            title: "Makkah Worship & Ziyarat",
            description: "Morning Ziyarat: Jabal al-Nour (Cave of Hira), Jabal Thawr, Masjid al-Jinn, Mina, Muzdalifah, Arafat. Afternoon and evening free for Tawaf and personal worship in Masjid al-Haram.",
            location: "Makkah, Saudi Arabia",
          },
        ],
      });
    }
  }

  // Customer users
  const customerPassword = await bcrypt.hash("customer123", 12);

  const customers = await Promise.all([
    prisma.user.upsert({
      where: { email: "ahmed.farook@gmail.com" },
      update: {},
      create: { name: "Ahmed Farook", email: "ahmed.farook@gmail.com", password: customerPassword, role: Role.CUSTOMER, phone: "+94 77 123 4567" },
    }),
    prisma.user.upsert({
      where: { email: "fatima.hashim@gmail.com" },
      update: {},
      create: { name: "Fatima Hashim", email: "fatima.hashim@gmail.com", password: customerPassword, role: Role.CUSTOMER, phone: "+94 76 234 5678" },
    }),
    prisma.user.upsert({
      where: { email: "mohamed.riyaz@gmail.com" },
      update: {},
      create: { name: "Mohamed Riyaz", email: "mohamed.riyaz@gmail.com", password: customerPassword, role: Role.CUSTOMER, phone: "+94 75 345 6789" },
    }),
    prisma.user.upsert({
      where: { email: "zainab.noor@gmail.com" },
      update: {},
      create: { name: "Zainab Noor", email: "zainab.noor@gmail.com", password: customerPassword, role: Role.CUSTOMER, phone: "+94 74 456 7890" },
    }),
    prisma.user.upsert({
      where: { email: "ibrahim.siddiq@gmail.com" },
      update: {},
      create: { name: "Ibrahim Siddiq", email: "ibrahim.siddiq@gmail.com", password: customerPassword, role: Role.CUSTOMER, phone: "+94 73 567 8901" },
    }),
  ]);

  // Create bookings
  const bookingData = [
    {
      customerId: customers[0].id,
      packageId: createdPackages[0].id,
      bookingRef: "PIL-2026-0001",
      status: BookingStatus.CONFIRMED,
      adults: 2,
      totalAmount: 670000,
      travelDate: new Date("2026-07-15"),
    },
    {
      customerId: customers[0].id,
      packageId: createdPackages[1].id,
      bookingRef: "PIL-2026-0002",
      status: BookingStatus.PAID,
      adults: 1,
      totalAmount: 475000,
      travelDate: new Date("2026-08-03"),
    },
    {
      customerId: customers[1].id,
      packageId: createdPackages[3].id,
      bookingRef: "PIL-2026-0003",
      status: BookingStatus.PROCESSING,
      adults: 2,
      children: 1,
      totalAmount: 980000,
      travelDate: new Date("2026-08-22"),
    },
    {
      customerId: customers[2].id,
      packageId: createdPackages[4].id,
      bookingRef: "PIL-2026-0004",
      status: BookingStatus.COMPLETED,
      adults: 1,
      totalAmount: 580000,
      travelDate: new Date("2027-02-20"),
    },
    {
      customerId: customers[4].id,
      packageId: createdPackages[6].id,
      bookingRef: "PIL-2026-0005",
      status: BookingStatus.CONFIRMED,
      adults: 3,
      totalAmount: 1050000,
      travelDate: new Date("2026-11-05"),
    },
  ];

  for (const booking of bookingData) {
    const existing = await prisma.booking.findUnique({ where: { bookingRef: booking.bookingRef } });
    if (!existing) {
      const commissionAmount = booking.totalAmount * 0.05;
      const agencyAmount = booking.totalAmount - commissionAmount;
      const created = await prisma.booking.create({
        data: {
          ...booking,
          children: booking.children ?? 0,
          commissionAmount,
          agencyAmount,
          stripePaymentId: `pi_demo_${booking.bookingRef}`,
        },
      });

      // Add messages to first booking
      if (booking.bookingRef === "PIL-2026-0001") {
        await prisma.message.createMany({
          data: [
            {
              bookingId: created.id,
              senderId: customers[0].id,
              content: "Assalamu Alaikum, could you please confirm the departure gate and check-in time for our July 15 flight?",
              read: true,
              createdAt: new Date("2026-06-01T10:00:00"),
            },
            {
              bookingId: created.id,
              senderId: agencyUser1.id,
              content: "Wa Alaikum Assalam Brother Ahmed! Your flight departs from Gate B12 at 02:30 AM. Please check in by midnight. We will send a detailed pre-departure brief by email 48 hours before. May Allah accept your Umrah. 🤲",
              read: true,
              createdAt: new Date("2026-06-01T14:30:00"),
            },
            {
              bookingId: created.id,
              senderId: customers[0].id,
              content: "JazakAllah Khair! Will our luggage tags be provided at the airport?",
              read: false,
              createdAt: new Date("2026-06-02T09:15:00"),
            },
          ],
        });
      }
    }
  }

  // Add a review for completed booking
  const completedBooking = await prisma.booking.findUnique({ where: { bookingRef: "PIL-2026-0004" } });
  if (completedBooking) {
    const existingReview = await prisma.review.findFirst({
      where: { packageId: createdPackages[4].id, customerId: customers[2].id },
    });
    if (!existingReview) {
      await prisma.review.create({
        data: {
          packageId: createdPackages[4].id,
          customerId: customers[2].id,
          rating: 5,
          comment: "SubhanAllah, what an incredible experience. Noor Pilgrimage made every moment of our Ramadan Umrah absolutely perfect. The hotel was exactly as described, the guides were knowledgeable and patient, and the entire team went above and beyond. Would book again without hesitation. May Allah reward them.",
        },
      });
    }
  }

  console.log("✅ Database seeded successfully!");
  console.log("Demo credentials:");
  console.log("  Admin:    admin@pilgrym.lk / admin123");
  console.log("  Agency 1: info@alamantravels.lk / agency123");
  console.log("  Agency 2: info@noorpilgrimage.lk / agency123");
  console.log("  Agency 3: info@barakahtravels.lk / agency123");
  console.log("  Customer: ahmed.farook@gmail.com / customer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
