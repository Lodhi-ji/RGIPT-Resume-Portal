require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const Profile = require('../models/Profile');
const ResumeVersion = require('../models/ResumeVersion');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Student.deleteMany({});
    await Profile.deleteMany({});
    await ResumeVersion.deleteMany({});

    console.log('Cleared existing data');

    // Hash password for all students
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('ECHE19069@College123', salt);

    // Sample students data
    const studentsData = [
      {
        name: 'Priya Sharma',
        rollNo: '21CS001',
        instituteEmail: 'priya.sharma@rgipt.ac.in',
        branch: 'Computer Science',
        degree: 'B.Tech',
        cpi: 8.9,
        class10: {
          percentage: 94.0,
          school: 'DAV Public School'
        },
        class12: {
          percentage: 90.5,
          school: 'DAV Public School'
        },
        password: await bcrypt.hash('21CS001@College123', salt),
        role: 'student'
      },
      {
        name: 'Anshika Verma',
        rollNo: 'ECHE19069',
        instituteEmail: 'anshika.verma@rgipt.ac.in',
        branch: 'Chemical Engineering',
        degree: 'B.Tech',
        cpi: 8.5,
        class10: {
          percentage: 92.5,
          school: 'St. Mary\'s High School'
        },
        class12: {
          percentage: 88.2,
          school: 'Delhi Public School'
        },
        password: hashedPassword,
        role: 'student'
      },
      {
        name: 'Ritik Lodhi',
        rollNo: '23CD3054',
        instituteEmail: 'ritik.lodhi@rgipt.ac.in',
        branch: 'Computer Science',
        degree: 'B.Tech',
        cpi: 9.1,
        class10: {
          percentage: 95.0,
          school: 'Kendriya Vidyalaya'
        },
        class12: {
          percentage: 91.5,
          school: 'Kendriya Vidyalaya'
        },
        password: await bcrypt.hash('23CD3054@College123', salt),
        role: 'student'
      },
      {
        name: 'Admin User',
        rollNo: 'ADMIN001',
        instituteEmail: 'admin@rgipt.ac.in',
        branch: 'Administration',
        degree: 'Admin',
        cpi: 10.0,
        class10: {
          percentage: 100.0,
          school: 'Admin School'
        },
        class12: {
          percentage: 100.0,
          school: 'Admin School'
        },
        password: await bcrypt.hash('admin123', salt),
        role: 'admin'
      }
    ];

    // Insert students
    const students = await Student.insertMany(studentsData);
    console.log('Students created');

    // Sample profiles data
    const profilesData = [
      {
        studentId: students[0]._id, // Priya Sharma
        phone: '9123456780',
        alternateEmail: 'priya.personal@gmail.com',
        skills: [
          'JavaScript',
          'TypeScript',
          'React.js',
          'Node.js',
          'Express.js',
          'MongoDB',
          'PostgreSQL',
          'Git',
          'Docker',
          'Kubernetes',
          'AWS',
          'REST APIs',
          'GraphQL'
        ],
        projects: [
          {
            title: 'Real-Time Chat Application',
            description: 'Built a scalable real-time chat application with WebSocket support',
            technologies: 'React, Node.js, Socket.io, MongoDB, Redis',
            startDate: new Date('2023-03-01'),
            endDate: new Date('2023-07-15'),
            githubLink: 'https://github.com/priyasharma/chat-app',
            liveLink: 'https://chat.priyasharma.dev',
            bullets: [
              'Implemented real-time messaging with Socket.io',
              'Scaled to support 1000+ concurrent users',
              'Added end-to-end encryption for secure messaging',
              'Deployed using Docker and Kubernetes on AWS'
            ]
          },
          {
            title: 'Task Management Dashboard',
            description: 'Collaborative task management tool with drag-and-drop interface',
            technologies: 'React, TypeScript, Node.js, PostgreSQL, GraphQL',
            startDate: new Date('2023-09-01'),
            endDate: new Date('2024-01-15'),
            githubLink: 'https://github.com/priyasharma/task-manager',
            liveLink: 'https://tasks.priyasharma.dev',
            bullets: [
              'Built drag-and-drop interface using React DnD',
              'Implemented GraphQL API for efficient data fetching',
              'Added real-time collaboration features',
              'Achieved 95+ Lighthouse performance score'
            ]
          }
        ],
        publications: [],
        internships: [
          {
            company: 'Microsoft',
            role: 'Software Engineering Intern',
            startDate: new Date('2023-05-20'),
            endDate: new Date('2023-08-10'),
            description: 'Worked on Azure cloud services, developed features for Azure DevOps platform',
            location: 'Bangalore, Karnataka'
          }
        ],
        achievements: [
          'Microsoft Imagine Cup Finalist 2023',
          'Google Summer of Code Participant',
          'Hackathon Winner - HackIndia 2023',
          'Dean\'s List for Academic Excellence'
        ],
        certifications: [
          {
            name: 'Microsoft Certified: Azure Developer Associate',
            issuer: 'Microsoft',
            issueDate: new Date('2023-08-20'),
            credentialId: 'AZ-204-2023',
            certLink: 'https://learn.microsoft.com/verify/AZ-204-2023'
          },
          {
            name: 'React - The Complete Guide',
            issuer: 'Udemy',
            issueDate: new Date('2023-02-10'),
            certLink: 'https://udemy.com/certificate/react-complete'
          }
        ],
        positionsOfResponsibility: [
          {
            title: 'Technical Lead',
            organization: 'Google Developer Student Club',
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-12-31'),
            description: 'Led technical workshops and mentored 50+ students in web development'
          }
        ],
        courses: [
          {
            name: 'Cloud Computing',
            platform: 'NPTEL',
            completionDate: new Date('2023-06-30')
          }
        ],
        socialLinks: [
          {
            title: 'GitHub',
            url: 'https://github.com/priyasharma',
            icon: 'github',
            displayInHeader: true
          },
          {
            title: 'LinkedIn',
            url: 'https://linkedin.com/in/priya-sharma',
            icon: 'linkedin',
            displayInHeader: true
          },
          {
            title: 'Portfolio',
            url: 'https://priyasharma.dev',
            icon: 'portfolio',
            displayInHeader: true
          },
          {
            title: 'Twitter',
            url: 'https://twitter.com/priyasharma_dev',
            icon: 'twitter',
            displayInHeader: false
          }
        ]
      },
      {
        studentId: students[1]._id, // Anshika Verma
        phone: '9876543210',
        alternateEmail: 'anshika.personal@gmail.com',
        skills: [
          'Process Design',
          'Chemical Process Simulation',
          'MATLAB',
          'AutoCAD',
          'Aspen Plus',
          'Python',
          'Data Analysis',
          'Project Management'
        ],
        projects: [
          {
            title: 'Optimization of Distillation Column Design',
            description: 'Designed and optimized a distillation column for separation of benzene-toluene mixture',
            technologies: 'Aspen Plus, MATLAB, Process Simulation',
            startDate: new Date('2023-01-15'),
            endDate: new Date('2023-05-30'),
            githubLink: 'https://github.com/anshika/distillation-project',
            liveLink: '',
            bullets: [
              'Achieved 15% improvement in energy efficiency through optimization',
              'Simulated benzene-toluene separation with 99.5% purity',
              'Reduced operational costs by optimizing reflux ratio'
            ]
          },
          {
            title: 'Waste Water Treatment Plant Design',
            description: 'Conceptual design of a waste water treatment plant for industrial effluents',
            technologies: 'AutoCAD, Process Design, Environmental Engineering',
            startDate: new Date('2023-08-01'),
            endDate: new Date('2023-12-15'),
            githubLink: '',
            liveLink: '',
            bullets: [
              'Designed primary, secondary and tertiary treatment processes',
              'Achieved 95% COD removal efficiency in design',
              'Created detailed P&ID diagrams using AutoCAD'
            ]
          }
        ],
        publications: [
          {
            title: 'Process Optimization in Distillation Columns Using Machine Learning',
            journal: 'International Journal of Chemical Engineering',
            year: '2024',
            paperLink: 'https://doi.org/10.1234/ijce.2024.001',
            description: 'Research on applying ML algorithms for optimizing distillation column parameters'
          }
        ],
        internships: [
          {
            company: 'Indian Oil Corporation Limited (IOCL)',
            role: 'Process Engineering Intern',
            startDate: new Date('2023-06-01'),
            endDate: new Date('2023-07-31'),
            description: 'Worked on process optimization in the refinery unit. Analyzed process parameters and suggested improvements for better efficiency.',
            location: 'Mathura, UP'
          }
        ],
        achievements: [
          'Dean\'s List for Academic Excellence (2022-23)',
          'Winner - Technical Paper Presentation at ChemCon 2023',
          'Second Prize - Process Design Competition',
          'Merit Scholarship Recipient'
        ],
        certifications: [
          {
            name: 'Process Safety Management',
            issuer: 'NIOSH',
            issueDate: new Date('2023-03-15'),
            credentialId: 'PSM-2023-456',
            certLink: 'https://niosh.gov/verify/PSM-2023-456'
          },
          {
            name: 'Python for Data Science',
            issuer: 'Coursera',
            issueDate: new Date('2023-01-20'),
            certLink: 'https://coursera.org/verify/python-cert'
          }
        ],
        positionsOfResponsibility: [
          {
            title: 'Technical Secretary',
            organization: 'Chemical Engineering Society',
            startDate: new Date('2022-08-01'),
            endDate: new Date('2023-07-31'),
            description: 'Organized technical events and workshops for chemical engineering students'
          }
        ],
        courses: [
          {
            name: 'Advanced Process Control',
            platform: 'NPTEL',
            completionDate: new Date('2023-04-30')
          }
        ],
        socialLinks: [
          {
            title: 'GitHub',
            url: 'https://github.com/anshikaverma',
            icon: 'github',
            displayInHeader: true
          },
          {
            title: 'LinkedIn',
            url: 'https://linkedin.com/in/anshika-verma',
            icon: 'linkedin',
            displayInHeader: true
          },
          {
            title: 'Portfolio',
            url: 'https://anshikaverma.dev',
            icon: 'portfolio',
            displayInHeader: false
          }
        ]
      },
      {
        studentId: students[2]._id, // Ritik Lodhi
        phone: '8765432109',
        alternateEmail: 'ritik.personal@gmail.com',
        skills: [
          'Java',
          'Python',
          'JavaScript',
          'React.js',
          'Node.js',
          'MongoDB',
          'MySQL',
          'Git',
          'Docker',
          'AWS',
          'Data Structures',
          'Algorithms',
          'Machine Learning'
        ],
        projects: [
          {
            title: 'E-Commerce Web Application',
            description: 'Full-stack e-commerce platform with user authentication, product catalog, and payment integration',
            technologies: 'React.js, Node.js, MongoDB, Express.js, Stripe API',
            startDate: new Date('2023-02-01'),
            endDate: new Date('2023-06-15'),
            githubLink: 'https://github.com/ritiklodhi/ecommerce-app',
            liveLink: 'https://ecommerce-demo.ritiklodhi.dev',
            bullets: [
              'Built responsive UI with React and Tailwind CSS',
              'Implemented secure payment processing with Stripe API',
              'Achieved 99.9% uptime with AWS deployment',
              'Integrated real-time inventory management system'
            ]
          },
          {
            title: 'Student Management System',
            description: 'Desktop application for managing student records with attendance tracking and grade management',
            technologies: 'Java, JavaFX, MySQL, JDBC',
            startDate: new Date('2023-08-01'),
            endDate: new Date('2023-11-30'),
            githubLink: 'https://github.com/ritiklodhi/student-management',
            liveLink: '',
            bullets: [
              'Designed intuitive JavaFX interface for 500+ student records',
              'Implemented automated attendance tracking system',
              'Generated PDF reports with grade analytics'
            ]
          },
          {
            title: 'Machine Learning Price Predictor',
            description: 'ML model to predict house prices using various features with 92% accuracy',
            technologies: 'Python, Scikit-learn, Pandas, NumPy, Matplotlib',
            startDate: new Date('2023-09-01'),
            endDate: new Date('2023-12-01'),
            githubLink: 'https://github.com/ritiklodhi/price-predictor',
            liveLink: 'https://price-predictor.ritiklodhi.dev',
            bullets: [
              'Achieved 92% accuracy using Random Forest algorithm',
              'Performed feature engineering on 10,000+ data points',
              'Deployed model using Flask and Docker'
            ]
          }
        ],
        publications: [
          {
            title: 'AI-Based Resume Parser Using Natural Language Processing',
            journal: 'IEEE Conference on Artificial Intelligence',
            year: '2024',
            paperLink: 'https://doi.org/10.1109/ieee.2024.001',
            description: 'Research on NLP-based resume parsing and information extraction'
          },
          {
            title: 'Optimizing Web Application Performance with Caching Strategies',
            journal: 'International Journal of Computer Science',
            year: '2023',
            paperLink: 'https://doi.org/10.1234/ijcs.2023.045',
            description: 'Study on various caching techniques for improving web app performance'
          }
        ],
        internships: [
          {
            company: 'TCS (Tata Consultancy Services)',
            role: 'Software Development Intern',
            startDate: new Date('2023-05-15'),
            endDate: new Date('2023-07-15'),
            description: 'Developed web applications using React.js and Node.js. Worked on client projects and gained experience in agile development methodology.',
            location: 'Pune, Maharashtra'
          }
        ],
        achievements: [
          'Google Code-in Finalist 2023',
          'Hackathon Winner - Smart India Hackathon 2023',
          'Coding Competition Winner - CodeChef Campus Chapter',
          'Academic Excellence Award 2022-23',
          'Open Source Contributor - 50+ contributions'
        ],
        certifications: [
          {
            name: 'AWS Certified Cloud Practitioner',
            issuer: 'Amazon Web Services',
            issueDate: new Date('2023-04-10'),
            credentialId: 'AWS-CCP-2023-789',
            certLink: 'https://aws.amazon.com/verification/AWS-CCP-2023-789'
          },
          {
            name: 'Full Stack Web Development',
            issuer: 'freeCodeCamp',
            issueDate: new Date('2023-02-28'),
            certLink: 'https://freecodecamp.org/certification/ritiklodhi/full-stack'
          },
          {
            name: 'Machine Learning Specialization',
            issuer: 'Coursera - Stanford University',
            issueDate: new Date('2023-06-15'),
            certLink: 'https://coursera.org/verify/specialization/ML2023'
          }
        ],
        positionsOfResponsibility: [
          {
            title: 'President',
            organization: 'Computer Science Society',
            startDate: new Date('2023-01-01'),
            endDate: new Date('2023-12-31'),
            description: 'Leading the CS society, organizing coding competitions, workshops, and technical events for 200+ students'
          },
          {
            title: 'Teaching Assistant',
            organization: 'Data Structures Course',
            startDate: new Date('2023-08-01'),
            endDate: new Date('2023-12-15'),
            description: 'Assisted professor in teaching data structures, conducted lab sessions and helped students with assignments'
          }
        ],
        courses: [
          {
            name: 'Advanced Algorithms',
            platform: 'MIT OpenCourseWare',
            completionDate: new Date('2023-05-20')
          },
          {
            name: 'System Design',
            platform: 'Educative.io',
            completionDate: new Date('2023-07-10')
          }
        ],
        socialLinks: [
          {
            title: 'GitHub',
            url: 'https://github.com/ritiklodhi',
            icon: 'github',
            displayInHeader: true
          },
          {
            title: 'LinkedIn',
            url: 'https://linkedin.com/in/ritik-lodhi',
            icon: 'linkedin',
            displayInHeader: true
          },
          {
            title: 'LeetCode',
            url: 'https://leetcode.com/ritiklodhi',
            icon: 'leetcode',
            displayInHeader: false
          },
          {
            title: 'Codeforces',
            url: 'https://codeforces.com/profile/ritiklodhi',
            icon: 'codeforces',
            displayInHeader: false
          },
          {
            title: 'Portfolio',
            url: 'https://ritiklodhi.dev',
            icon: 'portfolio',
            displayInHeader: true
          }
        ]
      }
    ];

    // Insert profiles
    const profiles = await Profile.insertMany(profilesData);
    console.log('Profiles created');

    // Sample resume versions
    const resumeVersionsData = [
      {
        studentId: students[0]._id, // Priya Sharma
        name: 'Software Engineer Resume',
        template: 'template4',
        sectionsEnabled: {
          education: true,
          projects: true,
          internships: true,
          skills: true,
          achievements: true,
          certifications: true,
          positionsOfResponsibility: true,
          courses: false,
          socialLinks: true,
          publications: false
        },
        selectedProjects: [profiles[0].projects[0]._id, profiles[0].projects[1]._id],
        selectedInternships: [profiles[0].internships[0]._id],
        selectedPublications: [],
        selectedCertifications: [profiles[0].certifications[0]._id, profiles[0].certifications[1]._id],
        selectedSocialLinks: [profiles[0].socialLinks[0]._id, profiles[0].socialLinks[1]._id, profiles[0].socialLinks[2]._id]
      },
      {
        studentId: students[1]._id, // Anshika Verma
        name: 'Chemical Engineering Resume',
        template: 'template1',
        sectionsEnabled: {
          education: true,
          projects: true,
          internships: true,
          skills: true,
          achievements: true,
          certifications: true,
          positionsOfResponsibility: true,
          courses: true,
          socialLinks: false,
          publications: true
        },
        selectedProjects: [profiles[1].projects[0]._id, profiles[1].projects[1]._id],
        selectedInternships: [profiles[1].internships[0]._id],
        selectedPublications: [profiles[1].publications[0]._id],
        selectedCertifications: [profiles[1].certifications[0]._id, profiles[1].certifications[1]._id],
        selectedSocialLinks: []
      },
      {
        studentId: students[2]._id, // Ritik Lodhi
        name: 'Software Developer Resume',
        template: 'template2',
        sectionsEnabled: {
          education: true,
          projects: true,
          internships: true,
          skills: true,
          achievements: true,
          certifications: true,
          positionsOfResponsibility: true,
          courses: false,
          socialLinks: true,
          publications: true
        },
        selectedProjects: [profiles[2].projects[0]._id, profiles[2].projects[2]._id],
        selectedInternships: [profiles[2].internships[0]._id],
        selectedPublications: [profiles[2].publications[0]._id],
        selectedCertifications: [profiles[2].certifications[0]._id, profiles[2].certifications[2]._id],
        selectedSocialLinks: [profiles[2].socialLinks[0]._id, profiles[2].socialLinks[1]._id, profiles[2].socialLinks[4]._id]
      },
      {
        studentId: students[2]._id, // Ritik Lodhi - Second resume version
        name: 'Full Stack Developer Resume',
        template: 'template4',
        sectionsEnabled: {
          education: true,
          projects: true,
          internships: true,
          skills: true,
          achievements: false,
          certifications: true,
          positionsOfResponsibility: false,
          courses: true,
          socialLinks: true,
          publications: false
        },
        selectedProjects: [profiles[2].projects[0]._id, profiles[2].projects[1]._id],
        selectedInternships: [profiles[2].internships[0]._id],
        selectedPublications: [],
        selectedCertifications: [profiles[2].certifications[0]._id, profiles[2].certifications[1]._id],
        selectedSocialLinks: [profiles[2].socialLinks[0]._id, profiles[2].socialLinks[1]._id]
      }
    ];

    // Insert resume versions
    await ResumeVersion.insertMany(resumeVersionsData);
    console.log('Resume versions created');

    console.log('\n=== SEED DATA CREATED SUCCESSFULLY ===');
    console.log('\nTest Login Credentials:');
    console.log('1. Student (Priya Sharma):');
    console.log('   Email: priya.sharma@rgipt.ac.in');
    console.log('   Password: 21CS001@College123');
    console.log('\n2. Student (Anshika Verma):');
    console.log('   Email: anshika.verma@rgipt.ac.in');
    console.log('   Password: ECHE19069@College123');
    console.log('\n3. Student (Ritik Lodhi):');
    console.log('   Email: ritik.lodhi@rgipt.ac.in');
    console.log('   Password: 23CD3054@College123');
    console.log('\n4. Admin:');
    console.log('   Email: admin@rgipt.ac.in');
    console.log('   Password: admin123');
    console.log('\n=== You can now test the authentication endpoints ===');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();