const ExcelJS = require('exceljs');
const Student = require('../models/Student');
const Profile = require('../models/Profile');
const { isValidEmail } = require('../utils/helpers');
const auditLogger = require('../utils/auditLogger');

class ExcelService {
  // Parse DOB value from Excel — handles dd/mm/yyyy string or Excel serial number
  parseDob(value) {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') {
      // Excel serial date: days since 1900-01-01 (with Lotus 1-2-3 leap year bug offset)
      return new Date((value - 25569) * 86400 * 1000);
    }
    if (typeof value === 'string') {
      const parts = value.trim().split('/');
      if (parts.length === 3) {
        const dd = parseInt(parts[0], 10);
        const mm = parseInt(parts[1], 10);
        const yyyy = parseInt(parts[2], 10);
        if (!isNaN(dd) && !isNaN(mm) && !isNaN(yyyy)) {
          return new Date(yyyy, mm - 1, dd);
        }
      }
    }
    if (value instanceof Date) return value;
    return null;
  }

  // Parse gender value — normalises to 'Male' or 'Female', null otherwise
  parseGender(value) {
    if (value === null || value === undefined || value === '') return null;
    const normalised = String(value).trim().toLowerCase();
    if (normalised === 'male') return 'Male';
    if (normalised === 'female') return 'Female';
    return null;
  }

  // Parse Excel file buffer (async, using exceljs)
  async parseExcelFile(buffer) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      const worksheet = workbook.worksheets[0];
      if (!worksheet) throw new Error('No worksheet found in Excel file');

      const data = [];
      let headers = [];

      worksheet.eachRow((row, rowNumber) => {
        const values = row.values.slice(1); // row.values[0] is always undefined
        if (rowNumber === 1) {
          // First row = headers
          headers = values.map(v => (v !== null && v !== undefined ? String(v).trim() : ''));
        } else {
          // Subsequent rows = data
          const obj = {};
          headers.forEach((header, i) => {
            const cell = values[i];
            obj[header] = cell !== undefined && cell !== null ? cell : '';
          });
          // Skip entirely empty rows
          if (Object.values(obj).some(v => v !== '')) {
            data.push(obj);
          }
        }
      });

      return data;
    } catch (error) {
      throw new Error('Failed to parse Excel file: ' + error.message);
    }
  }

  // Validate Excel file structure
  validateExcelStructure(data) {
    const requiredColumns = [
      'name',
      'rollNo',
      'instituteEmail',
      'branch',
      'degree',
      'cpi',
      '10th percentage',
      '12th percentage',
      '10th school',
      '12th school',
      'graduationYear',
      'semester'
    ];

    // Optional columns (won't fail if missing)
    const optionalColumns = ['10th year', '12th year', '10th board', '12th board'];

    if (!data || data.length === 0) {
      throw new Error('Excel file is empty');
    }

    const firstRow = data[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));

    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    return true;
  }

  // Validate individual student data
  validateStudentData(student, rowIndex) {
    const errors = [];

    // Name validation
    if (!student.name || student.name.trim() === '') {
      errors.push('Name is required');
    }

    // Roll number validation
    if (!student.rollNo || student.rollNo.toString().trim() === '') {
      errors.push('Roll number is required');
    }

    // Email validation
    if (!student.instituteEmail || !isValidEmail(student.instituteEmail)) {
      errors.push('Valid institute email is required');
    }

    // Branch validation
    if (!student.branch || student.branch.trim() === '') {
      errors.push('Branch is required');
    }

    // Degree validation
    if (!student.degree || student.degree.trim() === '') {
      errors.push('Degree is required');
    }

    // CPI validation
    const cpi = parseFloat(student.cpi);
    if (isNaN(cpi) || cpi < 0 || cpi > 10) {
      errors.push('CPI must be a number between 0 and 10');
    }

    // 10th percentage validation
    const class10Percentage = parseFloat(student['10th percentage']);
    if (isNaN(class10Percentage) || class10Percentage < 0 || class10Percentage > 100) {
      errors.push('10th percentage must be a number between 0 and 100');
    }

    // 12th percentage validation
    const class12Percentage = parseFloat(student['12th percentage']);
    if (isNaN(class12Percentage) || class12Percentage < 0 || class12Percentage > 100) {
      errors.push('12th percentage must be a number between 0 and 100');
    }

    // 10th school validation
    if (!student['10th school'] || student['10th school'].trim() === '') {
      errors.push('10th school is required');
    }

    // 12th school validation
    if (!student['12th school'] || student['12th school'].trim() === '') {
      errors.push('12th school is required');
    }

    // Graduation year validation
    if (!student.graduationYear || student.graduationYear.toString().trim() === '') {
      errors.push('Graduation year is required');
    }

    // Semester validation
    if (!student.semester || student.semester.toString().trim() === '') {
      errors.push('Semester is required');
    }

    if (errors.length > 0) {
      return {
        valid: false,
        errors: errors,
        row: rowIndex + 2 // +2 because Excel rows start at 1 and first row is header
      };
    }

    return { valid: true };
  }

  // Transform Excel row to Student object
  async transformToStudent(excelRow) {
    const rollNo = excelRow.rollNo.toString().trim().toUpperCase();

    return {
      name: excelRow.name.trim(),
      rollNo: rollNo,
      instituteEmail: excelRow.instituteEmail.toLowerCase().trim(),
      branch: excelRow.branch.trim(),
      degree: excelRow.degree.trim(),
      graduationYear: excelRow.graduationYear.toString().trim(),
      cpi: parseFloat(excelRow.cpi),
      cgpaRemark: `till Semester ${parseInt(excelRow.semester.toString().trim()) - 1}`,
      class10: {
        percentage: parseFloat(excelRow['10th percentage']),
        school: excelRow['10th school'].trim(),
        year: excelRow['10th year'] ? excelRow['10th year'].toString().trim() : '',
        board: excelRow['10th board'] ? excelRow['10th board'].toString().trim() : ''
      },
      class12: {
        percentage: parseFloat(excelRow['12th percentage']),
        school: excelRow['12th school'].trim(),
        year: excelRow['12th year'] ? excelRow['12th year'].toString().trim() : '',
        board: excelRow['12th board'] ? excelRow['12th board'].toString().trim() : ''
      },
      password: null,  // No password until student activates account
      passwordSet: false,  // Account not activated yet
      role: 'student',
      dob: this.parseDob(excelRow.dob),
      gender: this.parseGender(excelRow.gender)
    };
  }

  // Create students from Excel data
  async createStudentsFromExcel(excelData, adminId = null) {
    const results = {
      success: [],
      failed: []
    };

    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];
      
      try {
        // Validate student data
        const validation = this.validateStudentData(row, i);
        
        if (!validation.valid) {
          results.failed.push({
            row: validation.row,
            data: row,
            errors: validation.errors
          });
          continue;
        }

        // Check for duplicate rollNo - UPDATE instead of failing
        const existingByRollNo = await Student.findOne({ 
          rollNo: row.rollNo.toString().trim().toUpperCase()
        });
        
        if (existingByRollNo) {
          // Update existing student
          try {
            const studentData = await this.transformToStudent(row);
            delete studentData.password; // Don't update password
            
            await Student.findByIdAndUpdate(existingByRollNo._id, studentData);
            
            // Ensure profile exists
            const existingProfile = await Profile.findOne({ studentId: existingByRollNo._id });
            if (!existingProfile) {
              await Profile.create({
                studentId: existingByRollNo._id,
                skills: [],
                projects: [],
                internships: [],
                achievements: [],
                certifications: [],
                positionsOfResponsibility: [],
                courses: [],
                publications: [],
                socialLinks: []
              });
            }
            
            const updatedResult = {
              row: i + 2,
              rollNo: existingByRollNo.rollNo,
              name: studentData.name,
              email: studentData.instituteEmail,
              action: 'updated',
              status: 'Student data updated',
              warnings: []
            };
            const rawGender = row.gender;
            if (rawGender !== null && rawGender !== undefined && String(rawGender).trim() !== '' && studentData.gender === null) {
              updatedResult.warnings.push(`Unrecognised gender value "${rawGender}" — stored as null`);
            }
            results.success.push(updatedResult);
            continue;
          } catch (error) {
            results.failed.push({
              row: i + 2,
              data: row,
              errors: [`Failed to update student: ${error.message}`]
            });
            continue;
          }
        }

        // Check for duplicate email
        const existingByEmail = await Student.findOne({ 
          instituteEmail: row.instituteEmail.toLowerCase().trim() 
        });
        
        if (existingByEmail) {
          results.failed.push({
            row: i + 2,
            data: row,
            errors: [`Student with email ${row.instituteEmail} already exists`]
          });
          continue;
        }

        // Transform and create student
        const studentData = await this.transformToStudent(row);
        const student = await Student.create(studentData);

        // Create empty profile for the student
        await Profile.create({
          studentId: student._id,
          skills: [],
          projects: [],
          internships: [],
          achievements: [],
          certifications: [],
          positionsOfResponsibility: [],
          courses: [],
          publications: [],
          socialLinks: []
        });

        // Log profile creation to audit log
        if (adminId) {
          await auditLogger.logProfileCreation(student._id, adminId);
        }

        const createdResult = {
          row: i + 2,
          rollNo: student.rollNo,
          name: student.name,
          email: student.instituteEmail,
          action: 'created',
          status: 'Account created - Student must activate via email',
          warnings: []
        };
        const rawGender = row.gender;
        if (rawGender !== null && rawGender !== undefined && String(rawGender).trim() !== '' && studentData.gender === null) {
          createdResult.warnings.push(`Unrecognised gender value "${rawGender}" — stored as null`);
        }
        results.success.push(createdResult);

      } catch (error) {
        results.failed.push({
          row: i + 2,
          data: row,
          errors: [error.message]
        });
      }
    }

    return results;
  }
}

module.exports = new ExcelService();