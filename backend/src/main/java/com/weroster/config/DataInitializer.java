package com.weroster.config;

import com.weroster.entity.*;
import com.weroster.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

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
    private UserStaffRepository userStaffRepository;

    @Override
    public void run(String... args) throws Exception {
        
        // Only initialize if database is empty
        if (userRepository.count() == 0) {
            createMockData();
        }
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
        
        // Create Test User and link to staff
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
        
        // Link test user to nurse1
        UserStaff userStaff = UserStaff.builder()
                .user(testUser)
                .staff(nurse1)
                .build();
        userStaff = userStaffRepository.save(userStaff);
        
        System.out.println("🔗 Created UserStaff link:");
        System.out.println("   User ID: " + testUser.getId() + " (" + testUser.getEmail() + ")");
        System.out.println("   Staff ID: " + nurse1.getId() + " (" + nurse1.getFirstName() + " " + nurse1.getLastName() + ")");
        System.out.println("   UserStaff ID: " + userStaff.getId());
        
        // Create Shifts for Today and Tomorrow using flexible shift times
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        
        // Today's AM shift (flexible morning time: 10:00-15:00)
        Shift morningShiftToday = Shift.builder()
                .startTs(today.atTime(10, 0)) // 10:00 AM
                .endTs(today.atTime(15, 0))   // 3:00 PM (5 hours)
                .code("AM")
                .department(emergencyDept)
                .location(edRoom1)
                .note("Flexible AM shift in ED")
                .build();
        morningShiftToday = shiftRepository.save(morningShiftToday);
        
        // Today's PM shift (flexible afternoon time: 14:00-20:00)
        Shift afternoonShiftToday = Shift.builder()
                .startTs(today.atTime(14, 0)) // 2:00 PM
                .endTs(today.atTime(20, 0))  // 8:00 PM (6 hours)
                .code("PM")
                .department(icuDept)
                .location(icuBed1)
                .note("Flexible PM shift in ICU")
                .build();
        afternoonShiftToday = shiftRepository.save(afternoonShiftToday);
        
        // Today's AH shift (completely flexible: 9:00-17:00)
        Shift anyHourShiftToday = Shift.builder()
                .startTs(today.atTime(9, 0))  // 9:00 AM
                .endTs(today.atTime(17, 0))   // 5:00 PM (8 hours)
                .code("AH")
                .department(medicalDept)
                .location(medWard)
                .note("Flexible Any Hour shift in Medical Ward")
                .build();
        anyHourShiftToday = shiftRepository.save(anyHourShiftToday);
        
        // Tomorrow's AM shift (flexible morning time: 7:00-12:00)
        Shift morningShiftTomorrow = Shift.builder()
                .startTs(tomorrow.atTime(7, 0))  // 7:00 AM
                .endTs(tomorrow.atTime(12, 0))   // 12:00 PM (5 hours)
                .code("AM")
                .department(emergencyDept)
                .location(edRoom1)
                .note("Early AM shift in ED")
                .build();
        morningShiftTomorrow = shiftRepository.save(morningShiftTomorrow);
        
        // Tomorrow's PM shift (flexible afternoon time: 15:00-21:00)
        Shift afternoonShiftTomorrow = Shift.builder()
                .startTs(tomorrow.atTime(15, 0)) // 3:00 PM
                .endTs(tomorrow.atTime(21, 0))  // 9:00 PM (6 hours)
                .code("PM")
                .department(icuDept)
                .location(icuBed1)
                .note("Late PM shift in ICU")
                .build();
        afternoonShiftTomorrow = shiftRepository.save(afternoonShiftTomorrow);
        
        // Tomorrow's ON_CALL shift (completely flexible: 22:00-06:00 next day)
        Shift onCallShiftTomorrow = Shift.builder()
                .startTs(tomorrow.atTime(22, 0)) // 10:00 PM
                .endTs(tomorrow.plusDays(1).atTime(6, 0)) // 6:00 AM next day (8 hours)
                .code("ON_CALL")
                .department(medicalDept)
                .location(medWard)
                .note("On-call shift overnight")
                .build();
        onCallShiftTomorrow = shiftRepository.save(onCallShiftTomorrow);
        
        // Create Shift Assignments
        // Assign nurse1 (test user) to morning shift today
        ShiftAssignment assignment1 = ShiftAssignment.builder()
                .shift(morningShiftToday)
                .staff(nurse1)
                .isLead(false)
                .assignedAt(LocalDateTime.now())
                .note("Regular assignment")
                .build();
        shiftAssignmentRepository.save(assignment1);
        
        // Assign doctor1 as lead to morning shift today
        ShiftAssignment assignment2 = ShiftAssignment.builder()
                .shift(morningShiftToday)
                .staff(doctor1)
                .isLead(true)
                .assignedAt(LocalDateTime.now())
                .note("Lead assignment")
                .build();
        shiftAssignmentRepository.save(assignment2);
        
        // Assign nurse2 to afternoon shift today
        ShiftAssignment assignment3 = ShiftAssignment.builder()
                .shift(afternoonShiftToday)
                .staff(nurse2)
                .isLead(false)
                .assignedAt(LocalDateTime.now())
                .note("ICU assignment")
                .build();
        shiftAssignmentRepository.save(assignment3);
        
        // Assign nurse3 to AH shift today
        ShiftAssignment assignment4 = ShiftAssignment.builder()
                .shift(anyHourShiftToday)
                .staff(nurse3)
                .isLead(false)
                .assignedAt(LocalDateTime.now())
                .note("AH shift assignment")
                .build();
        shiftAssignmentRepository.save(assignment4);
        
        // Assign nurse1 (test user) to tomorrow's afternoon shift
        ShiftAssignment assignment5 = ShiftAssignment.builder()
                .shift(afternoonShiftTomorrow)
                .staff(nurse1)
                .isLead(false)
                .assignedAt(LocalDateTime.now())
                .note("Tomorrow PM assignment")
                .build();
        shiftAssignmentRepository.save(assignment5);
        
        // Assign doctor1 to tomorrow's AM shift
        ShiftAssignment assignment6 = ShiftAssignment.builder()
                .shift(morningShiftTomorrow)
                .staff(doctor1)
                .isLead(true)
                .assignedAt(LocalDateTime.now())
                .note("Tomorrow AM lead assignment")
                .build();
        shiftAssignmentRepository.save(assignment6);
        
        // Assign nurse2 to tomorrow's ON_CALL shift
        ShiftAssignment assignment7 = ShiftAssignment.builder()
                .shift(onCallShiftTomorrow)
                .staff(nurse2)
                .isLead(false)
                .assignedAt(LocalDateTime.now())
                .note("ON_CALL shift assignment")
                .build();
        shiftAssignmentRepository.save(assignment7);
        
        // Create comprehensive mock data for the last 2 months
        System.out.println("📅 Creating comprehensive mock data for the last 2 months...");
        
        LocalDate startDate = LocalDate.now().minusMonths(2);
        LocalDate endDate = LocalDate.now().plusDays(7); // Include next week
        
        int shiftCount = 0;
        int assignmentCount = 0;
        
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            // Skip weekends for some variety
            if (date.getDayOfWeek().getValue() > 5 && date.getDayOfWeek().getValue() % 2 == 0) {
                continue;
            }
            
            // Create AM shift
            Shift amShift = Shift.builder()
                    .startTs(date.atTime(8, 0)) // 8:00 AM
                    .endTs(date.atTime(16, 0))  // 4:00 PM
                    .code("AM")
                    .department(emergencyDept)
                    .location(edRoom1)
                    .note("Morning shift - " + date.toString())
                    .build();
            amShift = shiftRepository.save(amShift);
            shiftCount++;
            
            // Create PM shift
            Shift pmShift = Shift.builder()
                    .startTs(date.atTime(16, 0)) // 4:00 PM
                    .endTs(date.atTime(23, 59))  // 11:59 PM (valid hour)
                    .code("PM")
                    .department(icuDept)
                    .location(icuBed1)
                    .note("Evening shift - " + date.toString())
                    .build();
            pmShift = shiftRepository.save(pmShift);
            shiftCount++;
            
            // Create AH shift (every other day)
            if (date.getDayOfMonth() % 2 == 0) {
                Shift ahShift = Shift.builder()
                        .startTs(date.atTime(22, 0)) // 10:00 PM
                        .endTs(date.plusDays(1).atTime(6, 0)) // Next day 6:00 AM
                        .code("AH")
                        .department(medicalDept)
                        .location(medWard)
                        .note("After hours shift - " + date.toString())
                        .build();
                ahShift = shiftRepository.save(ahShift);
                shiftCount++;
                
                // Assign nurse3 to AH shift
                ShiftAssignment ahAssignment = ShiftAssignment.builder()
                        .shift(ahShift)
                        .staff(nurse3)
                        .isLead(false)
                        .assignedAt(LocalDateTime.now())
                        .note("AH shift assignment")
                        .build();
                shiftAssignmentRepository.save(ahAssignment);
                assignmentCount++;
            }
            
            // Create ON_CALL shift (every 3rd day)
            if (date.getDayOfMonth() % 3 == 0) {
                Shift onCallShift = Shift.builder()
                        .startTs(date.atTime(6, 0)) // 6:00 AM
                        .endTs(date.atTime(14, 0))  // 2:00 PM
                        .code("ON_CALL")
                        .department(emergencyDept)
                        .location(edRoom1)
                        .note("On-call shift - " + date.toString())
                        .build();
                onCallShift = shiftRepository.save(onCallShift);
                shiftCount++;
                
                // Assign doctor1 to ON_CALL shift
                ShiftAssignment onCallAssignment = ShiftAssignment.builder()
                        .shift(onCallShift)
                        .staff(doctor1)
                        .isLead(true)
                        .assignedAt(LocalDateTime.now())
                        .note("ON_CALL lead assignment")
                        .build();
                shiftAssignmentRepository.save(onCallAssignment);
                assignmentCount++;
            }
            
            // Assign multiple staff to shifts on weekdays (2-4 staff per shift, no overlaps)
            if (date.getDayOfWeek().getValue() <= 5) {
                // AM Shift: Assign 3-4 staff members
                List<Staff> amStaff = Arrays.asList(nurse1, nurse2, nurseConsultant, trainee);
                for (int i = 0; i < 3; i++) { // Assign 3 staff to AM shift
                    ShiftAssignment amAssignment = ShiftAssignment.builder()
                            .shift(amShift)
                            .staff(amStaff.get(i))
                            .isLead(i == 0) // First staff is lead
                            .assignedAt(LocalDateTime.now())
                            .note("AM shift assignment - staff " + (i + 1))
                            .build();
                    shiftAssignmentRepository.save(amAssignment);
                    assignmentCount++;
                }
                
                // PM Shift: Assign 2-3 staff members (different from AM to avoid overlap)
                List<Staff> pmStaff = Arrays.asList(doctor1, surgeon, anaesCoordinator);
                for (int i = 0; i < 2; i++) { // Assign 2 staff to PM shift
                    ShiftAssignment pmAssignment = ShiftAssignment.builder()
                            .shift(pmShift)
                            .staff(pmStaff.get(i))
                            .isLead(i == 0) // First staff is lead
                            .assignedAt(LocalDateTime.now())
                            .note("PM shift assignment - staff " + (i + 1))
                            .build();
                    shiftAssignmentRepository.save(pmAssignment);
                    assignmentCount++;
                }
            }
        }
        
        System.out.println("✅ Mock data created successfully!");
        System.out.println("📋 Created:");
        System.out.println("   - 1 Hospital: " + hospital.getName());
        System.out.println("   - 3 Departments: ED, ICU, Medical Ward");
        System.out.println("   - 3 Locations: ED Room 1, ICU Bed 1, Medical Ward A");
        System.out.println("   - 4 Staff members: Sarah Johnson, Michael Chen, Dr. Emily Rodriguez, Jessica Williams");
        System.out.println("   - " + (6 + shiftCount) + " Shifts: Original 6 + " + shiftCount + " comprehensive shifts");
        System.out.println("   - " + (7 + assignmentCount) + " Shift assignments: Original 7 + " + assignmentCount + " comprehensive assignments");
        System.out.println("   - Test user linked to Sarah Johnson");
        System.out.println("   - Data spans: " + startDate + " to " + endDate + " (2+ months)");
        System.out.println("🔐 Login credentials: test@example.com / hello");
        System.out.println("📅 Flexible Shift System:");
        System.out.println("   - AM: Morning shifts (flexible start/end times)");
        System.out.println("   - PM: Afternoon shifts (flexible start/end times)");
        System.out.println("   - AH: Any Hour shifts (completely flexible)");
        System.out.println("   - ON_CALL: On-call shifts (completely flexible)");
        
            // Verify the user-staff link exists (without accessing lazy properties)
            Optional<UserStaff> verifyLink = userStaffRepository.findUserStaffByUser(testUser);
        if (verifyLink.isPresent()) {
            System.out.println("✅ Verification: UserStaff link exists");
            System.out.println("   User ID: " + verifyLink.get().getUser().getId());
            System.out.println("   Staff ID: " + verifyLink.get().getStaff().getId());
        } else {
            System.out.println("❌ Verification: UserStaff link NOT found!");
        }
    }
}