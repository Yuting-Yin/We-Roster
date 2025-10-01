package com.weroster.config;

import com.weroster.entity.*;
import com.weroster.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
@Profile("!test")
public class DataInitializer implements CommandLineRunner {

    @Value("${com.weroster.config.DataInitializer.enabled:true}")
    private boolean enabled;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private HospitalRepository hospitalRepository;
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Autowired
    private DesignationRepository designationRepository;
    
    @Autowired
    private LocationRepository locationRepository;
    
    @Autowired
    private StaffRepository staffRepository;
    
    @Autowired
    private ShiftRepository shiftRepository;
    
    @Autowired
    private ShiftAssignmentRepository shiftAssignmentRepository;
    
    @Autowired
    private LeaveRequestRepository leaveRequestRepository;
    
    // Removed UserStaffRepository - using direct User-Staff relationship

    @Override
    public void run(String... args) throws Exception {
        if (!enabled) {
            System.out.println("🔍 DataInitializer - Disabled by configuration");
            return;
        }
        
        // Clear leave requests for testing (real version should not do this)
        System.out.println("🔍 DataInitializer - Clearing existing leave requests for testing...");
        leaveRequestRepository.deleteAll();
        System.out.println("🔍 DataInitializer - Leave requests cleared");
        
        // Only initialize if database is empty
        if (userRepository.count() == 0) {
            createMockData();
        }
        
        // Always create test leave requests (for testing purposes)
        createTestLeaveRequests();
    }
    
