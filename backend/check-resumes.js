require('dotenv').config();
const mongoose = require('mongoose');
const ResumeVersion = require('./models/ResumeVersion');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const resumes = await ResumeVersion.find({});
    console.log('\nAll resumes in database:');
    console.log('Total count:', resumes.length);
    
    resumes.forEach((resume, index) => {
      console.log(`\n${index + 1}. Resume:`);
      console.log('   ID:', resume._id);
      console.log('   Student ID:', resume.studentId);
      console.log('   Name:', resume.name);
      console.log('   Template:', resume.template);
      console.log('   Created:', resume.createdAt);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
