import { HISTORICAL_MONTHS } from './timeline';
import { normalizeDistrict } from '../utils/formatters';

export function generateRealisticDataset() {
  // 10 Exact RB KAM mappings requested
  const rbKamRoster = [
    { rbKam: 'Md. Imam Hasan', rbLead: 'A.M. Sirajul Mowla', districts: ['Bogra', 'Sirajganj'], thanas: ['Bogra Sadar', 'Sherpur', 'Shibganj', 'Sirajganj Sadar', 'Belkuchi', 'Shahjadpur'] },
    { rbKam: 'Md Rahad Mahmud Rifat', rbLead: 'A.M. Sirajul Mowla', districts: ['Sylhet', 'Brahmanbaria', 'Habiganj'], thanas: ['Kotwali', 'Amberkhana', 'Shah Paran', 'Brahmanbaria Sadar', 'Habiganj Sadar'] },
    { rbKam: 'Nurul Anwar Siddiquee', rbLead: 'A.M. Sirajul Mowla', districts: ['Narayanganj', 'Dhaka', 'Munshiganj'], thanas: ['Narayanganj Sadar', 'Fatullah', 'Dhanmondi', 'Gulshan', 'Munshiganj Sadar'] },
    { rbKam: 'A.K.M. Mahmudul Hasan', rbLead: 'S.M. Zahid Hasan', districts: ['Pabna', 'Rajshahi', 'Natore'], thanas: ['Pabna Sadar', 'Ishwardi', 'Boalia', 'Motihar', 'Natore Sadar'] },
    { rbKam: 'Md. Mahfuzur Rahman Plabon', rbLead: 'S.M. Zahid Hasan', districts: ['Dhaka', 'Manikganj'], thanas: ['Mirpur', 'Uttara', 'Mohammadpur', 'Manikganj Sadar', 'Saturia'] },
    { rbKam: 'Shahriar Khan Ishan', rbLead: 'A.M. Sirajul Mowla', districts: ['Gazipur', 'Tangail'], thanas: ['Joydebpur', 'Tongi', 'Konabari', 'Tangail Sadar', 'Mirzapur'] },
    { rbKam: 'Abdullah Ebne Jobair', rbLead: 'S.M. Zahid Hasan', districts: ['Mymensingh', 'Jamalpur'], thanas: ['Kotwali', 'Trishal', 'Muktagacha', 'Jamalpur Sadar', 'Sarishabari'] },
    { rbKam: 'Md. Miman Khan', rbLead: 'A.M. Sirajul Mowla', districts: ['Khulna', 'Jessore', 'Kushtia'], thanas: ['Sonadanga', 'Kotwali', 'Jessore Sadar', 'Kushtia Sadar', 'Kumarkhali'] },
    { rbKam: 'Apurbo Karmokar', rbLead: 'S.M. Zahid Hasan', districts: ['Faridpur', 'Barisal', 'Madaripur'], thanas: ['Kotwali', 'Bhanga', 'Barisal Sadar', 'Madaripur Sadar'] },
    { rbKam: 'Md. Mazharul Islam', rbLead: 'S.M. Zahid Hasan', districts: ['Rangpur', 'Dinajpur'], thanas: ['Kotwali', 'Mithapukur', 'Dinajpur Sadar', 'Birganj'] }
  ];

  const brandTemplates = [
    { brand: 'Aarong', cat: 'Apparel & Accessories', sub: 'Fashion Retail', aov: 3200, kam: 'Mostafa Aziz Proteek', catLead: 'Molla Abul Bashar' },
    { brand: 'Shwapno', cat: 'Superstores', sub: 'Supermarket Chain', aov: 1850, kam: 'Fahim Rokoni', catLead: 'A.M. Sirajul Mowla' },
    { brand: 'Square Hospital', cat: 'Healthcare', sub: 'Specialized Hospital', aov: 4100, kam: 'Molla Abul Bashar', catLead: 'Molla Abul Bashar' },
    { brand: 'Mount Adora Hospital', cat: 'Healthcare', sub: 'Specialized Hospital', aov: 3600, kam: 'Molla Abul Bashar', catLead: 'Molla Abul Bashar' },
    { brand: 'Bengal Meat', cat: 'Food & Dining', sub: 'Gourmet Meat', aov: 2100, kam: 'Nirzhar Chowdhury', catLead: 'Ziaul Haque' },
    { brand: 'Transcom Digital', cat: 'Electronics & Home', sub: 'Consumer Electronics', aov: 14500, kam: 'Tanvir Ahmed', catLead: 'Mahmudur Rahman' },
    { brand: 'Yellow', cat: 'Apparel & Accessories', sub: 'Lifestyle & Gifts', aov: 2900, kam: 'Mostafa Aziz Proteek', catLead: 'Molla Abul Bashar' },
    { brand: 'Labaid Diagnostic', cat: 'Healthcare', sub: 'Diagnostic Center', aov: 1950, kam: 'Molla Abul Bashar', catLead: 'Molla Abul Bashar' },
    { brand: 'Bata Shoes', cat: 'Apparel & Accessories', sub: 'Footwear', aov: 2400, kam: 'Fahim Rokoni', catLead: 'A.M. Sirajul Mowla' },
    { brand: 'Apex Footwear', cat: 'Apparel & Accessories', sub: 'Footwear', aov: 2600, kam: 'Nirzhar Chowdhury', catLead: 'Ziaul Haque' },
    { brand: 'Meena Bazar', cat: 'Superstores', sub: 'Supermarket Chain', aov: 1750, kam: 'Fahim Rokoni', catLead: 'A.M. Sirajul Mowla' },
    { brand: 'Walton Plaza', cat: 'Electronics & Home', sub: 'Consumer Electronics', aov: 16800, kam: 'Tanvir Ahmed', catLead: 'Mahmudur Rahman' }
  ];

  const merchants = [];
  let walletCounter = 1711200000;
  let idCount = 0;

  // Generate 11 outlets per RB KAM = 110 realistic outlets
  rbKamRoster.forEach((officer, rIdx) => {
    for (let i = 0; i < 11; i++) {
      idCount++;
      walletCounter += 17;
      const template = brandTemplates[(rIdx * 3 + i) % brandTemplates.length];
      const dist = officer.districts[i % officer.districts.length];
      const thana = officer.thanas[i % officer.thanas.length];

      // Realistic registration date
      const regYear = 2023 + (i % 3);
      const regMonth = (i % 12) + 1;
      const regDate = `${regYear}-${String(regMonth).padStart(2, '0')}-15`;

      // Generate 33-month historical trend
      const monthlyHistory = {};
      let baseTxns = Math.floor(25 + Math.random() * 180);

      // Health archetypes
      let archetype = 'GREEN';
      if (i === 1 || i === 5 || i === 7) archetype = 'AMBER';
      if (i === 8 || i === 10) archetype = 'RED';

      HISTORICAL_MONTHS.forEach(mStr => {
        const [mName, mYr] = mStr.split("'");
        const calYear = 2000 + parseInt(mYr);
        const mIdx = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].indexOf(mName) + 1;

        if (calYear < regYear || (calYear === regYear && mIdx <= regMonth)) {
          monthlyHistory[mStr] = { pc: 0, pa: 0, cc: 0 };
        } else if (archetype === 'RED') {
          monthlyHistory[mStr] = { pc: 0, pa: 0, cc: 0 };
        } else {
          let txns = archetype === 'AMBER' ? Math.floor(1 + Math.random() * 18) : baseTxns;
          if (mName === 'Mar' || mName === 'Apr') txns = Math.floor(txns * 1.8); // Festive Eid surge
          txns = Math.max(0, Math.floor(txns * (0.8 + Math.random() * 0.4)));
          monthlyHistory[mStr] = {
            pc: txns,
            pa: txns * template.aov,
            cc: Math.floor(txns * 0.86)
          };
        }
      });

      // Live Oct 2026 MTD Performance
      let mtdPC = 0;
      let mtdPA = 0;
      let mtdCC = 0;

      if (archetype === 'GREEN') {
        mtdPC = Math.floor(38 + Math.random() * 210);
        mtdPA = mtdPC * template.aov;
        mtdCC = Math.floor(mtdPC * 0.88);
      } else if (archetype === 'AMBER') {
        mtdPC = Math.floor(2 + Math.random() * 22);
        mtdPA = mtdPC * template.aov;
        mtdCC = Math.floor(mtdPC * 0.9);
      }

      // Specific revenue tuning for Under 25K & Under 50K cohorts
      if (i === 2) {
        // Under 25K (and therefore also Under 50K)
        mtdPC = 6;
        mtdPA = 18200;
        mtdCC = 5;
        archetype = 'AMBER';
      } else if (i === 3) {
        // Between 25K and 50K (Under 50K but NOT Under 25K)
        mtdPC = 14;
        mtdPA = 36500;
        mtdCC = 12;
        archetype = 'AMBER';
      }

      // Compute Onboarding Lag flags
      let noTxn1m = (i % 4 === 0);
      let noTxn3m = (i % 8 === 0);
      let noTxn5m = (i === 8);

      merchants.push({
        id: `m_${idCount}`,
        wallet: '0' + walletCounter,
        brand: template.brand,
        merchant: `${template.brand} - ${dist} ${thana} Branch`,
        district: normalizeDistrict(dist),
        thana: thana,
        category: template.cat,
        subCategory: template.sub,
        kam: template.kam,
        catLead: template.catLead,
        rbKam: officer.rbKam,
        rbKamLead: officer.rbLead,
        regDate: regDate,
        history: monthlyHistory,
        mtdPC: mtdPC,
        mtdPA: mtdPA,
        mtdCC: mtdCC,
        noTxn1m: noTxn1m,
        noTxn3m: noTxn3m,
        noTxn5m: noTxn5m
      });
    }
  });

  return merchants;
}
