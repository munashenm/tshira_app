import "dotenv/config";
import { PrismaClient, Province } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const demoClients = [
    {
      name: "Sipho Kumalo",
      idNumber: "8501015800081",
      email: "sipho.k@example.com",
      phone: "0721234567",
      address: "123 Polokwane Street",
      province: Province.LIMPOPO,
      district: "Capricorn",
      municipality: "Polokwane",
      companyName: "Kumalo Logistics",
      tradingName: "Sipho's Express",
      businessEmail: "info@kumalogistics.co.za",
      ckNumber: "2020/123456/07"
    },
    {
      name: "Lerato Mokoena",
      idNumber: "9205120123085",
      email: "lerato.m@example.com",
      phone: "0832345678",
      address: "45 Nelspruit Road",
      province: Province.MPUMALANGA,
      district: "Ehlanzeni",
      municipality: "Mbombela",
      companyName: "Mokoena Agro-Processing",
      tradingName: "Lerato's Farm",
      businessEmail: "admin@mokoena-agro.co.za",
      ckNumber: "2018/654321/07"
    },
    {
      name: "Thabo Ndlovu",
      idNumber: "7811235678089",
      email: "thabo.n@example.com",
      phone: "0113456789",
      address: "67 Sandton Drive",
      province: Province.GAUTENG,
      district: "Johannesburg",
      municipality: "City of Johannesburg",
      companyName: "Ndlovu Tech Solutions",
      tradingName: "Ndlovu IT",
      businessEmail: "thabo@ndlovutech.co.za",
      ckNumber: "2015/987654/07"
    },
    {
      name: "Nomvula Zulu",
      idNumber: "8808150987082",
      email: "nomvula.z@example.com",
      phone: "0794567890",
      address: "89 Rustenburg Ave",
      province: Province.NORTH_WEST,
      district: "Bojanala Platinum",
      municipality: "Rustenburg",
      companyName: "Zulu Creative Designs",
      tradingName: "Nomvula Art",
      businessEmail: "hello@zuludesigns.co.za",
      ckNumber: "2021/112233/07"
    },
    {
      name: "Pieter van der Merwe",
      idNumber: "7504305432083",
      email: "pieter.vdm@example.com",
      phone: "0515678901",
      address: "12 Bloemfontein Way",
      province: Province.FREE_STATE,
      district: "Mangaung",
      municipality: "Mangaung Metropolitan",
      companyName: "Van Der Merwe Construction",
      tradingName: "VDM Build",
      businessEmail: "pieter@vdmbuild.co.za",
      ckNumber: "2012/445566/07"
    },
    {
      name: "Zanele Mbatha",
      idNumber: "9512250111084",
      email: "zanele.m@example.com",
      phone: "0716789012",
      address: "34 Kimberley Road",
      province: Province.NORTHERN_CAPE,
      district: "Frances Baard",
      municipality: "Sol Plaatje",
      companyName: "Mbatha Consultancies",
      tradingName: "Zanele's HR",
      businessEmail: "hr@mbathaconsult.co.za",
      ckNumber: "2023/778899/07"
    },
    {
      name: "Andile Dlamini",
      idNumber: "8206065555087",
      email: "andile.d@example.com",
      phone: "0827890123",
      address: "56 Giyani Crescent",
      province: Province.LIMPOPO,
      district: "Mopani",
      municipality: "Greater Giyani",
      companyName: "Dlamini Security Services",
      tradingName: "Dlamini Shield",
      businessEmail: "security@dlaminishield.co.za",
      ckNumber: "2019/990011/07"
    },
    {
      name: "Bongiwe Sithole",
      idNumber: "9003030999086",
      email: "bongiwe.s@example.com",
      phone: "0738901234",
      address: "78 Witbank Street",
      province: Province.MPUMALANGA,
      district: "Nkangala",
      municipality: "Emalahleni",
      companyName: "Sithole Catering",
      tradingName: "Bongi's Bites",
      businessEmail: "orders@bongibites.co.za",
      ckNumber: "2022/223344/07"
    },
    {
      name: "Kabelo Moabi",
      idNumber: "8709095666088",
      email: "kabelo.m@example.com",
      phone: "0129012345",
      address: "90 Pretoria Main Rd",
      province: Province.GAUTENG,
      district: "Tshwane",
      municipality: "City of Tshwane",
      companyName: "Moabi Renewable Energy",
      tradingName: "Solar Moabi",
      businessEmail: "kabelo@solarmoabi.co.za",
      ckNumber: "2017/556677/07"
    },
    {
      name: "Fatima Ismail",
      idNumber: "9310100444081",
      email: "fatima.i@example.com",
      phone: "0180123456",
      address: "23 Mahikeng Dr",
      province: Province.NORTH_WEST,
      district: "Ngaka Modiri Molema",
      municipality: "Mahikeng",
      companyName: "Ismail Textiles",
      tradingName: "Fatima's Fashion",
      businessEmail: "design@fatimafashion.co.za",
      ckNumber: "2024/001122/07"
    }
  ];

  console.log("Starting seeding clients...");

  for (const clientData of demoClients) {
    const client = await prisma.client.upsert({
      where: { idNumber: clientData.idNumber },
      update: {},
      create: clientData,
    });
    console.log(`Created/Upserted client: ${client.name} (${client.idNumber})`);
  }

  console.log("Seeding clients completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
