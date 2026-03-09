const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const ResumeVersion = require('./models/ResumeVersion');

const renameTemplate = async () => {
  try {
    console.log('🔄 Renaming template4 to template2...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all resumes using template4
    const resumesToRename = await ResumeVersion.find({
      template: 'template4'
    });

    console.log(`📊 Found ${resumesToRename.length} resumes using template4\n`);

    if (resumesToRename.length === 0) {
      console.log('✅ No resumes need renaming. All resumes are already using template1 or template2.\n');
      process.exit(0);
    }

    // Display resumes that will be renamed
    console.log('Resumes to be renamed:');
    resumesToRename.forEach((resume, index) => {
      console.log(`  ${index + 1}. "${resume.name}" (template4) → will become template2`);
    });
    console.log('');

    // Perform the rename
    const result = await ResumeVersion.updateMany(
      { template: 'template4' },
      { $set: { template: 'template2' } }
    );

    console.log(`✅ Rename completed successfully!`);
    console.log(`   Modified ${result.modifiedCount} resume(s)\n`);

    // Verify the rename
    const remainingTemplate4 = await ResumeVersion.find({
      template: 'template4'
    }).countDocuments();

    if (remainingTemplate4 === 0) {
      console.log('✅ Verification passed: No resumes using template4 remain\n');
    } else {
      console.log(`⚠️  Warning: ${remainingTemplate4} resume(s) still using template4\n`);
    }

    // Show current template distribution
    const template1Count = await ResumeVersion.countDocuments({ template: 'template1' });
    const template2Count = await ResumeVersion.countDocuments({ template: 'template2' });
    
    console.log('📊 Current template distribution:');
    console.log(`   template1 (Modern): ${template1Count} resume(s)`);
    console.log(`   template2 (LaTeX RGIPT): ${template2Count} resume(s)`);
    console.log(`   Total: ${template1Count + template2Count} resume(s)\n`);

    console.log('🎉 Rename complete! Template4 is now template2.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Rename failed:', error);
    process.exit(1);
  }
};

// Run the rename
renameTemplate();