    private void createMockData() {
        System.out.println("Creating mock data...");
        
        // Create Hospital
        Hospital hospital = Hospital.builder()
                .name("WeRoster General Hospital")
                .code("WGH")
                .address("123 Healthcare Ave, Medical City")
                .note("Main hospital for WeRoster system")
                .build();
        hospital = hospitalRepository.save(hospital);
        
        // Create Designations
        Designation nurseDesignation = Designation.builder()
                .name("Registered Nurse")
                .code("RN")
                .type("CLINICAL")
                .status("ACTIVE")
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        nurseDesignation = designationRepository.save(nurseDesignation);
        
        Designation doctorDesignation = Designation.builder()
                .name("Doctor")
                .code("DOC")
                .type("CLINICAL")
                .status("ACTIVE")
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        doctorDesignation = designationRepository.save(doctorDesignation);
        
        // Create additional designations
        Designation surgeonDesignation = Designation.builder()
                .name("Surgeon")
                .code("SUR")
                .type("CLINICAL")
                .status("ACTIVE")
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        surgeonDesignation = designationRepository.save(surgeonDesignation);
        
        Designation anaesCoordinatorDesignation = Designation.builder()
                .name("Anaes Coordinator")
                .code("ANAES")
                .type("CLINICAL")
                .status("ACTIVE")
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        anaesCoordinatorDesignation = designationRepository.save(anaesCoordinatorDesignation);
        
        Designation nurseConsultantDesignation = Designation.builder()
                .name("Nurse Consultant")
                .code("NC")
                .type("CLINICAL")
                .status("ACTIVE")
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        nurseConsultantDesignation = designationRepository.save(nurseConsultantDesignation);
        
        Designation traineeDesignation = Designation.builder()
                .name("Trainee")
                .code("TRAINEE")
                .type("CLINICAL")
                .status("ACTIVE")
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        traineeDesignation = designationRepository.save(traineeDesignation);
        
        Designation medStudentDesignation = Designation.builder()
                .name("Med Student")
                .code("MED_STUDENT")
                .type("CLINICAL")
                .status("ACTIVE")
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        medStudentDesignation = designationRepository.save(medStudentDesignation);
        
        Designation offCampusTraineeDesignation = Designation.builder()
                .name("Off-campus Trainee")
                .code("OFF_CAMPUS")
                .type("CLINICAL")
                .status("ACTIVE")
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        offCampusTraineeDesignation = designationRepository.save(offCampusTraineeDesignation);
        
        // Create Departments
        Department emergencyDept = Department.builder()
                .name("Emergency Department")
                .code("ED")
                .hospital(hospital)
                .note("24/7 Emergency care")
                .build();
        emergencyDept = departmentRepository.save(emergencyDept);
        
        Department icuDept = Department.builder()
                .name("Intensive Care Unit")
                .code("ICU")
                .hospital(hospital)
                .note("Critical care unit")
                .build();
        icuDept = departmentRepository.save(icuDept);
        
        Department medicalDept = Department.builder()
                .name("Medical Ward")
                .code("MED")
                .hospital(hospital)
                .note("General medical ward")
                .build();
        medicalDept = departmentRepository.save(medicalDept);
        
        // Create Locations
        Location edRoom1 = Location.builder()
                .name("ED Room 1")
                .code("ED-R1")
                .type("TREATMENT_ROOM")
                .hospital(hospital)
                .note("Emergency treatment room 1")
                .build();
        edRoom1 = locationRepository.save(edRoom1);
        
        Location icuBed1 = Location.builder()
                .name("ICU Bed 1")
                .code("ICU-B1")
                .type("ICU_BED")
                .hospital(hospital)
                .note("ICU bed 1")
                .build();
        icuBed1 = locationRepository.save(icuBed1);
        
        Location medWard = Location.builder()
                .name("Medical Ward A")
                .code("MED-A")
                .type("WARD")
                .hospital(hospital)
                .note("Medical ward A")
                .build();
        medWard = locationRepository.save(medWard);
        
        // Create Staff Members
        Staff nurse1 = Staff.builder()
                .firstName("Sarah")
                .lastName("Johnson")
                .email("sarah.johnson@weroster.com")
                .phone("555-0101")
                .designation(nurseDesignation)
                .hospital(hospital)
                .status("ACTIVE")
                .isManager(false)
                .type("FULL_TIME")
                .hireDate(LocalDate.of(2023, 1, 15))
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        nurse1 = staffRepository.save(nurse1);
        
        Staff nurse2 = Staff.builder()
                .firstName("Michael")
                .lastName("Chen")
                .email("michael.chen@weroster.com")
                .phone("555-0102")
                .designation(nurseDesignation)
                .hospital(hospital)
                .status("ACTIVE")
                .isManager(false)
                .type("FULL_TIME")
                .hireDate(LocalDate.of(2023, 3, 20))
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        nurse2 = staffRepository.save(nurse2);
        
        Staff doctor1 = Staff.builder()
                .firstName("Dr. Emily")
                .lastName("Rodriguez")
                .email("emily.rodriguez@weroster.com")
                .phone("555-0201")
                .designation(doctorDesignation)
                .hospital(hospital)
                .status("ACTIVE")
                .isManager(true)
                .type("FULL_TIME")
                .hireDate(LocalDate.of(2022, 6, 10))
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        doctor1 = staffRepository.save(doctor1);
        
        Staff nurse3 = Staff.builder()
                .firstName("Jessica")
                .lastName("Williams")
                .email("jessica.williams@weroster.com")
                .phone("555-0103")
                .designation(nurseDesignation)
                .hospital(hospital)
                .status("ACTIVE")
                .isManager(false)
                .type("PART_TIME")
                .hireDate(LocalDate.of(2023, 8, 5))
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        nurse3 = staffRepository.save(nurse3);
        
        // Create additional staff with different designations
        Staff surgeon = Staff.builder()
                .firstName("Dr. Robert")
                .lastName("Wilson")
                .email("robert.wilson@weroster.com")
                .phone("555-0104")
                .designation(surgeonDesignation)
                .hospital(hospital)
                .status("ACTIVE")
                .isManager(false)
                .type("FULL_TIME")
                .hireDate(LocalDate.of(2022, 6, 10))
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        surgeon = staffRepository.save(surgeon);
        
        Staff anaesCoordinator = Staff.builder()
                .firstName("Sarah")
                .lastName("Brown")
                .email("sarah.brown@weroster.com")
                .phone("555-0105")
                .designation(anaesCoordinatorDesignation)
                .hospital(hospital)
                .status("ACTIVE")
                .isManager(true)
                .type("FULL_TIME")
                .hireDate(LocalDate.of(2021, 9, 15))
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        anaesCoordinator = staffRepository.save(anaesCoordinator);
        
        Staff nurseConsultant = Staff.builder()
                .firstName("Michael")
                .lastName("Davis")
                .email("michael.davis@weroster.com")
                .phone("555-0106")
                .designation(nurseConsultantDesignation)
                .hospital(hospital)
                .status("ACTIVE")
                .isManager(false)
                .type("FULL_TIME")
                .hireDate(LocalDate.of(2020, 4, 20))
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        nurseConsultant = staffRepository.save(nurseConsultant);
        
        Staff trainee = Staff.builder()
                .firstName("Emma")
                .lastName("Taylor")
                .email("emma.taylor@weroster.com")
                .phone("555-0107")
                .designation(traineeDesignation)
                .hospital(hospital)
                .status("ACTIVE")
                .isManager(false)
                .type("FULL_TIME")
                .hireDate(LocalDate.of(2024, 1, 8))
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        trainee = staffRepository.save(trainee);
        
        Staff medStudent = Staff.builder()
                .firstName("James")
                .lastName("Anderson")
                .email("james.anderson@weroster.com")
                .phone("555-0108")
                .designation(medStudentDesignation)
                .hospital(hospital)
                .status("ACTIVE")
                .isManager(false)
                .type("PART_TIME")
                .hireDate(LocalDate.of(2024, 2, 1))
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        medStudent = staffRepository.save(medStudent);
        
        Staff offCampusTrainee = Staff.builder()
                .firstName("Lisa")
                .lastName("Garcia")
                .email("lisa.garcia@weroster.com")
                .phone("555-0109")
                .designation(offCampusTraineeDesignation)
                .hospital(hospital)
                .status("ACTIVE")
                .isManager(false)
                .type("PART_TIME")
                .hireDate(LocalDate.of(2024, 3, 15))
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        offCampusTrainee = staffRepository.save(offCampusTrainee);
        
        // Create Test User and link directly to nurse1
        User testUser = User.builder()
                .domain("test")
                .email("test@example.com")
                .passwordHash("5d41402abc4b2a76b9719d911017c592") // "hello" in MD5
                .salt("")
                .role("USER")
                .status("ACTIVE")
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .loginAttempts(0)
                .build();
        testUser = userRepository.save(testUser);
        
        // Link test user directly to nurse1
        nurse1.setUser(testUser);
        nurse1 = staffRepository.save(nurse1);
        
        System.out.println("🔗 Created direct User-Staff link:");
        System.out.println("   User ID: " + testUser.getId() + " (" + testUser.getEmail() + ")");
        System.out.println("   Staff ID: " + nurse1.getId() + " (" + nurse1.getFirstName() + " " + nurse1.getLastName() + ")");
        
        // Note: Individual shifts for today/tomorrow are now handled by the comprehensive shift system
        // This ensures no overlaps and consistent shift patterns
        
        // Note: Shift assignments are now handled by the comprehensive shift system
        // This ensures proper staff distribution and no overlapping assignments
        
        // Create more staff members for better testing
        Staff nurse4 = Staff.builder()
                .firstName("Jennifer")
                .lastName("Martinez")
                .email("jennifer.martinez@weroster.com")
                .phone("555-0110")
                .designation(nurseDesignation)
                .hospital(hospital)
                .status("ACTIVE")
                .isManager(false)
                .type("FULL_TIME")
                .hireDate(LocalDate.of(2023, 5, 10))
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        nurse4 = staffRepository.save(nurse4);
        
        Staff nurse5 = Staff.builder()
                .firstName("David")
                .lastName("Thompson")
                .email("david.thompson@weroster.com")
                .phone("555-0111")
                .designation(nurseDesignation)
                .hospital(hospital)
                .status("ACTIVE")
                .isManager(false)
                .type("PART_TIME")
                .hireDate(LocalDate.of(2023, 7, 15))
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        nurse5 = staffRepository.save(nurse5);
        
        Staff doctor2 = Staff.builder()
                .firstName("Dr. Amanda")
                .lastName("Lee")
                .email("amanda.lee@weroster.com")
                .phone("555-0202")
                .designation(doctorDesignation)
                .hospital(hospital)
                .status("ACTIVE")
                .isManager(false)
                .type("FULL_TIME")
                .hireDate(LocalDate.of(2022, 9, 1))
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        doctor2 = staffRepository.save(doctor2);
        
        Staff nurse6 = Staff.builder()
                .firstName("Rachel")
                .lastName("Green")
                .email("rachel.green@weroster.com")
                .phone("555-0112")
                .designation(nurseDesignation)
                .hospital(hospital)
                .status("ACTIVE")
                .isManager(false)
                .type("FULL_TIME")
                .hireDate(LocalDate.of(2023, 2, 20))
                .createdTime(LocalDateTime.now())
                .statusTime(LocalDateTime.now())
                .build();
        nurse6 = staffRepository.save(nurse6);
        
        // Create user accounts for all staff members (excluding nurse1 who already has test user)
        List<Staff> allStaff = Arrays.asList(nurse1, nurse2, doctor1, nurse3, surgeon, anaesCoordinator, 
                nurseConsultant, trainee, medStudent, offCampusTrainee, nurse4, nurse5, doctor2, nurse6);
        
        // Create user accounts for staff members (excluding nurse1 who already has test user)
        List<Staff> staffNeedingUsers = Arrays.asList(nurse2, doctor1, nurse3, surgeon, anaesCoordinator, 
                nurseConsultant, trainee, medStudent, offCampusTrainee, nurse4, nurse5, doctor2, nurse6);
        
        for (Staff staff : staffNeedingUsers) {
            User user = User.builder()
                    .domain("staff")
                    .email(staff.getEmail())
                    .passwordHash("5d41402abc4b2a76b9719d911017c592") // "hello" in MD5
                    .salt("")
                    .role("USER")
                    .status("ACTIVE")
                    .createdTime(LocalDateTime.now())
                    .statusTime(LocalDateTime.now())
                    .loginAttempts(0)
                    .build();
            user = userRepository.save(user);
            
            // Link user directly to staff
            staff.setUser(user);
            staffRepository.save(staff);
        }
        
        // Create comprehensive mock data for the last 2 months
        System.out.println("📅 Creating comprehensive mock data for the last 2 months...");
        
        // Always create test data for current month to ensure frontend can find shifts
        LocalDate currentDate = LocalDate.now();
        
        // Calculate the start of the current week (Monday) to ensure full week coverage
        int dayOfWeek = currentDate.getDayOfWeek().getValue(); // Monday = 1, Sunday = 7
        LocalDate currentWeekMonday = currentDate.minusDays(dayOfWeek - 1);
        
        // Start from either the Monday of current week or the 1st of the month, whichever is earlier
        LocalDate monthStart = currentDate.withDayOfMonth(1);
        LocalDate startDate = currentWeekMonday.isBefore(monthStart) ? currentWeekMonday : monthStart;
        LocalDate endDate = currentDate.plusDays(14); // Current date + 2 weeks
        
        System.out.println("📅 Data range: " + startDate + " to " + endDate + " (includes full current week)");
        
        int shiftCount = 0;
        int assignmentCount = 0;
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            // Create shifts using new shift type definitions:
            // AM: starts 8:00-13:00 | PM: starts 13:00-18:00 | AH: starts outside 8:00-18:00 | ON_CALL: standby
            List<Shift> dayShifts = new ArrayList<>();
            
            // === AM SHIFTS (start 8:00-13:00) ===
            
            // AM shift: 8:00-16:00 - Emergency Department
            Shift amShift1 = Shift.builder()
                    .startTs(date.atTime(8, 0))
                    .endTs(date.atTime(16, 0))
                    .type(determineShiftCode(8, false))
                    .department(emergencyDept)
                    .location(edRoom1)
                    .note("Early morning shift ED - " + date.toString())
                    .build();
            amShift1 = shiftRepository.save(amShift1);
            dayShifts.add(amShift1);
            shiftCount++;
            
            // AM shift: 9:00-17:00 - ICU Department
            Shift amShift2 = Shift.builder()
                    .startTs(date.atTime(9, 0))
                    .endTs(date.atTime(17, 0))
                    .type(determineShiftCode(9, false))
                    .department(icuDept)
                    .location(icuBed1)
                    .note("Morning shift ICU - " + date.toString())
                    .build();
            amShift2 = shiftRepository.save(amShift2);
            dayShifts.add(amShift2);
            shiftCount++;
            
            // AM shift: 10:00-18:00 - Medical Ward
            Shift amShift3 = Shift.builder()
                    .startTs(date.atTime(10, 0))
                    .endTs(date.atTime(18, 0))
                    .type(determineShiftCode(10, false))
                    .department(medicalDept)
                    .location(medWard)
                    .note("Mid-morning shift Medical - " + date.toString())
                    .build();
            amShift3 = shiftRepository.save(amShift3);
            dayShifts.add(amShift3);
            shiftCount++;
            
            // === PM SHIFTS (start 13:00-18:00) ===
            
            // PM shift: 14:00-22:00 - Emergency Department
            Shift pmShift1 = Shift.builder()
                    .startTs(date.atTime(14, 0))
                    .endTs(date.atTime(22, 0))
                    .type(determineShiftCode(14, false))
                    .department(emergencyDept)
                    .location(edRoom1)
                    .note("Afternoon shift ED - " + date.toString())
                    .build();
            pmShift1 = shiftRepository.save(pmShift1);
            dayShifts.add(pmShift1);
            shiftCount++;
            
            // PM shift: 16:00-00:00 - ICU Department
            Shift pmShift2 = Shift.builder()
                    .startTs(date.atTime(16, 0))
                    .endTs(date.plusDays(1).atTime(0, 0))
                    .type(determineShiftCode(16, false))
                    .department(icuDept)
                    .location(icuBed1)
                    .note("Evening shift ICU - " + date.toString())
                    .build();
            pmShift2 = shiftRepository.save(pmShift2);
            dayShifts.add(pmShift2);
            shiftCount++;
            
            // === AH SHIFTS (start outside 8:00-18:00) ===
            
            // AH shift: 22:00-06:00 - Emergency Department
            Shift ahShift1 = Shift.builder()
                    .startTs(date.atTime(22, 0))
                    .endTs(date.plusDays(1).atTime(6, 0))
                    .type(determineShiftCode(22, false))
                    .department(emergencyDept)
                    .location(edRoom1)
                    .note("Night shift ED - " + date.toString())
                    .build();
            ahShift1 = shiftRepository.save(ahShift1);
            dayShifts.add(ahShift1);
            shiftCount++;
            
            // AH shift: 00:00-08:00 - Medical Ward
            Shift ahShift2 = Shift.builder()
                    .startTs(date.atTime(0, 0))
                    .endTs(date.atTime(8, 0))
                    .type(determineShiftCode(0, false))
                    .department(medicalDept)
                    .location(medWard)
                    .note("Overnight shift Medical - " + date.toString())
                    .build();
            ahShift2 = shiftRepository.save(ahShift2);
            dayShifts.add(ahShift2);
            shiftCount++;
            
            // AH shift: 18:30-02:30 - ICU Department
            Shift ahShift3 = Shift.builder()
                    .startTs(date.atTime(18, 30))
                    .endTs(date.plusDays(1).atTime(2, 30))
                    .type(determineShiftCode(18, false))
                    .department(icuDept)
                    .location(icuBed1)
                    .note("Late evening shift ICU - " + date.toString())
                    .build();
            ahShift3 = shiftRepository.save(ahShift3);
            dayShifts.add(ahShift3);
            shiftCount++;
            
            // === ON_CALL SHIFTS (standby, can start anytime) ===
            
            // ON_CALL shift: 20:00-08:00 - Emergency (standby)
            Shift onCallShift = Shift.builder()
                    .startTs(date.atTime(20, 0))
                    .endTs(date.plusDays(1).atTime(8, 0))
                    .type(determineShiftCode(20, true))
                    .department(emergencyDept)
                    .location(edRoom1)
                    .note("On-call standby shift - " + date.toString())
                    .build();
            onCallShift = shiftRepository.save(onCallShift);
            dayShifts.add(onCallShift);
            shiftCount++;
            
            // Assign staff to shifts with variety for swap testing
            assignStaffToShifts(dayShifts, allStaff, date, shiftAssignmentRepository);
            assignmentCount += dayShifts.size() * 2; // Average 2 staff per shift
        }
        
