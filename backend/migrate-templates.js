const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const ResumeVersion = require('./models/ResumeVersion');

const migrateTemplates = async () => {
  try {
    console.log('🔄 Starting template migration...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all resumes using template2 or template3
    const resumesToMigrate = await ResumeVersion.find({
      template: { $in: ['template2', 'template3'] }
    });

    console.log(`📊 Found ${resumesToMigrate.length} resumes to migrate\n`);

    if (resumesToMigrate.length === 0) {
      console.log('✅ No resumes need migration. All resumes are already using template1 or template4.\n');
      process.exit(0);
    }

    // Display resumes that will be migrated
    console.log('Resumes to be migrated:');
    resumesToMigrate.forEach((resume, index) => {
      console.log(`  ${index + 1}. "${resume.name}" (${resume.template}) → will become template1`);
    });
    console.log('');

    // Perform the migration
    const result = await ResumeVersion.updateMany(
      { template: { $in: ['template2', 'template3'] } },
      { $set: { template: 'template1' } }
    );

    console.log(`✅ Migration completed successfully!`);
    console.log(`   Modified ${result.modifiedCount} resume(s)\n`);

    // Verify the migration
    const remainingOldTemplates = await ResumeVersion.find({
      template: { $in: ['template2', 'template3'] }
    }).countDocuments();

    if (remainingOldTemplates === 0) {
      console.log('✅ Verification passed: No resumes using template2 or template3 remain\n');
    } else {
      console.log(`⚠️  Warning: ${remainingOldTemplates} resume(s) still using old templates\n`);
    }

    // Show current template distribution
    const template1Count = await ResumeVersion.countDocuments({ template: 'template1' });
    const template4Count = await ResumeVersion.countDocuments({ template: 'template4' });
    
    console.log('📊 Current template distribution:');
    console.log(`   template1 (Modern): ${template1Count} resume(s)`);
    console.log(`   template4 (LaTeX RGIPT): ${template4Count} resume(s)`);
    console.log(`   Total: ${template1Count + template4Count} resume(s)\n`);

    console.log('🎉 Migration complete! You can now safely use the application.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
migrateTemplates();
