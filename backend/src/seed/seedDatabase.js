import User from '../features/users/models/userModel.js';
import Hospital from '../features/hospitals/models/hospitalModel.js';
import { adminUser, nepaliHospitals, sampleDoctors } from './seedData.js';

/**
 * Seed database with initial data
 * Creates admin user and hospitals if they don't exist
 */
export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Seed Admin User
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (!existingAdmin) {
      // Password will be hashed by the model's pre-save hook
      const admin = await User.create({
        ...adminUser,
        // Ensure OTP fields are not set
        otpCode: undefined,
        otpExpires: undefined,
        otpType: undefined
      });
      
      console.log('✅ Admin user created:', admin.email);
    } else {
      console.log('ℹ️  Admin user already exists:', adminUser.email);
    }

    // Seed Hospitals
    let hospitalsCreated = 0;
    let hospitalsSkipped = 0;

    for (const hospitalData of nepaliHospitals) {
      const existingHospital = await Hospital.findOne({
        $or: [
          { name: hospitalData.name },
          { slug: hospitalData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }
        ]
      });

      if (!existingHospital) {
        await Hospital.create(hospitalData);
        hospitalsCreated++;
        console.log(`✅ Hospital created: ${hospitalData.name}`);
      } else {
        hospitalsSkipped++;
        console.log(`ℹ️  Hospital already exists: ${hospitalData.name}`);
      }
    }

    // Seed Sample Doctors
    let doctorsCreated = 0;
    let doctorsSkipped = 0;

    for (const doctorData of sampleDoctors) {
      const existingDoctor = await User.findOne({ email: doctorData.email });

      if (!existingDoctor) {
        // Password will be hashed by the model's pre-save hook
        await User.create({
          ...doctorData,
          // Ensure OTP fields are not set
          otpCode: undefined,
          otpExpires: undefined,
          otpType: undefined
        });

        doctorsCreated++;
        console.log(`✅ Doctor created: ${doctorData.name} (${doctorData.email})`);
      } else {
        doctorsSkipped++;
        console.log(`ℹ️  Doctor already exists: ${doctorData.email}`);
      }
    }

    console.log(`\n📊 Seeding Summary:`);
    console.log(`   - Hospitals created: ${hospitalsCreated}`);
    console.log(`   - Hospitals skipped: ${hospitalsSkipped}`);
    console.log(`   - Total hospitals: ${nepaliHospitals.length}`);
    console.log(`   - Doctors created: ${doctorsCreated}`);
    console.log(`   - Doctors skipped: ${doctorsSkipped}`);
    console.log(`   - Total doctors: ${sampleDoctors.length}`);
    console.log('✅ Database seeding completed!\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

export default seedDatabase;
