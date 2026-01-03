import User from '../features/users/models/userModel.js';
import Hospital from '../features/hospitals/models/hospitalModel.js';
import { adminUser, nepaliHospitals } from './seedData.js';
import bcrypt from 'bcryptjs';

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
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);
      
      const admin = await User.create({
        ...adminUser,
        password: hashedPassword
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

    console.log(`\n📊 Seeding Summary:`);
    console.log(`   - Hospitals created: ${hospitalsCreated}`);
    console.log(`   - Hospitals skipped: ${hospitalsSkipped}`);
    console.log(`   - Total hospitals: ${nepaliHospitals.length}`);
    console.log('✅ Database seeding completed!\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

export default seedDatabase;