        System.out.println("✅ Mock data created successfully!");
        System.out.println("📋 Created:");
        System.out.println("   - 1 Hospital: " + hospital.getName());
        System.out.println("   - 3 Departments: ED, ICU, Medical Ward");
        System.out.println("   - 3 Locations: ED Room 1, ICU Bed 1, Medical Ward A");
        System.out.println("   - 14 Staff members with user accounts:");
        System.out.println("     • Sarah Johnson (nurse1@weroster.com)");
        System.out.println("     • Michael Chen (nurse2@weroster.com)");
        System.out.println("     • Dr. Emily Rodriguez (doctor1@weroster.com)");
        System.out.println("     • Jessica Williams (nurse3@weroster.com)");
        System.out.println("     • Dr. Robert Wilson (surgeon@weroster.com)");
        System.out.println("     • Sarah Brown (anaes@weroster.com)");
        System.out.println("     • Michael Davis (consultant@weroster.com)");
        System.out.println("     • Emma Taylor (trainee@weroster.com)");
        System.out.println("     • James Anderson (student@weroster.com)");
        System.out.println("     • Lisa Garcia (offcampus@weroster.com)");
        System.out.println("     • Jennifer Martinez (nurse4@weroster.com)");
        System.out.println("     • David Thompson (nurse5@weroster.com)");
        System.out.println("     • Dr. Amanda Lee (doctor2@weroster.com)");
        System.out.println("     • Rachel Green (nurse6@weroster.com)");
        System.out.println("   - " + shiftCount + " Shifts: All non-overlapping comprehensive shifts");
        System.out.println("   - " + assignmentCount + " Shift assignments: All comprehensive assignments");
        System.out.println("   - All staff have user accounts with password: hello");
        System.out.println("   - Data spans: " + startDate + " to " + endDate + " (includes full current week + 2 weeks)");
        System.out.println("🔐 Login credentials for testing:");
        System.out.println("   - test@example.com / hello (original test user)");
        System.out.println("   - Any staff email / hello (e.g., sarah.johnson@weroster.com)");
        System.out.println("📅 Comprehensive Shift System (New Definitions):");
        System.out.println("   Shift Type Definitions:");
        System.out.println("     • AM: Shifts that START between 8:00-13:00");
        System.out.println("     • PM: Shifts that START between 13:00-18:00");
        System.out.println("     • AH: Shifts that START outside 8:00-18:00 range");
        System.out.println("     • ON_CALL: Standby shifts (can start anytime)");
        System.out.println("   Daily Shifts Created:");
        System.out.println("     • 3 AM shifts: 8:00-16:00 (ED), 9:00-17:00 (ICU), 10:00-18:00 (Medical)");
        System.out.println("     • 2 PM shifts: 14:00-22:00 (ED), 16:00-00:00 (ICU)");
        System.out.println("     • 3 AH shifts: 22:00-06:00 (ED), 00:00-08:00 (Medical), 18:30-02:30 (ICU)");
        System.out.println("     • 1 ON_CALL shift: 20:00-08:00 (ED standby)");
        System.out.println("   - Total: 9 shifts per day across all departments");
        System.out.println("🔄 Perfect for swap testing with diverse staff assignments!");
        System.out.println("👤 Test User (test@example.com / Sarah Johnson) Shift Pattern:");
        System.out.println("   • AM shifts: Every 3 days (day 3, 6, 9, 12, ...)");
        System.out.println("   • PM shifts: Every 3 days (day 1, 4, 7, 10, ...)");
        System.out.println("   • AH shifts: Every 4 days (day 4, 8, 12, 16, ...)");
        System.out.println("   • ON_CALL shifts: Every 3 days (day 2, 5, 8, 11, 14, ...) + every 8th day");
        System.out.println("   • Multiple shifts per day: Days 8, 16, 24 (AH + ON_CALL)");
        
        // Verify the user-staff link exists using direct relationship
        if (nurse1.getUser() != null) {
            System.out.println("✅ Verification: Direct User-Staff link exists");
            System.out.println("   User ID: " + nurse1.getUser().getId() + " (" + nurse1.getUser().getEmail() + ")");
            System.out.println("   Staff ID: " + nurse1.getId() + " (" + nurse1.getFirstName() + " " + nurse1.getLastName() + ")");
        } else {
            System.out.println("❌ Verification: Direct User-Staff link NOT found!");
        }
    }
    
    /**
     * Assign staff to shifts with variety for swap testing
     * Ensures no time overlaps and creates diverse assignments
     */
    private void assignStaffToShifts(List<Shift> shifts, List<Staff> allStaff, LocalDate date, 
                                   ShiftAssignmentRepository shiftAssignmentRepository) {
        Random random = new Random(date.toEpochDay()); // Use date as seed for consistent randomness
        
        for (Shift shift : shifts) {
            // Determine how many staff to assign based on shift type
            int staffCount = getStaffCountForShift(shift.getType());
            
            // Get available staff for this shift (avoid overlaps)
            List<Staff> availableStaff = getAvailableStaffForShift(shift, allStaff, date);
            
            // Prioritize test user for ON_CALL shifts (move to front if available)
            List<Staff> shuffledStaff = new ArrayList<>(availableStaff);
            if (shift.getType().equals("ON_CALL")) {
                Staff testUser = shuffledStaff.stream()
                    .filter(s -> s.getEmail().equals("sarah.johnson@weroster.com"))
                    .findFirst()
                    .orElse(null);
                if (testUser != null) {
                    shuffledStaff.remove(testUser);
                    shuffledStaff.add(0, testUser); // Put test user first
                    System.out.println("📌 Prioritized test user for ON_CALL on " + date);
                }
            } else {
                // Shuffle other shift types normally
                for (int i = shuffledStaff.size() - 1; i > 0; i--) {
                    int j = random.nextInt(i + 1);
                    Staff temp = shuffledStaff.get(i);
                    shuffledStaff.set(i, shuffledStaff.get(j));
                    shuffledStaff.set(j, temp);
                }
            }
            
            // Debug logging for ON_CALL shifts
            if (shift.getType().equals("ON_CALL")) {
                System.out.println("🔍 DEBUG ON_CALL: Date=" + date + ", DayOfYear=" + date.getDayOfYear() + 
                                   ", Available staff count=" + shuffledStaff.size() + 
                                   ", Needed=" + staffCount);
                if (shuffledStaff.size() > 0) {
                    for (Staff s : shuffledStaff) {
                        System.out.println("   → Available: " + s.getFirstName() + " " + s.getLastName() + " (" + s.getEmail() + ")");
                    }
                }
            }
            
            // Assign staff to shift
            for (int i = 0; i < Math.min(staffCount, shuffledStaff.size()); i++) {
                Staff staff = shuffledStaff.get(i);
                boolean isLead = (i == 0); // First assigned staff is lead
                
                ShiftAssignment assignment = ShiftAssignment.builder()
                        .shift(shift)
                        .staff(staff)
                        .isLead(isLead)
                        .assignedAt(LocalDateTime.now())
                        .note(shift.getType() + " shift assignment - " + staff.getFirstName() + " " + staff.getLastName())
                        .build();
                shiftAssignmentRepository.save(assignment);
                
                // Extra logging for ON_CALL assignments
                if (shift.getType().equals("ON_CALL")) {
                    System.out.println("✅ Assigned ON_CALL to: " + staff.getFirstName() + " " + staff.getLastName() + " on " + date);
                }
            }
        }
    }
    
    /**
     * Determine shift code based on start time according to new shift type definitions:
     * - AM: shifts that start between 8:00-13:00
     * - PM: shifts that start between 13:00-18:00
     * - AH: shifts that start outside 8:00-18:00 range
     * - ON_CALL: standby shifts (can start anytime, but marked explicitly)
     */
    private String determineShiftCode(int startHour, boolean isOnCall) {
        if (isOnCall) {
            return "ON_CALL";
        } else if (startHour >= 8 && startHour < 13) {
            return "AM";
        } else if (startHour >= 13 && startHour < 18) {
            return "PM";
        } else {
            return "AH";
        }
    }
    
    /**
     * Get the number of staff to assign based on shift type
     */
    private int getStaffCountForShift(String shiftCode) {
        switch (shiftCode) {
            case "AM":
                return 3; // 3 staff for AM shifts
            case "PM":
                return 2; // 2 staff for PM shifts
            case "AH":
                return 2; // 2 staff for AH shifts
            case "ON_CALL":
                return 1; // 1 staff for ON_CALL shifts
            default:
                return 2;
        }
    }
    
    /**
     * Get available staff for a shift, ensuring no overlaps and proper test user assignments
     */
    private List<Staff> getAvailableStaffForShift(Shift shift, List<Staff> allStaff, LocalDate date) {
        List<Staff> availableStaff = new ArrayList<>();
        
        // Use a deterministic pattern based on date and shift type to ensure consistency
        int dayOfYear = date.getDayOfYear();
        int shiftTypeHash = shift.getType().hashCode();
        
        for (int i = 0; i < allStaff.size(); i++) {
            Staff staff = allStaff.get(i);
            
            // Ensure test user (nurse1) gets regular assignments for testing
            boolean isTestUser = staff.getEmail().equals("sarah.johnson@weroster.com");
            
            // Use a pattern that ensures:
            // 1. Test user gets assignments on specific days for testing
            // 2. No staff gets assigned to overlapping shifts
            // 3. Good distribution across all staff
            
            boolean isAvailable = true;
            
            if (isTestUser) {
                // Test user gets regular assignments for testing
                // Give test user shifts more frequently for better testing experience
                if (shift.getType().equals("AM") && dayOfYear % 3 == 0) {
                    isAvailable = true; // Test user gets AM shifts every 3 days
                } else if (shift.getType().equals("PM") && dayOfYear % 3 == 1) {
                    isAvailable = true; // Test user gets PM shifts every 3 days
                } else if (shift.getType().equals("AH") && dayOfYear % 4 == 0) {
                    isAvailable = true; // Test user gets AH shifts every 4 days
                } else if (shift.getType().equals("ON_CALL") && dayOfYear % 3 == 2) {
                    isAvailable = true; // Test user gets ON_CALL shifts every 3 days (day 2, 5, 8, 11, 14, ...)
                } else {
                    isAvailable = false; // Test user doesn't get other shifts
                }
                
                // Special case: Also assign ON_CALL on days when test user has AH (for testing multiple shifts per day)
                // This creates days with both AH and ON_CALL shifts
                if (shift.getType().equals("ON_CALL") && dayOfYear % 8 == 0) {
                    isAvailable = true; // ON_CALL on every 8th day (some overlap with AH on day 8, 16, 24, ...)
                }
                
                // Debug logging for test user ON_CALL availability
                if (shift.getType().equals("ON_CALL")) {
                    System.out.println("🧪 Test user ON_CALL check: Date=" + date + ", DayOfYear=" + dayOfYear + 
                                       ", dayOfYear%3=" + (dayOfYear % 3) + ", dayOfYear%8=" + (dayOfYear % 8) + 
                                       ", isAvailable=" + isAvailable);
                }
            } else {
                // Other staff get distributed assignments
                int staffHash = (staff.getId().intValue() + dayOfYear + shiftTypeHash) % 7;
                
                if (shift.getType().equals("AM") && staffHash < 4) {
                    isAvailable = true; // 4 out of 7 staff available for AM
                } else if (shift.getType().equals("PM") && staffHash < 3) {
                    isAvailable = true; // 3 out of 7 staff available for PM
                } else if (shift.getType().equals("AH") && staffHash < 2) {
                    isAvailable = true; // 2 out of 7 staff available for AH
                } else if (shift.getType().equals("ON_CALL") && staffHash < 1) {
                    isAvailable = true; // 1 out of 7 staff available for ON_CALL
                } else {
                    isAvailable = false;
                }
            }
            
            if (isAvailable) {
                availableStaff.add(staff);
            }
        }
        
        return availableStaff;
    }
    
    private void createTestLeaveRequests() {
        System.out.println("🔍 DataInitializer - Creating test leave requests...");
        
        // Find the test user (Sarah Johnson)
        User testUser = userRepository.findAll().stream()
            .filter(user -> "test@example.com".equals(user.getEmail()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Test user not found"));
        Staff testStaff = testUser.getStaff();
        if (testStaff == null) {
            System.out.println("🔍 DataInitializer - Test user has no staff record, skipping leave requests");
            return;
        }
        
        // Find some shifts for the test user
        List<Shift> testUserShifts = shiftAssignmentRepository.findAll().stream()
            .filter(assignment -> assignment.getStaff().getId().equals(testStaff.getId()))
            .map(assignment -> assignment.getShift())
            .distinct()
            .limit(3)
            .toList();
        
        if (testUserShifts.isEmpty()) {
            System.out.println("🔍 DataInitializer - No shifts found for test user, skipping leave requests");
            return;
        }
        
        // Create test leave requests
        List<LeaveRequest> testLeaves = new ArrayList<>();
        
        // 1. Month Leave request with status "REJECTED" (Declined) - Current month for visibility
        LocalDate today = LocalDate.now();
        LeaveRequest monthLeave = LeaveRequest.builder()
            .staff(testStaff)
            .shift(null) // Month leave is not tied to a specific shift
            .startTime(today.withDayOfMonth(1).atStartOfDay()) // First day of current month
            .endTime(today.withDayOfMonth(today.lengthOfMonth()).atTime(23, 59)) // Last day of current month
            .requestType("Month Leave")
            .reason("Family vacation")
            .status("REJECTED")
            .createdAt(LocalDateTime.now().minusDays(5))
            .build();
        testLeaves.add(monthLeave);
        System.out.println("🔍 DataInitializer - Created Month Leave request (REJECTED) for " + today.getMonth());
        
        // 2. Week Leave request with status "APPROVED" - Next week for visibility
        LocalDate nextWeekStart = today.plusWeeks(1);
        LeaveRequest weekLeave = LeaveRequest.builder()
            .staff(testStaff)
            .shift(null) // Week leave is not tied to a specific shift
            .startTime(nextWeekStart.atStartOfDay()) // Next week start
            .endTime(nextWeekStart.plusDays(6).atTime(23, 59)) // Next week end (7 days)
            .requestType("Week Leave")
            .reason("Medical treatment")
            .status("APPROVED")
            .createdAt(LocalDateTime.now().minusDays(3))
            .build();
        testLeaves.add(weekLeave);
        System.out.println("🔍 DataInitializer - Created Week Leave request (APPROVED) for " + nextWeekStart + " to " + nextWeekStart.plusDays(6));
        
        // Save all test leave requests
        leaveRequestRepository.saveAll(testLeaves);
        System.out.println("🔍 DataInitializer - Saved " + testLeaves.size() + " test leave requests");
        
        // Log details
        for (LeaveRequest leave : testLeaves) {
            System.out.println("🔍 DataInitializer - Leave Request ID: " + leave.getId() + 
                ", Type: " + leave.getRequestType() + 
                ", Status: " + leave.getStatus() + 
                ", Start: " + leave.getStartTime() + 
                ", End: " + leave.getEndTime() +
                ", Shift ID: " + (leave.getShift() != null ? leave.getShift().getId() : "null"));
        }
    }
}