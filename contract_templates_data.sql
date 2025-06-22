-- Contract Templates Knowledge Base Data
-- Generated for Supabase SQL Editor
-- Copy and paste this entire file content into Supabase SQL Editor

-- ========================================
-- CONTRACT TEMPLATES INSERTION SCRIPT
-- ========================================

-- This file contains INSERT statements for:
-- 1. contract_templates (main template records)
-- 2. contract_sections (modular sections within templates)  
-- 3. contract_clauses (reusable legal clauses)
-- 4. contract_parameters (required fields for each contract type)

-- Run this script after the knowledge base migration has been executed
-- ========================================

-- Template 1: Employment Agreement with Stock Options
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'employment', 'Employment Agreement with Stock Options', 'Comprehensive employment contract including stock option grants, equity vesting, confidentiality, non-compete clauses, and termination provisions for companies in India', 'agreement', 'India', ARRAY['employment', 'stock options', 'equity', 'vesting', 'confidentiality', 'non-compete', 'termination', 'probation', 'compensation']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES 

-- Preamble
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'preamble', 'Agreement Header and Parties', 'This EMPLOYMENT AGREEMENT (Hereinafter, the "Agreement") is entered into on this __ day of ______, 20__ (Effective Date). 

BY AND BETWEEN

_____________, a private limited company incorporated under the Companies Act, 1956/2013, having its registered office at ___________________________ (hereinafter referred to as the "Company" or "Employer", which expression shall, unless repugnant to the meaning or context hereof, be deemed to include all permitted successors and assigns), 
AND
Mr. __________________ son/daughter/wife of Mr. ____________ aged ___ years and residing at ___________________________________(hereinafter referred to as the "Employee", which expression shall, unless repugnant to the meaning or context hereof, be deemed to include all permitted successors and assigns).', '["effective_date", "company_name", "company_address", "employee_name", "employee_relation", "guardian_name", "employee_age", "employee_address"]', 1, false),

-- Definitions
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', 'definitions', 'Interpretation and Definitions', 'In this agreement the following terms shall have the following meanings:
a) Reporting Lead: The reporting lead shall be the immediate senior of the Employee who the Employee shall be reporting to, especially in cases of leaves and other such required permissions.
b) "The Employment": the employment of the Employee by the Company in accordance with the terms of this agreement;
c) "Termination Date": the date on which the Employment ceases.
d) Founder: The Founder shall mean the person who founded the Company, Mr. ________________.', '["founder_name"]', 2, false),

-- Position and Duties
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440001', 'position', 'Position and Role Changes', 'Upon execution of this Agreement, the employee would be posted as the ____________ of the Company. During the term period of this Agreement, the Company may change the Employee''s above mentioned post (or position) or location based on the Company''s production, operation or working requirements or according to the employee''s working capacities and performance, including but not limited to adjustments made to the employee''s job description or work place, promotion, work transfer at the same level, and demotion, etc., or adjustments made to the employee''s responsibilities without any change to employee''s post (or position).', '["job_title"]', 3, false),

-- Term and Probation
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440001', 'probation', 'Term and Probation Period', 'It is understood and agreed that the first ninety (30) days of employment shall constitute a probationary period ("Probationary Period") during which period the Employer may, in its absolute discretion, terminate the Employee''s employment, for any reason without notice or cause. Section 10 of this Agreement shall come into effect only after the completion of the Probationary Period. After the end of the Probationary Period, the Employer may decide to confirm the Employment of the Employee, in its sole discretion. After the end of the Probationary Period, this Agreement may be terminated in accordance with Clause 17 of this Agreement.', '[]', 4, false),

-- Performance of Duties
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440001', 'duties', 'Performance of Duties', 'The Employee agrees that during the Employment Period, he/she shall devote his/her full business time to the business affairs of the Company and shall perform the duties assigned to him/her faithfully and efficiently, and shall endeavor, to the best of his/her abilities to achieve the goals and adhere to the parameters set by the Company. The Employee further promises to never engage in any theft of the Employer''s property or attempt to defraud the Employer in any manner. The Employee shall not be assigned duties and responsibilities that are not generally within the scope and character associated or required of other employees of similar rank and position. The Employee shall work for 6 (six) days a week from Monday to Saturday.', '[]', 5, false),

-- Compensation
('550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440001', 'compensation', 'Compensation and Benefits', 'The Employee shall receive an annual salary, payable in monthly or more frequent installments, as per the convenience of the Employer, an amount of Rs. ___________/- (Rupees ________________________ only) per month, subject to such increases from time to time, as determined by the Employer. Such payments shall be subject to such normal statutory deductions by the Employer. During the term of this Agreement, the Employee''s salary shall be paid by means of bank transfer, cheque, or any other method convenient to the Employer, and consented to by the Employee. All reasonable expenses arising out of employment shall be reimbursed assuming that the same have been authorized prior to being incurred.', '["monthly_salary", "salary_in_words"]', 6, false),

-- Stock Options
('550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440001', 'stock_options', 'Stock Option Plans', 'For the purpose of encouraging and rewarding the Employee''s contributions to the performance of the Company and aligning Employee''s interests with the interests of the Company''s stockholders, the Company grants to Employee options to purchase ___ shares of Company common stock, INR ___ par value per share. The Options will become exercisable subject to stockholder approval and vesting schedules. The Options will fully vest and become immediately exercisable if Employee is terminated by the Company other than for cause within sixty (60) days prior to a Change in Control or twelve (12) months following a Change in Control.', '["option_shares", "par_value"]', 7, true),

-- Leave Policy
('550e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440001', 'leave', 'Holiday and Leave Policy', 'The Employee is entitled to ten (10) days of paid leave in a year and ten (10) sick leave in a year. In addition, the Employee will be entitled to the usual bank and public holidays. The Employee may not, without the prior written consent of the Company carry forward more than 7days holiday from one holiday year to the next. Any authorized holiday that is carried forward must be used by August in the following holiday year.', '[]', 8, false),

-- Termination
('550e8400-e29b-41d4-a716-446655440109', '550e8400-e29b-41d4-a716-446655440001', 'termination', 'Amendment and Termination', 'The Employer may terminate the employment of the Employee at any time: for just cause at common law, in which case the Employee is not entitled to any advance notice of termination or compensation in lieu of notice; In case the Employer terminates the employment without just cause, in which case the Employer shall provide the Employee with advance notice of termination or compensation in lieu of notice equal to 2 months. The Employee may terminate his employment at any time by providing the Employer with at least two(2) month advance notice of his intention to resign.', '[]', 9, false),

-- Signatures
('550e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440001', 'signatures', 'Execution and Signatures', 'IN WITNESS WHEREOF, the Employee has hereunto set his hand, and the Company has caused these presents to be executed in its name and on its behalf.

____________________        ___________________
(Employee)                    (The Employer)

Name: _________________        Represented By:                
Designation: ______', '["employee_signature", "employer_signature", "employee_name_sign", "employer_representative", "employee_designation"]', 10, false);

-- Insert reusable contract clauses
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES 

('550e8400-e29b-41d4-a716-446655440201', 'confidentiality', 'Comprehensive Confidentiality Clause', 'The Company owns and may develop, compile and own certain proprietary techniques, trade secrets, and confidential information, which are very valuable to the Company (collectively, "Confidential Information"). All records, documents, and files concerning the company shall be treated as confidential information and includes not only information disclosed by Company, but also information developed or learned by the employee during employee''s performance of the Services. Confidential Information includes, but is not limited to, current and future product plans & specifications, technology, algorithms, prototypes, data, methods, processes, developments, designs, inventions, techniques, know-how, details of customers and business contacts, Vendor Information, business model, business plans, business process, marketing, sales or other business information, costs and resources, tools used; and all derivatives or improvements to any of the above.', ARRAY['confidentiality', 'trade secrets', 'proprietary information', 'non-disclosure'], ARRAY['employment', 'consulting', 'service agreements']),

('550e8400-e29b-41d4-a716-446655440202', 'non_compete', 'Non-Compete Restriction', 'In order to protect the Company''s legitimate business interests, the Employee shall not participate, directly or indirectly in any business or activity that involves _______________________________ or competes with the business, proposed business or business interests of the Company within or outside the territory of India, whether as an employee, consultant, officer, director, advisor, owner, sole proprietor, investor, or partner for a period of 5 (five) years from the termination of this Agreement.', ARRAY['non-compete', 'business restriction', 'competitive activities'], ARRAY['employment', 'executive agreements']),

('550e8400-e29b-41d4-a716-446655440203', 'non_solicitation', 'Non-Solicitation of Employees and Clients', 'During the Term of this Agreement and for a period of five (5) years after the termination of this Agreement, the Employee agrees not to solicit any employee, consultant, client or other persons of the Employer, without the Employer''s prior written consent. Furthermore, the employee, in any way, directly or indirectly, interfere with the relationship between any client or business counterparties or prospective clients.', ARRAY['non-solicitation', 'employee protection', 'client protection'], ARRAY['employment', 'executive agreements', 'sales agreements']),

('550e8400-e29b-41d4-a716-446655440204', 'intellectual_property', 'Assignment of Intellectual Property', 'The Employee acknowledges that any work including without limitation product development, contributions and inventions, discoveries, designs, innovations, creations, developments, improvements, works of authorship, ideas, formulae, processes, techniques, know-how and data (whether or not patentable, and whether or not at a commercial stage, or registered under any intellectual property laws) of any kind that are conceived, created, developed, learned or reduced to practice by the Employee during the period of employment are "works made for hire" and Employee shall assign, and does hereby assign, to the Employer all of Employee''s right, title and interest in and to all Intellectual Property.', ARRAY['intellectual property', 'work for hire', 'inventions', 'assignment'], ARRAY['employment', 'development agreements', 'consulting']),

('550e8400-e29b-41d4-a716-446655440205', 'stock_vesting', 'Stock Option Vesting and Exercise', 'The Options will become exercisable subject to stockholder approval and vesting schedules. The Options will fully vest and become immediately exercisable if Employee is terminated by the Company other than for cause within sixty (60) days prior to a Change in Control or twelve (12) months following a Change in Control. Unless an earlier termination date occurs, the Options will expire and become un-exercisable on the twentieth(20th) anniversary of the Effective Date.', ARRAY['stock options', 'vesting', 'change in control', 'equity'], ARRAY['employment', 'executive compensation', 'startup agreements']),

('550e8400-e29b-41d4-a716-446655440206', 'indemnification', 'Employee Indemnification Clause', 'The Employee shall indemnify the employer against any and all expenses, including amounts paid upon judgments, counsel fees, environmental penalties and fines, and amounts paid in settlement (before or after suit is commenced), incurred by the employer in connection with his/her defense or settlement of any claim, action, suit or proceeding in which he/she is made a party or which may be asserted against his/her by reason of his/her employment or the performance of duties in this Agreement.', ARRAY['indemnification', 'liability protection', 'legal expenses'], ARRAY['employment', 'executive agreements', 'high-risk positions']),

('550e8400-e29b-41d4-a716-446655440207', 'dispute_resolution', 'Mediation and Arbitration', 'The Parties agree to first mediate any disputes or claims between them in good faith and resolve the disputes amicably and share the cost of mediation equally. In the event that mediation fails, any controversy or claim arising out of or relating to this Agreement or breach of any duties hereunder shall be settled by Arbitration in accordance with the Arbitration and Conciliation Act of India, 1996. All hearings will be held in _______________, India and shall be conducted in English.', ARRAY['dispute resolution', 'mediation', 'arbitration', 'India'], ARRAY['employment', 'service agreements', 'commercial contracts']);

-- Insert contract parameters for employment agreements
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES 

('550e8400-e29b-41d4-a716-446655440301', 'employment', 'effective_date', 'Agreement Effective Date', 'date', true, 'The date when the employment agreement becomes effective', '2024-01-15', NULL),
('550e8400-e29b-41d4-a716-446655440302', 'employment', 'company_name', 'Company Name', 'text', true, 'Legal name of the employing company', 'Tech Innovations Pvt Ltd', NULL),
('550e8400-e29b-41d4-a716-446655440303', 'employment', 'company_address', 'Company Registered Address', 'text', true, 'Complete registered office address of the company', 'Plot 123, Sector 45, Gurgaon, Haryana - 122001', NULL),
('550e8400-e29b-41d4-a716-446655440304', 'employment', 'employee_name', 'Employee Full Name', 'text', true, 'Complete legal name of the employee', 'Rahul Kumar Sharma', NULL),
('550e8400-e29b-41d4-a716-446655440305', 'employment', 'employee_relation', 'Employee Relationship', 'select', true, 'Relationship identifier for employee', 'son', '["son", "daughter", "wife", "husband"]'),
('550e8400-e29b-41d4-a716-446655440306', 'employment', 'guardian_name', 'Guardian/Spouse Name', 'text', true, 'Name of employee''s father/mother/spouse', 'Suresh Kumar Sharma', NULL),
('550e8400-e29b-41d4-a716-446655440307', 'employment', 'employee_age', 'Employee Age', 'number', true, 'Age of the employee in years', '28', NULL),
('550e8400-e29b-41d4-a716-446655440308', 'employment', 'employee_address', 'Employee Residential Address', 'text', true, 'Complete residential address of employee', 'House 456, Sector 12, Noida, UP - 201301', NULL),
('550e8400-e29b-41d4-a716-446655440309', 'employment', 'job_title', 'Job Title/Position', 'text', true, 'Official designation or job title', 'Senior Software Developer', NULL),
('550e8400-e29b-41d4-a716-446655440310', 'employment', 'monthly_salary', 'Monthly Salary Amount', 'currency', true, 'Monthly salary in Indian Rupees', '75000', NULL),
('550e8400-e29b-41d4-a716-446655440311', 'employment', 'salary_in_words', 'Salary in Words', 'text', true, 'Monthly salary amount written in words', 'Seventy Five Thousand', NULL),
('550e8400-e29b-41d4-a716-446655440312', 'employment', 'founder_name', 'Founder Name', 'text', false, 'Name of the company founder (if applicable)', 'Amit Patel', NULL),
('550e8400-e29b-41d4-a716-446655440313', 'employment', 'option_shares', 'Stock Option Shares', 'number', false, 'Number of shares in stock option grant', '1000', NULL),
('550e8400-e29b-41d4-a716-446655440314', 'employment', 'par_value', 'Share Par Value', 'currency', false, 'Par value per share in INR', '10', NULL),
('550e8400-e29b-41d4-a716-446655440315', 'employment', 'jurisdiction_city', 'Jurisdiction City', 'text', true, 'City for legal jurisdiction and dispute resolution', 'New Delhi', NULL),
('550e8400-e29b-41d4-a716-446655440316', 'employment', 'business_area', 'Business Area/Industry', 'text', false, 'Specific business area for non-compete clause', 'software development and technology consulting', NULL);

-- ========================================
-- End of Template 1: Employment Agreement with Stock Options
-- ========================================

-- Template 2: Standard Employment Agreement
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES 
('550e8400-e29b-41d4-a716-446655440002', 'employment', 'Standard Employment Agreement', 'Comprehensive employment contract without stock options, including confidentiality, non-compete, restrictive covenants, and termination provisions', 'agreement', 'Universal', ARRAY['employment', 'confidentiality', 'non-compete', 'restrictive covenant', 'termination', 'probation', 'compensation', 'standard']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES 

-- Preamble
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440002', 'preamble', 'Agreement Header and Parties', 'This EMPLOYMENT AGREEMENT (Hereinafter, the "Agreement") is entered into on this ___ day of ________, 20__, 

BY AND BETWEEN

_____________, a private limited company incorporated under the Companies Act, 1956, having its registered office at______________(hereinafter referred to as the "Company" or "Employer", which expression shall, unless repugnant to the meaning or context hereof, be deemed to include all permitted successors and assigns), 
AND
_______________ son/daughter/wife of ___________ aged _____ years and residing at ______________________(hereinafter referred to as the "Employee", which expression shall, unless repugnant to the meaning or context hereof, be deemed to include all permitted successors and assigns).', '["effective_date", "company_name", "company_address", "employee_name", "employee_relation", "guardian_name", "employee_age", "employee_address"]', 1, false),

-- Definitions
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440002', 'definitions', 'Interpretation and Definitions', 'In this agreement the following terms shall have the following meanings:
a) "Confidential Information": any trade secret or other information which is confidential or commercially sensitive and which is not in the public domain (other than through the wrongful disclosure by the Employee) and which belongs to any Group Company and which relates to the business methods, management systems, marketing plans, strategic plans, finances, new or maturing business opportunities, marketing activities, processes, inventions, designs or similar;
b) "The Employment": the employment of the Employee by the Company in accordance with the terms of this agreement;
c) "Group Company": the Company, any company of which it is a Subsidiary and any Subsidiaries of the Company or any holding company, from time to time;
d) "Subsidiary": a company as defined in section 1159 of the Companies Act 2006;
e) "Termination Date": the date on which the Employment ceases.', '[]', 2, false),

-- Position and Duties
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440002', 'position', 'Position and Role Changes', 'Upon execution of this Agreement, the employee would be posted as the _______of the Company. During the term period of this Agreement, the Company may change the employee''s above mentioned post (or position) or location based on the Company''s production, operation or working requirements or according to the employee''s working capacities and performance, including but not limited to adjustments made to the employee''s job description or work place, promotion, work transfer at the same level, and demotion, etc., or adjustments made to the employee''s responsibilities without any change to employee''s post (or position).', '["job_title"]', 3, false),

-- Term and Probation
('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440002', 'probation', 'Term and Probation Period', 'It is understood and agreed that the first ____ (_____) days of employment shall constitute a probationary period ("Probationary Period") during which period the Employer may, in its absolute discretion, terminate the Employee''s employment, without assigning any reasons and without notice or cause. After the end of the Probationary Period, the Employer may decide to confirm the Employment of the Employee, in its sole discretion. After the end of the Probationary Period, this Agreement may be terminated in accordance with Clause 12 of this Agreement.', '["probation_days", "probation_days_words"]', 4, false),

-- Performance of Duties
('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440002', 'duties', 'Performance of Duties', 'The Employee agrees that during the Employment Period, he/she shall devote his/her full business time to the business affairs of the Company and shall perform the duties assigned to him/her faithfully and efficiently, and shall endeavor, to the best of his/her abilities to achieve the goals and adhere to the parameters set by the Company. The Employee shall be responsible for: [specific duties to be defined].', '["specific_duties"]', 5, false),

-- Compensation
('550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440002', 'compensation', 'Compensation and Benefits', 'The Employee shall receive an annual salary, payable in monthly or more frequent installments, as per the convenience of the Employer, an amount of________ per annum/ month, subject to such increases from time to time, as determined by the Employer. Such payments shall be subject to such normal statutory deductions by the Employer. During the term of this Agreement, the Employee''s salary shall be paid by means of bank transfer, cheque, or any other method convenient to the Employer, and consented to by the Employee. All reasonable expenses arising out of employment shall be reimbursed assuming that the same have been authorized prior to being incurred and with the provision of appropriate receipts.', '["salary_amount", "salary_period"]', 6, false),

-- Employee Obligations
('550e8400-e29b-41d4-a716-446655440207', '550e8400-e29b-41d4-a716-446655440002', 'obligations', 'Obligations of the Employee', 'Upon execution of agreement, the Employee shall not engage in any sort of theft, fraud, misrepresentation or any other illegal act. The Employee shall always ensure that his/her conduct is in accordance with all the rules, regulations and policies of the Company as notified from time to time, including but not limited to Leave Policy and Sexual Harassment Policy. The Employee shall not take up part-time or full-time employment or consultation with any other party or be involved in any other business during the term of his/her employment with the Company.', '[]', 7, false),

-- Leave Policy
('550e8400-e29b-41d4-a716-446655440208', '550e8400-e29b-41d4-a716-446655440002', 'leave', 'Leave Policy', 'The Employee is entitled to ____ (___) days of paid casual leaves in a year and ____(___) days of sick leave. In addition, the Employee will be entitled to _____ (__)public holidays mentioned under the Leave Policy of the Employer. The Employee may not carry forward or encash any holiday to the next holiday year. For any period of absence due to sickness or injury the Employee will be paid statutory sick pay only, provided that he satisfies the relevant requirements.', '["casual_leave_days", "casual_leave_words", "sick_leave_days", "sick_leave_words", "public_holidays", "public_holidays_words"]', 8, false),

-- Termination
('550e8400-e29b-41d4-a716-446655440209', '550e8400-e29b-41d4-a716-446655440002', 'termination', 'Amendment and Termination', 'In case the Employer terminates the employment without just cause, in which case the Employer shall provide the Employee with advance notice of termination or compensation in lieu of notice equal to ___ (___) month(s). The Employee may terminate his employment at any time by providing the Employer with at least ____ (___) month(s) advance notice of his intention to resign. For purposes of this Agreement, "Cause" means the Employee''s gross misconduct resulting in material damage to the Company, willful insubordination or disobedience, theft, fraud or dishonesty, willful damage or loss of Employer''s property, bribery and habitual lateness or absence, or any other willful and material breach of this Agreement.', '["notice_period_employer", "notice_period_employer_words", "notice_period_employee", "notice_period_employee_words"]', 9, false),

-- Signatures
('550e8400-e29b-41d4-a716-446655440210', '550e8400-e29b-41d4-a716-446655440002', 'signatures', 'Execution and Signatures', 'IN WITNESS WHEREOF, the Employee has hereunto set his hand, and the Company has caused these presents to be executed in its name and on its behalf, all as of the day and year first above written.

____________________        ___________________
(Employee)                    (The Employer)

Name: _________________        Represented By:                
Designation: ___________________', '["employee_signature", "employer_signature", "employee_name_sign", "employer_representative", "employee_designation"]', 10, false);

-- Insert additional reusable contract clauses specific to standard employment
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES 

('550e8400-e29b-41d4-a716-446655440301', 'restrictive_covenant', 'Comprehensive Restrictive Covenant', 'Following the termination of employment of the Employee by the Employer, with or without cause, or the voluntary withdrawal by the Employee from the Employer, the Employee shall, for a period of three years following the said termination or voluntary withdrawal, refrain from either directly or indirectly soliciting or attempting to solicit the business of any client or customer of the Employer for his own benefit or that of any third person or organization, and shall refrain from either directly or indirectly attempting to obtain the withdrawal from the employment by the Employer of any other Employee of the Employer. The Employee shall not directly or indirectly divulge any financial information relating to the Employer or any of its affiliates or clients to any person whatsoever.', ARRAY['restrictive covenant', 'post-employment', 'client protection', 'employee solicitation'], ARRAY['employment', 'senior positions', 'sales roles']),

('550e8400-e29b-41d4-a716-446655440302', 'competing_business', 'One Year Non-Compete', 'During the Term of this Agreement and for a period of one (1) year after the termination of this Agreement, the Employee agrees not to engage in any employment, consulting, or other activity involving _______________ that competes with the business, proposed business or business interests of the Employer, without the Employer''s prior written consent.', ARRAY['non-compete', 'one year', 'business protection'], ARRAY['employment', 'competitive industries', 'key positions']),

('550e8400-e29b-41d4-a716-446655440303', 'ip_assignment_standard', 'Standard IP Assignment', 'The Employee acknowledges that any work including without limitation inventions, designs, ideas, concepts, drawings, working notes, artistic works that the Employee may individually or jointly conceive or develop during the term of Employment are "works made for hire" and to the fullest extent permitted by law, Employee shall assign, and does hereby assign, to the Employer all of Employee''s right, title and interest in and to all Intellectual Property improved, developed, discovered or written in such works. The Employer owns any intellectual property created by the Employee during the course of the employment, including but not limited to website design or functionality.', ARRAY['intellectual property', 'work for hire', 'standard assignment'], ARRAY['employment', 'creative roles', 'development positions']),

('550e8400-e29b-41d4-a716-446655440304', 'confidentiality_standard', 'Standard Confidentiality and Trade Secrets', 'The Employee acknowledges that, in the course of performing and fulfilling his duties hereunder, he may have access to and be entrusted with confidential information concerning the present and contemplated financial status and activities of the Employer. The Employee further acknowledges and agrees that the right to maintain the confidentiality of trade secrets, source code, website information, business plans or client information or other confidential or proprietary information constitutes a proprietary right which the Employer is entitled to protect. The Employee will not, under any circumstance during the continuance of this agreement, disclose any such confidential information to any person, firm or corporation, nor shall he use the same, except as required in the normal course of his engagement hereunder, and even after the termination of employment, he shall not disclose or make use of the same.', ARRAY['confidentiality', 'trade secrets', 'proprietary information', 'post-employment'], ARRAY['employment', 'all positions', 'standard agreements']);

-- Insert contract parameters for standard employment agreements
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES 

('550e8400-e29b-41d4-a716-446655440401', 'employment', 'probation_days', 'Probation Period (Days)', 'number', true, 'Number of days for probationary period', '90', NULL),
('550e8400-e29b-41d4-a716-446655440402', 'employment', 'probation_days_words', 'Probation Period (Words)', 'text', true, 'Probation period in words', 'ninety', NULL),
('550e8400-e29b-41d4-a716-446655440403', 'employment', 'specific_duties', 'Specific Job Duties', 'text', false, 'Detailed description of job responsibilities', 'Develop software applications, maintain code quality, participate in team meetings', NULL),
('550e8400-e29b-41d4-a716-446655440404', 'employment', 'salary_amount', 'Salary Amount', 'currency', true, 'Annual or monthly salary amount', '600000', NULL),
('550e8400-e29b-41d4-a716-446655440405', 'employment', 'salary_period', 'Salary Period', 'select', true, 'Whether salary is annual or monthly', 'per annum', '["per annum", "per month"]'),
('550e8400-e29b-41d4-a716-446655440406', 'employment', 'casual_leave_days', 'Casual Leave Days', 'number', true, 'Number of casual leave days per year', '12', NULL),
('550e8400-e29b-41d4-a716-446655440407', 'employment', 'casual_leave_words', 'Casual Leave (Words)', 'text', true, 'Casual leave days in words', 'twelve', NULL),
('550e8400-e29b-41d4-a716-446655440408', 'employment', 'sick_leave_days', 'Sick Leave Days', 'number', true, 'Number of sick leave days per year', '10', NULL),
('550e8400-e29b-41d4-a716-446655440409', 'employment', 'sick_leave_words', 'Sick Leave (Words)', 'text', true, 'Sick leave days in words', 'ten', NULL),
('550e8400-e29b-41d4-a716-446655440410', 'employment', 'public_holidays', 'Public Holidays', 'number', true, 'Number of public holidays', '15', NULL),
('550e8400-e29b-41d4-a716-446655440411', 'employment', 'public_holidays_words', 'Public Holidays (Words)', 'text', true, 'Public holidays in words', 'fifteen', NULL),
('550e8400-e29b-41d4-a716-446655440412', 'employment', 'notice_period_employer', 'Employer Notice Period (Months)', 'number', true, 'Notice period when employer terminates without cause', '2', NULL),
('550e8400-e29b-41d4-a716-446655440413', 'employment', 'notice_period_employer_words', 'Employer Notice Period (Words)', 'text', true, 'Employer notice period in words', 'two', NULL),
('550e8400-e29b-41d4-a716-446655440414', 'employment', 'notice_period_employee', 'Employee Notice Period (Months)', 'number', true, 'Notice period when employee resigns', '1', NULL),
('550e8400-e29b-41d4-a716-446655440415', 'employment', 'notice_period_employee_words', 'Employee Notice Period (Words)', 'text', true, 'Employee notice period in words', 'one', NULL),
('550e8400-e29b-41d4-a716-446655440416', 'employment', 'state_jurisdiction', 'State for Jurisdiction', 'text', true, 'State for legal jurisdiction', 'Maharashtra', NULL),
('550e8400-e29b-41d4-a716-446655440417', 'employment', 'city_jurisdiction', 'City for Jurisdiction', 'text', true, 'City for legal jurisdiction', 'Mumbai', NULL),
('550e8400-e29b-41d4-a716-446655440418', 'employment', 'competing_business_area', 'Competing Business Area', 'text', false, 'Specific business area for non-compete restriction', 'software development and IT consulting', NULL);

-- ========================================
-- End of Template 2: Standard Employment Agreement
-- ========================================

-- Template 3: Experience Letter
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES 
('550e8400-e29b-41d4-a716-446655440003', 'reference', 'Experience Letter', 'Standard experience letter template for employees documenting their tenure, role, performance, and contributions to the organization', 'letter', 'Universal', ARRAY['experience letter', 'reference', 'employment verification', 'tenure', 'performance', 'certification']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES 

-- Header
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440003', 'header', 'Document Header', 'EXPERIENCE LETTER
                                        Date: ____', '["issue_date"]', 1, false),

-- Recipient Details
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440003', 'recipient', 'Recipient Information', 'To    
Mr. _______
_____________ (residential address)
Phone No: ________________________', '["employee_name", "employee_address", "employee_phone"]', 2, false),

-- Subject
('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440003', 'subject', 'Subject Line', 'Sub: Experience Letter', '[]', 3, false),

-- Main Content
('550e8400-e29b-41d4-a716-446655440304', '550e8400-e29b-41d4-a716-446655440003', 'body', 'Letter Body and Employment Details', 'Dear ___,

You have worked in our organization from ________ until ______ in the capacity of __________ within _______ department. 

Your performance during the employment has been appreciated in evaluations each year and your contribution towards the organization have always been valued. 

We wish you all the best for your future endeavours.', '["employee_salutation", "start_date", "end_date", "job_position", "department"]', 4, false),

-- Signature
('550e8400-e29b-41d4-a716-446655440305', '550e8400-e29b-41d4-a716-446655440003', 'signature', 'Signature Block', 'Yours sincerely,

 __________________________                 
[Insert Name]', '["signatory_name", "signatory_title"]', 5, false);

-- Insert reusable contract clauses for experience letters
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES 

('550e8400-e29b-41d4-a716-446655440401', 'performance_acknowledgment', 'Standard Performance Acknowledgment', 'Your performance during the employment has been appreciated in evaluations each year and your contribution towards the organization have always been valued.', ARRAY['performance', 'appreciation', 'evaluation', 'contribution'], ARRAY['experience letters', 'reference letters', 'employment verification']),

('550e8400-e29b-41d4-a716-446655440402', 'employment_verification', 'Basic Employment Verification', 'You have worked in our organization from ________ until ______ in the capacity of __________ within _______ department.', ARRAY['employment verification', 'tenure', 'position', 'department'], ARRAY['experience letters', 'employment verification', 'reference documents']),

('550e8400-e29b-41d4-a716-446655440403', 'future_wishes', 'Best Wishes for Future', 'We wish you all the best for your future endeavours.', ARRAY['best wishes', 'future', 'goodwill'], ARRAY['experience letters', 'farewell letters', 'reference letters']),

('550e8400-e29b-41d4-a716-446655440404', 'performance_excellent', 'Excellent Performance Clause', 'Your performance during the employment has been consistently excellent and your dedication to achieving organizational goals has been exemplary. Your professional conduct and technical skills have made significant contributions to our team success.', ARRAY['excellent performance', 'dedication', 'technical skills', 'team contribution'], ARRAY['experience letters', 'senior positions', 'outstanding employees']),

('550e8400-e29b-41d4-a716-446655440405', 'performance_satisfactory', 'Satisfactory Performance Clause', 'You have performed your duties satisfactorily during your tenure with our organization and have been a reliable member of our team.', ARRAY['satisfactory performance', 'reliable', 'duties'], ARRAY['experience letters', 'standard employees', 'basic verification']);

-- Insert contract parameters for experience letters
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES 

('550e8400-e29b-41d4-a716-446655440501', 'reference', 'issue_date', 'Letter Issue Date', 'date', true, 'Date when the experience letter is issued', '2024-01-15', NULL),
('550e8400-e29b-41d4-a716-446655440502', 'reference', 'employee_name', 'Employee Full Name', 'text', true, 'Complete name of the employee', 'Rahul Kumar Sharma', NULL),
('550e8400-e29b-41d4-a716-446655440503', 'reference', 'employee_address', 'Employee Address', 'text', true, 'Residential address of the employee', 'House No. 123, Sector 45, Gurgaon, Haryana - 122001', NULL),
('550e8400-e29b-41d4-a716-446655440504', 'reference', 'employee_phone', 'Employee Phone Number', 'text', true, 'Contact phone number of the employee', '+91-9876543210', NULL),
('550e8400-e29b-41d4-a716-446655440505', 'reference', 'employee_salutation', 'Employee Salutation', 'text', true, 'How to address the employee in letter', 'Rahul', NULL),
('550e8400-e29b-41d4-a716-446655440506', 'reference', 'start_date', 'Employment Start Date', 'date', true, 'Date when employee started working', '2022-03-15', NULL),
('550e8400-e29b-41d4-a716-446655440507', 'reference', 'end_date', 'Employment End Date', 'date', true, 'Date when employee left the organization', '2024-01-10', NULL),
('550e8400-e29b-41d4-a716-446655440508', 'reference', 'job_position', 'Job Position/Title', 'text', true, 'Official designation of the employee', 'Senior Software Developer', NULL),
('550e8400-e29b-41d4-a716-446655440509', 'reference', 'department', 'Department Name', 'text', true, 'Department where employee worked', 'Information Technology', NULL),
('550e8400-e29b-41d4-a716-446655440510', 'reference', 'signatory_name', 'Signatory Name', 'text', true, 'Name of the person signing the letter', 'Ms. Priya Sharma', NULL),
('550e8400-e29b-41d4-a716-446655440511', 'reference', 'signatory_title', 'Signatory Title', 'text', true, 'Designation of the person signing', 'HR Manager', NULL),
('550e8400-e29b-41d4-a716-446655440512', 'reference', 'performance_level', 'Performance Level', 'select', false, 'Level of employee performance', 'appreciated', '["excellent", "appreciated", "satisfactory", "good"]'),
('550e8400-e29b-41d4-a716-446655440513', 'reference', 'special_achievements', 'Special Achievements', 'text', false, 'Any notable achievements or contributions', 'Led the successful implementation of the new CRM system', NULL),
('550e8400-e29b-41d4-a716-446655440514', 'reference', 'reason_for_leaving', 'Reason for Leaving', 'select', false, 'Reason why employee left', 'career growth', '["career growth", "personal reasons", "relocation", "higher studies", "resignation", "retirement"]');

-- ========================================
-- End of Template 3: Experience Letter
-- ========================================

-- Template 4: Letter of Intent for Joint Venture
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES 
('550e8400-e29b-41d4-a716-446655440004', 'loi', 'Letter of Intent for Joint Venture', 'Comprehensive Letter of Intent for formation of jointly owned company, including shareholding structure, governance, exclusivity, and confidentiality provisions', 'agreement', 'Universal', ARRAY['letter of intent', 'joint venture', 'partnership', 'shareholding', 'governance', 'exclusivity', 'confidentiality', 'business formation']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES 

-- Header and Parties
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440004', 'preamble', 'Letter of Intent Header and Parties', 'Letter of Intent

This Letter of Intent ("LoI") is entered into by and between:

[name]
[company registration number]
[address]

(hereinafter referred to as "Party A")

and

[name]
[company registration number]
[address]

(hereinafter referred to as "Party B")

(hereinafter referred to individually as "Party" and collectively as "Parties")', '["party_a_name", "party_a_registration", "party_a_address", "party_b_name", "party_b_registration", "party_b_address"]', 1, false),

-- Background
('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440004', 'background', 'Background and Purpose', 'The LoI summarizes the Parties'' understanding regarding the contemplated formation of a jointly owned company ("Company") to design, manufacture, market and sell [products] ("Products") worldwide. The purpose of the LoI is to establish a basis for future discussions regarding a definitive agreement after the formation of the Company ("Definitive Agreement"). The LoI does not create any binding obligation, expressed or implied, on the Parties, except as set forth in Articles 3 through 8 hereof.', '["products_description"]', 2, false),

-- Key Terms - Company Formation
('550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440004', 'company_formation', 'Company Formation and Shareholding', 'The Parties shall form a [form of company] located in [city and country] with the sole purpose of designing, manufacturing, marketing and selling Products worldwide. Party A shall own [number]% and Party B [number]% of the share capital of the Company. The initial registered and paid-in share capital of the Company shall be [amount and currency], of which Party A will contribute [number]% and Party B [number]% in cash or in kind. The Parties'' contributions in kind shall consist of Party A''s [description of assets] and Party B''s [description of assets]. The Parties shall not be required to make any further capital contributions to the Company.', '["company_form", "company_location", "party_a_ownership", "party_b_ownership", "share_capital_amount", "party_a_contribution_percent", "party_b_contribution_percent", "party_a_assets", "party_b_assets"]', 3, false),

-- Expertise and Governance
('550e8400-e29b-41d4-a716-446655440404', '550e8400-e29b-41d4-a716-446655440004', 'governance', 'Expertise Contribution and Governance Structure', 'Party A shall contribute its [description of expertise] and Party B shall contribute its [description of expertise] to the Company. The Parties shall dedicate such time and effort to the formation and operation of the Company as is reasonably necessary to secure a solid platform for growth. The Company shall have a board of directors responsible for the overall and strategic management of the Company. The board of directors shall consist of [number] directors. Party A shall nominate [number] directors, and Party B shall nominate [number] directors. The general meeting of the Company shall elect the directors nominated by the Parties and [number] additional directors. The chairman of the board of directors shall be elected by and among the directors.', '["party_a_expertise", "party_b_expertise", "total_directors", "party_a_directors", "party_b_directors", "additional_directors"]', 4, false),

-- Decision Making
('550e8400-e29b-41d4-a716-446655440405', '550e8400-e29b-41d4-a716-446655440004', 'decision_making', 'Decision Making and Management', 'The Company shall have a general manager responsible for the day-to-day management of the Company. The general manager shall be appointed by the board of directors of the Company. All decisions of the general meeting of the Company shall be taken by a simple majority vote unless applicable law requires a special majority vote. All decisions of the board of directors of the Company shall be taken by a simple majority vote with the chairman having a casting vote in case of an equality of votes. A valid decision of the general meeting or of the board of directors of the Company requires the presence of more than [number]% of the share capital or of the directors of the Company.', '["quorum_percentage"]', 5, false),

-- Restrictions and Rights
('550e8400-e29b-41d4-a716-446655440406', '550e8400-e29b-41d4-a716-446655440004', 'restrictions', 'Non-Compete and Transfer Rights', 'The Parties, and persons or companies having a decisive influence on a Party''s financial and operational decisions, shall be prohibited from competing with the Company as long as they, directly or indirectly, own shares in the Company and for a period of [number] years thereafter. The Parties shall have a mutual right of first refusal on any sale or other transfer of shares in the Company. The price of the shares subject to a right of first refusal shall be equal to the price offered by a third party in good faith or, in the absence of a third party offer, the market value of the shares as determined by an independent auditor.', '["non_compete_years"]', 6, false),

-- Term and Termination
('550e8400-e29b-41d4-a716-446655440407', '550e8400-e29b-41d4-a716-446655440004', 'termination', 'Term and Termination', 'The LoI shall enter into force when it has been signed by both Parties and shall terminate on the earlier of: (i) the date of execution of any Definitive Agreement, and (ii) [date] unless the Parties agree to extend the date. The Parties shall have no claim against each other as a result of termination of the LoI for any reason.', '["termination_date"]', 7, false),

-- Signatures
('550e8400-e29b-41d4-a716-446655440408', '550e8400-e29b-41d4-a716-446655440004', 'signatures', 'Execution and Signatures', 'For and on behalf of                For and on behalf of
Party A                    Party B

Name:                    Name:
Title:                    Title:
Date:                    Date:', '["party_a_signatory_name", "party_a_signatory_title", "party_a_signature_date", "party_b_signatory_name", "party_b_signatory_title", "party_b_signature_date"]', 8, false);

-- Insert reusable contract clauses for Letters of Intent
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES 

('550e8400-e29b-41d4-a716-446655440501', 'exclusivity', 'Exclusivity Clause', 'Until the date of termination of the LoI, the Parties shall not enter into discussions with any third party regarding a cooperation to design, manufacture, market and sell Products.', ARRAY['exclusivity', 'non-negotiation', 'cooperation'], ARRAY['letter of intent', 'partnership agreements', 'joint ventures']),

('550e8400-e29b-41d4-a716-446655440502', 'confidentiality_loi', 'LOI Confidentiality', 'Except as required by law, each Party agrees that it shall not disclose any Confidential Information to any third party except its advisors who are bound by a duty of confidentiality and that it shall not use any Confidential Information other than in connection with its evaluation of the contemplated formation of the Company. "Confidential Information" means any information about the other Party provided hereunder, the contemplated formation of the Company, and the LoI except information which: (i) is generally available to or known by the public other than as a result of improper disclosure by a Party, or (ii) is obtained by a Party from a source other than the other Party, provided that such source was not bound by a duty of confidentiality to the other Party with respect to such information.', ARRAY['confidentiality', 'proprietary information', 'evaluation'], ARRAY['letter of intent', 'joint ventures', 'partnership negotiations']),

('550e8400-e29b-41d4-a716-446655440503', 'cost_sharing', 'Cost and Expense Sharing', 'Except as may be set forth in any Definitive Agreement, each Party shall bear its own costs and expenses incurred in pursuing or consummating a Definitive Agreement and the formation of the Company, including, but not limited to, legal and other professional fees.', ARRAY['cost sharing', 'expenses', 'professional fees'], ARRAY['letter of intent', 'partnership agreements', 'business formation']),

('550e8400-e29b-41d4-a716-446655440504', 'drag_along_tag_along', 'Drag-Along and Tag-Along Rights', 'If a Party wishes to sell all of its shares in the Company pursuant to a good faith third party offer, the other Party shall, upon request, be required to sell all of its shares in the Company to such third party on the same terms and conditions. If a Party wishes to sell all of its shares in the Company to a third party, the other Party shall be entitled to sell all of its shares in the Company to such third party on the same terms and conditions.', ARRAY['drag along', 'tag along', 'share transfer', 'exit rights'], ARRAY['joint ventures', 'partnership agreements', 'shareholder agreements']),

('550e8400-e29b-41d4-a716-446655440505', 'definitive_agreement', 'Definitive Agreement Commitment', 'Promptly after execution of the LoI, the Parties shall enter into good faith negotiations for a Definitive Agreement containing such terms and conditions as are customary for the formation of a jointly owned Company of the contemplated nature, including, without limitation, a business plan for the Company for the first 3 (three) years of its operation.', ARRAY['definitive agreement', 'good faith negotiations', 'business plan'], ARRAY['letter of intent', 'partnership formation', 'joint ventures']),

('550e8400-e29b-41d4-a716-446655440506', 'dispute_resolution_loi', 'LOI Dispute Resolution', 'Any disputes arising out of or in connection with the LoI which cannot be settled amicably shall be resolved by a court of competent jurisdiction in accordance with the laws of [country] excluding conflict of law principles.', ARRAY['dispute resolution', 'jurisdiction', 'governing law'], ARRAY['letter of intent', 'international agreements', 'partnership agreements']);

-- Insert contract parameters for Letters of Intent
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES 

('550e8400-e29b-41d4-a716-446655440601', 'loi', 'party_a_name', 'Party A Name', 'text', true, 'Legal name of the first party', 'TechCorp Solutions Pvt Ltd', NULL),
('550e8400-e29b-41d4-a716-446655440602', 'loi', 'party_a_registration', 'Party A Registration Number', 'text', true, 'Company registration number of Party A', 'CIN: U72200MH2018PTC123456', NULL),
('550e8400-e29b-41d4-a716-446655440603', 'loi', 'party_a_address', 'Party A Address', 'text', true, 'Complete registered address of Party A', '123 Business Park, Andheri East, Mumbai - 400069', NULL),
('550e8400-e29b-41d4-a716-446655440604', 'loi', 'party_b_name', 'Party B Name', 'text', true, 'Legal name of the second party', 'Innovation Labs Inc', NULL),
('550e8400-e29b-41d4-a716-446655440605', 'loi', 'party_b_registration', 'Party B Registration Number', 'text', true, 'Company registration number of Party B', 'Delaware Corporation: 123456789', NULL),
('550e8400-e29b-41d4-a716-446655440606', 'loi', 'party_b_address', 'Party B Address', 'text', true, 'Complete registered address of Party B', '456 Silicon Valley, CA 94043, USA', NULL),
('550e8400-e29b-41d4-a716-446655440607', 'loi', 'products_description', 'Products Description', 'text', true, 'Description of products to be developed/marketed', 'IoT-enabled smart home devices and related software solutions', NULL),
('550e8400-e29b-41d4-a716-446655440608', 'loi', 'company_form', 'Company Form', 'text', true, 'Legal form of the joint venture company', 'private limited company', NULL),
('550e8400-e29b-41d4-a716-446655440609', 'loi', 'company_location', 'Company Location', 'text', true, 'City and country where company will be located', 'Singapore, Singapore', NULL),
('550e8400-e29b-41d4-a716-446655440610', 'loi', 'party_a_ownership', 'Party A Ownership Percentage', 'number', true, 'Ownership percentage of Party A', '60', NULL),
('550e8400-e29b-41d4-a716-446655440611', 'loi', 'party_b_ownership', 'Party B Ownership Percentage', 'number', true, 'Ownership percentage of Party B', '40', NULL),
('550e8400-e29b-41d4-a716-446655440612', 'loi', 'share_capital_amount', 'Share Capital Amount', 'text', true, 'Initial share capital amount and currency', 'USD 1,000,000', NULL),
('550e8400-e29b-41d4-a716-446655440613', 'loi', 'party_a_contribution_percent', 'Party A Capital Contribution %', 'number', true, 'Party A percentage of capital contribution', '60', NULL),
('550e8400-e29b-41d4-a716-446655440614', 'loi', 'party_b_contribution_percent', 'Party B Capital Contribution %', 'number', true, 'Party B percentage of capital contribution', '40', NULL),
('550e8400-e29b-41d4-a716-446655440615', 'loi', 'party_a_assets', 'Party A Asset Contribution', 'text', false, 'Description of assets contributed by Party A', 'manufacturing facilities and equipment', NULL),
('550e8400-e29b-41d4-a716-446655440616', 'loi', 'party_b_assets', 'Party B Asset Contribution', 'text', false, 'Description of assets contributed by Party B', 'intellectual property and technology licenses', NULL),
('550e8400-e29b-41d4-a716-446655440617', 'loi', 'party_a_expertise', 'Party A Expertise', 'text', true, 'Description of expertise contributed by Party A', 'manufacturing expertise and supply chain management', NULL),
('550e8400-e29b-41d4-a716-446655440618', 'loi', 'party_b_expertise', 'Party B Expertise', 'text', true, 'Description of expertise contributed by Party B', 'technology development and software engineering', NULL),
('550e8400-e29b-41d4-a716-446655440619', 'loi', 'total_directors', 'Total Number of Directors', 'number', true, 'Total number of directors on the board', '5', NULL),
('550e8400-e29b-41d4-a716-446655440620', 'loi', 'party_a_directors', 'Party A Directors', 'number', true, 'Number of directors nominated by Party A', '3', NULL),
('550e8400-e29b-41d4-a716-446655440621', 'loi', 'party_b_directors', 'Party B Directors', 'number', true, 'Number of directors nominated by Party B', '2', NULL),
('550e8400-e29b-41d4-a716-446655440622', 'loi', 'additional_directors', 'Additional Directors', 'number', false, 'Number of additional independent directors', '0', NULL),
('550e8400-e29b-41d4-a716-446655440623', 'loi', 'quorum_percentage', 'Quorum Percentage', 'number', true, 'Minimum percentage required for valid decisions', '50', NULL),
('550e8400-e29b-41d4-a716-446655440624', 'loi', 'non_compete_years', 'Non-Compete Period (Years)', 'number', true, 'Number of years for non-compete restriction', '3', NULL),
('550e8400-e29b-41d4-a716-446655440625', 'loi', 'termination_date', 'LOI Termination Date', 'date', true, 'Date when LOI will terminate if no definitive agreement', '2024-12-31', NULL),
('550e8400-e29b-41d4-a716-446655440626', 'loi', 'governing_law_country', 'Governing Law Country', 'text', true, 'Country whose laws will govern the LOI', 'Singapore', NULL),
('550e8400-e29b-41d4-a716-446655440627', 'loi', 'party_a_signatory_name', 'Party A Signatory Name', 'text', true, 'Name of person signing for Party A', 'Mr. Rajesh Kumar', NULL),
('550e8400-e29b-41d4-a716-446655440628', 'loi', 'party_a_signatory_title', 'Party A Signatory Title', 'text', true, 'Title of person signing for Party A', 'Managing Director', NULL),
('550e8400-e29b-41d4-a716-446655440629', 'loi', 'party_b_signatory_name', 'Party B Signatory Name', 'text', true, 'Name of person signing for Party B', 'Ms. Sarah Johnson', NULL),
('550e8400-e29b-41d4-a716-446655440630', 'loi', 'party_b_signatory_title', 'Party B Signatory Title', 'text', true, 'Title of person signing for Party B', 'Chief Executive Officer', NULL),
('550e8400-e29b-41d4-a716-446655440631', 'loi', 'party_a_signature_date', 'Party A Signature Date', 'date', true, 'Date when Party A signs the LOI', '2024-06-15', NULL),
('550e8400-e29b-41d4-a716-446655440632', 'loi', 'party_b_signature_date', 'Party B Signature Date', 'date', true, 'Date when Party B signs the LOI', '2024-06-15', NULL);

-- ========================================
-- End of Template 4: Letter of Intent for Joint Venture
-- ========================================

-- Template 5: Model Franchise Agreement
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES 
('550e8400-e29b-41d4-a716-446655440005', 'franchise', 'Model Franchise Agreement', 'Comprehensive franchise agreement template covering business partnerships, service provisions, confidentiality, terms, termination, and dispute resolution for franchise operations in India', 'agreement', 'India', ARRAY['franchise', 'business partnership', 'service provider', 'confidentiality', 'termination', 'dispute resolution', 'intellectual property', 'commission structure']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES 

-- Preamble
('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440005', 'preamble', 'Agreement Header and Parties', 'This agreement is executed on this _____ day of ______, the year _______.

BETWEEN

______________, a private limited company incorporated under the Company''s Act 2013, and having its corporate office at ______________, India, hereinafter referred to as the "Franchiser" which expression shall unless repugnant to the context or meaning thereof include its successors and assigns of ONE PART.

AND

______________, a proprietary firm having its ______________, and represented by ______________, S/o ______________, aged about ____ years, hereinafter referred to as the "Franchise" which expression unless repugnant to the context or meaning thereof be deemed to include, legal representative, executors, administrators, successors and permitted assignees of the other PART, each a party and collectively referred to as parties.', '[\"execution_day\", \"execution_month\", \"execution_year\", \"franchiser_name\", \"franchiser_address\", \"franchise_name\", \"franchise_business_address\", \"franchise_representative\", \"franchise_father_name\", \"franchise_age\"]', 1, false),

-- Background and Purpose
('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440005', 'background', 'Background and Business Objectives', 'Both parties as above have expressed a desire of entering into a franchise agreement to meet their respective objectives, which are set out here in below:

(a) ______________ on its part has entered into the business of Online Ads, Offline Ads, Value Added Services and Premium Services and is interested in furthering this business through "Franchise" (Conductor) operated outlets on national basis maintaining a uniform standard facilities and services including uniformity in the charges levied from the customers for rendering the specified services.

(b) "Franchise" on his part is interested in entering into the business of operating as a service provider through their cyber cafe outlet and thus carrying out the business of providing services to the customers.

(c) ______________ is desirous of appointing "Franchise" to conduct, manage and operate the services through the ______________ as per the uniform norms set up by ______________ in respect of nature of services and cost of services to the customer.

(d) "Franchise" is desirous of taking over the services offered by ______________, for the purpose of its operations and management to carry out business on the terms and conditions contained herein.

(e) The purpose of this Agreement is to set forth the terms and conditions under which the parties to the Agreement shall conduct themselves during the substance of Agreement.', '[\"franchiser_company\", \"franchiser_company_2\", \"service_outlet_type\", \"franchiser_company_3\", \"franchiser_company_4\"]', 2, false),

-- Definitions
('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440005', 'definitions', 'Definitions and Interpretations', 'For the purpose of this agreement, the following expressions shall bear the respective meaning set forth below:

Details of terminology for the services to be provided

[Note: Specific definitions to be customized based on the franchise business model and services offered]', '[]', 3, false),

-- Grant of Franchise
('550e8400-e29b-41d4-a716-446655440504', '550e8400-e29b-41d4-a716-446655440005', 'grant', 'Grant of the Franchise', 'The "Franchise" warrants and represents to ______________ that it is a company/firm, validly existing and in good standing under the laws of republic of India and has all requisite power and authority to enter into this agreement with ______________. All the obligations of the "Franchise" under this agreement are legal, valid and binding obligations enforceable in accordance with its terms. There are no proceedings pending against the franchise, which may have an adverse effect on the ability of the franchise to perform and meet its obligations under this agreement.

On consideration of the "Franchise''s" applications and relying on such assurances and representations that "Franchise" has made to ______________, ______________ appoints the franchise as a franchise on the terms and conditions set forth in this agreement and in the website.

There is no product and/or service and/or territorial exclusivity granted to the "Franchise" as part of this Agreement by ______________ may give such right or a similar right to persons other than "Franchise" to sell ______________ products and services anywhere including geographic area surrounding the premises.', '[\"franchiser_name_1\", \"franchiser_name_2\", \"franchiser_name_3\", \"franchiser_name_4\", \"franchiser_name_5\", \"franchiser_name_6\"]', 4, false),

-- Services and Terms
('550e8400-e29b-41d4-a716-446655440505', '550e8400-e29b-41d4-a716-446655440005', 'services', 'Services, Terms & Conditions', '(1) ______________ would provide their entire range of services by own or through the service providers which includes online ads, offline ads, value added services and premium services to the "Franchise".

(2) "Franchise" will act as a single point e-hub for all the services provided by ______________ falling within the purview of this agreement.

(3) The entire business being on pre-payment basis, ______________ will supply all the services based upon requests from "Franchise" up to limits available for "Franchise". Such limits will be equivalent to the funds available from "Franchise" with ______________ at any point in time and will keep reducing with every transaction corresponding to the value of transaction. ______________ will enhance the limit of Franchisee by amounts received by it from "Franchise" from time to time.

(4) ______________ will publish commission structure and earning of the "Franchise" from time to time in the web site ______________. The details of all transactions done by "Franchise" will be available on the web, login ID and password of which will be provided to "Franchise" by ______________. "Franchise" will keep enough funds with ______________ so as to cater all transactions to provide services to the customers.

(5) All the services falling within the purview of this agreement will be made to "Franchise" based upon standard conditions of sales as set by ______________ for all its "Franchise" outlets from time to time. Such conditions will generally be in line with conditions that are placed upon ______________ by various service providers and also as a result of business decisions, legal and contractual requirements.

(6) "Franchise" will keep providing the services within the purview of this agreement through their outlets exclusively with ______________. "Franchise" will not enter into direct agreements with any other services providers, aggregators, distributors or any similar entity in India for this purpose, for the duration of this agreement.

(7) The Intellectual Property rights including the concept of delivery of services will rest with ______________ or its suppliers or service providers.

(8) ______________ and "Franchise" shall conduct their business at all times, in accordance with the applicable statutes, regulations, notification etc., issued by the Government or any other statutory authority.', '[\"franchiser_services_1\", \"franchiser_services_2\", \"franchiser_services_3\", \"franchiser_services_4\", \"franchiser_services_5\", \"franchiser_website\", \"franchiser_services_6\", \"franchiser_services_7\", \"franchiser_services_8\", \"franchiser_services_9\", \"franchiser_exclusive\", \"franchiser_ip_1\", \"franchiser_compliance\"]', 5, false),

-- Confidentiality
('550e8400-e29b-41d4-a716-446655440506', '550e8400-e29b-41d4-a716-446655440005', 'confidentiality', 'Confidentiality', '"Franchise" shall keep all information of confidential nature received from the ______________ in whatever form as strictly confidential and shall not disclose it to third Parties without the prior written consent of ______________ during the term of this Agreement.

"Franchise" agrees not to disclose revenue information without ______________ prior written consent.', '[\"franchiser_confidential_1\", \"franchiser_confidential_2\", \"franchiser_revenue\"]', 6, false),

-- Limitation of Liability
('550e8400-e29b-41d4-a716-446655440507', '550e8400-e29b-41d4-a716-446655440005', 'liability', 'Limitation of Liability', 'The Parties shall not be liable for any incidental, special, indirect or consequential damages arising out of or relating to this Agreement.', '[]', 7, false),

-- Terms
('550e8400-e29b-41d4-a716-446655440508', '550e8400-e29b-41d4-a716-446655440005', 'terms', 'Terms', 'This Agreement comes into force on the date of signing this Agreement and shall continue for one (1) year after this date. This agreement may be extended on the mutual agreement of both parties, unless earlier terminated in accordance with the agreement by paying renewal fee to ______________ by "Franchise".', '[\"franchiser_renewal\"]', 8, false),

-- Termination
('550e8400-e29b-41d4-a716-446655440509', '550e8400-e29b-41d4-a716-446655440005', 'termination', 'Termination', '1. This agreement may be terminated by either party at any time, without assigning any reason by giving prior written notice of ninety (90) days.

2. ______________ shall be entitled to terminate this agreement, with immediate effect upon happening of one or more of following:

a. Any breach or violation of any of the terms and conditions of this agreement by the "Franchise", if within seven (7) days of written notice from the Principal of the breach or violation, such breach or violation is not cured, provided that no cure period shall be applicable for the violation of any applicable law.

b. Failure of the "Franchise" to provide the services to the customers as per the expectations of ______________.', '[\"franchiser_termination_1\", \"franchiser_termination_2\"]', 9, false),

-- Applicable Law
('550e8400-e29b-41d4-a716-446655440510', '550e8400-e29b-41d4-a716-446655440005', 'governing_law', 'Applicable Law', 'This agreement is governed by and constructed in accordance with the laws of India.', '[]', 10, false),

-- Dispute Resolution
('550e8400-e29b-41d4-a716-446655440511', '550e8400-e29b-41d4-a716-446655440005', 'dispute_resolution', 'Dispute Resolution and Jurisdiction', '1. Any dispute, controversy or claims arising out of or relating to this Agreement or the breach, termination or invalidity thereof, shall be settled by arbitration in accordance with the provisions of the [Indian] Arbitration and Conciliation Act, 1996.

2. The arbitral tribunal shall be composed of three arbitrators, one arbitrator appointed by ______________, a second arbitrator appointed by "Franchise" and a third arbitrator to be appointed by such arbitrators.

3. The place of arbitration shall be at ______________ and any award whether interim or final, shall be made, and shall be deemed for all purposes between the Parties to be made in ______________.

4. The arbitral procedure shall be conducted in the English/Kannada language and any award or awards shall be rendered in English/Kannada. The procedural law of the arbitration shall be Indian law.

5. The award of the arbitral tribunal shall be final, conclusive and binding upon the Parties, and the provisions of the [Indian] Arbitration and Conciliation Act, 1996 shall apply.

6. The rights and obligations of the Parties under, or pursuant to, this Clause, including the arbitration agreement in this Clause, shall be governed by and be subject to Indian law, and the agreement shall be subject to the exclusive jurisdiction of the courts at ______________. (place to be named as per the agreement between the parties)', '[\"franchiser_arbitrator\", \"arbitration_place\", \"arbitration_place_2\", \"jurisdiction_court\"]', 11, false),

-- Signatures
('550e8400-e29b-41d4-a716-446655440512', '550e8400-e29b-41d4-a716-446655440005', 'signatures', 'Execution and Signatures', 'This Agreement has been executed on the date set forth herein in two (2) copies of which the Parties have taken one each.

For ______________, For ______________

Authorized signatory                     Authorized signatory
Witness 1                               Witness 1

Signature:                              Signature:
Name:                                   Name:
Address:                                Address:

Witness 2                               Witness 2

Signature:                              Signature:
Name:                                   Name:
Address:                                Address:', '[\"franchiser_execution\", \"franchise_execution\"]', 12, false);

-- Insert reusable contract clauses for franchise agreements
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES 

('550e8400-e29b-41d4-a716-446655440601', 'franchise_exclusivity', 'Non-Exclusivity Clause', 'There is no product and/or service and/or territorial exclusivity granted to the "Franchise" as part of this Agreement. The Franchiser may give such right or a similar right to persons other than "Franchise" to sell franchiser products and services anywhere including geographic area surrounding the premises.', ARRAY['non-exclusivity', 'territorial rights', 'competition'], ARRAY['franchise agreements', 'business partnerships', 'distribution agreements']),

('550e8400-e29b-41d4-a716-446655440602', 'pre_payment_system', 'Pre-Payment Business Model', 'The entire business being on pre-payment basis, Franchiser will supply all the services based upon requests from Franchise up to limits available for Franchise. Such limits will be equivalent to the funds available from Franchise with Franchiser at any point in time and will keep reducing with every transaction corresponding to the value of transaction.', ARRAY['pre-payment', 'transaction limits', 'fund management'], ARRAY['franchise agreements', 'service provider agreements', 'payment systems']),

('550e8400-e29b-41d4-a716-446655440603', 'commission_structure', 'Commission and Earnings Structure', 'Franchiser will publish commission structure and earning of the Franchise from time to time on the website. The details of all transactions done by Franchise will be available on the web, login ID and password of which will be provided to Franchise by Franchiser.', ARRAY['commission', 'earnings', 'transparency', 'web portal'], ARRAY['franchise agreements', 'revenue sharing', 'performance tracking']),

('550e8400-e29b-41d4-a716-446655440604', 'exclusive_dealing', 'Exclusive Dealing Obligation', 'Franchise will keep providing the services within the purview of this agreement through their outlets exclusively with Franchiser. Franchise will not enter into direct agreements with any other services providers, aggregators, distributors or any similar entity in India for this purpose, for the duration of this agreement.', ARRAY['exclusive dealing', 'non-compete', 'loyalty'], ARRAY['franchise agreements', 'exclusive partnerships', 'distribution agreements']),

('550e8400-e29b-41d4-a716-446655440605', 'intellectual_property_franchise', 'Intellectual Property Rights in Franchise', 'The Intellectual Property rights including the concept of delivery of services will rest with Franchiser or its suppliers or service providers. Franchise acknowledges that no IP rights are transferred under this agreement.', ARRAY['intellectual property', 'service concept', 'ownership'], ARRAY['franchise agreements', 'IP licensing', 'business method protection']),

('550e8400-e29b-41d4-a716-446655440606', 'franchise_confidentiality', 'Franchise Confidentiality Obligations', 'Franchise shall keep all information of confidential nature received from the Franchiser in whatever form as strictly confidential and shall not disclose it to third parties without the prior written consent of Franchiser during the term of this Agreement. Franchise agrees not to disclose revenue information without Franchiser prior written consent.', ARRAY['confidentiality', 'trade secrets', 'revenue protection'], ARRAY['franchise agreements', 'business partnerships', 'confidential relationships']),

('550e8400-e29b-41d4-a716-446655440607', 'franchise_termination_cause', 'Termination for Cause in Franchise', 'Franchiser shall be entitled to terminate this agreement with immediate effect upon: (a) Any breach or violation of any terms by Franchise, if within seven (7) days of written notice such breach is not cured, provided that no cure period shall apply for violation of applicable law; (b) Failure of Franchise to provide services to customers as per Franchiser expectations.', ARRAY['termination for cause', 'breach', 'service standards'], ARRAY['franchise agreements', 'performance standards', 'contract enforcement']),

('550e8400-e29b-41d4-a716-446655440608', 'arbitration_three_panel', 'Three-Arbitrator Panel Resolution', 'Any dispute shall be settled by arbitration in accordance with the Indian Arbitration and Conciliation Act, 1996. The arbitral tribunal shall be composed of three arbitrators, one appointed by each party and a third arbitrator appointed by such arbitrators. The place of arbitration and procedural law shall be Indian law.', ARRAY['arbitration', 'three arbitrators', 'dispute resolution', 'India'], ARRAY['franchise agreements', 'commercial disputes', 'Indian jurisdiction']);

-- Insert contract parameters for franchise agreements
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES 

('550e8400-e29b-41d4-a716-446655440701', 'franchise', 'execution_day', 'Agreement Execution Day', 'number', true, 'Day of the month when agreement is executed', '15', NULL),
('550e8400-e29b-41d4-a716-446655440702', 'franchise', 'execution_month', 'Agreement Execution Month', 'text', true, 'Month when agreement is executed', 'March', NULL),
('550e8400-e29b-41d4-a716-446655440703', 'franchise', 'execution_year', 'Agreement Execution Year', 'number', true, 'Year when agreement is executed', '2024', NULL),
('550e8400-e29b-41d4-a716-446655440704', 'franchise', 'franchiser_name', 'Franchiser Company Name', 'text', true, 'Legal name of the franchising company', 'TechServices Solutions Pvt Ltd', NULL),
('550e8400-e29b-41d4-a716-446655440705', 'franchise', 'franchiser_address', 'Franchiser Corporate Address', 'text', true, 'Complete corporate office address of franchiser', 'Plot 45, Sector 18, Gurgaon, Haryana - 122015', NULL),
('550e8400-e29b-41d4-a716-446655440706', 'franchise', 'franchise_name', 'Franchise Business Name', 'text', true, 'Name of the franchise business/proprietorship', 'Digital Services Hub', NULL),
('550e8400-e29b-41d4-a716-446655440707', 'franchise', 'franchise_business_address', 'Franchise Business Address', 'text', true, 'Complete business address of franchise', 'Shop 12, Main Market, Noida, UP - 201301', NULL),
('550e8400-e29b-41d4-a716-446655440708', 'franchise', 'franchise_representative', 'Franchise Representative Name', 'text', true, 'Name of person representing the franchise', 'Amit Kumar Singh', NULL),
('550e8400-e29b-41d4-a716-446655440709', 'franchise', 'franchise_father_name', 'Franchise Representative Father Name', 'text', true, 'Father''s name of franchise representative', 'Rajesh Kumar Singh', NULL),
('550e8400-e29b-41d4-a716-446655440710', 'franchise', 'franchise_age', 'Franchise Representative Age', 'number', true, 'Age of franchise representative', '35', NULL),
('550e8400-e29b-41d4-a716-446655440711', 'franchise', 'service_outlet_type', 'Service Outlet Type', 'text', true, 'Type of service outlet or business model', 'cyber cafe outlet', NULL),
('550e8400-e29b-41d4-a716-446655440712', 'franchise', 'franchiser_website', 'Franchiser Website', 'text', true, 'Website URL of the franchiser', 'www.techservices.com', NULL),
('550e8400-e29b-41d4-a716-446655440713', 'franchise', 'arbitration_place', 'Arbitration Place', 'text', true, 'City where arbitration will take place', 'New Delhi', NULL),
('550e8400-e29b-41d4-a716-446655440714', 'franchise', 'jurisdiction_court', 'Court Jurisdiction', 'text', true, 'Courts having jurisdiction over the agreement', 'New Delhi', NULL),
('550e8400-e29b-41d4-a716-446655440715', 'franchise', 'agreement_term_years', 'Agreement Term (Years)', 'number', true, 'Duration of franchise agreement in years', '1', NULL),
('550e8400-e29b-41d4-a716-446655440716', 'franchise', 'notice_period_days', 'Termination Notice Period (Days)', 'number', true, 'Days of notice required for termination', '90', NULL),
('550e8400-e29b-41d4-a716-446655440717', 'franchise', 'breach_cure_days', 'Breach Cure Period (Days)', 'number', true, 'Days given to cure a breach before termination', '7', NULL),
('550e8400-e29b-41d4-a716-446655440718', 'franchise', 'renewal_fee_required', 'Renewal Fee Required', 'select', false, 'Whether renewal fee is required for extension', 'yes', '[\"yes\", \"no\"]'),
('550e8400-e29b-41d4-a716-446655440719', 'franchise', 'business_services', 'Business Services Offered', 'text', true, 'Description of services offered through franchise', 'Online Ads, Offline Ads, Value Added Services and Premium Services', NULL),
('550e8400-e29b-41d4-a716-446655440720', 'franchise', 'payment_model', 'Payment Model', 'select', true, 'How payments are handled in the franchise', 'pre-payment', '[\"pre-payment\", \"post-payment\", \"credit-based\", \"commission-only\"]'),
('550e8400-e29b-41d4-a716-446655440721', 'franchise', 'territorial_exclusivity', 'Territorial Exclusivity', 'select', true, 'Whether territorial exclusivity is granted', 'no', '[\"yes\", \"no\", \"limited\"]'),
('550e8400-e29b-41d4-a716-446655440722', 'franchise', 'arbitration_language', 'Arbitration Language', 'select', true, 'Language for arbitration proceedings', 'English', '[\"English\", \"Hindi\", \"Kannada\", \"English/Hindi\", \"English/Kannada\"]');

-- ========================================
-- End of Template 5: Model Franchise Agreement
-- ========================================

-- Template 6: Model Agency Contract
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES 
('550e8400-e29b-41d4-a716-446655440006', 'agency', 'Model Agency Contract', 'Comprehensive agency agreement template for appointment of sole agents, covering sales representation, commission structure, territorial restrictions, stock management, termination clauses, and dispute resolution', 'agreement', 'India', ARRAY['agency', 'sales agent', 'commission', 'territorial rights', 'stock management', 'termination', 'dispute resolution', 'sole agent', 'sales representation']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES 

-- Preamble
('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440006', 'preamble', 'Agreement Header and Parties', 'This agreement is executed on this ______________ day of ______________ between ______________ (principal) (hereinafter called "the principal") of the one part and ______________ (agent) (hereinafter called "the agent") of the other part.

Whereby it is agreed between the parties as follows:', '[\"execution_day\", \"execution_month\", \"principal_name\", \"agent_name\"]', 1, false),

-- Appointment
('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440006', 'appointment', 'Agent Appointment and Territory', 'That the agent is hereby appointed as the sole agent of the principal for the town ______________ (in the District of ______________) (hereinafter called "the agency town") for the purpose of making sales of the products/goods of the principal for a term of ______________ years commencing from the date hereof on the terms and conditions set forth hereunder.', '[\"agency_town\", \"agency_district\", \"agreement_term_years\"]', 2, false),

-- Representations and Warranties
('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440006', 'representations', 'Agent Representations and Warranties', 'That the agent shall not, while selling the products/goods of the principal make any representation in the trade or give any warranty other than those contained in the principal''s printed price list.', '[]', 3, false),

-- Commission Structure
('550e8400-e29b-41d4-a716-446655440604', '550e8400-e29b-41d4-a716-446655440006', 'commission', 'Commission Structure and Payment Terms', 'That the agent shall be allowed to deduct and retain as his agency commission with himself ______________ per cent of the list price of all products/goods sold on behalf of the principal. The agent shall keep a record of all sales and shall regularly remit to the principal on each Saturday all sums received by the agent in respect of such sales less ______________ per cent his agency commission. All sales shall be made for cash against delivery of goods unless the principal''s consent in writing to give credit to any particular purchaser be in any case first obtained and in the case of such credit sales the principal may direct for such increase in the price of his products/goods over and above the current list price of the principal.', '[\"commission_percentage\", \"commission_percentage_2\"]', 4, false),

-- Financial Authority
('550e8400-e29b-41d4-a716-446655440605', '550e8400-e29b-41d4-a716-446655440006', 'financial_authority', 'Financial Authority Limitations', 'That the agent shall not make purchases on behalf of or in any manner pledge the credit of the principal without the consent in writing of the principal.', '[]', 5, false),

-- Premises and Insurance
('550e8400-e29b-41d4-a716-446655440606', '550e8400-e29b-41d4-a716-446655440006', 'premises', 'Premises and Insurance Requirements', 'That the agent shall, at the expense of the principal, take on rent and occupy for the purpose of the agency, suitable premises with prior approval of the principal and shall keep insured for full value against all available risks, all the goods entrusted to his custody by the principal under this agreement and on request, shall produce to the principal, receipts, for the rent, rates and taxes of the said premises and for the premiums on insurance policies showing that the same have been paid on or about their respective due dates. That the agent shall bear all expenses relating to or incidental to the said agency.', '[]', 6, false),

-- Territorial Restrictions
('550e8400-e29b-41d4-a716-446655440607', '550e8400-e29b-41d4-a716-446655440006', 'territorial_restrictions', 'Territorial and Price Restrictions for Purchasers', 'That the agent, while selling to persons in the trade, shall obtain the purchaser''s signature to an agreement to the following effect:

(i) That the said products/goods of the principal shall not directly or indirectly be re-sold outside the agency district.

(ii) That the said products/goods of the principal shall not be re-sold to the public below the price list for the time being.', '[]', 7, false),

-- Agent Identification
('550e8400-e29b-41d4-a716-446655440608', '550e8400-e29b-41d4-a716-446655440006', 'identification', 'Agent Identification Requirements', 'That the agent shall, in all his commercial dealings and on documents and on the name-plate or letter-head indicating his place of business, describe himself as selling agent for the principal.', '[]', 8, false),

-- Breach and Liquidated Damages
('550e8400-e29b-41d4-a716-446655440609', '550e8400-e29b-41d4-a716-446655440006', 'breach_damages', 'Breach and Liquidated Damages', 'That a breach of the condition in clause 6 hereof shall entitle the principal to put an end to this agreement forthwith and also to recover from the said agent by way of liquidated damages the sum of Rs. ______________ for each such article sold in breach of such clause. The agent undertakes that all purchasers to whom he may sell the principal''s goods shall duly enter into, and carry out the aforesaid agreement referred to in clause 6 hereof for the purposes of this agreement be deemed to be a breach of clause 6 of this agreement by the agent and give the principal the rights and remedies against the agent for breach by the agent of this agreement.', '[\"liquidated_damages_amount\"]', 9, false),

-- Stock Management
('550e8400-e29b-41d4-a716-446655440610', '550e8400-e29b-41d4-a716-446655440006', 'stock_management', 'Stock Management and Checking', 'That the principal shall keep with the agent a stock of his goods free of all expenses of delivery to the value of Rs. ______________ according to the principal''s current price list and the principal further undertakes to replenish such stock on the close of each month so as to keep it at the agreed value. Provided always that the agent shall have no right of action against the principal for delay resulting from shortage of stock, delays in transit, accidents, strikes or other unavoidable occurrences in replenishing such stock. The principal shall always have the right, without any prior notice, to cause a stock checking of the said products/goods and on any shortage or deficiency found on such stock-taking the agent shall on demand pay to the principal the list price of such shortage or deficiency less the deduction by way of commission or rebate receivable by the agent. The agent shall not alter, remove, or tamper with the marks or numbers on the products/goods so entrusted into his custody.', '[\"stock_value\"]', 10, false),

-- Pricing and Discounts
('550e8400-e29b-41d4-a716-446655440611', '550e8400-e29b-41d4-a716-446655440006', 'pricing', 'Pricing and Discount Policy', 'That the agent shall not sell the goods of the principal to any purchaser except at current price list of the principal conveyed by him from time to time. The agent may, however, allow a discount or rebate of ______________ per cent.', '[\"discount_percentage\"]', 11, false),

-- Dispute Handling
('550e8400-e29b-41d4-a716-446655440612', '550e8400-e29b-41d4-a716-446655440006', 'dispute_handling', 'Customer Dispute Handling', 'That in the event of any dispute arising between the agent and a purchaser of the products/goods of the principal, the agent shall immediately inform the principal of the same and shall not without the principal''s approval or consent in writing take any legal proceedings in respect of or compromise such dispute or grant a release to any purchaser of the products/goods of the principal.', '[]', 12, false),

-- Termination Notice
('550e8400-e29b-41d4-a716-446655440613', '550e8400-e29b-41d4-a716-446655440006', 'termination_notice', 'Termination Notice Period', 'That either party may terminate this agreement at his option at any time after the expiration of ______________ years by giving the other one month''s notice in writing.', '[\"minimum_term_years\"]', 13, false),

-- Non-Assignment
('550e8400-e29b-41d4-a716-446655440614', '550e8400-e29b-41d4-a716-446655440006', 'non_assignment', 'Non-Assignment of Benefits', 'That the benefits under this agreement shall not be assignable to any other person.', '[]', 14, false),

-- Exclusive Service
('550e8400-e29b-41d4-a716-446655440615', '550e8400-e29b-41d4-a716-446655440006', 'exclusive_service', 'Exclusive Service and Business Dedication', 'That the agent shall always, during the existence of this agreement, devote his whole business time and energy for pushing the sale of the products/goods of the principal and shall in all such dealings act honestly and faithfully to the principal and shall carry out orders and instructions and shall not engage or be interested either directly or indirectly as agent or servant in any other business or trade without the prior consent in writing of the principal.', '[]', 15, false),

-- Post-Termination Restrictions
('550e8400-e29b-41d4-a716-446655440616', '550e8400-e29b-41d4-a716-446655440006', 'post_termination', 'Post-Termination Non-Compete and Non-Solicitation', 'That on the termination of his agreement for any reason whatsoever, the agent shall not for the period of one year solicit trade orders from the persons who had been purchasers of the products/goods of the principal any time within ______________ years immediately preceding the date of such termination and the agent shall not for a period of one year engage or be interested as agent or servant in any business, firm or company manufacturing, selling or dealing in products/goods similar to those of the principal.', '[\"customer_history_years\"]', 16, false),

-- Delivery Terms
('550e8400-e29b-41d4-a716-446655440617', '550e8400-e29b-41d4-a716-446655440006', 'delivery', 'Delivery Terms and Responsibilities', 'That all products/goods shall be sold by the agent for delivery at agent''s place of business but the agent shall, at his own expense, have the right to deliver products/goods to purchasers at their places of business.', '[]', 17, false),

-- Summary Termination
('550e8400-e29b-41d4-a716-446655440618', '550e8400-e29b-41d4-a716-446655440006', 'summary_termination', 'Summary Termination Grounds', 'That without prejudice to any other remedy he may have against the agent for any breach or non-performance of any part of this agreement, the principal shall have the right summarily to terminate this agreement:

(i) on the agent being found guilty of a breach of its provisions or being guilty of misconduct or negligence of his duties; or

(ii) on the agent absenting himself from his business duties entrusted to him under this agreement for ______________ days without the principal''s prior permission in writing; or

(iii) on the agent committing an act of bankruptcy.', '[\"absence_days\"]', 18, false),

-- Dispute Resolution
('550e8400-e29b-41d4-a716-446655440619', '550e8400-e29b-41d4-a716-446655440006', 'dispute_resolution', 'Arbitration and Dispute Resolution', 'That in the event of any dispute arising out of or in relation to or touching upon the agreement, the same shall be decided by arbitration in accordance with the provisions of the Arbitration and Conciliation Act, 1996 by the Arbitrator appointed with mutual consent.

1. The award of the Arbitrator shall be final, conclusive and binding upon the Parties, and the provisions of the [Indian] Arbitration and Conciliation Act, 1996 shall apply.

2. The rights and obligations of the Parties under, or pursuant to, this Clause, including the arbitration agreement in this Clause, shall be governed by and be subject to Indian law, and the agreement shall be subject to the exclusive jurisdiction of the courts at ______________. (place to be named as per the agreement between the parties).', '[\"jurisdiction_court\"]', 19, false),

-- Business Cessation Termination
('550e8400-e29b-41d4-a716-446655440620', '550e8400-e29b-41d4-a716-446655440006', 'business_cessation', 'Termination for Business Cessation', 'That the principal shall be entitled to terminate this agreement by one month''s notice in writing to the agent in the event of his ceasing to carry on the said business of the principal.', '[]', 20, false),

-- Post-Termination Obligations
('550e8400-e29b-41d4-a716-446655440621', '550e8400-e29b-41d4-a716-446655440006', 'post_termination_obligations', 'Post-Termination Asset Return and Settlement', 'That on the termination of this agreement for whatever reason, the agent shall forthwith deliver to the principal all the unsold stock of products/goods and shall pay to the principal for the shortages of deficiency of stock at price list less commission and rebate allowable to the agent. The agent shall also deliver to the charge of the principal all books of account and documents of the agency, cash, cheques, bills of exchange or other securities he may have received during the normal course as a result of sales of the products/goods of the principal and shall transfer, assign or negotiate in favour of the principal all such securities on demand.', '[]', 21, false),

-- Signatures
('550e8400-e29b-41d4-a716-446655440622', '550e8400-e29b-41d4-a716-446655440006', 'signatures', 'Execution and Witnesses', 'IN WITNESS WHEREOF the parties have signed this deed.

Witness:                                                           Principal

Witness:                                                           Agent', '[]', 22, false);

-- Insert reusable contract clauses for agency agreements
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES 

('550e8400-e29b-41d4-a716-446655440701', 'sole_agency', 'Sole Agency Appointment', 'The agent is hereby appointed as the sole agent of the principal for the specified territory for the purpose of making sales of the products/goods of the principal for the agreed term on the terms and conditions set forth in the agreement.', ARRAY['sole agent', 'territorial exclusivity', 'sales representation'], ARRAY['agency agreements', 'distribution agreements', 'sales representation']),

('550e8400-e29b-41d4-a716-446655440702', 'commission_payment', 'Commission and Payment Terms', 'The agent shall be allowed to deduct and retain as agency commission a specified percentage of the list price of all products/goods sold. The agent shall keep records of all sales and regularly remit to the principal all sums received less the agency commission. All sales shall be for cash against delivery unless written consent for credit is obtained.', ARRAY['commission', 'payment terms', 'cash sales', 'credit approval'], ARRAY['agency agreements', 'sales commission', 'payment structures']),

('550e8400-e29b-41d4-a716-446655440703', 'no_financial_authority', 'Limited Financial Authority', 'The agent shall not make purchases on behalf of or in any manner pledge the credit of the principal without the consent in writing of the principal.', ARRAY['financial authority', 'credit limitations', 'purchase restrictions'], ARRAY['agency agreements', 'financial controls', 'risk management']),

('550e8400-e29b-41d4-a716-446655440704', 'territorial_resale_restrictions', 'Territorial Resale Restrictions', 'All purchasers must agree that the products/goods shall not directly or indirectly be re-sold outside the agency district and shall not be re-sold to the public below the current price list.', ARRAY['territorial restrictions', 'price maintenance', 'resale control'], ARRAY['agency agreements', 'distribution control', 'price protection']),

('550e8400-e29b-41d4-a716-446655440705', 'agent_identification_requirement', 'Agent Identification Requirement', 'The agent shall, in all commercial dealings and on documents, name-plates, and letter-heads, describe himself as selling agent for the principal.', ARRAY['agent identification', 'branding', 'commercial representation'], ARRAY['agency agreements', 'brand protection', 'market representation']),

('550e8400-e29b-41d4-a716-446655440706', 'stock_management_agency', 'Stock Management and Checking Rights', 'The principal shall maintain stock with the agent to an agreed value and has the right to check stock without notice. The agent is liable for shortages and deficiencies at list price less commission. The agent cannot alter marks or numbers on goods.', ARRAY['stock management', 'inventory control', 'shortage liability'], ARRAY['agency agreements', 'inventory management', 'asset protection']),

('550e8400-e29b-41d4-a716-446655440707', 'exclusive_service_obligation', 'Exclusive Service and Business Dedication', 'The agent shall devote whole business time and energy to pushing sales of the principal''s products/goods, act honestly and faithfully, and shall not engage in any other business without prior written consent of the principal.', ARRAY['exclusive service', 'business dedication', 'non-compete', 'loyalty'], ARRAY['agency agreements', 'exclusive representation', 'conflict prevention']),

('550e8400-e29b-41d4-a716-446655440708', 'post_termination_restrictions_agency', 'Post-Termination Non-Compete and Non-Solicitation', 'Upon termination, the agent shall not for one year solicit trade orders from previous customers or engage in similar business. The agent must return all stock, documents, and securities to the principal.', ARRAY['post-termination', 'non-compete', 'non-solicitation', 'asset return'], ARRAY['agency agreements', 'termination procedures', 'competitive protection']),

('550e8400-e29b-41d4-a716-446655440709', 'summary_termination_agency', 'Summary Termination for Cause', 'The principal may summarily terminate the agreement for: (i) breach of provisions, misconduct, or negligence; (ii) absence from business duties for specified days without permission; (iii) act of bankruptcy by the agent.', ARRAY['summary termination', 'breach', 'misconduct', 'bankruptcy'], ARRAY['agency agreements', 'termination for cause', 'performance standards']),

('550e8400-e29b-41d4-a716-446655440710', 'liquidated_damages_agency', 'Liquidated Damages for Territorial Breach', 'Breach of territorial restrictions entitles the principal to terminate the agreement and recover liquidated damages for each article sold in breach, with the agent being liable for purchaser compliance failures.', ARRAY['liquidated damages', 'territorial breach', 'enforcement'], ARRAY['agency agreements', 'breach remedies', 'damage quantification']);

-- Insert contract parameters for agency agreements
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES 

('550e8400-e29b-41d4-a716-446655440801', 'agency', 'execution_day', 'Agreement Execution Day', 'text', true, 'Day of the month when agreement is executed', '15th', NULL),
('550e8400-e29b-41d4-a716-446655440802', 'agency', 'execution_month', 'Agreement Execution Month', 'text', true, 'Month when agreement is executed', 'March', NULL),
('550e8400-e29b-41d4-a716-446655440803', 'agency', 'principal_name', 'Principal Name', 'text', true, 'Legal name of the principal appointing the agent', 'ABC Manufacturing Ltd', NULL),
('550e8400-e29b-41d4-a716-446655440804', 'agency', 'agent_name', 'Agent Name', 'text', true, 'Legal name of the agent being appointed', 'XYZ Sales Agency', NULL),
('550e8400-e29b-41d4-a716-446655440805', 'agency', 'agency_town', 'Agency Town', 'text', true, 'Town or city for which agent is appointed', 'Pune', NULL),
('550e8400-e29b-41d4-a716-446655440806', 'agency', 'agency_district', 'Agency District', 'text', true, 'District containing the agency town', 'Pune District', NULL),
('550e8400-e29b-41d4-a716-446655440807', 'agency', 'agreement_term_years', 'Agreement Term (Years)', 'number', true, 'Duration of agency agreement in years', '3', NULL),
('550e8400-e29b-41d4-a716-446655440808', 'agency', 'commission_percentage', 'Commission Percentage', 'number', true, 'Percentage commission on sales', '10', NULL),
('550e8400-e29b-41d4-a716-446655440809', 'agency', 'liquidated_damages_amount', 'Liquidated Damages Amount (Rs.)', 'currency', true, 'Amount of liquidated damages per breach', '5000', NULL),
('550e8400-e29b-41d4-a716-446655440810', 'agency', 'stock_value', 'Stock Value (Rs.)', 'currency', true, 'Value of stock to be maintained with agent', '100000', NULL),
('550e8400-e29b-41d4-a716-446655440811', 'agency', 'discount_percentage', 'Maximum Discount Percentage', 'number', true, 'Maximum discount agent can offer', '5', NULL),
('550e8400-e29b-41d4-a716-446655440812', 'agency', 'minimum_term_years', 'Minimum Term Before Termination (Years)', 'number', true, 'Minimum years before termination allowed', '2', NULL),
('550e8400-e29b-41d4-a716-446655440813', 'agency', 'customer_history_years', 'Customer History Period (Years)', 'number', true, 'Years of customer history for non-solicitation', '3', NULL),
('550e8400-e29b-41d4-a716-446655440814', 'agency', 'absence_days', 'Maximum Absence Days', 'number', true, 'Maximum days agent can be absent without permission', '30', NULL),
('550e8400-e29b-41d4-a716-446655440815', 'agency', 'jurisdiction_court', 'Court Jurisdiction', 'text', true, 'Courts having jurisdiction over the agreement', 'Pune', NULL),
('550e8400-e29b-41d4-a716-446655440816', 'agency', 'products_description', 'Products/Goods Description', 'text', true, 'Description of products/goods to be sold', 'Electronic appliances and accessories', NULL),
('550e8400-e29b-41d4-a716-446655440817', 'agency', 'payment_frequency', 'Payment Frequency', 'select', true, 'How often agent remits payments', 'weekly', '[\"daily\", \"weekly\", \"bi-weekly\", \"monthly\"]'),
('550e8400-e29b-41d4-a716-446655440818', 'agency', 'premises_approval_required', 'Premises Approval Required', 'select', true, 'Whether principal approval needed for premises', 'yes', '[\"yes\", \"no\"]'),
('550e8400-e29b-41d4-a716-446655440819', 'agency', 'insurance_requirement', 'Insurance Requirement', 'select', true, 'Whether insurance is required for goods', 'yes', '[\"yes\", \"no\", \"partial\"]'),
('550e8400-e29b-41d4-a716-446655440820', 'agency', 'credit_sales_allowed', 'Credit Sales Allowed', 'select', true, 'Whether credit sales are permitted', 'with_approval', '[\"no\", \"with_approval\", \"yes\"]'),
('550e8400-e29b-41d4-a716-446655440821', 'agency', 'territorial_exclusivity', 'Territorial Exclusivity', 'select', true, 'Whether agent has exclusive territorial rights', 'yes', '[\"yes\", \"no\", \"limited\"]'),
('550e8400-e29b-41d4-a716-446655440822', 'agency', 'stock_replenishment', 'Stock Replenishment Frequency', 'select', true, 'How often stock is replenished', 'monthly', '[\"weekly\", \"bi-weekly\", \"monthly\", \"quarterly\"]');

-- ========================================
-- End of Template 6: Model Agency Contract
-- ========================================

-- Template 7: Agreement for Sale
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES 
('550e8400-e29b-41d4-a716-446655440007', 'sale', 'Agreement for Sale', 'Comprehensive property sale agreement template covering sale consideration, payment terms, possession transfer, title assurance, encumbrance clearance, and dispute resolution for real estate transactions in India', 'agreement', 'India', ARRAY['property sale', 'real estate', 'sale consideration', 'possession transfer', 'title clearance', 'encumbrance', 'specific performance', 'arbitration']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES 

-- Preamble
('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440007', 'preamble', 'Agreement Header and Parties', 'THIS AGREEMENT FOR SALE is made and executed on this the ______________ day of ______________, ______________.

BETWEEN

Sri. ______________ s/o. ______________ aged ______________ years residing at ______________ hereinafter called the "SELLER" (which expression shall mean and include her legal heirs, successors, successors-in-interest, executors, administrators, legal representatives, attorneys and assigns) of ONE PART.

AND

Sri. ______________ s/o ______________ aged ______________ years residing at ______________ hereinafter called the "PURCHASER" (represented by his power of attorney) which expression shall mean and include his heirs, successors, executors, administrators, legal representatives, attorneys and assigns of the OTHER PART.', '[\"execution_day\", \"execution_month\", \"execution_year\", \"seller_name\", \"seller_father_name\", \"seller_age\", \"seller_address\", \"purchaser_name\", \"purchaser_father_name\", \"purchaser_age\", \"purchaser_address\"]', 1, false),

-- Property Ownership Declaration
('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440007', 'ownership', 'Property Ownership and Title Declaration', 'WHEREAS THE SELLER is the absolute owner in possession and enjoyment of the property more fully described in the schedule hereunder and hereafter called the "SCHEDULE PROPERTY".

WHEREAS the property more fully described in the schedule hereunder is the self acquired property of the SELLER who purchased the same from Sri. ______________ under sale deed dated ______________ and registered as Doct.No. ______________ of ______________ Book 1 Volume No ______________ Pages ______________ to ______________, registered on ______________ and filed on the file of the Sub-Registrar, ______________

WHEREAS the SELLER is the absolute owner of the property and he has been enjoying the same with absolute right and he has clear and marketable title to the Schedule Property', '[\"previous_owner_name\", \"previous_sale_deed_date\", \"document_number\", \"document_year\", \"volume_number\", \"page_from\", \"page_to\", \"registration_date\", \"sub_registrar_office\"]', 2, false),

-- Background and Sale Intent
('550e8400-e29b-41d4-a716-446655440703', '550e8400-e29b-41d4-a716-446655440007', 'background', 'Background and Intent to Sale', 'WHEREAS the SELLER being in need of funds for the purpose of ______________ has decided to sell the property more fully described in the Schedule hereunder and the PURCHASER has offered to purchase the same.

WHEREAS the SELLER offered to sell and transfer the schedule property to the PURCHASER for a sale consideration of Rs ______________ (Rupees ______________ only) and the PURCHASER herein has agreed to purchase the same for the aforesaid consideration on the following terms and conditions:', '[\"purpose_of_sale\", \"total_sale_consideration\", \"sale_consideration_words\"]', 3, false),

-- Sale Consideration
('550e8400-e29b-41d4-a716-446655440704', '550e8400-e29b-41d4-a716-446655440007', 'consideration', 'Sale Consideration', 'The Sale consideration of the Schedule Property is fixed at Rs. ______________ (Rupees ______________ only).', '[\"sale_consideration_amount\", \"sale_consideration_amount_words\"]', 4, false),

-- Advance Payment
('550e8400-e29b-41d4-a716-446655440705', '550e8400-e29b-41d4-a716-446655440007', 'advance_payment', 'Advance Payment', 'The PURCHASER has paid a sum of Rs. ______________ (Rupees ______________ only) by cash/cheque/D.D. bearing No ______________ drawn on ______________ dated ______________ as advance, the receipt of which sum the SELLER hereby acknowledges.', '[\"advance_amount\", \"advance_amount_words\", \"payment_instrument_number\", \"bank_name\", \"payment_date\"]', 5, false),

-- Balance Payment
('550e8400-e29b-41d4-a716-446655440706', '550e8400-e29b-41d4-a716-446655440007', 'balance_payment', 'Balance Payment Terms', 'The balance payment of Rs. ______________ (Rupees ______________ only) will be paid by the PURCHASER to the SELLER at the time of execution of the absolute Sale Deed and thus completing the Sale transaction.', '[\"balance_amount\", \"balance_amount_words\"]', 6, false),

-- Completion Timeline
('550e8400-e29b-41d4-a716-446655440707', '550e8400-e29b-41d4-a716-446655440007', 'completion', 'Sale Completion Timeline', 'The parties herein covenant to complete the Sale transaction and to execute the Absolute Sale Deed by the end of ______________.', '[\"completion_date\"]', 7, false),

-- Exclusivity Confirmation
('550e8400-e29b-41d4-a716-446655440708', '550e8400-e29b-41d4-a716-446655440007', 'exclusivity', 'Exclusivity and No Other Agreements', 'The SELLER confirms with the PURCHASER that he/she has not entered into any agreement for sale, mortgage or exchange whatsoever with any other person relating to the Schedule Property of this Agreement.', '[]', 8, false),

-- Title Assurance
('550e8400-e29b-41d4-a716-446655440709', '550e8400-e29b-41d4-a716-446655440007', 'title_assurance', 'Title Assurance and Encumbrance Clearance', 'The SELLER hereby assures the PURCHASER and he/she has absolute power to convey the same and there are no encumbrances, liens, charges, Government dues, attachments, acquisition, or requisition, proceedings etc.', '[]', 9, false),

-- Possession Transfer
('550e8400-e29b-41d4-a716-446655440710', '550e8400-e29b-41d4-a716-446655440007', 'possession', 'Possession Transfer', 'The SELLER agrees to put the purchaser in absolute and vacant possession of the schedule property after executing the sale deed and registering the same in the jurisdictional Sub-Registrar''s office.', '[]', 10, false),

-- No Further Encumbrance
('550e8400-e29b-41d4-a716-446655440711', '550e8400-e29b-41d4-a716-446655440007', 'no_encumbrance', 'Covenant Against Further Encumbrance', 'The SELLER covenants with the purchaser that he/she shall not do any act, deed or thing creating any charge, lien or encumbrance in respect of the schedule property during the subsistence of this Agreement.', '[]', 11, false),

-- Marketable Title Covenant
('550e8400-e29b-41d4-a716-446655440712', '550e8400-e29b-41d4-a716-446655440007', 'marketable_title', 'Marketable Title Conveyance Covenant', 'The SELLER has specifically agreed and covenants with the PURCHASER that he/she shall do all acts, deeds and things which are necessary and requisite to convey absolute and marketable title in respect of the schedule property in favour of the PURCHASER or his nominee.', '[]', 12, false),

-- Expenses
('550e8400-e29b-41d4-a716-446655440713', '550e8400-e29b-41d4-a716-446655440007', 'expenses', 'Stamp Duty and Registration Expenses', 'IT IS AGREED between the parties that all expenses towards Stamp Duty and Registration charges shall be borne by the PURCHASER only.', '[]', 13, false),

-- Nomination Rights
('550e8400-e29b-41d4-a716-446655440714', '550e8400-e29b-41d4-a716-446655440007', 'nomination', 'Nomination and Assignment Rights', 'The PURCHASER shall have the right to nominate or assign his right under this agreement to any person/persons of his choice and the SELLER shall execute the Sale Deed as per terms and conditions of this Agreement in favour of the PURCHASER or his nominee or assignee.', '[]', 14, false),

-- Family Consent
('550e8400-e29b-41d4-a716-446655440715', '550e8400-e29b-41d4-a716-446655440007', 'family_consent', 'Family Consent Requirements', 'The SELLER has agreed to get consent deed duly executed to this Sale transaction from his wife/her husband, sons and daughters on or before date of registration of Sale Deed and assured that they all join to execute sale deed in favour of the purchaser.', '[]', 15, false),

-- Specific Performance
('550e8400-e29b-41d4-a716-446655440716', '550e8400-e29b-41d4-a716-446655440007', 'specific_performance', 'Specific Performance Rights', 'It is hereby expressly provided and agreed by the parties hereto that both parties are entitled to enforce specific performance of the agreement against each other in case of breach of any conditions mentioned in this Agreement.', '[]', 16, false),

-- Agreement Custody
('550e8400-e29b-41d4-a716-446655440717', '550e8400-e29b-41d4-a716-446655440007', 'custody', 'Agreement Custody and Copies', 'The original of the "AGREEMENT" signed by both the parties shall be with the PURCHASER and copy of the same similarly signed shall be with the SELLER.', '[]', 17, false),

-- Dispute Resolution
('550e8400-e29b-41d4-a716-446655440718', '550e8400-e29b-41d4-a716-446655440007', 'dispute_resolution', 'Dispute Resolution and Jurisdiction', 'Any dispute, controversy or claims arising out of or relating to this Agreement or the breach, termination or invalidity thereof, shall be settled by arbitration in accordance with the provisions of the [Indian] Arbitration and Conciliation Act, 1996.

The arbitration is by Sole Arbitrator appointed by mutual consent.

The place of arbitration shall be at ______________ and any award whether interim or final, shall be made, and shall be deemed for all purposes between the Parties to be made in ______________.

The arbitral procedure shall be conducted in the English/Kannada language and any award or awards shall be rendered in English/Kannada. The procedural law of the arbitration shall be Indian law.

The award of the arbitral tribunal shall be final, conclusive and binding upon the Parties, and the provisions of the [Indian] Arbitration and Conciliation Act, 1996 shall apply.

The rights and obligations of the Parties under, or pursuant to, this Clause, including the arbitration agreement in this Clause, shall be governed by and be subject to Indian law, and the agreement shall be subject to the exclusive jurisdiction of the courts at ______________. (place to be named as per the agreement between the parties)', '[\"arbitration_place\", \"arbitration_place_2\", \"jurisdiction_court\"]', 18, false),

-- Property Schedule
('550e8400-e29b-41d4-a716-446655440719', '550e8400-e29b-41d4-a716-446655440007', 'schedule', 'Property Schedule', 'SCHEDULE

[Property description to be inserted here - complete details of the property including survey numbers, boundaries, area, and any other relevant details]', '[]', 19, false),

-- Signatures
('550e8400-e29b-41d4-a716-446655440720', '550e8400-e29b-41d4-a716-446655440007', 'signatures', 'Execution and Witnesses', 'IN WITNESS WHEREOF the SELLER and the PURCHASER have signed this Agreement of Sale on the day month and year herein above mentioned in the presence of the witnesses:

WITNESSES:

1. ______________                    SELLER

2. ______________                    PURCHASER', '[]', 20, false);

-- Insert reusable contract clauses for sale agreements
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES 

('550e8400-e29b-41d4-a716-446655440801', 'property_ownership', 'Absolute Ownership Declaration', 'The SELLER is the absolute owner in possession and enjoyment of the property more fully described in the schedule and has clear and marketable title to the Schedule Property with absolute right to sell and transfer the same.', ARRAY['ownership', 'marketable title', 'clear title', 'possession'], ARRAY['property sales', 'real estate transfers', 'land transactions']),

('550e8400-e29b-41d4-a716-446655440802', 'no_encumbrance', 'No Encumbrance Assurance', 'The SELLER hereby assures that there are no encumbrances, liens, charges, Government dues, attachments, acquisition, or requisition proceedings etc. affecting the property and covenants not to create any such encumbrances during the subsistence of this Agreement.', ARRAY['no encumbrance', 'liens', 'charges', 'government dues'], ARRAY['property sales', 'title clearance', 'real estate due diligence']),

('550e8400-e29b-41d4-a716-446655440803', 'vacant_possession', 'Vacant Possession Transfer', 'The SELLER agrees to put the purchaser in absolute and vacant possession of the schedule property after executing the sale deed and registering the same in the jurisdictional Sub-Registrar''s office.', ARRAY['vacant possession', 'possession transfer', 'property handover'], ARRAY['property sales', 'possession transfer', 'real estate completion']),

('550e8400-e29b-41d4-a716-446655440804', 'advance_payment_acknowledgment', 'Advance Payment Acknowledgment', 'The PURCHASER has paid an advance amount by cash/cheque/D.D., the receipt of which sum the SELLER hereby acknowledges. The balance payment will be made at the time of execution of the absolute Sale Deed.', ARRAY['advance payment', 'payment acknowledgment', 'earnest money'], ARRAY['property sales', 'payment terms', 'transaction security']),

('550e8400-e29b-41d4-a716-446655440805', 'nomination_assignment_rights', 'Nomination and Assignment Rights', 'The PURCHASER shall have the right to nominate or assign his right under this agreement to any person/persons of his choice and the SELLER shall execute the Sale Deed in favour of the PURCHASER or his nominee or assignee.', ARRAY['nomination rights', 'assignment', 'transferability'], ARRAY['property sales', 'investment flexibility', 'nominee transactions']),

('550e8400-e29b-41d4-a716-446655440806', 'family_consent_requirement', 'Family Consent and Joint Execution', 'The SELLER has agreed to get consent deed duly executed from family members including spouse, sons and daughters and assured that they all join to execute sale deed in favour of the purchaser.', ARRAY['family consent', 'spousal consent', 'joint execution'], ARRAY['property sales', 'family property', 'consent requirements']),

('550e8400-e29b-41d4-a716-446655440807', 'specific_performance_clause', 'Specific Performance Enforceability', 'Both parties are entitled to enforce specific performance of the agreement against each other in case of breach of any conditions mentioned in this Agreement, ensuring legal remedy beyond monetary damages.', ARRAY['specific performance', 'breach remedy', 'enforceability'], ARRAY['property sales', 'contract enforcement', 'legal remedies']),

('550e8400-e29b-41d4-a716-446655440808', 'registration_expenses', 'Registration and Stamp Duty Responsibility', 'All expenses towards Stamp Duty and Registration charges shall be borne by the PURCHASER only, clearly defining the financial responsibility for transaction completion.', ARRAY['stamp duty', 'registration charges', 'buyer responsibility'], ARRAY['property sales', 'transaction costs', 'expense allocation']),

('550e8400-e29b-41d4-a716-446655440809', 'exclusivity_agreement', 'Exclusivity and No Competing Transactions', 'The SELLER confirms that no agreement for sale, mortgage or exchange has been entered into with any other person relating to the Schedule Property, ensuring exclusive dealing.', ARRAY['exclusivity', 'no competing deals', 'exclusive transaction'], ARRAY['property sales', 'deal protection', 'exclusivity assurance']),

('550e8400-e29b-41d4-a716-446655440810', 'marketable_title_covenant', 'Marketable Title Conveyance Covenant', 'The SELLER covenants to do all acts, deeds and things necessary and requisite to convey absolute and marketable title in respect of the schedule property in favour of the PURCHASER or nominee.', ARRAY['marketable title', 'title conveyance', 'seller obligations'], ARRAY['property sales', 'title assurance', 'conveyancing']);

-- Insert contract parameters for sale agreements
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES 

('550e8400-e29b-41d4-a716-446655440901', 'sale', 'execution_day', 'Agreement Execution Day', 'text', true, 'Day of the month when agreement is executed', '15th', NULL),
('550e8400-e29b-41d4-a716-446655440902', 'sale', 'execution_month', 'Agreement Execution Month', 'text', true, 'Month when agreement is executed', 'March', NULL),
('550e8400-e29b-41d4-a716-446655440903', 'sale', 'execution_year', 'Agreement Execution Year', 'number', true, 'Year when agreement is executed', '2024', NULL),
('550e8400-e29b-41d4-a716-446655440904', 'sale', 'seller_name', 'Seller Name', 'text', true, 'Full name of the property seller', 'Rajesh Kumar Sharma', NULL),
('550e8400-e29b-41d4-a716-446655440905', 'sale', 'seller_father_name', 'Seller Father Name', 'text', true, 'Father''s name of the seller', 'Late Ramesh Kumar Sharma', NULL),
('550e8400-e29b-41d4-a716-446655440906', 'sale', 'seller_age', 'Seller Age', 'number', true, 'Age of the seller', '45', NULL),
('550e8400-e29b-41d4-a716-446655440907', 'sale', 'seller_address', 'Seller Address', 'text', true, 'Complete residential address of seller', 'House No. 123, Sector 15, Noida, UP - 201301', NULL),
('550e8400-e29b-41d4-a716-446655440908', 'sale', 'purchaser_name', 'Purchaser Name', 'text', true, 'Full name of the property purchaser', 'Amit Singh Rawat', NULL),
('550e8400-e29b-41d4-a716-446655440909', 'sale', 'purchaser_father_name', 'Purchaser Father Name', 'text', true, 'Father''s name of the purchaser', 'Suresh Singh Rawat', NULL),
('550e8400-e29b-41d4-a716-446655440910', 'sale', 'purchaser_age', 'Purchaser Age', 'number', true, 'Age of the purchaser', '38', NULL),
('550e8400-e29b-41d4-a716-446655440911', 'sale', 'purchaser_address', 'Purchaser Address', 'text', true, 'Complete residential address of purchaser', 'Plot 456, Sector 22, Gurgaon, Haryana - 122001', NULL),
('550e8400-e29b-41d4-a716-446655440912', 'sale', 'previous_owner_name', 'Previous Owner Name', 'text', false, 'Name of previous owner from whom seller purchased', 'Mohan Lal Gupta', NULL),
('550e8400-e29b-41d4-a716-446655440913', 'sale', 'previous_sale_deed_date', 'Previous Sale Deed Date', 'date', false, 'Date of previous sale deed', '2015-08-20', NULL),
('550e8400-e29b-41d4-a716-446655440914', 'sale', 'document_number', 'Document Registration Number', 'text', false, 'Registration document number', '2458', NULL),
('550e8400-e29b-41d4-a716-446655440915', 'sale', 'document_year', 'Document Year', 'number', false, 'Year of document registration', '2015', NULL),
('550e8400-e29b-41d4-a716-446655440916', 'sale', 'volume_number', 'Volume Number', 'text', false, 'Volume number of registration', '245', NULL),
('550e8400-e29b-41d4-a716-446655440917', 'sale', 'page_from', 'Page From', 'number', false, 'Starting page number', '125', NULL),
('550e8400-e29b-41d4-a716-446655440918', 'sale', 'page_to', 'Page To', 'number', false, 'Ending page number', '130', NULL),
('550e8400-e29b-41d4-a716-446655440919', 'sale', 'registration_date', 'Registration Date', 'date', false, 'Date of registration', '2015-08-25', NULL),
('550e8400-e29b-41d4-a716-446655440920', 'sale', 'sub_registrar_office', 'Sub-Registrar Office', 'text', false, 'Sub-registrar office location', 'Noida', NULL),
('550e8400-e29b-41d4-a716-446655440921', 'sale', 'purpose_of_sale', 'Purpose of Sale', 'text', true, 'Reason for selling the property', 'business expansion', NULL),
('550e8400-e29b-41d4-a716-446655440922', 'sale', 'total_sale_consideration', 'Total Sale Consideration (Rs.)', 'currency', true, 'Total sale price of the property', '5000000', NULL),
('550e8400-e29b-41d4-a716-446655440923', 'sale', 'sale_consideration_words', 'Sale Consideration in Words', 'text', true, 'Sale price written in words', 'Fifty Lakhs', NULL),
('550e8400-e29b-41d4-a716-446655440924', 'sale', 'advance_amount', 'Advance Amount (Rs.)', 'currency', true, 'Advance payment amount', '500000', NULL),
('550e8400-e29b-41d4-a716-446655440925', 'sale', 'advance_amount_words', 'Advance Amount in Words', 'text', true, 'Advance amount written in words', 'Five Lakhs', NULL),
('550e8400-e29b-41d4-a716-446655440926', 'sale', 'payment_instrument_number', 'Payment Instrument Number', 'text', true, 'Cheque/DD number for advance payment', 'DD123456789', NULL),
('550e8400-e29b-41d4-a716-446655440927', 'sale', 'bank_name', 'Bank Name', 'text', true, 'Bank from which payment instrument is drawn', 'State Bank of India', NULL),
('550e8400-e29b-41d4-a716-446655440928', 'sale', 'payment_date', 'Payment Date', 'date', true, 'Date of advance payment', '2024-03-15', NULL),
('550e8400-e29b-41d4-a716-446655440929', 'sale', 'balance_amount', 'Balance Amount (Rs.)', 'currency', true, 'Remaining payment amount', '4500000', NULL),
('550e8400-e29b-41d4-a716-446655440930', 'sale', 'balance_amount_words', 'Balance Amount in Words', 'text', true, 'Balance amount written in words', 'Forty Five Lakhs', NULL),
('550e8400-e29b-41d4-a716-446655440931', 'sale', 'completion_date', 'Sale Completion Date', 'date', true, 'Date by which sale deed will be executed', '2024-06-30', NULL),
('550e8400-e29b-41d4-a716-446655440932', 'sale', 'arbitration_place', 'Arbitration Place', 'text', true, 'City where arbitration will take place', 'New Delhi', NULL),
('550e8400-e29b-41d4-a716-446655440933', 'sale', 'jurisdiction_court', 'Court Jurisdiction', 'text', true, 'Courts having jurisdiction over the agreement', 'New Delhi', NULL),
('550e8400-e29b-41d4-a716-446655440934', 'sale', 'property_description', 'Property Description', 'text', true, 'Detailed description of the property being sold', 'Residential plot measuring 200 sq yards in Sector 15, Noida', NULL),
('550e8400-e29b-41d4-a716-446655440935', 'sale', 'survey_number', 'Survey Number', 'text', false, 'Survey number of the property', 'S.No. 123/2A', NULL),
('550e8400-e29b-41d4-a716-446655440936', 'sale', 'property_area', 'Property Area', 'text', true, 'Area of the property', '200 sq yards', NULL),
('550e8400-e29b-41d4-a716-446655440937', 'sale', 'payment_mode', 'Advance Payment Mode', 'select', true, 'Mode of advance payment', 'cheque', '[\"cash\", \"cheque\", \"demand_draft\", \"online_transfer\"]'),
('550e8400-e29b-41d4-a716-446655440938', 'sale', 'power_of_attorney', 'Power of Attorney Representation', 'select', false, 'Whether purchaser is represented by POA', 'no', '[\"yes\", \"no\"]'),
('550e8400-e29b-41d4-a716-446655440939', 'sale', 'family_consent_required', 'Family Consent Required', 'select', true, 'Whether family consent is required', 'yes', '[\"yes\", \"no\"]'),
('550e8400-e29b-41d4-a716-446655440940', 'sale', 'arbitration_language', 'Arbitration Language', 'select', true, 'Language for arbitration proceedings', 'English', '[\"English\", \"Hindi\", \"Kannada\", \"English/Hindi\", \"English/Kannada\"]');

-- ========================================
-- End of Template 7: Agreement for Sale
-- ========================================

-- Template 8: Model Building Contract
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES 
('550e8400-e29b-41d4-a716-446655440008', 'construction', 'Model Building Contract', 'Comprehensive construction agreement template for residential building projects covering construction timeline, staged payments, material specifications, quality control, risk allocation, and completion requirements', 'contract', 'India', ARRAY['construction', 'building contract', 'residential construction', 'staged payments', 'material specifications', 'completion timeline', 'quality control', 'risk management']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES 

-- Preamble
('550e8400-e29b-41d4-a716-446655440801', '550e8400-e29b-41d4-a716-446655440008', 'preamble', 'Agreement Header and Parties', 'This agreement is executed on this ______________ day of ______________ 2016 between ABC Ltd., a company incorporated under the Companies Act, 2013, having its Registered Office at ______________ acting through Shri ______________, its Company Secretary, (hereinafter called "the builder"), which term shall, unless repugnant to the context, include its legal representatives, of the one part and Shri ______________ son of Shri ______________ resident of ______________ (hereinafter called "the owner"), which term shall, unless the context otherwise admits, include his heirs, executors, administrators, legal representatives, nominees and assigns, of the other part.', '[\"execution_day\", \"execution_month\", \"builder_company_name\", \"builder_address\", \"builder_representative\", \"owner_name\", \"owner_father_name\", \"owner_address\"]', 1, false),

-- Property and Project Background
('550e8400-e29b-41d4-a716-446655440802', '550e8400-e29b-41d4-a716-446655440008', 'background', 'Property and Project Background', 'WHEREAS the owner has a plot of land measuring ______________ sq. meters situated at ______________ (as specified in Schedule I) duly registered in his own name with the rights, title and interest therein absolutely vesting in him;

AND WHEREAS the owner has requested the builder to build a residential house on the said piece of land according to the plan approved by the Municipal authorities, of the area;

AND WHEREAS the builder, has agreed to build the desired residential house.

Now this AGREEMENT is reduced into writing and respective parts thereof shall be performed by the owner and the builder in accordance with the following terms and conditions:', '[\"plot_area\", \"plot_location\"]', 2, false),

-- Construction Timeline and Specifications
('550e8400-e29b-41d4-a716-446655440803', '550e8400-e29b-41d4-a716-446655440008', 'construction_scope', 'Construction Timeline and Specifications', 'The builder will build and complete the residential house within ______________ months from the date of execution hereof in a thorough manner and with the best material and work as specified in Schedule II hereof on the plot of land belonging to the owner, which is more clearly and precisely described in Schedule I hereof.', '[\"construction_timeline_months\"]', 3, false),

-- Payment Terms and Schedule
('550e8400-e29b-41d4-a716-446655440804', '550e8400-e29b-41d4-a716-446655440008', 'payment_schedule', 'Payment Terms and Staged Schedule', 'Subject to the conditions hereinafter contained, the owner will pay to the builder a sum of Rs. ______________ as cost of labour for construction and all other type of labour, cost of materials, electrical and sanitary fittings, wood work, doors and windows, white-washing, painting and polishing etc., as per specifications of the architect of the owner, which have been given in detail on the approved plan of the bungalow and a photo-copy whereof has already been handed over to the builder, who has received the same and has signed the original sanctioned plan in token of having received a photo copy thereof, in the following manner and at varying stages of the construction:

(a) Construction up to plinth level - Ten per cent of the total contract amount.
(b) Completion of walls up to roof level - Fifteen per cent of the total contract amount.
(c) Completion of roof slab of the entire structure of the bungalow - Thirty per cent of the total contract amount.
(d) Fixing of shutters of doors, windows, completion of wooden almirahs, pelmets and all other wood work - Twenty per cent of the total contract amount.
(e) Finishing of the entire construction and fixing of electrical and sanitary fittings - Fifteen per cent of the total contract amount.
(f) After receipt of Completion Certificate from the Municipal authorities - Balance amount of the contract money.', '[\"total_contract_amount\"]', 4, false),

-- Earnest Money
('550e8400-e29b-41d4-a716-446655440805', '550e8400-e29b-41d4-a716-446655440008', 'earnest_money', 'Earnest Money and Commencement', 'The owner shall pay to the builder a sum of Rupees ______________ only immediately on execution of this Agreement in the form of earnest money, immediately on receipt whereof, the builder shall procure building materials and start construction work. The said sum of Rupees ______________ shall be adjusted by the owner from the last installment payable to the builder.', '[\"earnest_money_amount\", \"earnest_money_words\"]', 5, false),

-- Time is Essence
('550e8400-e29b-41d4-a716-446655440806', '550e8400-e29b-41d4-a716-446655440008', 'time_essence', 'Time is of the Essence', 'It is expressly agreed between the owner and the builder that in respect of the aforesaid payments and in respect of the construction of the residential house, time is the essence of this agreement.', '[]', 6, false),

-- Builder Obligations
('550e8400-e29b-41d4-a716-446655440807', '550e8400-e29b-41d4-a716-446655440008', 'builder_obligations', 'Builder Obligations and Scope', 'The builder will do and perform all works incidental to the proper execution and completion of the residential house including all works rendered necessary in consequence of the doing of the works and will supply all the required skilled, semi-skilled and unskilled labour and materials necessary for the same and no additional payment shall be made by the owner to the builder for the same.', '[]', 7, false),

-- Inspection Rights
('550e8400-e29b-41d4-a716-446655440808', '550e8400-e29b-41d4-a716-446655440008', 'inspection', 'Owner Inspection Rights', 'The builder will permit the owner, his representatives and his architect to have access to the works while the same are under construction and to inspect the same so as to make sure that the construction work is being done according to sanctioned plan and materials are being used as per specifications given by the architect.', '[]', 8, false),

-- Risk Allocation
('550e8400-e29b-41d4-a716-446655440809', '550e8400-e29b-41d4-a716-446655440008', 'risk_allocation', 'Risk Allocation During Construction', 'While the bungalow is in the course of construction and until the owner takes over the same, all materials used or to be used in the construction, shall remain at the builder''s risk and the builder shall not be entitled to any compensation for injury/or loss/or destruction of, such works or materials arising from any cause whatsoever.', '[]', 9, false),

-- Possession Conditions
('550e8400-e29b-41d4-a716-446655440810', '550e8400-e29b-41d4-a716-446655440008', 'possession', 'Possession and Payment Conditions', 'The owner will not be entitled to take possession of the residential house until the entire amount is paid within the time stipulated herein above.', '[]', 10, false),

-- Utility Deposits
('550e8400-e29b-41d4-a716-446655440811', '550e8400-e29b-41d4-a716-446655440008', 'utilities', 'Utility Deposits and Connections', 'The owner shall make payments of all the amounts in respect of the said residential house towards water and electricity deposits etc.', '[]', 11, false),

-- Payment Security
('550e8400-e29b-41d4-a716-446655440812', '550e8400-e29b-41d4-a716-446655440008', 'payment_security', 'Payment Security and Charge', 'It is agreed by the owner that any amount that will be due and payable to the builder as mentioned in this agreement shall be treated as a charge on the residential house till such time the same is paid in full.', '[]', 12, false),

-- Additional Work
('550e8400-e29b-41d4-a716-446655440813', '550e8400-e29b-41d4-a716-446655440008', 'additional_work', 'Additional and Extra Work', 'If the owner requires any additional or extra items of work to be carried on by the builder in the residential house, other than the above specified works, the builder should be informed by the owner in advance and the cost and/or difference of cost for such items of work as per rates mutually agreed upon should be paid by the owner to the builder in advance.', '[]', 13, false),

-- Dispute Resolution
('550e8400-e29b-41d4-a716-446655440814', '550e8400-e29b-41d4-a716-446655440008', 'dispute_resolution', 'Dispute Resolution and Jurisdiction', 'Any dispute, controversy or claims arising out of or relating to this Agreement or the breach, termination or invalidity thereof, shall be settled by arbitration in accordance with the provisions of the [Indian] Arbitration and Conciliation Act, 1996.

The arbitral tribunal shall be composed of three arbitrators, one arbitrator appointed by ______________, a second arbitrator appointed by ______________ and a third arbitrator to be appointed by such arbitrators.

The place of arbitration shall be at ______________ and any award whether interim or final, shall be made, and shall be deemed for all purposes between the Parties to be made in ______________.

The arbitral procedure shall be conducted in the English/Kannada language and any award or awards shall be rendered in English/Kannada. The procedural law of the arbitration shall be Indian law.

The award of the arbitral tribunal shall be final, conclusive and binding upon the Parties, and the provisions of the [Indian] Arbitration and Conciliation Act, 1996 shall apply.

The rights and obligations of the Parties under, or pursuant to, this Clause, including the arbitration agreement in this Clause, shall be governed by and be subject to Indian law, and the agreement shall be subject to the exclusive jurisdiction of the courts at ______________. (place to be named as per the agreement between the parties)', '[\"builder_arbitrator\", \"owner_arbitrator\", \"arbitration_place\", \"arbitration_place_2\", \"jurisdiction_court\"]', 14, false),

-- Plot Schedule
('550e8400-e29b-41d4-a716-446655440815', '550e8400-e29b-41d4-a716-446655440008', 'plot_schedule', 'Plot Details Schedule', 'SCHEDULE I

Details of the plot of land upon which the residential house is to be built by the builder for the owner:

Plot No. ______________                     measuring ______________ sq. metres
Street ______________
Road ______________                                                                                      
Bounded on         East ______________
West ______________
North ______________
South ______________
Within the District of ______________', '[\"plot_number\", \"plot_area_schedule\", \"street_name\", \"road_name\", \"boundary_east\", \"boundary_west\", \"boundary_north\", \"boundary_south\", \"district_name\"]', 15, false),

-- Construction Specifications
('550e8400-e29b-41d4-a716-446655440816', '550e8400-e29b-41d4-a716-446655440008', 'specifications', 'Construction Specifications Schedule', 'SCHEDULE II

1. Foundation and Super-structure:
Earth digging for foundation up to a depth of six feet. R.C.C., framed structure with R.C.C. foundation columns, beams and slabs all the partition and main walls shall be of 1st quality red bricks in cement mortar, both sides plastered and finished with snowcem painted on outer side and plastic emulsion painted inside.

2. Almirahs, Doors and Windows:
All the almirahs, doors and window frames will be of teak wood and the entire window frames will be of teak board (1/2" thick) covered by kail wood frames. All the doors and window frames will be fixed with M.S. Grills and glazed shutters and wooden plank shutters. All the doors, windows, shutters etc. will be painted with synthetic enamel paint. Drawing-cum-dining room will have a sliding gate.

3. Flooring:
Entire flooring will be laid with light grey colour mosaic tiles with 6" skirting for all the rooms. Bathrooms and toilets will have square while 5" x 5" tiles to a height of seven feet.

4. Electrical Fittings etc.:
Concealed electrical wiring will be done with best quality insulated wires and cables. Light points will be as per the specifications shown in the site plan.

5. Water Supply:
There will be an underground water storage tank which will be 10'' x 10'' with 4'' depth fully water proof coated with a booster pump to lift water to an overhead R.C.C. water tank of similar capacity to be constructed on four R.C.C. columns. A tube well will also be bored and fitted with a booster pump, which may be used as an alternative source of water supply in the event of Municipal Water Supply failure.

6. Kitchen:
Kitchen will be fitted with an exhaust fan of the best available make and suitable for the size of the kitchen to be constructed in the bungalow. White 4" x 4" tiles will be fixed up to a height of 9'' on all the walls. There will be raised platform on two sides as shown in the plan with tops fitted with 1/2" thick white marble slabs with a stainless steel sink at the space provided therefore.', '[]', 16, false),

-- Signatures
('550e8400-e29b-41d4-a716-446655440817', '550e8400-e29b-41d4-a716-446655440008', 'signatures', 'Execution and Witnesses', 'IN WITNESS WHEREOF, the parties afore-mentioned have signed this deed in token of acceptance of the terms thereof.

Witnesses:
(1) Name:
     Father''s Name:
     Address:
     Signature:                                 Owner

(2) Name:
     Father''s Name:
     Address:
     Signature:                                 Builder', '[]', 17, false);

-- Insert reusable contract clauses for construction agreements
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES 

('550e8400-e29b-41d4-a716-446655440901', 'staged_payment', 'Staged Payment Schedule', 'Payment shall be made in stages based on construction milestones: (a) Plinth level - 10%; (b) Walls to roof level - 15%; (c) Roof slab completion - 30%; (d) Doors, windows, woodwork - 20%; (e) Finishing and fittings - 15%; (f) After completion certificate - remaining balance.', ARRAY['staged payments', 'construction milestones', 'payment schedule'], ARRAY['construction contracts', 'building agreements', 'project financing']),

('550e8400-e29b-41d4-a716-446655440902', 'material_risk', 'Construction Material Risk Allocation', 'During construction and until owner takes possession, all materials used or to be used in construction shall remain at builder''s risk. Builder not entitled to compensation for injury, loss, or destruction of works or materials from any cause whatsoever.', ARRAY['material risk', 'construction risk', 'builder liability'], ARRAY['construction contracts', 'risk management', 'building projects']),

('550e8400-e29b-41d4-a716-446655440903', 'inspection_rights', 'Owner Inspection and Quality Control', 'Builder shall permit owner, representatives, and architect access to works during construction for inspection to ensure construction according to sanctioned plan and materials per architect specifications.', ARRAY['inspection rights', 'quality control', 'construction monitoring'], ARRAY['construction contracts', 'quality assurance', 'building supervision']),

('550e8400-e29b-41d4-a716-446655440904', 'completion_timeline', 'Construction Completion Timeline', 'Builder will build and complete the residential house within specified months from execution date in thorough manner with best materials and work as per approved specifications and sanctioned plans.', ARRAY['completion timeline', 'construction deadline', 'project delivery'], ARRAY['construction contracts', 'project management', 'timeline commitments']),

('550e8400-e29b-41d4-a716-446655440905', 'earnest_money_construction', 'Earnest Money for Construction Commencement', 'Owner shall pay earnest money immediately upon agreement execution for builder to procure materials and start construction. Amount shall be adjusted from final installment payable to builder.', ARRAY['earnest money', 'construction commencement', 'material procurement'], ARRAY['construction contracts', 'project initiation', 'advance payments']),

('550e8400-e29b-41d4-a716-446655440906', 'builder_comprehensive_scope', 'Comprehensive Builder Scope and Obligations', 'Builder will perform all works incidental to proper execution and completion including all consequential works, supply all required labor (skilled, semi-skilled, unskilled) and materials with no additional payments required.', ARRAY['builder scope', 'comprehensive obligations', 'labor supply', 'material supply'], ARRAY['construction contracts', 'contractor obligations', 'project scope']),

('550e8400-e29b-41d4-a716-446655440907', 'payment_security_charge', 'Payment Security and Property Charge', 'Any amount due and payable to builder shall be treated as charge on the residential house until paid in full. Owner not entitled to possession until entire amount paid within stipulated time.', ARRAY['payment security', 'property charge', 'possession conditions'], ARRAY['construction contracts', 'payment assurance', 'security interests']),

('550e8400-e29b-41d4-a716-446655440908', 'additional_work_approval', 'Additional Work Authorization and Payment', 'For any additional or extra work beyond specified scope, builder must be informed in advance. Cost for such work at mutually agreed rates must be paid by owner to builder in advance.', ARRAY['additional work', 'change orders', 'advance payment', 'scope changes'], ARRAY['construction contracts', 'project modifications', 'change management']),

('550e8400-e29b-41d4-a716-446655440909', 'time_essence_construction', 'Time is of the Essence in Construction', 'Time is expressly agreed to be of the essence regarding all payments and construction of the residential house, establishing strict adherence to payment and construction schedules.', ARRAY['time is essence', 'strict timelines', 'schedule adherence'], ARRAY['construction contracts', 'project deadlines', 'timeline enforcement']),

('550e8400-e29b-41d4-a716-446655440910', 'utility_owner_responsibility', 'Owner Utility Connection Responsibility', 'Owner shall make all payments for utility connections including water and electricity deposits and any other utility-related expenses for the residential house.', ARRAY['utility connections', 'owner responsibility', 'utility deposits'], ARRAY['construction contracts', 'utility setup', 'owner obligations']);

-- Insert contract parameters for construction agreements
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES 

('550e8400-e29b-41d4-a716-446655441001', 'construction', 'execution_day', 'Agreement Execution Day', 'text', true, 'Day of the month when agreement is executed', '15th', NULL),
('550e8400-e29b-41d4-a716-446655441002', 'construction', 'execution_month', 'Agreement Execution Month', 'text', true, 'Month when agreement is executed', 'March', NULL),
('550e8400-e29b-41d4-a716-446655441003', 'construction', 'builder_company_name', 'Builder Company Name', 'text', true, 'Legal name of the construction company', 'ABC Construction Ltd', NULL),
('550e8400-e29b-41d4-a716-446655441004', 'construction', 'builder_address', 'Builder Registered Address', 'text', true, 'Complete registered office address of builder', 'Plot 123, Industrial Area, Gurgaon, Haryana - 122001', NULL),
('550e8400-e29b-41d4-a716-446655441005', 'construction', 'builder_representative', 'Builder Representative Name', 'text', true, 'Name of person representing the builder company', 'Rajesh Kumar Singh', NULL),
('550e8400-e29b-41d4-a716-446655441006', 'construction', 'owner_name', 'Property Owner Name', 'text', true, 'Full name of the property owner', 'Amit Sharma', NULL),
('550e8400-e29b-41d4-a716-446655441007', 'construction', 'owner_father_name', 'Owner Father Name', 'text', true, 'Father''s name of the property owner', 'Late Suresh Kumar Sharma', NULL),
('550e8400-e29b-41d4-a716-446655441008', 'construction', 'owner_address', 'Owner Address', 'text', true, 'Complete residential address of owner', 'House 456, Sector 15, Noida, UP - 201301', NULL),
('550e8400-e29b-41d4-a716-446655441009', 'construction', 'plot_area', 'Plot Area (sq. meters)', 'number', true, 'Area of the plot in square meters', '200', NULL),
('550e8400-e29b-41d4-a716-446655441010', 'construction', 'plot_location', 'Plot Location', 'text', true, 'Complete location details of the plot', 'Sector 15, Noida, Uttar Pradesh', NULL),
('550e8400-e29b-41d4-a716-446655441011', 'construction', 'construction_timeline_months', 'Construction Timeline (Months)', 'number', true, 'Number of months for construction completion', '6', NULL),
('550e8400-e29b-41d4-a716-446655441012', 'construction', 'total_contract_amount', 'Total Contract Amount (Rs.)', 'currency', true, 'Total contract value for construction', '2500000', NULL),
('550e8400-e29b-41d4-a716-446655441013', 'construction', 'earnest_money_amount', 'Earnest Money Amount (Rs.)', 'currency', true, 'Earnest money amount to be paid upfront', '20000', NULL),
('550e8400-e29b-41d4-a716-446655441014', 'construction', 'earnest_money_words', 'Earnest Money in Words', 'text', true, 'Earnest money amount written in words', 'Twenty Thousand', NULL),
('550e8400-e29b-41d4-a716-446655441015', 'construction', 'plot_number', 'Plot Number', 'text', true, 'Official plot number', 'Plot No. 123/A', NULL),
('550e8400-e29b-41d4-a716-446655441016', 'construction', 'plot_area_schedule', 'Plot Area in Schedule (sq. meters)', 'number', true, 'Plot area as mentioned in schedule', '200', NULL),
('550e8400-e29b-41d4-a716-446655441017', 'construction', 'street_name', 'Street Name', 'text', true, 'Name of the street where plot is located', 'MG Road', NULL),
('550e8400-e29b-41d4-a716-446655441018', 'construction', 'road_name', 'Road Name', 'text', true, 'Name of the main road', 'Sector Road 15', NULL),
('550e8400-e29b-41d4-a716-446655441019', 'construction', 'boundary_east', 'Eastern Boundary', 'text', true, 'Description of eastern boundary', 'Plot No. 124', NULL),
('550e8400-e29b-41d4-a716-446655441020', 'construction', 'boundary_west', 'Western Boundary', 'text', true, 'Description of western boundary', 'Plot No. 122', NULL),
('550e8400-e29b-41d4-a716-446655441021', 'construction', 'boundary_north', 'Northern Boundary', 'text', true, 'Description of northern boundary', '30 feet road', NULL),
('550e8400-e29b-41d4-a716-446655441022', 'construction', 'boundary_south', 'Southern Boundary', 'text', true, 'Description of southern boundary', 'Plot No. 121', NULL),
('550e8400-e29b-41d4-a716-446655441023', 'construction', 'district_name', 'District Name', 'text', true, 'District where property is located', 'Gautam Budh Nagar', NULL),
('550e8400-e29b-41d4-a716-446655441024', 'construction', 'arbitration_place', 'Arbitration Place', 'text', true, 'City where arbitration will take place', 'New Delhi', NULL),
('550e8400-e29b-41d4-a716-446655441025', 'construction', 'jurisdiction_court', 'Court Jurisdiction', 'text', true, 'Courts having jurisdiction over the agreement', 'New Delhi', NULL),
('550e8400-e29b-41d4-a716-446655441026', 'construction', 'building_type', 'Building Type', 'select', true, 'Type of building to be constructed', 'residential_house', '[\"residential_house\", \"commercial_building\", \"apartment\", \"villa\", \"duplex\"]'),
('550e8400-e29b-41d4-a716-446655441027', 'construction', 'foundation_depth', 'Foundation Depth (feet)', 'number', true, 'Depth of foundation in feet', '6', NULL),
('550e8400-e29b-41d4-a716-446655441028', 'construction', 'flooring_type', 'Flooring Type', 'select', true, 'Type of flooring to be used', 'mosaic_tiles', '[\"mosaic_tiles\", \"marble\", \"granite\", \"ceramic_tiles\", \"vitrified_tiles\"]'),
('550e8400-e29b-41d4-a716-446655441029', 'construction', 'door_window_material', 'Door/Window Material', 'select', true, 'Material for doors and windows', 'teak_wood', '[\"teak_wood\", \"sal_wood\", \"pine_wood\", \"aluminum\", \"upvc\"]'),
('550e8400-e29b-41d4-a716-446655441030', 'construction', 'electrical_wiring', 'Electrical Wiring Type', 'select', true, 'Type of electrical wiring', 'concealed', '[\"concealed\", \"surface\", \"conduit\"]'),
('550e8400-e29b-41d4-a716-446655441031', 'construction', 'water_storage', 'Water Storage System', 'select', true, 'Type of water storage system', 'underground_overhead', '[\"underground_only\", \"overhead_only\", \"underground_overhead\", \"bore_well_system\"]'),
('550e8400-e29b-41d4-a716-446655441032', 'construction', 'completion_certificate_required', 'Completion Certificate Required', 'select', true, 'Whether municipal completion certificate is required', 'yes', '[\"yes\", \"no\"]'),
('550e8400-e29b-41d4-a716-446655441033', 'construction', 'payment_stages', 'Number of Payment Stages', 'number', true, 'Number of payment stages', '6', NULL),
('550e8400-e29b-41d4-a716-446655441034', 'construction', 'quality_materials', 'Quality of Materials', 'select', true, 'Quality grade of construction materials', 'best_quality', '[\"standard_quality\", \"good_quality\", \"best_quality\", \"premium_quality\"]');

-- ========================================
-- End of Template 8: Model Building Contract
-- ========================================

-- Template 9: Model of Partnership Deed
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES
('550e8400-e29b-41d4-a716-446655440009', 'partnership', 'Model of Partnership Deed', 'Comprehensive partnership agreement template for establishing business partnerships in India with detailed provisions for capital contribution, profit sharing, partner rights and obligations, succession planning, and dispute resolution mechanisms', 'business', 'india', ARRAY['partnership', 'business', 'collaboration', 'profit_sharing', 'capital', 'succession', 'governance']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES
('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440009', 'preamble', 'Parties and Introduction', 'THIS DEED of Partnership made at ____ this ____ day of ____, 2017, between ____, son of ____ Hindu resident of ____ (address) ____ of the ONE PART, ____, son of ____ of resident of ____ (address) ____ of the SECOND PART and Mrs. ____, wife of ____, resident of ____ (address) ____ of the THIRD PART. WHEREBY IT IS AGREED that the parties hereto (hereinafter together called the partners) shall become partners in the business of ____ for the term of ____ years with effect from ____ upon the terms and conditions hereinafter contained namely:', '["execution_place", "execution_day", "execution_month", "first_partner_name", "first_partner_father", "first_partner_address", "first_partner_city", "second_partner_name", "second_partner_father", "second_partner_address", "second_partner_city", "third_partner_name", "third_partner_husband", "third_partner_address", "third_partner_city", "business_type", "partnership_term", "commencement_date"]', 1, false),
('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440009', 'operational', 'Partnership Name and Style', 'The partnership shall be carried on in the name and style of M/s. ____.', '["partnership_name"]', 2, false),
('550e8400-e29b-41d4-a716-446655440903', '550e8400-e29b-41d4-a716-446655440009', 'operational', 'Place of Business', 'The partnership business will be carried on at ____ and/or at such other place or places, as shall be agreed to by the partners from time to time.', '["business_address"]', 3, false),
('550e8400-e29b-41d4-a716-446655440904', '550e8400-e29b-41d4-a716-446655440009', 'financial', 'Capital Contribution', 'The capital of the partnership shall be Rs. ____ which shall be contributed by the partners in the following proportions. First Party ____% Rs. ____, Second Party ____% Rs. ____, Third Party ____% Rs. ____. The further capital if any required by the partnership shall be brought by the partners and such additional capital brought by the partners shall be treated as loan to the firm and shall be paid interest @ ____% p.a. out of the gross profits of the firm.', '["total_capital", "first_party_percentage", "first_party_amount", "second_party_percentage", "second_party_amount", "third_party_percentage", "third_party_amount", "additional_capital_interest_rate"]', 4, false),
('550e8400-e29b-41d4-a716-446655440905', '550e8400-e29b-41d4-a716-446655440009', 'financial', 'Additional Capital and Loans', 'The partners may agree to increase the capital of the firm by bringing in additional contribution in the proportion of the shares held by them in the initial capital of the firm. At the time of increase of the capital, the additional capital of the partner or partners may be adjusted against the increased capital.', '[]', 5, true),
('550e8400-e29b-41d4-a716-446655440906', '550e8400-e29b-41d4-a716-446655440009', 'financial', 'Banking Arrangements', 'The bankers of the partnership shall be ____ Branch ____ the bank account of the firm shall be operated by any partner or by the Authorised Signatory.', '["bank_name", "bank_branch"]', 6, false),
('550e8400-e29b-41d4-a716-446655440907', '550e8400-e29b-41d4-a716-446655440009', 'financial', 'Profit and Loss Distribution', 'The net profits of the business shall be divided between the partners in the proportion of the capital and they shall bear all losses including loss of capital in the same proportion.', '[]', 7, false),
('550e8400-e29b-41d4-a716-446655440908', '550e8400-e29b-41d4-a716-446655440009', 'governance', 'Books and Account Access', 'The firm shall maintain usual account and other books at the place of business and they shall be kept properly posted upto date and shall not be removed from the place of business without the consent of all the partners. Each partner shall have free access to the books of account of the partnership at all times and shall be entitled to make such copies or extract therefrom as he may think fit.', '[]', 8, false),
('550e8400-e29b-41d4-a716-446655440909', '550e8400-e29b-41d4-a716-446655440009', 'operational', 'Working Partners and Remuneration', 'The First and the Second Party shall devote their whole time and attention to the interests of the business and shall be the working partners. They shall be entitled to equal remuneration for their working out of the amount computed in the manner laid down under section 40(b) of the Income-tax Act, 1961. The remuneration so computed shall be worked out and credited in the books of account, at the close of the accounting year period.', '[]', 9, false),
('550e8400-e29b-41d4-a716-446655440910', '550e8400-e29b-41d4-a716-446655440009', 'obligations', 'Partner Duties and Obligations', 'Each partner shall- (i) Be just and faithful to other partners in the transactions relating to partnership business; (ii) Pay his separate debts and indemnify the other partners and assets of the firm against the same and all other proceedings, costs, claims or demands in respect thereof; (iii) Give full information and truthful explanations of all matters relating to the affairs of the partnership to all the partners at all times.', '[]', 10, false),
('550e8400-e29b-41d4-a716-446655440911', '550e8400-e29b-41d4-a716-446655440009', 'restrictions', 'Partner Restrictions', 'No partner shall without the consent of the other partners- (i) Engage in any other business directly or indirectly; (ii) Lend money or give credit of the goods of the firm to whom the other partners have previously forbidden him to trust; (iii) Mortgage, charge or assign his share in the assets or profits of the firm; (iv) Draw, accept or endorse any bill of exchange or promissory note on account of the firm; (v) Engage, remove or dismiss any apprentice, employee or agent of the firm; (vi) Give any security or promise for the payment of money on account of the firm except in the ordinary course of business; (vii) Give bail, bond or guarantee or become surety for any person or do or Knowingly suffer any thing to be done where the partnership property may be endangered; (viii) Buy, order or contract any property or goods for the firm exceeding Rs.____; (ix) Sign any cheque on behalf of the firm to, a sum exceeding Rs. ____; (x) Compromise or compound or, release or, discharge any debt due to the partnership.', '["purchase_limit", "cheque_limit"]', 11, false),
('550e8400-e29b-41d4-a716-446655440912', '550e8400-e29b-41d4-a716-446655440009', 'financial', 'Annual Accounts and Financial Year', 'The accounts of the partnership shall be maintained according to the financial year, from 1st April to 31st March and general account shall be taken of all the capital assets and liabilities to, the time being of the partnership as on ____ in each year and a balance sheet and profit and loss account shall be prepared by M/s. ____ Chartered Accountants or any other Chartered Accountants to be agreed upon by the partners and a copy thereof shall be furnished to each of the partners, who shall be bound thereby, unless some manifest error shall be discovered within six months, in which case such error, shall be rectified.', '["annual_account_date", "chartered_accountant_firm"]', 12, false),
('550e8400-e29b-41d4-a716-446655440913', '550e8400-e29b-41d4-a716-446655440009', 'operational', 'Holiday Entitlements', 'Each partner, shall be entitled to ____ weeks holiday in each year and all the partners shall make choice of the holiday alternatively.', '["holiday_weeks"]', 13, true),
('550e8400-e29b-41d4-a716-446655440914', '550e8400-e29b-41d4-a716-446655440009', 'governance', 'New Partner Introduction', 'A new partner, may be introduced with the consent of all the partners on such terms and conditions as the partners agree with the Person to be introduced as a partner, in the firm.', '[]', 14, true),
('550e8400-e29b-41d4-a716-446655440915', '550e8400-e29b-41d4-a716-446655440009', 'succession', 'Death of Partner Provisions', 'On the death of any partner, during the continuance of the partnership, the firm shall not be dissolved, the surviving partners shall have the option to purchase the share of the deceased partner, in the partnership business and the property and goodwill thereof. The purchase price of the share of deceased partner shall be the amount at which such share shall stand in the last balance sheet which shall have been prepared prior to the death of the deceased or in the event of the death of either, partner before the preparation of the first balance sheet the sum credited to him as his share of capital, and interest at the rate of ____% p.a. thereon in lieu. of profit from the date of the then last preceding annual account upto the date of death of the deceased.', '["death_interest_rate"]', 15, false),
('550e8400-e29b-41d4-a716-446655440916', '550e8400-e29b-41d4-a716-446655440009', 'succession', 'Retirement and Insolvency', 'If a partner retires or becomes insolvent, then the partnership will not be dissolved, and the remaining partner, shall have the option to purchase the share of such partner and the purchase price shall be calculated as given in the preceding clause.', '[]', 16, false),
('550e8400-e29b-41d4-a716-446655440917', '550e8400-e29b-41d4-a716-446655440009', 'financial', 'Expenses and Outgoings', 'All outgoings and expenses of the partnership and all losses or damages incurred, interest payable for any loans received and taxes, etc. shall be paid first out of the profits, next out of capital and in the case of further deficiency, by the partners in the shares in which they are entitled to the net profits of the partnership business.', '[]', 17, false),
('550e8400-e29b-41d4-a716-446655440918', '550e8400-e29b-41d4-a716-446655440009', 'financial', 'Partnership Moneys and Banking', 'All partnership moneys, bills, notes, cheques and other instruments received by the partnership shall as and when received be paid and deposited in the bank to the credit of the firms'' account, except such sums as are immediately required to meet the current expenses of the partnership firm.', '[]', 18, false),
('550e8400-e29b-41d4-a716-446655440919', '550e8400-e29b-41d4-a716-446655440009', 'operational', 'Business Transactions', 'All transactions of the firm shall be done in the name of the partnership and all goods shall be purchased or sold in the firm name. All the bills, vouchers, delivery notes, receipts, etc. shall be issued in the name of the firm.', '[]', 19, false),
('550e8400-e29b-41d4-a716-446655440920', '550e8400-e29b-41d4-a716-446655440009', 'termination', 'Termination Events', 'If any partner shall assign, charge or encumber his share in the partnership or shall become bankrupt or a lunatic or otherwise permanently incapable of attending to the partnership business or shall absent himself from the partnership business for more than ____ days, in any period of the twelve months except during his annual holiday without the consent of the other partners, or commit any breach of any of the provisions of this agreement or commits any criminal offence or do or suffer any act which would be a ground for the dissolution of the partnership by the court and in any such case it shall be lawful for the other partners by notice in writing to the offending or incapacitated partner or his trustee or official assignee to determine the partnership.', '["absence_limit_days"]', 20, false),
('550e8400-e29b-41d4-a716-446655440921', '550e8400-e29b-41d4-a716-446655440009', 'termination', 'Partnership Dissolution', 'Upon the determination of the partnership by efflux of time or in the case of death, retirement or expulsion of a partner from the partnership, the surviving or other partner shall not exercise the option of purchasing the share and interest of the deceased, retired or expelled partner or the partnership is determined by any other event not herein otherwise provided, a full and general account of the assets, credits, debts, liabilities of the partnership shall be taken and the assets and credits shall be sold, realised and the proceeds shall be applied in paying and discharging debts, liabilities and expenses.', '[]', 21, false),
('550e8400-e29b-41d4-a716-446655440922', '550e8400-e29b-41d4-a716-446655440009', 'operational', 'Goodwill Purchase Options', 'Upon the determination of the partnership, each partner shall have the option to purchase the goodwill of the partnership on a price as agreed to by the partners, and if no partner exercises the option to purchase the goodwill, the same shall be sold to a willing purchaser. No partner (unless he is the purchaser of such business) shall directly or indirectly carry on or be concerned or interested in a similar business in his own name in the locality of the firm within a period of ____ years from the completion of sale of goodwill.', '["non_compete_period"]', 22, false),
('550e8400-e29b-41d4-a716-446655440923', '550e8400-e29b-41d4-a716-446655440009', 'governance', 'General Provisions', 'All the other matters for which no provision is made in this deed, shall be decided by the majority of the partners for the time being of the partnership.', '[]', 23, true),
('550e8400-e29b-41d4-a716-446655440924', '550e8400-e29b-41d4-a716-446655440009', 'dispute_resolution', 'Dispute Resolution and Jurisdiction', 'Any dispute, controversy or claims arising out of or relating to this Agreement or the breach, termination or invalidity thereof, shall be settled by arbitration in accordance with the provisions of the [Indian] Arbitration and Conciliation Act, 1996. The arbitral tribunal shall be composed of Sole Arbitrator or by the Arbitrator appointed by mutual consent. The place of arbitration shall be at ____ and any award whether interim or final, shall be made, and shall be deemed for all purposes between the Parties to be made in ____. The arbitral procedure shall be conducted in the English/Kannada language and any award or awards shall be rendered in English/Kannada. The procedural law of the arbitration shall be Indian law. The award of the arbitral tribunal shall be final, conclusive and binding upon the Parties, and the provisions of the [Indian] Arbitration and Conciliation Act, 1996 shall apply. The rights and obligations of the Parties under, or pursuant to, this Clause, including the arbitration agreement in this Clause, shall be governed by and be subject to Indian law, and the agreement shall be subject to the exclusive jurisdiction of the courts at ____.', '["arbitration_place", "award_place", "court_jurisdiction"]', 24, false);

-- Insert reusable contract clauses
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES
('550e8400-e29b-41d4-a716-446655441001', 'financial', 'Capital Contribution and Profit Sharing', 'The capital of the partnership shall be contributed by the partners in agreed proportions, and net profits shall be divided between the partners in the proportion of their capital contribution. Partners shall bear all losses including loss of capital in the same proportion.', ARRAY['capital', 'profit_sharing', 'loss_sharing', 'equity'], ARRAY['partnership_agreements', 'joint_ventures', 'business_collaborations']),
('550e8400-e29b-41d4-a716-446655441002', 'governance', 'Partner Duties and Fiduciary Obligations', 'Each partner shall be just and faithful to other partners in all transactions relating to partnership business, pay their separate debts and indemnify other partners, and provide full information and truthful explanations of all partnership affairs at all times.', ARRAY['fiduciary_duty', 'transparency', 'indemnification', 'good_faith'], ARRAY['partnership_agreements', 'business_alliances', 'joint_ventures']),
('550e8400-e29b-41d4-a716-446655441003', 'restrictions', 'Non-Compete and Business Restrictions', 'Partners shall not engage in competing business activities, exceed monetary limits for purchases or cheques, or take actions that could endanger partnership property without consent of other partners.', ARRAY['non_compete', 'monetary_limits', 'business_protection', 'consent_requirements'], ARRAY['partnership_agreements', 'business_protection', 'competitive_restrictions']),
('550e8400-e29b-41d4-a716-446655441004', 'succession', 'Death and Succession Provisions', 'Upon death of any partner, the firm shall not dissolve, and surviving partners have the option to purchase the deceased partner''s share at book value plus interest, with provisions for indemnification of the deceased partner''s representatives.', ARRAY['succession_planning', 'death_benefits', 'share_purchase', 'continuity'], ARRAY['partnership_agreements', 'business_continuity', 'succession_planning']),
('550e8400-e29b-41d4-a716-446655441005', 'termination', 'Retirement and Expulsion Provisions', 'Partners may retire or be expelled under specified circumstances, with remaining partners having the option to purchase their share and continue the partnership business.', ARRAY['retirement', 'expulsion', 'share_purchase', 'business_continuity'], ARRAY['partnership_agreements', 'business_management', 'partner_changes']),
('550e8400-e29b-41d4-a716-446655441006', 'financial', 'Banking and Financial Management', 'All partnership moneys, bills, and instruments shall be deposited in the firm''s bank account, with specified authorization for account operations and monetary transaction limits.', ARRAY['banking', 'financial_management', 'authorization', 'monetary_controls'], ARRAY['partnership_agreements', 'financial_management', 'business_operations']),
('550e8400-e29b-41d4-a716-446655441007', 'dispute_resolution', 'Arbitration and Dispute Resolution', 'All disputes shall be settled by arbitration under the Indian Arbitration and Conciliation Act, 1996, with sole arbitrator appointed by mutual consent, conducted in specified location and language.', ARRAY['arbitration', 'dispute_resolution', 'indian_law', 'sole_arbitrator'], ARRAY['partnership_agreements', 'business_contracts', 'dispute_resolution']),
('550e8400-e29b-41d4-a716-446655441008', 'termination', 'Dissolution and Winding Up', 'Upon partnership determination, assets shall be sold and proceeds applied to discharge debts and liabilities, with remaining balance divided among partners in profit-sharing proportions.', ARRAY['dissolution', 'winding_up', 'asset_distribution', 'debt_settlement'], ARRAY['partnership_agreements', 'business_termination', 'asset_distribution']),
('550e8400-e29b-41d4-a716-446655441009', 'intellectual_property', 'Goodwill Valuation and Non-Compete', 'Partners have option to purchase partnership goodwill upon dissolution, with non-compete restrictions preventing similar business operations in the locality for specified period.', ARRAY['goodwill', 'non_compete', 'intellectual_property', 'business_protection'], ARRAY['partnership_agreements', 'business_protection', 'asset_valuation']),
('550e8400-e29b-41d4-a716-446655441010', 'governance', 'Books of Account and Transparency', 'Partnership shall maintain proper books of account at business premises, accessible to all partners at all times, with provisions for annual accounting and chartered accountant preparation of financial statements.', ARRAY['accounting', 'transparency', 'financial_reporting', 'audit'], ARRAY['partnership_agreements', 'financial_management', 'regulatory_compliance']);

-- Insert contract parameters
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES
('550e8400-e29b-41d4-a716-446655441101', 'partnership', 'execution_place', 'Place of Execution', 'text', true, 'City or location where the partnership deed is executed', 'Bengaluru', NULL),
('550e8400-e29b-41d4-a716-446655441102', 'partnership', 'execution_day', 'Day of Execution', 'text', true, 'Day of the month when deed is executed', '15th', NULL),
('550e8400-e29b-41d4-a716-446655441103', 'partnership', 'execution_month', 'Month of Execution', 'text', true, 'Month when the deed is executed', 'January', NULL),
('550e8400-e29b-41d4-a716-446655441104', 'partnership', 'first_partner_name', 'First Partner Name', 'text', true, 'Full name of the first partner', 'Rajesh Kumar', NULL),
('550e8400-e29b-41d4-a716-446655441105', 'partnership', 'first_partner_father', 'First Partner Father Name', 'text', true, 'Father''s name of the first partner', 'Omprakash Kumar', NULL),
('550e8400-e29b-41d4-a716-446655441106', 'partnership', 'first_partner_address', 'First Partner Address', 'text', true, 'Complete address of the first partner', '123 MG Road, Bengaluru - 560001', NULL),
('550e8400-e29b-41d4-a716-446655441107', 'partnership', 'first_partner_city', 'First Partner City', 'text', true, 'City where first partner resides', 'Bengaluru', NULL),
('550e8400-e29b-41d4-a716-446655441108', 'partnership', 'second_partner_name', 'Second Partner Name', 'text', true, 'Full name of the second partner', 'Priya Sharma', NULL),
('550e8400-e29b-41d4-a716-446655441109', 'partnership', 'second_partner_father', 'Second Partner Father Name', 'text', true, 'Father''s name of the second partner', 'Eknath Sharma', NULL),
('550e8400-e29b-41d4-a716-446655441110', 'partnership', 'second_partner_address', 'Second Partner Address', 'text', true, 'Complete address of the second partner', '456 Brigade Road, Bengaluru - 560025', NULL),
('550e8400-e29b-41d4-a716-446655441111', 'partnership', 'second_partner_city', 'Second Partner City', 'text', true, 'City where second partner resides', 'Bengaluru', NULL),
('550e8400-e29b-41d4-a716-446655441112', 'partnership', 'third_partner_name', 'Third Partner Name', 'text', true, 'Full name of the third partner', 'Mrs. Sunita Agarwal', NULL),
('550e8400-e29b-41d4-a716-446655441113', 'partnership', 'third_partner_husband', 'Third Partner Husband Name', 'text', true, 'Husband''s name of the third partner', 'Vinod Agarwal', NULL),
('550e8400-e29b-41d4-a716-446655441114', 'partnership', 'third_partner_address', 'Third Partner Address', 'text', true, 'Complete address of the third partner', '789 Commercial Street, Bengaluru - 560001', NULL),
('550e8400-e29b-41d4-a716-446655441115', 'partnership', 'third_partner_city', 'Third Partner City', 'text', true, 'City where third partner resides', 'Bengaluru', NULL),
('550e8400-e29b-41d4-a716-446655441116', 'partnership', 'business_type', 'Type of Business', 'text', true, 'Description of the business activity', 'Software Development and IT Services', NULL),
('550e8400-e29b-41d4-a716-446655441117', 'partnership', 'partnership_term', 'Partnership Term', 'text', true, 'Duration of the partnership in years', '10', NULL),
('550e8400-e29b-41d4-a716-446655441118', 'partnership', 'commencement_date', 'Commencement Date', 'date', true, 'Date from which partnership becomes effective', '2024-04-01', NULL),
('550e8400-e29b-41d4-a716-446655441119', 'partnership', 'partnership_name', 'Partnership Firm Name', 'text', true, 'Legal name and style of the partnership firm', 'M/s. TechnoVision Partners', NULL),
('550e8400-e29b-41d4-a716-446655441120', 'partnership', 'business_address', 'Place of Business', 'text', true, 'Address where partnership business will be conducted', 'Unit 301, Tech Park, Electronic City, Bengaluru - 560100', NULL),
('550e8400-e29b-41d4-a716-446655441121', 'partnership', 'total_capital', 'Total Partnership Capital', 'currency', true, 'Total capital amount for the partnership', '10,00,000', NULL),
('550e8400-e29b-41d4-a716-446655441122', 'partnership', 'first_party_percentage', 'First Party Capital Percentage', 'number', true, 'Percentage of capital contributed by first partner', '40', NULL),
('550e8400-e29b-41d4-a716-446655441123', 'partnership', 'first_party_amount', 'First Party Capital Amount', 'currency', true, 'Capital amount contributed by first partner', '4,00,000', NULL),
('550e8400-e29b-41d4-a716-446655441124', 'partnership', 'second_party_percentage', 'Second Party Capital Percentage', 'number', true, 'Percentage of capital contributed by second partner', '40', NULL),
('550e8400-e29b-41d4-a716-446655441125', 'partnership', 'second_party_amount', 'Second Party Capital Amount', 'currency', true, 'Capital amount contributed by second partner', '4,00,000', NULL),
('550e8400-e29b-41d4-a716-446655441126', 'partnership', 'third_party_percentage', 'Third Party Capital Percentage', 'number', true, 'Percentage of capital contributed by third partner', '20', NULL),
('550e8400-e29b-41d4-a716-446655441127', 'partnership', 'third_party_amount', 'Third Party Capital Amount', 'currency', true, 'Capital amount contributed by third partner', '2,00,000', NULL),
('550e8400-e29b-41d4-a716-446655441128', 'partnership', 'additional_capital_interest_rate', 'Additional Capital Interest Rate', 'number', true, 'Interest rate on additional capital loans to firm', '12', NULL),
('550e8400-e29b-41d4-a716-446655441129', 'partnership', 'bank_name', 'Bank Name', 'text', true, 'Name of the bank for partnership account', 'State Bank of India', NULL),
('550e8400-e29b-41d4-a716-446655441130', 'partnership', 'bank_branch', 'Bank Branch', 'text', true, 'Branch location of the bank', 'Electronic City Branch', NULL),
('550e8400-e29b-41d4-a716-446655441131', 'partnership', 'purchase_limit', 'Purchase Limit', 'currency', true, 'Maximum amount a partner can spend without consent', '50,000', NULL),
('550e8400-e29b-41d4-a716-446655441132', 'partnership', 'cheque_limit', 'Cheque Signing Limit', 'currency', true, 'Maximum cheque amount a partner can sign alone', '25,000', NULL),
('550e8400-e29b-41d4-a716-446655441133', 'partnership', 'annual_account_date', 'Annual Account Date', 'text', true, 'Date for preparing annual accounts', '31st March', NULL),
('550e8400-e29b-41d4-a716-446655441134', 'partnership', 'chartered_accountant_firm', 'Chartered Accountant Firm', 'text', true, 'Name of CA firm for preparing accounts', 'M/s. Gupta & Associates, Chartered Accountants', NULL),
('550e8400-e29b-41d4-a716-446655441135', 'partnership', 'holiday_weeks', 'Holiday Weeks per Year', 'number', false, 'Number of holiday weeks each partner is entitled to', '4', NULL),
('550e8400-e29b-41d4-a716-446655441136', 'partnership', 'death_interest_rate', 'Death Interest Rate', 'number', true, 'Interest rate on deceased partner''s share', '8', NULL),
('550e8400-e29b-41d4-a716-446655441137', 'partnership', 'absence_limit_days', 'Absence Limit Days', 'number', true, 'Maximum days a partner can be absent without consent', '60', NULL),
('550e8400-e29b-41d4-a716-446655441138', 'partnership', 'non_compete_period', 'Non-Compete Period', 'number', true, 'Years of non-compete restriction after partnership ends', '2', NULL),
('550e8400-e29b-41d4-a716-446655441139', 'partnership', 'arbitration_place', 'Place of Arbitration', 'text', true, 'City where arbitration proceedings will be held', 'Bengaluru', NULL),
('550e8400-e29b-41d4-a716-446655441140', 'partnership', 'award_place', 'Award Place', 'text', true, 'Place where arbitration award is deemed to be made', 'Bengaluru', NULL),
('550e8400-e29b-41d4-a716-446655441141', 'partnership', 'court_jurisdiction', 'Court Jurisdiction', 'text', true, 'Location of courts having jurisdiction', 'Bengaluru', NULL);

-- ========================================
-- End of Template 9: Model of Partnership Deed
-- ========================================

-- Template 10: Model Agreement of Sale of Immovable Property
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'property_sale', 'Model Agreement of Sale of Immovable Property', 'Comprehensive agreement for sale of immovable property with provisions for earnest money, title verification, possession transfer, breach remedies, and detailed property schedule specifications for real estate transactions', 'real_estate', 'india', ARRAY['property_sale', 'real_estate', 'immovable_property', 'earnest_money', 'title_verification', 'possession']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', 'preamble', 'Parties and Introduction', 'THIS AGREEMENT OF SALE executed on the ____ day of ____ 2017 between ____ son of ____, resident of ____, hereinafter called the "Vendor" of the one part and ____ son of ____ resident of ____ hereinafter called the "Purchaser" of the other part. (The expression "Vendor" and "Purchaser" wherever they occur in these presents, shall also mean and include their respective heirs, executors, administrator, legal representatives and assigns).', '["execution_day", "execution_month", "vendor_name", "vendor_father", "vendor_address", "purchaser_name", "purchaser_father", "purchaser_address"]', 1, false),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440010', 'recitals', 'Property Ownership and Agreement', 'WHEREAS the vendor is the sole and absolute owner of the property more fully set out in the Schedule hereunder: AND WHEREAS it is agreed that the vendor shall sell and the purchaser shall purchase the said property for the sum of Rs.____ (____ in words) free of all encumbrances.', '["total_sale_price", "total_sale_price_words"]', 2, false),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440010', 'financial', 'Sale Price', 'The price of the property more fully set out in the Schedule is fixed at Rs.____ (Rupees ____) free of all encumbrances.', '["sale_price", "sale_price_words"]', 3, false),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440010', 'financial', 'Earnest Money', 'The purchaser has paid to the vendor this day the sum of Rs.____ (Rupees ____) by way of earnest money for the due performance of the agreement, the receipt of which the vendor doth hereby admit and acknowledge.', '["earnest_money", "earnest_money_words"]', 4, false),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440010', 'performance', 'Time for Performance', 'The time for performance of the agreement shall be ____ months from this date, and it is agreed that time fixed herein for performance shall be the essence of this contract.', '["performance_months"]', 5, false),
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440010', 'financial', 'Balance Payment', 'The purchaser shall pay to the vendor the balance sale price of Rs.____ (Rupees ____) before registration of the sale deed.', '["balance_amount", "balance_amount_words"]', 6, false),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440010', 'possession', 'Vacant Possession', 'The vendor agrees that he will deliver vacant possession of the property to the purchaser before registration of the sale deed. Alternatively, the vendor agrees that he will put the purchaser in constructive possession (if vacant possession is not possible) of the property by causing the tenant in occupation of it to attorn their tenancy to the purchaser.', '[]', 7, false),
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440010', 'execution', 'Sale Deed Execution', 'The vendor shall execute the sale deed in favour of the purchaser or his nominee or nominees as purchaser may require.', '[]', 8, false),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440010', 'title_verification', 'Title Deed Delivery and Scrutiny', 'The vendor shall hand over all the title deeds of the property to the purchaser or his advocate nominated by him within ____ days from the date of this Agreement for scrutiny of title and the opinion of the vendor''s Advocate regarding title of the property shall be final and conclusive. The purchaser shall duly intimate the vendor about the approval of the title within ____ days after delivering the title deeds to him or his Advocate.', '["title_delivery_days", "title_approval_days"]', 9, false),
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', 'title_verification', 'Title Disapproval Consequences', 'If the vendor''s title to the property is not approved by the purchaser, the vendor shall refund to the purchaser the earnest money received by him under this Agreement and on failure of the vendor to refund the earnest money within ____ days he shall be liable to repay the same with interest thereon at ____ per cent per annum.', '["refund_days", "interest_rate"]', 10, false),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440010', 'breach', 'Purchaser Breach', 'If the purchaser commits a breach of the Agreement, he shall forfeit the earnest amount of Rs.____ (Rupees ____) paid by him to the vendor.', '["forfeit_amount", "forfeit_amount_words"]', 11, false),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440010', 'breach', 'Vendor Breach', 'If the vendor commits a breach of the Agreement, the vendor shall not only refund to the purchaser the sum of Rs.____ (Rupees ____) received by him as earnest money, but shall also pay to the purchaser an equal sum by way of liquidated damages.', '["refund_earnest", "refund_earnest_words"]', 12, false),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440010', 'remedies', 'Specific Performance Rights', 'Nothing contained in paras 9 and 10 supra shall prejudice the rights of the parties hereto, to specific performance of this Agreement of sale.', '[]', 13, false),
('550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440010', 'dispute_resolution', 'Dispute Resolution and Jurisdiction', 'Any dispute, controversy or claims arising out of or relating to this Agreement or the breach, termination or invalidity thereof, shall be settled by arbitration in accordance with the provisions of the [Indian] Arbitration and Conciliation Act, 1996. The arbitration shall be by the Sole Arbitrator appointed with mutual consent. The place of arbitration shall be at ____ and any award whether interim or final, shall be made, and shall be deemed for all purposes between the Parties to be made in ____. The arbitral procedure shall be conducted in the English/Kannada language and any award or awards shall be rendered in English/Kannada. The procedural law of the arbitration shall be Indian law. The award of the arbitral tribunal shall be final, conclusive and binding upon the Parties, and the provisions of the [Indian] Arbitration and Conciliation Act, 1996 shall apply. The rights and obligations of the Parties under, or pursuant to, this Clause, including the arbitration agreement in this Clause, shall be governed by and be subject to Indian law, and the agreement shall be subject to the exclusive jurisdiction of the courts at ____.', '["arbitration_place", "award_place", "court_jurisdiction"]', 14, false),
('550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440010', 'schedule', 'Property Schedule', 'Schedule of Property: Municipal No./Ward No./Plot No./Khasra No.: ____; Location: Street No.: ____, Street Name: ____; Place/Area North: ____, South: ____, East: ____, West: ____; District/Taluka/Village/Hobli: ____; Police Station: ____; District/State: ____; Exact Measurement: Total Area: ____, Measurement of all sides: ____; Plinth area/floor area: ____; Carpet area: ____; Fixtures & Fittings: ____; Any other items to be covered in sale deed: ____; Permitted use of the land/building: ____.', '["municipal_no", "street_no", "street_name", "boundary_north", "boundary_south", "boundary_east", "boundary_west", "district_taluka", "police_station", "district_state", "total_area", "side_measurements", "plinth_area", "carpet_area", "fixtures_fittings", "other_items", "permitted_use"]', 15, false);

-- Insert reusable contract clauses
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES
('550e8400-e29b-41d4-a716-446655441001', 'financial', 'Earnest Money and Performance Security', 'The purchaser pays earnest money for due performance of the agreement, with vendor acknowledging receipt. Time for performance is the essence of the contract.', ARRAY['earnest_money', 'performance_security', 'time_essence', 'payment'], ARRAY['property_sale', 'real_estate_transactions', 'purchase_agreements']),
('550e8400-e29b-41d4-a716-446655441002', 'title_verification', 'Title Deed Verification Process', 'Vendor shall deliver title deeds for scrutiny within specified days, with purchaser having defined period to approve title. Vendor''s advocate''s opinion on title shall be final and conclusive.', ARRAY['title_verification', 'due_diligence', 'legal_scrutiny', 'documentation'], ARRAY['property_sale', 'real_estate_due_diligence', 'title_verification']),
('550e8400-e29b-41d4-a716-446655441003', 'possession', 'Vacant Possession and Constructive Possession', 'Vendor agrees to deliver vacant possession before registration, or alternatively put purchaser in constructive possession by causing tenant to attorn tenancy.', ARRAY['vacant_possession', 'constructive_possession', 'tenant_attornment', 'property_transfer'], ARRAY['property_sale', 'tenanted_property', 'possession_transfer']),
('550e8400-e29b-41d4-a716-446655441004', 'breach', 'Purchaser Breach and Forfeiture', 'If purchaser breaches the agreement, earnest money shall be forfeited to the vendor as compensation for breach.', ARRAY['purchaser_breach', 'earnest_forfeiture', 'breach_penalty', 'liquidated_damages'], ARRAY['property_sale', 'breach_remedies', 'purchase_agreements']),
('550e8400-e29b-41d4-a716-446655441005', 'breach', 'Vendor Breach and Double Damages', 'If vendor breaches the agreement, vendor shall refund earnest money and pay equal sum as liquidated damages to the purchaser.', ARRAY['vendor_breach', 'double_damages', 'liquidated_damages', 'breach_remedy'], ARRAY['property_sale', 'breach_remedies', 'vendor_obligations']),
('550e8400-e29b-41d4-a716-446655441006', 'title_verification', 'Title Disapproval and Refund', 'If vendor''s title is not approved, vendor shall refund earnest money, and failure to refund within specified days attracts interest penalty.', ARRAY['title_disapproval', 'earnest_refund', 'interest_penalty', 'title_defects'], ARRAY['property_sale', 'title_verification', 'purchase_protection']),
('550e8400-e29b-41d4-a716-446655441007', 'remedies', 'Specific Performance Rights', 'Breach remedies shall not prejudice rights of parties to seek specific performance of the sale agreement.', ARRAY['specific_performance', 'legal_remedies', 'contract_enforcement', 'equitable_relief'], ARRAY['property_sale', 'contract_enforcement', 'legal_remedies']),
('550e8400-e29b-41d4-a716-446655441008', 'execution', 'Sale Deed Execution and Nominees', 'Vendor shall execute sale deed in favor of purchaser or nominees as purchaser may require.', ARRAY['sale_deed', 'nominee_transfer', 'deed_execution', 'property_transfer'], ARRAY['property_sale', 'deed_execution', 'property_transfer']),
('550e8400-e29b-41d4-a716-446655441009', 'dispute_resolution', 'Arbitration and Indian Law Governance', 'All disputes shall be settled by sole arbitrator under Indian Arbitration and Conciliation Act, 1996, with proceedings in specified location and language.', ARRAY['arbitration', 'indian_law', 'dispute_resolution', 'sole_arbitrator'], ARRAY['property_sale', 'dispute_resolution', 'contract_governance']),
('550e8400-e29b-41d4-a716-446655441010', 'schedule', 'Comprehensive Property Description', 'Detailed property schedule including municipal numbers, location, boundaries, measurements, areas, fixtures, and permitted use specifications.', ARRAY['property_description', 'boundaries', 'measurements', 'fixtures', 'permitted_use'], ARRAY['property_sale', 'property_documentation', 'real_estate_description']);

-- Insert contract parameters
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES
('550e8400-e29b-41d4-a716-446655441101', 'property_sale', 'execution_day', 'Day of Execution', 'text', true, 'Day of the month when agreement is executed', '15th', NULL),
('550e8400-e29b-41d4-a716-446655441102', 'property_sale', 'execution_month', 'Month of Execution', 'text', true, 'Month when the agreement is executed', 'January', NULL),
('550e8400-e29b-41d4-a716-446655441103', 'property_sale', 'vendor_name', 'Vendor Name', 'text', true, 'Full name of the property seller', 'Suresh Kumar', NULL),
('550e8400-e29b-41d4-a716-446655441104', 'property_sale', 'vendor_father', 'Vendor Father Name', 'text', true, 'Father''s name of the vendor', 'Shankar Kumar', NULL),
('550e8400-e29b-41d4-a716-446655441105', 'property_sale', 'vendor_address', 'Vendor Address', 'text', true, 'Complete address of the vendor', '123 MG Road, Bengaluru - 560001', NULL),
('550e8400-e29b-41d4-a716-446655441106', 'property_sale', 'purchaser_name', 'Purchaser Name', 'text', true, 'Full name of the property buyer', 'Pradeep Sharma', NULL),
('550e8400-e29b-41d4-a716-446655441107', 'property_sale', 'purchaser_father', 'Purchaser Father Name', 'text', true, 'Father''s name of the purchaser', 'Prakash Sharma', NULL),
('550e8400-e29b-41d4-a716-446655441108', 'property_sale', 'purchaser_address', 'Purchaser Address', 'text', true, 'Complete address of the purchaser', '456 Brigade Road, Bengaluru - 560025', NULL),
('550e8400-e29b-41d4-a716-446655441109', 'property_sale', 'total_sale_price', 'Total Sale Price', 'currency', true, 'Total agreed sale price of the property', '50,00,000', NULL),
('550e8400-e29b-41d4-a716-446655441110', 'property_sale', 'total_sale_price_words', 'Total Sale Price (Words)', 'text', true, 'Sale price written in words', 'Fifty Lakhs only', NULL),
('550e8400-e29b-41d4-a716-446655441111', 'property_sale', 'sale_price', 'Sale Price', 'currency', true, 'Fixed sale price of the property', '50,00,000', NULL),
('550e8400-e29b-41d4-a716-446655441112', 'property_sale', 'sale_price_words', 'Sale Price (Words)', 'text', true, 'Sale price in words', 'Fifty Lakhs only', NULL),
('550e8400-e29b-41d4-a716-446655441113', 'property_sale', 'earnest_money', 'Earnest Money Amount', 'currency', true, 'Amount paid as earnest money', '5,00,000', NULL),
('550e8400-e29b-41d4-a716-446655441114', 'property_sale', 'earnest_money_words', 'Earnest Money (Words)', 'text', true, 'Earnest money amount in words', 'Five Lakhs only', NULL),
('550e8400-e29b-41d4-a716-446655441115', 'property_sale', 'performance_months', 'Performance Period (Months)', 'number', true, 'Time period for performance in months', '6', NULL),
('550e8400-e29b-41d4-a716-446655441116', 'property_sale', 'balance_amount', 'Balance Amount', 'currency', true, 'Balance amount to be paid', '45,00,000', NULL),
('550e8400-e29b-41d4-a716-446655441117', 'property_sale', 'balance_amount_words', 'Balance Amount (Words)', 'text', true, 'Balance amount in words', 'Forty Five Lakhs only', NULL),
('550e8400-e29b-41d4-a716-446655441118', 'property_sale', 'title_delivery_days', 'Title Delivery Days', 'number', true, 'Days within which title deeds to be delivered', '15', NULL),
('550e8400-e29b-41d4-a716-446655441119', 'property_sale', 'title_approval_days', 'Title Approval Days', 'number', true, 'Days for purchaser to approve title', '30', NULL),
('550e8400-e29b-41d4-a716-446655441120', 'property_sale', 'refund_days', 'Refund Days', 'number', true, 'Days for vendor to refund earnest money', '30', NULL),
('550e8400-e29b-41d4-a716-446655441121', 'property_sale', 'interest_rate', 'Interest Rate', 'number', true, 'Interest rate on delayed refund (per annum)', '12', NULL),
('550e8400-e29b-41d4-a716-446655441122', 'property_sale', 'forfeit_amount', 'Forfeit Amount', 'currency', true, 'Amount to be forfeited on purchaser breach', '5,00,000', NULL),
('550e8400-e29b-41d4-a716-446655441123', 'property_sale', 'forfeit_amount_words', 'Forfeit Amount (Words)', 'text', true, 'Forfeit amount in words', 'Five Lakhs only', NULL),
('550e8400-e29b-41d4-a716-446655441124', 'property_sale', 'refund_earnest', 'Refund Earnest Amount', 'currency', true, 'Earnest money to be refunded on vendor breach', '5,00,000', NULL),
('550e8400-e29b-41d4-a716-446655441125', 'property_sale', 'refund_earnest_words', 'Refund Earnest (Words)', 'text', true, 'Refund earnest amount in words', 'Five Lakhs only', NULL),
('550e8400-e29b-41d4-a716-446655441126', 'property_sale', 'arbitration_place', 'Place of Arbitration', 'text', true, 'City where arbitration proceedings will be held', 'Bengaluru', NULL),
('550e8400-e29b-41d4-a716-446655441127', 'property_sale', 'award_place', 'Award Place', 'text', true, 'Place where arbitration award is deemed to be made', 'Bengaluru', NULL),
('550e8400-e29b-41d4-a716-446655441128', 'property_sale', 'court_jurisdiction', 'Court Jurisdiction', 'text', true, 'Location of courts having jurisdiction', 'Bengaluru', NULL),
('550e8400-e29b-41d4-a716-446655441129', 'property_sale', 'municipal_no', 'Municipal/Ward/Plot Number', 'text', true, 'Municipal or ward or plot or khasra number', 'Plot No. 123, Ward No. 45', NULL),
('550e8400-e29b-41d4-a716-446655441130', 'property_sale', 'street_no', 'Street Number', 'text', true, 'Street number of the property', '15', NULL),
('550e8400-e29b-41d4-a716-446655441131', 'property_sale', 'street_name', 'Street Name', 'text', true, 'Name of the street', 'MG Road', NULL),
('550e8400-e29b-41d4-a716-446655441132', 'property_sale', 'boundary_north', 'North Boundary', 'text', true, 'Northern boundary of the property', 'Road', NULL),
('550e8400-e29b-41d4-a716-446655441133', 'property_sale', 'boundary_south', 'South Boundary', 'text', true, 'Southern boundary of the property', 'Property of Mr. Raj', NULL),
('550e8400-e29b-41d4-a716-446655441134', 'property_sale', 'boundary_east', 'East Boundary', 'text', true, 'Eastern boundary of the property', 'Common Drainage', NULL),
('550e8400-e29b-41d4-a716-446655441135', 'property_sale', 'boundary_west', 'West Boundary', 'text', true, 'Western boundary of the property', 'Property of Mr. Kumar', NULL),
('550e8400-e29b-41d4-a716-446655441136', 'property_sale', 'district_taluka', 'District/Taluka/Village/Hobli', 'text', true, 'Administrative location details', 'Bengaluru Urban District, Bengaluru North Taluka', NULL),
('550e8400-e29b-41d4-a716-446655441137', 'property_sale', 'police_station', 'Police Station', 'text', true, 'Nearest police station', 'Commercial Street Police Station', NULL),
('550e8400-e29b-41d4-a716-446655441138', 'property_sale', 'district_state', 'District/State', 'text', true, 'District and state details', 'Bengaluru Urban, Karnataka', NULL),
('550e8400-e29b-41d4-a716-446655441139', 'property_sale', 'total_area', 'Total Area', 'text', true, 'Total area of the property', '2400 sq ft', NULL),
('550e8400-e29b-41d4-a716-446655441140', 'property_sale', 'side_measurements', 'Side Measurements', 'text', true, 'Measurements of all sides', '40 ft x 60 ft', NULL),
('550e8400-e29b-41d4-a716-446655441141', 'property_sale', 'plinth_area', 'Plinth/Floor Area', 'text', true, 'Plinth area or floor area', '2000 sq ft', NULL),
('550e8400-e29b-41d4-a716-446655441142', 'property_sale', 'carpet_area', 'Carpet Area', 'text', true, 'Carpet area of the property', '1800 sq ft', NULL),
('550e8400-e29b-41d4-a716-446655441143', 'property_sale', 'fixtures_fittings', 'Fixtures & Fittings', 'text', true, 'List of fixtures and fittings included', 'Modular kitchen, built-in wardrobes, ceiling fans', NULL),
('550e8400-e29b-41d4-a716-446655441144', 'property_sale', 'other_items', 'Other Items', 'text', false, 'Any other items to be covered in sale deed', 'Parking space, generator backup', NULL),
('550e8400-e29b-41d4-a716-446655441145', 'property_sale', 'permitted_use', 'Permitted Use', 'text', true, 'Permitted use of the land/building', 'Residential', NULL);

-- ========================================
-- End of Template 10: Model Agreement of Sale of Immovable Property
-- ========================================

-- Template 11: Model of Service Agreement
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'service_agreement', 'Model of Service Agreement', 'Comprehensive service agreement template for employment of business manager with detailed provisions for duties, compensation, benefits, termination, and performance requirements including salary, commission, accommodation, and travel arrangements', 'employment', 'india', ARRAY['service_agreement', 'employment', 'manager', 'compensation', 'benefits', 'termination', 'business_management']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES
('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440011', 'preamble', 'Parties and Background', 'This AGREEMENT is made on this ____ day of ____ BETWEEN ____, etc. (Hereinafter called the "Employer") of the one part AND ____, etc, (hereinafter called the "Manager") of the other part. WHEREAS 1. The employer wants to appoint a suitable person to work as Manager for his business concern; and 2. ____, the party of the other part, has agreed to serve as Manager of the employer for his business concern.', '["execution_day", "execution_month", "employer_name", "manager_name", "manager_name_ref"]', 1, false),
('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440011', 'term', 'Term and Place of Work', 'The manager shall work as such for a term of ____ years from the day of ____ at ____ or any other place as desired by the employer.', '["contract_term", "start_date", "work_location"]', 2, false),
('550e8400-e29b-41d4-a716-446655440903', '550e8400-e29b-41d4-a716-446655440011', 'duties', 'Manager Duties and Obligations', 'The manager shall give his whole time and attention to the said business and shall use his best endeavour to improve and expand the same and shall in all respects diligently and faithfully obey and observe all lawful orders and instructions of the employer in relation to the conduct of the said business and shall not without his consent divulge any secrets or dealing thereto.', '[]', 3, false),
('550e8400-e29b-41d4-a716-446655440904', '550e8400-e29b-41d4-a716-446655440011', 'accounting', 'Books and Accounts Management', 'The manager shall keep at the place of business at ____ (place) proper books of accounts showing all goods and moneys received and delivered and disbursed by him with necessary particulars of all such transactions and shall duly account for all moneys belonging to the employer and coming into the hands or power of the manager and shall forthwith pay the same to the employer or his bankers for the time being except only such moneys as the manager shall be authorised by the employer to retain for immediate requirements of the said business.', '["business_place"]', 4, false),
('550e8400-e29b-41d4-a716-446655440905', '550e8400-e29b-41d4-a716-446655440011', 'compensation', 'Salary and Commission', 'The employer shall pay to the manager during the continuance of his engagements and provided he shall duly observe and perform the agreement herein on his part contained the salary of Rs.____ per mensem on the first day of every calendar month commencing from the first day of ____ without any deduction except such as he will be bound to make under the Income-tax law for the time being in force, and shall also pay the manager at the end of each year during the aforesaid period a further sum equal to ____% on the gross sale return for the said year (or on the net profits of the said business for the said year (if any) after making such deductions as are properly made according to the usual custom of the said business in the estimation of net profits).', '["monthly_salary", "salary_start_date", "commission_percentage"]', 5, false),
('550e8400-e29b-41d4-a716-446655440906', '550e8400-e29b-41d4-a716-446655440011', 'compensation', 'Death and Termination Compensation', 'Upon the death or termination of the engagement of the manager before the expiration of the said period of ____ years the employer shall forthwith pay to him or his heirs, executors, administrators or other legal representatives, as the case may be, in respect of the services of the manager of the whole or any part of the current month a due proportion of the salary of Rs.____ per mensem together with such further sum in lieu of such percentage as aforesaid as shall bear the same proportion to the estimated gross return (net profits) for the then current year as the part of the said year during which he has served, shall bear to the whole year, the gross return (net profits) being calculated on average of the past three years.', '["contract_period", "monthly_salary_ref"]', 6, false),
('550e8400-e29b-41d4-a716-446655440907', '550e8400-e29b-41d4-a716-446655440011', 'accommodation', 'Accommodation Provision', 'The employer shall during the continuance of the manager''s engagement provide him with a suitable furnished house for residence free of rent, rates and taxes (except the charges for electricity consumed by him or of extra water used by him) and the manager shall reside in the said house.', '[]', 7, false),
('550e8400-e29b-41d4-a716-446655440908', '550e8400-e29b-41d4-a716-446655440011', 'travel', 'Travel and Tour Arrangements', 'The manager shall make such tour as may be necessary in the interest of the said business or as he may be directed by the employer to make and the employer shall pay him all reasonable expense actually incurred in undertaking such tours (or a travelling allowance at per mile for all journey by road and first class fare for journeys performed by rail and a halting allowance of Rs.____ per diem when a halt of not less than 8 hours is made at one place).', '["halting_allowance"]', 8, false),
('550e8400-e29b-41d4-a716-446655440909', '550e8400-e29b-41d4-a716-446655440011', 'leave', 'Leave Entitlements', 'The manager shall be entitled during his engagement to leave on full pay for a period equal to 1/11th of the period of service rendered and to a further leave on half pay in case of illness or incapacity to be proved to the satisfaction of the employer for a period of 15 days in one year.', '[]', 9, false),
('550e8400-e29b-41d4-a716-446655440910', '550e8400-e29b-41d4-a716-446655440011', 'termination', 'Termination by Notice', 'Either party hereto may terminate the engagement of the manager at any time before the expiration of the said term of ____ years on giving or sending by registered post to the other party three calendar months, notice in writing, such notice to be given or sent in the case of the employer to his house at ____ and in case of the manager to his place of business or residence provided by the employer and on the expiration of the said three months from the date of giving or posting such notice, the said engagement shall terminate provided that the employer may terminate the said engagement at any time on payment of three months'' pay in advance in lieu of such notice as aforesaid.', '["termination_term", "employer_address"]', 10, false),
('550e8400-e29b-41d4-a716-446655440911', '550e8400-e29b-41d4-a716-446655440011', 'termination', 'Termination for Cause', 'If the manager at any time willfully neglects or refuses or from illness or other cause becomes or is unable to perform any of the duties under this agreement, the employer may suspend his salary (and sum by way of percentage) during such neglect, negligence or inability as aforesaid and may further immediately terminate the engagement of the manager without giving any such notice or making such payment or salary in advance as hereinbefore provided.', '[]', 11, false),
('550e8400-e29b-41d4-a716-446655440912', '550e8400-e29b-41d4-a716-446655440011', 'security', 'Surety Requirement', 'The manager will at his own expense find and provide two respectable sureties to the amount of Rs.____ each for his good conduct and for the due performance by him of this engagement and if he fails to do so for a period of three months from this date, the employer may terminate his services forthwith.', '["surety_amount"]', 12, false),
('550e8400-e29b-41d4-a716-446655440913', '550e8400-e29b-41d4-a716-446655440011', 'dispute_resolution', 'Dispute Resolution and Jurisdiction', 'Any dispute, controversy or claims arising out of or relating to this Agreement or the breach, termination or invalidity thereof, shall be settled by arbitration in accordance with the provisions of the [Indian] Arbitration and Conciliation Act, 1996. The arbitral tribunal shall be composed of Sole Arbitrator or by the Arbitrator appointed by mutual consent. The place of arbitration shall be at ____ and any award whether interim or final, shall be made, and shall be deemed for all purposes between the Parties to be made in ____. The arbitral procedure shall be conducted in the English/Kannada language and any award or awards shall be rendered in English/Kannada. The procedural law of the arbitration shall be Indian law. The award of the arbitral tribunal shall be final, conclusive and binding upon the Parties, and the provisions of the [Indian] Arbitration and Conciliation Act, 1996 shall apply. The rights and obligations of the Parties under, or pursuant to, this Clause, including the arbitration agreement in this Clause, shall be governed by and be subject to Indian law, and the agreement shall be subject to the exclusive jurisdiction of the courts at ____.', '["arbitration_place", "award_place", "court_jurisdiction"]', 13, false);

-- Insert reusable contract clauses
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES
('550e8400-e29b-41d4-a716-446655441001', 'duties', 'Full-Time Service and Confidentiality', 'Manager shall devote whole time and attention to business, use best endeavors to improve and expand it, obey lawful instructions, and maintain confidentiality of business secrets.', ARRAY['full_time_service', 'confidentiality', 'business_expansion', 'duty_of_care'], ARRAY['service_agreements', 'employment_contracts', 'managerial_appointments']),
('550e8400-e29b-41d4-a716-446655441002', 'accounting', 'Financial Record Keeping and Accountability', 'Manager shall maintain proper books of accounts, account for all moneys, and remit funds to employer except amounts authorized for immediate business requirements.', ARRAY['financial_accountability', 'record_keeping', 'money_handling', 'business_accounting'], ARRAY['service_agreements', 'financial_management', 'business_operations']),
('550e8400-e29b-41d4-a716-446655441003', 'compensation', 'Salary and Performance-Based Commission', 'Fixed monthly salary plus annual commission based on gross sales or net profits, with pro-rata calculation for partial periods and specific income tax deduction provisions.', ARRAY['fixed_salary', 'performance_commission', 'pro_rata_calculation', 'tax_deductions'], ARRAY['service_agreements', 'employment_compensation', 'performance_incentives']),
('550e8400-e29b-41d4-a716-446655441004', 'accommodation', 'Furnished Accommodation Provision', 'Employer provides furnished house free of rent and taxes, with manager responsible for electricity and extra water charges and required to reside in provided accommodation.', ARRAY['furnished_accommodation', 'utility_responsibility', 'residence_requirement', 'employee_benefits'], ARRAY['service_agreements', 'employee_benefits', 'accommodation_provision']),
('550e8400-e29b-41d4-a716-446655441005', 'travel', 'Business Travel and Expense Reimbursement', 'Manager undertakes necessary business tours with employer covering reasonable expenses, or providing fixed travel allowances for road/rail journeys and halting allowances.', ARRAY['business_travel', 'expense_reimbursement', 'travel_allowances', 'halting_allowance'], ARRAY['service_agreements', 'business_operations', 'travel_management']),
('550e8400-e29b-41d4-a716-446655441006', 'leave', 'Leave Entitlements and Sick Leave', 'Manager entitled to full pay leave (1/11th of service period) and additional half-pay sick leave (15 days per year) with employer satisfaction regarding illness proof.', ARRAY['annual_leave', 'sick_leave', 'leave_calculation', 'medical_leave'], ARRAY['service_agreements', 'employee_benefits', 'leave_management']),
('550e8400-e29b-41d4-a716-446655441007', 'termination', 'Three-Month Notice Termination', 'Either party may terminate with three months written notice, with employer option to pay three months salary in lieu of notice period.', ARRAY['notice_period', 'termination_rights', 'payment_in_lieu', 'mutual_termination'], ARRAY['service_agreements', 'employment_termination', 'notice_requirements']),
('550e8400-e29b-41d4-a716-446655441008', 'termination', 'Immediate Termination for Cause', 'Employer may immediately terminate and suspend salary for manager''s willful neglect, refusal to perform duties, illness, or incapacity without notice or advance payment.', ARRAY['immediate_termination', 'cause_termination', 'salary_suspension', 'performance_failure'], ARRAY['service_agreements', 'disciplinary_action', 'performance_management']),
('550e8400-e29b-41d4-a716-446655441009', 'security', 'Surety Bond Requirement', 'Manager must provide two respectable sureties at specified amount for good conduct and performance, with failure to provide resulting in immediate termination.', ARRAY['surety_bond', 'performance_security', 'conduct_guarantee', 'financial_security'], ARRAY['service_agreements', 'performance_security', 'employment_bonds']),
('550e8400-e29b-41d4-a716-446655441010', 'dispute_resolution', 'Sole Arbitrator Dispute Resolution', 'All disputes resolved through sole arbitrator under Indian Arbitration and Conciliation Act, 1996, with proceedings in specified location and English/Kannada language.', ARRAY['sole_arbitrator', 'indian_arbitration_law', 'dispute_resolution', 'language_specification'], ARRAY['service_agreements', 'dispute_resolution', 'employment_disputes']);

-- Insert contract parameters
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES
('550e8400-e29b-41d4-a716-446655441101', 'service_agreement', 'execution_day', 'Day of Execution', 'text', true, 'Day of the month when agreement is executed', '15th', NULL),
('550e8400-e29b-41d4-a716-446655441102', 'service_agreement', 'execution_month', 'Month of Execution', 'text', true, 'Month when the agreement is executed', 'March', NULL),
('550e8400-e29b-41d4-a716-446655441103', 'service_agreement', 'employer_name', 'Employer Name', 'text', true, 'Full name and details of the employer', 'ABC Industries Private Limited', NULL),
('550e8400-e29b-41d4-a716-446655441104', 'service_agreement', 'manager_name', 'Manager Name', 'text', true, 'Full name and details of the manager', 'Ramesh Kumar', NULL),
('550e8400-e29b-41d4-a716-446655441105', 'service_agreement', 'manager_name_ref', 'Manager Name Reference', 'text', true, 'Manager name for reference in recitals', 'Ramesh Kumar', NULL),
('550e8400-e29b-41d4-a716-446655441106', 'service_agreement', 'contract_term', 'Contract Term (Years)', 'number', true, 'Duration of the service agreement in years', '3', NULL),
('550e8400-e29b-41d4-a716-446655441107', 'service_agreement', 'start_date', 'Start Date', 'date', true, 'Date from which service commences', '2024-04-01', NULL),
('550e8400-e29b-41d4-a716-446655441108', 'service_agreement', 'work_location', 'Work Location', 'text', true, 'Primary place of work for the manager', 'Bengaluru', NULL),
('550e8400-e29b-41d4-a716-446655441109', 'service_agreement', 'business_place', 'Business Place', 'text', true, 'Location where books of accounts will be maintained', 'Electronic City, Bengaluru', NULL),
('550e8400-e29b-41d4-a716-446655441110', 'service_agreement', 'monthly_salary', 'Monthly Salary', 'currency', true, 'Fixed monthly salary amount', '75,000', NULL),
('550e8400-e29b-41d4-a716-446655441111', 'service_agreement', 'salary_start_date', 'Salary Start Date', 'date', true, 'Date from which salary payment commences', '2024-04-01', NULL),
('550e8400-e29b-41d4-a716-446655441112', 'service_agreement', 'commission_percentage', 'Commission Percentage', 'number', true, 'Annual commission percentage on gross sales/net profits', '5', NULL),
('550e8400-e29b-41d4-a716-446655441113', 'service_agreement', 'contract_period', 'Contract Period (Years)', 'number', true, 'Total contract period for compensation calculation', '3', NULL),
('550e8400-e29b-41d4-a716-446655441114', 'service_agreement', 'monthly_salary_ref', 'Monthly Salary Reference', 'currency', true, 'Monthly salary amount for compensation calculations', '75,000', NULL),
('550e8400-e29b-41d4-a716-446655441115', 'service_agreement', 'halting_allowance', 'Halting Allowance per Day', 'currency', true, 'Daily allowance for halts during business tours', '2,000', NULL),
('550e8400-e29b-41d4-a716-446655441116', 'service_agreement', 'termination_term', 'Termination Notice Term', 'number', true, 'Contract term reference for termination clause', '3', NULL),
('550e8400-e29b-41d4-a716-446655441117', 'service_agreement', 'employer_address', 'Employer Address', 'text', true, 'Address for serving termination notice to employer', '123 Industrial Area, Bengaluru - 560100', NULL),
('550e8400-e29b-41d4-a716-446655441118', 'service_agreement', 'surety_amount', 'Surety Amount per Person', 'currency', true, 'Amount for each surety bond', '2,00,000', NULL),
('550e8400-e29b-41d4-a716-446655441119', 'service_agreement', 'arbitration_place', 'Place of Arbitration', 'text', true, 'City where arbitration proceedings will be held', 'Bengaluru', NULL),
('550e8400-e29b-41d4-a716-446655441120', 'service_agreement', 'award_place', 'Award Place', 'text', true, 'Place where arbitration award is deemed to be made', 'Bengaluru', NULL),
('550e8400-e29b-41d4-a716-446655441121', 'service_agreement', 'court_jurisdiction', 'Court Jurisdiction', 'text', true, 'Location of courts having jurisdiction', 'Bengaluru', NULL);

-- ========================================
-- End of Template 11: Model of Service Agreement
-- ========================================

-- Template 12: Mutual Non-Disclosure Agreement
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES
('550e8400-e29b-41d4-a716-446655440012', 'mutual_nda', 'Mutual Non-Disclosure Agreement', 'Comprehensive mutual non-disclosure agreement for protection of confidential information between parties exploring business relationships with provisions for confidentiality, non-disclosure, publication restrictions, remedies, and dispute resolution mechanisms', 'confidentiality', 'india', ARRAY['non_disclosure', 'confidentiality', 'mutual_nda', 'business_relationship', 'trade_secrets', 'proprietary_information']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES
('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440012', 'preamble', 'Parties and Effective Date', 'This Non-Disclosure Agreement (hereinafter, the "Agreement" is entered into on this [.] day of [.], 20[.] (hereinafter, the "Effective Date") BY AND BETWEEN Name: ____ Address: ____ Represented by: ____ (hereinafter referred to as the "First Party", which expression shall, where the context admits, include its successors and permitted assigns), of the ONE PART; AND Name: ____ Address: ____ Represented by: ____ (hereinafter referred to as the "Second Party", which expression shall, unless repugnant to the meaning or context hereof, be deemed to include its successors and permitted assigns); ON THE SECOND PART.', '["execution_day", "execution_month", "execution_year", "first_party_name", "first_party_address", "first_party_representative", "second_party_name", "second_party_address", "second_party_representative"]', 1, false),
('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440012', 'recitals', 'Background and Purpose', 'WHEREAS the Parties intend to participate in discussions in order to explore a potential business relationship and the Parties may share information that is confidential and proprietary either during the discussions or during the course of the business relationship, for the purpose of enabling the parties to interact and work productively (hereinafter referred to as the "Purpose"); WHEREAS the Parties desire to protect such Confidential Information and ensure that it is not disclosed to any third party with the permission of the Party.', '[]', 2, false),
('550e8400-e29b-41d4-a716-446655440903', '550e8400-e29b-41d4-a716-446655440012', 'definitions', 'Confidential Information Definition', 'For purposes of this Agreement, "Confidential Information" means and includes all information or material that has or could have commercial value or other utility in the business in which Parties are engaged and any data or information that is proprietary to the Parties and not generally known to the public, whether in tangible or intangible form, whenever and however disclosed, including, but not limited to: Any Trade Secrets, Proprietary documents, business plans, process, structure or practices; Any marketing strategies, plans, financial information, or projections; operations, sales estimates, business plans and performance results; Any information related to the cost of project execution or delivery of service; Plans for products or services, and client or partner lists; Any algorithm, software, design, process, procedure, formula, source code, object code, flow charts, databases, improvement, technology or method; Any concepts, reports, data, know-how, works-in-progress, designs, development tools, specifications; Any invoices, bills, e-mail communications, mobile text communications, and any other communication related to the projects, products or services; Any other information that should reasonably be recognized as confidential information of the other Party.', '[]', 3, false),
('550e8400-e29b-41d4-a716-446655440904', '550e8400-e29b-41d4-a716-446655440012', 'definitions', 'Confidential Information Acknowledgment', 'Confidential Information need not be novel, unique, patentable, copyrightable or constitute a trade secret in order to be designated Confidential Information. The Parties acknowledge that the Confidential Information is proprietary to the other Party, has been developed and obtained through great efforts by the Party and that Parties regard all of their Confidential Information as trade secrets. The Parties shall use the Confidential Information solely for and in connection with the Purpose.', '[]', 4, false),
('550e8400-e29b-41d4-a716-446655440905', '550e8400-e29b-41d4-a716-446655440012', 'exceptions', 'Information Exclusions', 'Notwithstanding any other provision of this Agreement, the Parties acknowledge that Confidential Information shall not include any information that: Is or becomes legally and publicly available to either Party without breach of this Agreement; Was rightfully in the possession of either Party without any obligation of confidentiality; or Is disclosed or is required to be disclosed under any relevant law, regulation or order of court, provided the other Party is given prompt notice of such requirement or such order and (where possible) provided the opportunity to contest it, and the scope of such disclosure is limited to the extent possible.', '[]', 5, false),
('550e8400-e29b-41d4-a716-446655440906', '550e8400-e29b-41d4-a716-446655440012', 'non_disclosure', 'Non-Disclosure Obligations', 'The Parties shall use the Confidential Information only for the Purpose and not disclose any or part or summary or extract of the Confidential Information to any third party, including third parties affiliated with the other Party, without that Party''s prior written consent, which prior consent the Party may refuse to give without assigning any reasons. The Parties shall hold and keep in strictest confidence any and all Confidential Information and shall treat the Confidential Information with at least the same degree of care and protection as it would treat its own Confidential Information.', '[]', 6, false),
('550e8400-e29b-41d4-a716-446655440907', '550e8400-e29b-41d4-a716-446655440012', 'non_disclosure', 'Sales Materials and Copying Restrictions', 'Either Party shall not disclose the sale of materials of the other Party to any individual/person/any client of the other Party. Either Party shall not copy or reproduce in any way (including without limitation, store in any computer or electronic system) any Confidential Information or any documents containing Confidential Information without the Party''s prior written consent. The Party shall immediately upon request by the other Party deliver to the Party owning the Confidential Information that has been disclosed to the other Party, including all copies (if any) made in terms of these.', '[]', 7, false),
('550e8400-e29b-41d4-a716-446655440908', '550e8400-e29b-41d4-a716-446655440012', 'non_disclosure', 'Employee Access and Third Party Restrictions', 'Either Party shall not commercially/non-commercially use or disclose any Confidential Information or any materials derived therefrom to any other person or entity other than persons in the direct employment of the other Party who have a need to have access to and knowledge of the Confidential Information solely for the Purpose as defined above, and such persons are under similar obligation of confidentiality and non-disclosure as these presents. In the event that any employees, agents or affiliates of either Party disclose or cause to be disclosed the Confidential Information, that Party shall be liable for such disclosure.', '[]', 8, false),
('550e8400-e29b-41d4-a716-446655440909', '550e8400-e29b-41d4-a716-446655440012', 'non_disclosure', 'Breach Notification and Warranties', 'Both Parties agrees to notify the other Party immediately if it learns of any use or disclosure of the Party''s Confidential Information in violation of the terms of this Agreement. The Parties further acknowledge and agree that no representation or warranty, express or implied, is or will be made, and no responsibility or liability is or will be accepted by either Party, or by any of its respective directors, officers, employees, agents or advisers, as to, or in relation to, the accuracy of completeness of any Confidential Information made available to the other Party or its advisers; it is responsible for making its own evaluation of such Confidential Information.', '[]', 9, false),
('550e8400-e29b-41d4-a716-446655440910', '550e8400-e29b-41d4-a716-446655440012', 'non_disclosure', 'Client Solicitation Restrictions', 'During the term of this agreement, either Parties may use the association with the other Party only towards the purpose as envisaged under their business association under this Agreement. Both the Parties hereby acknowledge, understand and agree that they shall not approach the clients of the other Party in any manner for whom one Party has delivered a product or a service on behalf of the other Party, for an existing project or for any future projects.', '[]', 10, false),
('550e8400-e29b-41d4-a716-446655440911', '550e8400-e29b-41d4-a716-446655440012', 'publications', 'Publication and Publicity Restrictions', 'Neither Party shall not make news releases, public announcements, give interviews, issue or publish advertisements or publicize in any other manner whatsoever in connection with this Agreement, the contents/provisions thereof, other information relating to this Agreement, the Purpose, the Confidential Information or other matter of this Agreement, without the prior written approval of the other Party. Further, neither Party shall use any photographs/video/other materials belonging or related to the other Party in promotional content through electronic, print or other mediums.', '[]', 11, false),
('550e8400-e29b-41d4-a716-446655440912', '550e8400-e29b-41d4-a716-446655440012', 'term', 'Agreement Term and Continuation', 'This Agreement shall be effective from the date hereof and all non-disclosure provisions shall continue to be in force at all times even after the cessation of the discussions or business relationship between the parties. Upon any demand made by either Party, the other Party shall immediately cease any and all disclosures or uses of Confidential Information, and at the request of the Party, shall promptly return or destroy all written, graphic or other tangible forms of the Confidential Information and all copies, abstracts, extracts, samples, notes or modules or like thereof, in accordance with this clause and Section 6 of this Agreement. The obligations of the Parties with respect to disclosure and confidentiality shall continue to be binding and applicable without limit in point in time except and until such information enters the public domain.', '[]', 12, false),
('550e8400-e29b-41d4-a716-446655440913', '550e8400-e29b-41d4-a716-446655440012', 'intellectual_property', 'Title and Proprietary Rights', 'Notwithstanding the disclosure of any Confidential Information by one Party to the other Party, the original Party shall retain title and all intellectual property and proprietary rights in the Confidential Information. No license under any trademark, patent or copyright, or application for same, which are now or thereafter may be obtained by the one Party is either granted or implied by the conveying of Confidential Information, to the other Party. Neither Party shall conceal, alter, obliterate, mutilate, deface or otherwise interfere with any trademark, trademark notice, copyright notice, confidentiality notice or any notice of any other proprietary right of the other Party on any copy of the Confidential Information, and shall reproduce any such mark or notice on all copies of such Confidential Information. Likewise, the other Party shall not add or emboss its own or any other any mark, symbol or logo on such Confidential Information.', '[]', 13, false),
('550e8400-e29b-41d4-a716-446655440914', '550e8400-e29b-41d4-a716-446655440012', 'return', 'Return of Confidential Information', 'Upon written demand of the either Party, the other Party shall: Cease using the Confidential Information; Return the Confidential Information and all copies, abstract, extracts, samples, notes or modules thereof to the Party that makes such demand, within seven (7) days after receipt of notice; and Upon such return, certify in writing that the other Party has complied with the obligations set forth in this paragraph.', '[]', 14, false),
('550e8400-e29b-41d4-a716-446655440915', '550e8400-e29b-41d4-a716-446655440012', 'remedies', 'Remedies and Enforcement', 'The Parties acknowledge that if either Party fails to comply with any of its obligations hereunder, the other Party may suffer immediate, irreparable harm for which monetary damages may not be adequate. The Parties acknowledge that damages are not a sufficient remedy for the other Party for any breach of any of the Party''s undertakings herein provided; and the Parties further acknowledge that the affected Party is entitled to, without limitation to the other rights guaranteed under this Agreement, to specific performance or injunctive relief (as appropriate) as one of the remedies for any breach or threatened breach of those undertakings by the defaulting Party, in addition to any other remedies available to the affected Party in law or in equity.', '[]', 15, false),
('550e8400-e29b-41d4-a716-446655440916', '550e8400-e29b-41d4-a716-446655440012', 'general', 'Entire Agreement and Assignment', 'This Agreement constitutes the entire agreement between the Parties relating to the matters discussed herein and supersedes any and all prior oral discussions and/or written correspondence or agreements between the Parties. This Agreement may be amended or modified only with the mutual written consent of the parties, by way of an addendum. Neither this Agreement nor any right granted hereunder shall be assignable or otherwise transferable.', '[]', 16, false),
('550e8400-e29b-41d4-a716-446655440917', '550e8400-e29b-41d4-a716-446655440012', 'dispute_resolution', 'Dispute Resolution', 'Mediation. The Parties agree to first mediate any disputes or claims between them in good faith and resolve the disputes amicably and share the cost of mediation equally. Arbitration. In the event that mediation fails, any controversy or claim arising out of or relating to this Agreement or breach of any duties hereunder shall be settled by Arbitration in accordance with the Arbitration and Conciliation Act of India, 1996. All hearings will be held in ____ India and shall be conducted in English. The parties shall each appoint an arbitrator who shall then appoint a sole arbitrator to preside over the Arbitration proceedings.', '["arbitration_location"]', 17, false),
('550e8400-e29b-41d4-a716-446655440918', '550e8400-e29b-41d4-a716-446655440012', 'governing_law', 'Governing Law and Jurisdiction', 'This Agreement shall be governed by and construed in accordance with the laws of India. Each party hereby irrevocably submits to the exclusive jurisdiction of the courts of ____ India, for the adjudication of any dispute hereunder or in connection herewith.', '["jurisdiction_location"]', 18, false),
('550e8400-e29b-41d4-a716-446655440919', '550e8400-e29b-41d4-a716-446655440012', 'miscellaneous', 'Miscellaneous Provisions', 'No failure or delay by either Party in exercising or enforcing any right, remedy or power hereunder shall operate as a waiver thereof, nor shall any single or partial exercise or enforcement of any right, remedy or power preclude any further exercise or enforcement thereof or the exercise or enforcement of any other right, remedy or power. The failure of either party to enforce its rights under this Agreement at any time for any period shall not be construed as a waiver of such rights. In the event that any of the provisions of this Agreement shall be held by a court or other tribunal of competent jurisdiction to be unenforceable, the remaining portions hereof shall remain in full force and effect. All obligations respecting the Confidential Information provided hereunder shall survive any termination of this Agreement.', '[]', 19, false);

-- Insert reusable contract clauses
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES
('550e8400-e29b-41d4-a716-446655441001', 'definitions', 'Comprehensive Confidential Information Definition', 'Confidential Information includes trade secrets, proprietary documents, business plans, marketing strategies, financial information, algorithms, software, source code, client lists, communications, and any other information that should reasonably be recognized as confidential.', ARRAY['confidential_information', 'trade_secrets', 'proprietary_data', 'business_information'], ARRAY['non_disclosure_agreements', 'confidentiality_agreements', 'business_relationships']),
('550e8400-e29b-41d4-a716-446655441002', 'non_disclosure', 'Strict Confidentiality and Use Restrictions', 'Parties shall use confidential information only for the specified purpose, not disclose to third parties without written consent, and treat with same degree of care as own confidential information.', ARRAY['non_disclosure', 'confidentiality_obligations', 'use_restrictions', 'third_party_restrictions'], ARRAY['non_disclosure_agreements', 'confidentiality_protection', 'information_security']),
('550e8400-e29b-41d4-a716-446655441003', 'exceptions', 'Standard Confidentiality Exceptions', 'Confidential information excludes information that is publicly available without breach, rightfully possessed without confidentiality obligation, or required to be disclosed by law with proper notice and opportunity to contest.', ARRAY['confidentiality_exceptions', 'public_domain', 'legal_disclosure', 'prior_possession'], ARRAY['non_disclosure_agreements', 'legal_compliance', 'information_protection']),
('550e8400-e29b-41d4-a716-446655441004', 'non_disclosure', 'Employee Access and Liability', 'Confidential information may only be shared with employees having need-to-know for the purpose, who are under similar confidentiality obligations, with party being liable for any disclosure by employees or affiliates.', ARRAY['employee_access', 'need_to_know', 'liability', 'confidentiality_training'], ARRAY['non_disclosure_agreements', 'employee_management', 'information_access']),
('550e8400-e29b-41d4-a716-446655441005', 'restrictions', 'Client Solicitation and Business Association Restrictions', 'Parties shall not approach each other''s clients for whom services were delivered, and may use association only for the specified business purpose under the agreement.', ARRAY['client_protection', 'solicitation_restrictions', 'business_association', 'competitive_protection'], ARRAY['non_disclosure_agreements', 'business_protection', 'client_relationships']),
('550e8400-e29b-41d4-a716-446655441006', 'publications', 'Publication and Publicity Restrictions', 'Neither party may make news releases, public announcements, advertisements, or use other party''s materials in promotional content without prior written approval.', ARRAY['publication_restrictions', 'publicity_control', 'promotional_materials', 'public_announcements'], ARRAY['non_disclosure_agreements', 'publicity_management', 'brand_protection']),
('550e8400-e29b-41d4-a716-446655441007', 'intellectual_property', 'Intellectual Property Rights Retention', 'Disclosing party retains all intellectual property rights in confidential information, with no license granted and requirements to preserve all proprietary notices and marks.', ARRAY['intellectual_property', 'proprietary_rights', 'no_license', 'trademark_protection'], ARRAY['non_disclosure_agreements', 'intellectual_property_protection', 'licensing_agreements']),
('550e8400-e29b-41d4-a716-446655441008', 'return', 'Return and Destruction of Information', 'Upon demand, receiving party must cease use, return or destroy all confidential information and copies within seven days, and certify compliance in writing.', ARRAY['information_return', 'destruction_requirements', 'cessation_of_use', 'compliance_certification'], ARRAY['non_disclosure_agreements', 'information_management', 'contract_termination']),
('550e8400-e29b-41d4-a716-446655441009', 'remedies', 'Injunctive Relief and Equitable Remedies', 'Parties acknowledge breach may cause irreparable harm for which monetary damages are inadequate, entitling affected party to specific performance and injunctive relief in addition to other remedies.', ARRAY['injunctive_relief', 'irreparable_harm', 'specific_performance', 'equitable_remedies'], ARRAY['non_disclosure_agreements', 'breach_remedies', 'contract_enforcement']),
('550e8400-e29b-41d4-a716-446655441010', 'dispute_resolution', 'Mediation and Arbitration Process', 'Disputes shall be first mediated in good faith with shared costs, and if mediation fails, settled by arbitration under Indian Arbitration and Conciliation Act with sole arbitrator proceedings in English.', ARRAY['mediation', 'arbitration', 'dispute_resolution', 'indian_arbitration_law'], ARRAY['non_disclosure_agreements', 'dispute_resolution', 'alternative_dispute_resolution']);

-- Insert contract parameters
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES
('550e8400-e29b-41d4-a716-446655441101', 'mutual_nda', 'execution_day', 'Day of Execution', 'text', true, 'Day of the month when agreement is executed', '15th', NULL),
('550e8400-e29b-41d4-a716-446655441102', 'mutual_nda', 'execution_month', 'Month of Execution', 'text', true, 'Month when the agreement is executed', 'March', NULL),
('550e8400-e29b-41d4-a716-446655441103', 'mutual_nda', 'execution_year', 'Year of Execution', 'text', true, 'Year when the agreement is executed', '2024', NULL),
('550e8400-e29b-41d4-a716-446655441104', 'mutual_nda', 'first_party_name', 'First Party Name', 'text', true, 'Name of the first party', 'ABC Technologies Pvt. Ltd.', NULL),
('550e8400-e29b-41d4-a716-446655441105', 'mutual_nda', 'first_party_address', 'First Party Address', 'text', true, 'Complete address of the first party', '123 Tech Park, Electronic City, Bengaluru - 560100', NULL),
('550e8400-e29b-41d4-a716-446655441106', 'mutual_nda', 'first_party_representative', 'First Party Representative', 'text', true, 'Authorized representative of the first party', 'Mr. Rajesh Kumar, Managing Director', NULL),
('550e8400-e29b-41d4-a716-446655441107', 'mutual_nda', 'second_party_name', 'Second Party Name', 'text', true, 'Name of the second party', 'XYZ Solutions Pvt. Ltd.', NULL),
('550e8400-e29b-41d4-a716-446655441108', 'mutual_nda', 'second_party_address', 'Second Party Address', 'text', true, 'Complete address of the second party', '456 Business Center, Koramangala, Bengaluru - 560034', NULL),
('550e8400-e29b-41d4-a716-446655441109', 'mutual_nda', 'second_party_representative', 'Second Party Representative', 'text', true, 'Authorized representative of the second party', 'Ms. Priya Sharma, Chief Executive Officer', NULL),
('550e8400-e29b-41d4-a716-446655441110', 'mutual_nda', 'arbitration_location', 'Arbitration Location', 'text', true, 'City where arbitration hearings will be held', 'Bengaluru', NULL),
('550e8400-e29b-41d4-a716-446655441111', 'mutual_nda', 'jurisdiction_location', 'Jurisdiction Location', 'text', true, 'City/location for court jurisdiction', 'Bengaluru', NULL);

-- ========================================
-- End of Template 12: Mutual Non-Disclosure Agreement
-- ========================================

-- Template 13: Confidentiality and Non-Compete Agreement
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES
('550e8400-e29b-41d4-a716-446655440013', 'confidentiality_non_compete', 'Confidentiality and Non-Compete Agreement', 'Comprehensive confidentiality and non-compete agreement for employees with detailed provisions for non-competition restrictions, confidentiality obligations, affiliate definitions, client protection, and indemnification requirements designed to protect employer business interests', 'employment', 'india', ARRAY['confidentiality', 'non_compete', 'employment', 'trade_secrets', 'business_protection', 'employee_restrictions']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES
('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440013', 'preamble', 'Parties and Background', 'This Agreement is entered into on this ____ day of ____ at ____ between: ____, a Company incorporated under the Companies Act, 1956/2013 with its office at ____ through its Managing Director ____ (hereinafter referred to as the EMPLOYER) AND ____ (hereinafter referred to as the EMPLOYEE). The aforesaid Parties to this Agreement shall jointly be referred to as the ''PARTIES''. WHEREAS the employee has accepted employment with the employer vide Acceptance Letter dated ____; AND WHEREAS as part of the employment negotiations it was specifically agreed between the Parties that it was an essential and integral term that a separate confidentiality and non-compete agreement would be executed between the Parties.', '["execution_day", "execution_month", "execution_place", "employer_company_name", "employer_office_address", "managing_director_name", "employee_name", "acceptance_letter_date"]', 1, false),
('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440013', 'definitions', 'Definitions', 'For the purpose of this Agreement, the following expressions shall have the meaning specified hereunder: ''Agreement'' shall mean this Non Compete and Confidentiality Agreement or any modifications or amendment thereto; ''Affiliate'' shall mean, when referring to the Employee and Employer, any individual, partnership, joint venture, company or any legal entity or person which: is directly or indirectly under the control of either Party, or; is directly or indirectly under common control with either Party, or Ultimately controls either Party. For the purpose of this Agreement, "control" with respect to a company means (i) ownership of 50% or more of the voting rights of the company or (ii) the power to direct the management of the company, or to appoint a majority of the directors of the company, whether such power results from ownership of shares, or from a contract or otherwise. "Employer" shall mean ____, a Company incorporated under the Companies Act, 1956 / 2013 with its office at ____ including its successors and assigns. "Employee" shall mean and refer to ____. "Employer''s business" shall mean and include amongst other things, the business of ____. "Relative (s)" shall have the meaning as set out under the Companies Act, 1956/2013.', '["employer_definition", "employer_office_definition", "employee_definition", "employer_business_definition"]', 2, false),
('550e8400-e29b-41d4-a716-446655440903', '550e8400-e29b-41d4-a716-446655440013', 'non_competition', 'Non-Competition Obligations', 'The Employee undertakes to the Employer that he/she shall not and shall ensure that none of his/her Affiliates shall, either on his/her own account or in association with others engage or participate directly or indirectly, whether as shareholder, director, partner, proprietor, member, agent, distributor, employee or otherwise, within India or outside India, during the period of his/his employment in whatever capacity with the Employer and for a further period of 1 (One) Year from the date of ceasing to be in such employment, for whatever reasons: (a) In any business which, involves, relates to or competes with the Employer''s Business; (b) Establish, develop, carry on or assist in carrying on or be engaged, concerned, interested or employed in any business enterprise or venture competing with the Employer''s Business.', '[]', 3, false),
('550e8400-e29b-41d4-a716-446655440904', '550e8400-e29b-41d4-a716-446655440013', 'non_competition', 'Client and Employee Solicitation Restrictions', 'The Employee shall not: solicit, canvas or entice away (or Endeavour to solicit, canvass or entice away) from the Employer''s Business, or from any Affiliate of the Employer, any person, firm or company who was at any time during the period of one year immediately preceding the date of cessation of employment, a client of the Employer''s Business, for the purpose of offering to such client or customer, goods or services similar to or competing with those of the Employer''s Business; solicit, canvass or entice away (or endeavour to solicit, canvass or entice away) any of the employees including the senior employees and/or technical or sales and marketing staff from the Employer or from any of its Affiliates, for the purpose of employment in an enterprise or venture competing with the Employer''s Business.', '[]', 4, false),
('550e8400-e29b-41d4-a716-446655440905', '550e8400-e29b-41d4-a716-446655440013', 'non_competition', 'Supplier and Advisory Restrictions', 'The Employee shall not: solicit, canvass, or entice away (or endeavor to solicit canvass or entice away) any supplier of the Employer or of any of its Affiliates or use its knowledge of or influence over any such supplier to or for its benefit or for the benefit of any other person carrying on business competing with the Employer''s business or with any business of the Employer''s Affiliates; act as an advisor, consultant, trustee or agent for any third person who is engaged or proposes to start any business which directly or indirectly relates to the Employer''s business or promote, start, engage in or do any business that directly or indirectly relates to the Employer''s Business.', '[]', 5, false),
('550e8400-e29b-41d4-a716-446655440906', '550e8400-e29b-41d4-a716-446655440013', 'non_competition', 'Name Usage Restrictions', 'Establish after the execution hereof at any future point of time any business or trade under a name that is identical or similar to ''____'' or which in any way suggests any connection with ''____'' without written consent of the Employer. For the purposes of clarification, it is agreed by the Parties that the obligation, not to use a name which is identical or similar to "____" shall not be limited to the term/ period referred to in Section 2.1 above, in which case this restraint will have effect for an indefinite period.', '["company_name_1", "company_name_2", "company_name_3"]', 6, false),
('550e8400-e29b-41d4-a716-446655440907', '550e8400-e29b-41d4-a716-446655440013', 'non_competition', 'Separate Covenants and Relatives', 'Each of the above covenants shall be construed as a separate covenant and if one or more of the covenants is held to be unlawful, the remaining covenants shall continue to bind the Employee and their Affiliates. It is expressly agreed by the Parties hereto that the Employer''s obligations under this Agreement shall include that the Employee shall not directly or indirectly in any manner whatsoever undertake any competing Business through his Relatives. However this clause shall not be read and understood to constitute a bar on a relative of the Employee acting purely in the capacity of an employee for a competing business. The Employee shall promptly inform the Employer as and when he has knowledge of the fact that any of his Relatives are undertaking or propose to undertake any competing Business.', '[]', 7, false),
('550e8400-e29b-41d4-a716-446655440908', '550e8400-e29b-41d4-a716-446655440013', 'non_competition', 'Competing Business Definition', 'For the purpose of this Section, the expression "competing with the Employer''s Business" or Competing Business" shall be deemed to include the following: (a) setting up, promoting or investing in a business, venture, activity or company which entails or proposes to compete against the business of the Employer by inter alia offering same or similar Service as are offered or proposed to be offered by the Employer and/or its Affiliate. (b) entering into any agreement or arrangement, with any third party which results or is likely to result in making available same or similar services as are offered or proposed to be offered by the Employer and/or its Affiliate; (c) entering into any agreement with any third party for the transfer of business knowledge or information to any third party so as to offer the third party an opportunity to compete with the Service and business of the Employer.', '[]', 8, false),
('550e8400-e29b-41d4-a716-446655440909', '550e8400-e29b-41d4-a716-446655440013', 'consideration', 'Consideration', 'In consideration of the emoluments agreed to be paid to the Employee by the employer, the Employee has agreed to assume the obligations set out in this Agreement.', '[]', 9, false),
('550e8400-e29b-41d4-a716-446655440910', '550e8400-e29b-41d4-a716-446655440013', 'confidentiality', 'Confidentiality Obligations', 'The Employee hereby undertakes that he shall, and shall cause their representatives and Affiliates to, treat any information (i) related to the Employer''s Business, (ii) the information ("Confidential Information") received from the Employer or from any of the Employer''s Affiliates as strictly confidential and that they shall refrain from making any disclosure to anybody for whatever purpose such Confidential Information, unless such Confidential Information is in the public domain through no fault of the Employee or their representatives or of any of their Affiliates. None of the Parties hereto shall disclose the contents of this Agreement to any third party without the prior consent of the other party, except to the extent of any disclosure which might be required to be made under any statutory or other applicable regulation or by the effect of a court order / administrative order.', '[]', 10, false),
('550e8400-e29b-41d4-a716-446655440911', '550e8400-e29b-41d4-a716-446655440013', 'warranties', 'Employee Warranties', 'The Employee represents and warrants that by entering into this Agreement, the Employee is not, and shall not be deemed to be, in default or breach of any of his duties or obligations to any person.', '[]', 11, false),
('550e8400-e29b-41d4-a716-446655440912', '550e8400-e29b-41d4-a716-446655440013', 'indemnities', 'Employee Indemnification', 'The Employee shall indemnify and keep indemnified the Employer, its directors, officers, shareholders, and agents from and against and in respect of any and all losses, liabilities and/ or damages, resulting from (a) Any misrepresentation, breach of warranty or obligation or non-fulfillment of any obligations or covenants on the part of the Employee or its affiliates under this Agreement, and (b) all actions, suits, proceedings, claims, demands, judgments, costs and expenses on a full indemnity basis, incidental to any of the foregoing or incurred in investigating or attempting to avoid contest or defer the same or enforcing any of the rights of the Employer under this Agreement.', '[]', 12, false),
('550e8400-e29b-41d4-a716-446655440913', '550e8400-e29b-41d4-a716-446655440013', 'governing_law', 'Governing Law and Arbitration', 'This Agreement shall be governed by and construed in accordance with the laws of India. The Parties hereto agree that they shall use all reasonable efforts to resolve between themselves any disputes, controversy or claim arising out of or relating to this Agreement in an amicable manner. In particular the Parties agree that discussions will be carried out between senior level officers of the Employer and the Employee to a maximum period of forty-five (45) days from the date that written notice of the details of the issue in dispute, controversy or claim shall have been given by one Party to the other. In the event the efforts and discussions described in Clause 7.2 fail to resolve the matter, such dispute, controversy or claim shall be settled by arbitration in accordance with the Indian Arbitration and Conciliation Act, 1996, and any statutory modification or re enactment thereof. It is further agreed that the place of arbitration shall be New Delhi and the Arbitrator shall be appointed mutually by the Parties. The decision of the arbitrator shall be final and binding upon the Parties.', '[]', 13, false),
('550e8400-e29b-41d4-a716-446655440914', '550e8400-e29b-41d4-a716-446655440013', 'general', 'General Provisions', 'Waiver by any Party of any default with respect to any provision, condition or requirement hereof, any delay or omission of any Party to exercise any right hereunder on any one occasion shall not in any manner impair the exercise of any invalidity of such right on any other occasion. If any of the provisions of this Agreement become invalid, illegal or unenforceable in any respects under any applicable law, the validity, legality and enforceability of the remaining provisions shall not in any way be affected or impaired. Where the provisions of such applicable law may be waived, they are hereby waived by the Parties to the full extent permitted so that this Agreement shall be deemed to be valid and binding and enforceable in accordance with its terms. The parties acknowledge that this Agreement constitutes the entire agreement between the Parties in respect of the matters hereby contemplated. All previous communications, either oral or written, between the Parties hereto with respect to the subject matter hereof are hereby superseded. All notices require or permitted hereunder shall be in writing and in the English language and shall be sent by recognized courier or by facsimile transmission address to the address of each Party set forth above, or to such other address as such other Party shall have communicated to the other Party. Any variation of this Agreement shall be mutually agreed in writing and executed by or on behalf of each of the Parties.', '[]', 14, false);

-- Insert reusable contract clauses
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES
('550e8400-e29b-41d4-a716-446655441001', 'definitions', 'Comprehensive Control and Affiliate Definitions', 'Control means ownership of 50% or more voting rights or power to direct management. Affiliate includes entities under control, common control, or ultimate control of either party.', ARRAY['control_definition', 'affiliate_definition', 'corporate_structure', 'ownership_control'], ARRAY['employment_agreements', 'non_compete_agreements', 'corporate_law']),
('550e8400-e29b-41d4-a716-446655441002', 'non_competition', 'Comprehensive Non-Competition Restrictions', 'Employee shall not compete with employer''s business during employment and for one year after, including direct/indirect participation as shareholder, director, partner, or employee in competing business.', ARRAY['non_compete', 'employment_restrictions', 'business_competition', 'post_employment_restraint'], ARRAY['employment_agreements', 'non_compete_agreements', 'business_protection']),
('550e8400-e29b-41d4-a716-446655441003', 'non_competition', 'Client and Employee Solicitation Prohibitions', 'Employee prohibited from soliciting employer''s clients from past year for competing services, and from soliciting employer''s employees for competing ventures.', ARRAY['client_solicitation', 'employee_solicitation', 'competitive_restrictions', 'business_protection'], ARRAY['employment_agreements', 'client_protection', 'employee_retention']),
('550e8400-e29b-41d4-a716-446655441004', 'non_competition', 'Supplier and Advisory Service Restrictions', 'Employee cannot solicit employer''s suppliers or act as advisor/consultant for competing businesses, protecting employer''s business relationships and competitive position.', ARRAY['supplier_protection', 'advisory_restrictions', 'business_relationships', 'competitive_advantage'], ARRAY['employment_agreements', 'business_protection', 'supplier_relationships']),
('550e8400-e29b-41d4-a716-446655441005', 'non_competition', 'Perpetual Name Usage Restrictions', 'Employee cannot use identical or similar business name suggesting connection with employer, with this restriction applying indefinitely beyond employment period.', ARRAY['name_usage', 'trademark_protection', 'business_identity', 'perpetual_restriction'], ARRAY['employment_agreements', 'trademark_protection', 'business_identity']),
('550e8400-e29b-41d4-a716-446655441006', 'non_competition', 'Relatives and Separate Covenants', 'Employee cannot undertake competing business through relatives, must inform employer of relatives'' competing activities, with each covenant being severable if others become unenforceable.', ARRAY['relative_restrictions', 'separate_covenants', 'family_business', 'covenant_severability'], ARRAY['employment_agreements', 'non_compete_agreements', 'family_law']),
('550e8400-e29b-41d4-a716-446655441007', 'confidentiality', 'Strict Confidentiality and Agreement Non-Disclosure', 'Employee must treat all employer business information as strictly confidential unless in public domain, and cannot disclose agreement contents except as legally required.', ARRAY['confidentiality', 'trade_secrets', 'business_information', 'agreement_confidentiality'], ARRAY['employment_agreements', 'confidentiality_agreements', 'trade_secret_protection']),
('550e8400-e29b-41d4-a716-446655441008', 'warranties', 'Employee Non-Conflict Warranty', 'Employee warrants that entering agreement does not create default or breach of duties to any other person, ensuring clean slate for employment relationship.', ARRAY['non_conflict_warranty', 'employee_representations', 'clean_slate', 'duty_compliance'], ARRAY['employment_agreements', 'conflict_of_interest', 'employee_warranties']),
('550e8400-e29b-41d4-a716-446655441009', 'indemnities', 'Comprehensive Employee Indemnification', 'Employee indemnifies employer for losses from breach of agreement obligations and all related legal costs, actions, and proceedings on full indemnity basis.', ARRAY['employee_indemnification', 'breach_consequences', 'legal_costs', 'full_indemnity'], ARRAY['employment_agreements', 'indemnification_clauses', 'legal_protection']),
('550e8400-e29b-41d4-a716-446655441010', 'dispute_resolution', 'Amicable Resolution and Delhi Arbitration', 'Parties must attempt amicable resolution for 45 days through senior officer discussions before arbitration in New Delhi under Indian Arbitration Act with mutually appointed arbitrator.', ARRAY['amicable_resolution', 'delhi_arbitration', 'senior_officer_discussions', 'indian_arbitration_law'], ARRAY['employment_agreements', 'dispute_resolution', 'arbitration_agreements']);

-- Insert contract parameters
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES
('550e8400-e29b-41d4-a716-446655441101', 'confidentiality_non_compete', 'execution_day', 'Day of Execution', 'text', true, 'Day of the month when agreement is executed', '15th', NULL),
('550e8400-e29b-41d4-a716-446655441102', 'confidentiality_non_compete', 'execution_month', 'Month of Execution', 'text', true, 'Month when the agreement is executed', 'April', NULL),
('550e8400-e29b-41d4-a716-446655441103', 'confidentiality_non_compete', 'execution_place', 'Place of Execution', 'text', true, 'City where the agreement is executed', 'Bengaluru', NULL),
('550e8400-e29b-41d4-a716-446655441104', 'confidentiality_non_compete', 'employer_company_name', 'Employer Company Name', 'text', true, 'Full legal name of the employer company', 'TechCorp Solutions Pvt. Ltd.', NULL),
('550e8400-e29b-41d4-a716-446655441105', 'confidentiality_non_compete', 'employer_office_address', 'Employer Office Address', 'text', true, 'Complete address of employer''s office', 'Electronic City Phase 1, Bengaluru - 560100', NULL),
('550e8400-e29b-41d4-a716-446655441106', 'confidentiality_non_compete', 'managing_director_name', 'Managing Director Name', 'text', true, 'Name of the managing director', 'Mr. Rajesh Kumar', NULL),
('550e8400-e29b-41d4-a716-446655441107', 'confidentiality_non_compete', 'employee_name', 'Employee Name', 'text', true, 'Full name of the employee', 'Priya Sharma', NULL),
('550e8400-e29b-41d4-a716-446655441108', 'confidentiality_non_compete', 'acceptance_letter_date', 'Acceptance Letter Date', 'date', true, 'Date of employee''s acceptance letter', '2024-03-15', NULL),
('550e8400-e29b-41d4-a716-446655441109', 'confidentiality_non_compete', 'employer_definition', 'Employer Definition', 'text', true, 'Legal definition of employer for agreement', 'TechCorp Solutions Pvt. Ltd.', NULL),
('550e8400-e29b-41d4-a716-446655441110', 'confidentiality_non_compete', 'employer_office_definition', 'Employer Office Definition', 'text', true, 'Office address for employer definition', 'Electronic City Phase 1, Bengaluru - 560100', NULL),
('550e8400-e29b-41d4-a716-446655441111', 'confidentiality_non_compete', 'employee_definition', 'Employee Definition', 'text', true, 'Employee identification for agreement', 'Priya Sharma', NULL),
('550e8400-e29b-41d4-a716-446655441112', 'confidentiality_non_compete', 'employer_business_definition', 'Employer Business Definition', 'text', true, 'Description of employer''s business activities', 'Software development, IT consulting, and technology solutions', NULL),
('550e8400-e29b-41d4-a716-446655441113', 'confidentiality_non_compete', 'company_name_1', 'Company Name 1', 'text', true, 'First instance of company name for restrictions', 'TechCorp Solutions', NULL),
('550e8400-e29b-41d4-a716-446655441114', 'confidentiality_non_compete', 'company_name_2', 'Company Name 2', 'text', true, 'Second instance of company name for restrictions', 'TechCorp Solutions', NULL),
('550e8400-e29b-41d4-a716-446655441115', 'confidentiality_non_compete', 'company_name_3', 'Company Name 3', 'text', true, 'Third instance of company name for restrictions', 'TechCorp Solutions', NULL);

-- ========================================
-- End of Template 13: Confidentiality and Non-Compete Agreement
-- ========================================

-- Template 14: Non-Disclosure Agreement
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES
('550e8400-e29b-41d4-a716-446655440014', 'standard_nda', 'Non-Disclosure Agreement', 'Standard non-disclosure agreement for business discussions and potential transactions with comprehensive confidentiality provisions, information protection, return obligations, indemnification clauses, and arbitration dispute resolution for proprietary business information exchange', 'confidentiality', 'india', ARRAY['non_disclosure', 'confidentiality', 'business_discussions', 'proprietary_information', 'trade_secrets', 'information_protection']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES
('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440014', 'preamble', 'Parties and Date', 'This Agreement made on this the ____ day of ____, 2016 By and Between ____, a company incorporated under the Companies Act, 1956 and having its registered office at ____ (hereinafter referred to as "____", which expression shall unless repugnant to the context or meaning thereof, include its successors in interests and assigns) of the one part; And ____ a company incorporated under the Companies Act, 2013 and having its registered office at ____ (hereinafter referred to as "Company" which expression shall, unless repugnant to the context or meaning thereof, be deemed to include, its representatives and permitted assigns) of the Other part; PARTY 1 and COMPANY shall hereinafter be referred to as such or collectively as "Parties" and individually as "Party".', '["execution_day", "execution_month", "party1_name", "party1_address", "party1_reference", "company_name", "company_address"]', 1, false),
('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440014', 'recitals', 'Background and Purpose', 'WHEREAS both the Parties herein wish to pursue discussions and negotiate with each other for the purpose of entering into a potential business arrangement in relation to ____ ("Proposed Transaction"); AND WHEREAS the Parties contemplate that with respect to the Proposed Transaction, both the Parties may exchange certain information, material and documents relating to each other''s business, assets, financial condition, operations, plans and/or prospects of their businesses (hereinafter referred to as "Confidential Information", more fully detailed in clause 1 herein below) that each Party regards as proprietary and confidential; and AND WHEREAS, each Party wishes to review such Confidential Information of the other for the sole purpose of determining their mutual interest in engaging in the Proposed Transaction.', '["proposed_transaction_details"]', 2, false),
('550e8400-e29b-41d4-a716-446655440903', '550e8400-e29b-41d4-a716-446655440014', 'definitions', 'Confidential Information Definition', '"Confidential and or proprietary Information" shall mean and include any information disclosed by one Party (Disclosing Party) to the other (Receiving Party) either directly or indirectly, in writing, orally, by inspection of tangible objects (including, without limitation, documents, prototypes, samples, media, documentation, discs and code). Confidential information shall include, without limitation, any materials, trade secrets, network information, configurations, trademarks, brand name, know-how, business and marketing plans, financial and operational information, and all other non-public information, material or data relating to the current and/ or future business and operations of the Disclosing Party and analysis, compilations, studies, summaries, extracts or other documentation prepared by the Disclosing Party. Confidential Information may also include information disclosed to the Receiving Party by third parties on behalf of the Disclosing Party.', '[]', 3, false),
('550e8400-e29b-41d4-a716-446655440904', '550e8400-e29b-41d4-a716-446655440014', 'non_disclosure', 'Non-Disclosure and Protection Obligations', 'The Receiving Party shall refrain from disclosing, reproducing, summarising and/or distributing Confidential Information and confidential materials of the Disclosing Party except in connection with the Proposed Transaction. The Parties shall protect the confidentiality of each other''s Confidential Information in the same manner as they protect the confidentiality of their own proprietary and confidential information of similar nature. Each Party, while acknowledging the confidential and proprietary nature of the Confidential Information agrees to take all reasonable measures at its own expense to restrain its representatives from prohibited or unauthorised disclosure or use of the Confidential Information.', '[]', 4, false),
('550e8400-e29b-41d4-a716-446655440905', '550e8400-e29b-41d4-a716-446655440014', 'ownership', 'Ownership and Copying Restrictions', 'Confidential Information shall at all times remain the property of the Disclosing Party and may not be copied or reproduced by the Receiving Party without the Disclosing Party''s prior written consent.', '[]', 5, false),
('550e8400-e29b-41d4-a716-446655440906', '550e8400-e29b-41d4-a716-446655440014', 'return', 'Return and Destruction of Information', 'Within seven (7) days of a written request by the Disclosing Party, the Receiving Party shall return/destroy (as may be requested in writing by the Disclosing Party or upon expiry and or earlier termination) all originals, copies, reproductions and summaries of Confidential Information provided to the Receiving Party as Confidential Information. The Receiving Party shall certify to the Disclosing Party in writing that it has satisfied its obligations under this paragraph.', '[]', 6, false),
('550e8400-e29b-41d4-a716-446655440907', '550e8400-e29b-41d4-a716-446655440014', 'access_control', 'Employee and Consultant Access', 'The Receiving Party may disclose the Confidential Information only to the Receiving Party''s employees and consultants on a need-to-know basis. The Receiving Party shall have executed or shall execute appropriate written agreements with third parties, in a form and manner sufficient to enable the Receiving Party to enforce all the provisions of this Agreement.', '[]', 7, false),
('550e8400-e29b-41d4-a716-446655440908', '550e8400-e29b-41d4-a716-446655440014', 'exceptions', 'Confidentiality Exceptions', 'Confidential Information, however, shall not include any information which the Receiving Party can show: (i) is in or comes into the public domain otherwise than through a breach of this Agreement or the fault of the Receiving Party; or (ii) was already in its possession free of any such restriction prior to receipt from the Disclosing Party; or (iii) was independently developed by the Receiving Party without making use of the Confidential Information; or (iv) has been approved for release or use (in either case without restriction) by written authorisation of the Disclosing Party.', '[]', 8, false),
('550e8400-e29b-41d4-a716-446655440909', '550e8400-e29b-41d4-a716-446655440014', 'legal_disclosure', 'Legal Disclosure Requirements', 'In the event either Party receives a summons or other validly issued administrative or judicial process requiring the disclosure of Confidential Information of the other Party, the Receiving Party shall promptly notify the Disclosing Party. The Receiving Party may disclose Confidential Information to the extent such disclosure is required by law, rule, regulation or legal process; provided however, that, to the extent practicable, the Receiving Party shall give prompt written notice of any such request for such information to the Disclosing Party, and agrees to co-operate with the Disclosing Party, at the Disclosing Party''s expense, to the extent permissible and practicable, to challenge the request or limit the scope there of, as the Disclosing Party may reasonably deem appropriate.', '[]', 9, false),
('550e8400-e29b-41d4-a716-446655440910', '550e8400-e29b-41d4-a716-446655440014', 'publicity', 'Name Usage and Publicity Restrictions', 'Neither Party shall use the other''s name, trademarks, proprietary words or symbols or disclose under this Agreement in any publication, press release, marketing material, or otherwise without the prior written approval of the other.', '[]', 10, false),
('550e8400-e29b-41d4-a716-446655440911', '550e8400-e29b-41d4-a716-446655440014', 'remedies', 'Injunctive Relief and Remedies', 'Each Party agrees that the conditions in this Agreement and the Confidential Information disclosed pursuant to this Agreement are of a special, unique, and extraordinary character and that an impending or existing violation of any provision of this Agreement would cause the other Party irreparable injury for which it would have no adequate remedy at law and further agrees that the other Party shall be entitled to obtain immediately injunctive relief prohibiting such violation, in addition to any other rights and remedies available to it at law or in equity.', '[]', 11, false),
('550e8400-e29b-41d4-a716-446655440912', '550e8400-e29b-41d4-a716-446655440014', 'indemnification', 'Indemnification and Damages', 'The Receiving Party shall indemnify the Disclosing Party for all costs, expenses or damages that Disclosing Party incurs as a result of any violation of any provisions of this Agreement. This obligation shall include court, litigation expenses, and actual, reasonable attorney''s fees. The Parties acknowledge that as damages may not be a sufficient remedy for any breach under this Agreement, the non-breaching party is entitled to seek specific performance or injunctive relief (as appropriate) as a remedy for any breach or threatened breach, in addition to any other remedies at law or in equity.', '[]', 12, false),
('550e8400-e29b-41d4-a716-446655440913', '550e8400-e29b-41d4-a716-446655440014', 'limitations', 'Damage Limitations', 'Neither Party shall be liable for any special, consequential, incidental or exemplary damages or loss (or any lost profits, savings or business opportunity) regardless of whether a Party was advised of the possibility of the damage or loss asserted.', '[]', 13, false),
('550e8400-e29b-41d4-a716-446655440914', '550e8400-e29b-41d4-a716-446655440014', 'disclosure_rights', 'Voluntary Disclosure Rights', 'Both the Parties agree that by virtue of the Parties entering into this Agreement neither Party is obligated to disclose all or any of the Confidential Information to the other as stated in this Agreement. The Parties reserve the right to disclose only such information at its discretion and which it thinks, is necessary to disclose in relation to the Proposed Transaction.', '[]', 14, false),
('550e8400-e29b-41d4-a716-446655440915', '550e8400-e29b-41d4-a716-446655440014', 'term', 'Agreement Term and Survival', 'Both the Parties agree that this Agreement will be effective from the date of execution of this Agreement by both Parties and shall continue to be effective till the Proposed Transaction is terminated by either Party by giving a thirty (30) days notice, in case either Party foresees that the Proposed Transaction would not be achieved. Notwithstanding anything contained herein, the provisions of this Agreement shall survive and continue after expiration or termination of this Agreement for a further period of five year(s) from the date of expiration. It being further clarified that notwithstanding anything contained herein, in case a binding agreement is executed between the Parties in furtherance of the Proposed Transaction, the terms and conditions of this Agreement shall become effective and form a part of that binding agreement and be co-terminus with such binding agreement and shall be in effect till the term of such binding agreement and shall after its expiry and or early termination shall continue to be in force in the following manner: ____ years after the termination of the binding agreement ____ years after the expiry of the binding agreement (whichever is earlier).', '["survival_years_termination", "survival_years_expiry"]', 15, false),
('550e8400-e29b-41d4-a716-446655440916', '550e8400-e29b-41d4-a716-446655440014', 'authority', 'Authority and Enforceability', 'Each Party warrants that it has the authority to enter into this Agreement. If any provision of this agreement is held to be invalid or unenforceable to any extent, the remainder of this Agreement shall not be affected and each provision hereof shall be valid and enforceable to the fullest extent permitted by law. Any invalid or unenforceable provision of this Agreement shall be replaced with a provision that is valid and enforceable and most nearly reflects the original intent of the unenforceable provision.', '[]', 16, false),
('550e8400-e29b-41d4-a716-446655440917', '550e8400-e29b-41d4-a716-446655440014', 'execution', 'Execution and Relationship', 'This Agreement may be executed in two counterparts, each of which will be deemed to be an original, and all of which, when taken together, shall be deemed to constitute one and the same agreement. The relationship between both the Parties to this Agreement shall be on a principal-to-principal basis and nothing in this agreement shall be deemed to have created a relationship of an agent or partner between the Parties and none of the employees of COMPANY shall be considered as employees of PARTY 1.', '[]', 17, false),
('550e8400-e29b-41d4-a716-446655440918', '550e8400-e29b-41d4-a716-446655440014', 'governing_law', 'Governing Law and Dispute Resolution', 'This Agreement shall be governed by the laws of India. Both parties irrevocably submit to the exclusive jurisdiction of the Courts in Bangalore, for any action or proceeding regarding this Agreement. Any dispute or claim arising out of or in connection herewith, or the breach, termination or invalidity thereof, shall be settled by arbitration in accordance with the provisions of Procedure of the Indian Arbitration & Conciliation Act, 1996, including any amendments thereof. The arbitration tribunal shall be composed of a sole arbitrator, and such arbitrator shall be appointed mutually by the Parties. The place of arbitration shall be Bangalore, India and the arbitration proceedings shall take place in the English language.', '[]', 18, false),
('550e8400-e29b-41d4-a716-446655440919', '550e8400-e29b-41d4-a716-446655440014', 'modifications', 'Modifications and Assignment', 'Additional oral agreements do not exist. All modifications and amendments to this Agreement must be made in writing. The Agreement and/or any rights arising from it cannot be assigned or otherwise transferred either wholly or in part, without the written consent of the other Party.', '[]', 19, false);

-- Insert reusable contract clauses
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES
('550e8400-e29b-41d4-a716-446655441001', 'definitions', 'Comprehensive Confidential Information Scope', 'Confidential information includes all materials, trade secrets, network information, trademarks, business plans, financial data, and any non-public information relating to current or future business operations, including third-party information.', ARRAY['confidential_information', 'trade_secrets', 'business_data', 'proprietary_information'], ARRAY['non_disclosure_agreements', 'business_negotiations', 'information_protection']),
('550e8400-e29b-41d4-a716-446655441002', 'non_disclosure', 'Standard Confidentiality Protection Requirements', 'Receiving party shall protect confidential information with same care as own proprietary information, refrain from disclosure except for proposed transaction, and take reasonable measures to prevent unauthorized disclosure by representatives.', ARRAY['confidentiality_protection', 'care_standards', 'representative_obligations', 'disclosure_restrictions'], ARRAY['non_disclosure_agreements', 'information_security', 'business_protection']),
('550e8400-e29b-41d4-a716-446655441003', 'return', 'Seven-Day Return and Certification Requirement', 'Within seven days of written request, receiving party must return or destroy all confidential information and provide written certification of compliance with return obligations.', ARRAY['information_return', 'seven_day_requirement', 'destruction_option', 'compliance_certification'], ARRAY['non_disclosure_agreements', 'information_management', 'contract_termination']),
('550e8400-e29b-41d4-a716-446655441004', 'access_control', 'Need-to-Know Employee Access Control', 'Confidential information may only be disclosed to employees and consultants on need-to-know basis, with receiving party executing appropriate written agreements to enforce all provisions.', ARRAY['need_to_know', 'employee_access', 'consultant_agreements', 'access_control'], ARRAY['non_disclosure_agreements', 'information_access', 'employee_management']),
('550e8400-e29b-41d4-a716-446655441005', 'exceptions', 'Standard Confidentiality Exceptions', 'Exceptions include information in public domain without breach, rightfully possessed without restriction, independently developed, or approved for release by disclosing party.', ARRAY['public_domain', 'prior_possession', 'independent_development', 'authorized_release'], ARRAY['non_disclosure_agreements', 'legal_protection', 'information_classification']),
('550e8400-e29b-41d4-a716-446655441006', 'legal_disclosure', 'Legal Process Disclosure Protection', 'When legal disclosure required, receiving party must promptly notify disclosing party and cooperate to challenge or limit scope of disclosure at disclosing party''s expense.', ARRAY['legal_disclosure', 'notification_requirement', 'disclosure_limitation', 'cooperative_defense'], ARRAY['non_disclosure_agreements', 'legal_compliance', 'disclosure_protection']),
('550e8400-e29b-41d4-a716-446655441007', 'remedies', 'Irreparable Harm and Injunctive Relief', 'Parties acknowledge breach causes irreparable injury requiring immediate injunctive relief due to special and extraordinary character of confidential information, in addition to other legal remedies.', ARRAY['irreparable_harm', 'injunctive_relief', 'extraordinary_character', 'immediate_protection'], ARRAY['non_disclosure_agreements', 'breach_remedies', 'legal_enforcement']),
('550e8400-e29b-41d4-a716-446655441008', 'indemnification', 'Comprehensive Indemnification for Violations', 'Receiving party indemnifies disclosing party for all costs, expenses, damages, litigation expenses, and reasonable attorney fees resulting from any violation of agreement provisions.', ARRAY['indemnification', 'cost_recovery', 'litigation_expenses', 'attorney_fees'], ARRAY['non_disclosure_agreements', 'financial_protection', 'legal_costs']),
('550e8400-e29b-41d4-a716-446655441009', 'term', 'Five-Year Survival and Transaction Integration', 'Agreement survives termination for five years, with provisions becoming part of any binding transaction agreement and continuing for specified periods after transaction termination or expiry.', ARRAY['five_year_survival', 'transaction_integration', 'survival_periods', 'agreement_continuation'], ARRAY['non_disclosure_agreements', 'contract_duration', 'transaction_protection']),
('550e8400-e29b-41d4-a716-446655441010', 'governing_law', 'Bangalore Jurisdiction and Sole Arbitrator', 'Agreement governed by Indian law with Bangalore court jurisdiction and arbitration by sole arbitrator under Indian Arbitration Act, conducted in English language.', ARRAY['indian_law', 'bangalore_jurisdiction', 'sole_arbitrator', 'english_language'], ARRAY['non_disclosure_agreements', 'dispute_resolution', 'indian_legal_system']);

-- Insert contract parameters
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES
('550e8400-e29b-41d4-a716-446655441101', 'standard_nda', 'execution_day', 'Day of Execution', 'text', true, 'Day of the month when agreement is executed', '20th', NULL),
('550e8400-e29b-41d4-a716-446655441102', 'standard_nda', 'execution_month', 'Month of Execution', 'text', true, 'Month when the agreement is executed', 'May', NULL),
('550e8400-e29b-41d4-a716-446655441103', 'standard_nda', 'party1_name', 'Party 1 Name', 'text', true, 'Name of the first party company', 'ABC Technologies Pvt. Ltd.', NULL),
('550e8400-e29b-41d4-a716-446655441104', 'standard_nda', 'party1_address', 'Party 1 Address', 'text', true, 'Registered office address of first party', 'Electronic City Phase 2, Bengaluru - 560100', NULL),
('550e8400-e29b-41d4-a716-446655441105', 'standard_nda', 'party1_reference', 'Party 1 Reference Name', 'text', true, 'Reference name for first party in agreement', 'ABC Technologies', NULL),
('550e8400-e29b-41d4-a716-446655441106', 'standard_nda', 'company_name', 'Company Name', 'text', true, 'Name of the second party company', 'XYZ Solutions Pvt. Ltd.', NULL),
('550e8400-e29b-41d4-a716-446655441107', 'standard_nda', 'company_address', 'Company Address', 'text', true, 'Registered office address of company', 'Koramangala 4th Block, Bengaluru - 560034', NULL),
('550e8400-e29b-41d4-a716-446655441108', 'standard_nda', 'proposed_transaction_details', 'Proposed Transaction Details', 'text', true, 'Description of the proposed business transaction', 'Software development partnership and technology licensing', NULL),
('550e8400-e29b-41d4-a716-446655441109', 'standard_nda', 'survival_years_termination', 'Survival Years after Termination', 'number', true, 'Years for agreement survival after termination', '3', NULL),
('550e8400-e29b-41d4-a716-446655441110', 'standard_nda', 'survival_years_expiry', 'Survival Years after Expiry', 'number', true, 'Years for agreement survival after expiry', '2', NULL);

-- ========================================
-- End of Template 14: Non-Disclosure Agreement
-- ========================================

-- Template 15: Offer Letter
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES
('550e8400-e29b-41d4-a716-446655440015', 'offer_letter', 'Offer Letter', 'Standard employment offer letter with compensation structure, probation period, notice requirements, and terms of employment for new hires', 'employment', 'India', ARRAY['offer letter', 'employment', 'compensation', 'probation', 'notice period', 'hr', 'hiring', 'background verification']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES

-- Header and Date
('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440015', 'header', 'Offer Letter Header', 'OFFER LETTER
                                        Date: ____', '["offer_date"]', 1, false),

-- Recipient Details
('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440015', 'recipient', 'Recipient Information', 'To
Mr. ____
____ (residential address)
Phone No: ____', '["employee_name", "employee_address", "employee_phone"]', 2, false),

-- Subject Line
('550e8400-e29b-41d4-a716-446655440903', '550e8400-e29b-41d4-a716-446655440015', 'subject', 'Subject Line', 'Sub: Offer Letter
Dear ____,', '["employee_first_name"]', 3, false),

-- Position Offer
('550e8400-e29b-41d4-a716-446655440904', '550e8400-e29b-41d4-a716-446655440015', 'offer', 'Position and Location Offer', 'We are pleased to offer you the post of ____ based at ____.', '["job_position", "work_location"]', 4, false),

-- Compensation Reference
('550e8400-e29b-41d4-a716-446655440905', '550e8400-e29b-41d4-a716-446655440015', 'compensation', 'Compensation Structure Reference', 'The compensation structure is enclosed for your reference as Annexure.', '[]', 5, false),

-- Employment Terms
('550e8400-e29b-41d4-a716-446655440906', '550e8400-e29b-41d4-a716-446655440015', 'terms', 'Employment Terms and Policies', 'Your employment with the Company will be subject to strict adherence to the policies and procedures of the Company.', '[]', 6, false),

-- Probation Period
('550e8400-e29b-41d4-a716-446655440907', '550e8400-e29b-41d4-a716-446655440015', 'probation', 'Probation Period', 'You will be on probation for six months.', '[]', 7, false),

-- Conditions
('550e8400-e29b-41d4-a716-446655440908', '550e8400-e29b-41d4-a716-446655440015', 'conditions', 'Offer Conditions', 'This offer is subjected to background verification and medical fitness.', '[]', 8, false),

-- Notice Period
('550e8400-e29b-41d4-a716-446655440909', '550e8400-e29b-41d4-a716-446655440015', 'notice', 'Notice Period Terms', 'On acceptance of the terms of conditions as per this offer letter, you will be able to terminate your employment with the Company by giving one (1) month notice to the Company and vice versa. You shall not be eligible to avail leave during the notice period.', '[]', 9, false),

-- Welcome Message
('550e8400-e29b-41d4-a716-446655440910', '550e8400-e29b-41d4-a716-446655440015', 'welcome', 'Welcome and Acceptance Request', 'We welcome you to join the Company and would be happy if you can sign the duplicate copy of this letter in token of your acceptance of the offer of employment with the Company.

If you have any question, please clarify from the undersigned.', '[]', 10, false),

-- Company Signature Block
('550e8400-e29b-41d4-a716-446655440911', '550e8400-e29b-41d4-a716-446655440015', 'company_signature', 'Company Signature Section', 'With regards,
____
____
HR - Head', '["hr_head_name", "hr_head_designation"]', 11, false),

-- Acceptance Section
('550e8400-e29b-41d4-a716-446655440912', '550e8400-e29b-41d4-a716-446655440015', 'acceptance', 'Employee Acceptance Section', 'I accept the aforesaid terms & conditions and this offer of employment. I shall keep the contents of this document confidential. 

I will join on ____.

Name: ____
Signature: ____
Date: ____', '["joining_date", "employee_name_sign", "employee_signature", "acceptance_date"]', 12, false),

-- Compensation Annexure Header
('550e8400-e29b-41d4-a716-446655440913', '550e8400-e29b-41d4-a716-446655440015', 'annexure', 'Compensation Annexure', 'Annexure

Components*
Monthly
(INR)
Annual
(INR)', '[]', 13, false),

-- Basic Salary
('550e8400-e29b-41d4-a716-446655440914', '550e8400-e29b-41d4-a716-446655440015', 'salary_basic', 'Basic Salary Component', 'Basic
____
____', '["basic_monthly", "basic_annual"]', 14, false),

-- HRA Component
('550e8400-e29b-41d4-a716-446655440915', '550e8400-e29b-41d4-a716-446655440015', 'salary_hra', 'HRA Component', 'HRA
____
____', '["hra_monthly", "hra_annual"]', 15, false),

-- Special Allowance
('550e8400-e29b-41d4-a716-446655440916', '550e8400-e29b-41d4-a716-446655440015', 'salary_special', 'Special Allowance Component', 'Special Allowance
____
____', '["special_allowance_monthly", "special_allowance_annual"]', 16, false),

-- Conveyance
('550e8400-e29b-41d4-a716-446655440917', '550e8400-e29b-41d4-a716-446655440015', 'salary_conveyance', 'Conveyance Component', 'Conveyance
____
____', '["conveyance_monthly", "conveyance_annual"]', 17, true),

-- Medical Allowance
('550e8400-e29b-41d4-a716-446655440918', '550e8400-e29b-41d4-a716-446655440015', 'salary_medical', 'Medical Allowance Component', 'Medical
____
____', '["medical_monthly", "medical_annual"]', 18, true),

-- LTA Component
('550e8400-e29b-41d4-a716-446655440919', '550e8400-e29b-41d4-a716-446655440015', 'salary_lta', 'LTA Component', 'LTA
____
____', '["lta_monthly", "lta_annual"]', 19, true),

-- PF Contribution
('550e8400-e29b-41d4-a716-446655440920', '550e8400-e29b-41d4-a716-446655440015', 'salary_pf', 'PF Employer Contribution', 'PF (Employer Contribution)
____
____', '["pf_monthly", "pf_annual"]', 20, true),

-- Bonus Component
('550e8400-e29b-41d4-a716-446655440921', '550e8400-e29b-41d4-a716-446655440015', 'salary_bonus', 'Annual Bonus Component', 'Bonus (Annual)

____', '["bonus_annual"]', 21, true),

-- Total Compensation
('550e8400-e29b-41d4-a716-446655440922', '550e8400-e29b-41d4-a716-446655440015', 'salary_total', 'Total Monthly and CTC', 'Total
____
____

CTC
____', '["total_monthly", "total_annual", "ctc_amount"]', 22, false),

-- Compensation Note
('550e8400-e29b-41d4-a716-446655440923', '550e8400-e29b-41d4-a716-446655440015', 'compensation_note', 'Compensation Structure Note', '* - The components can vary depending on the company and the way it would want to structure the salary.', '[]', 23, false);

-- Insert reusable contract clauses
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES

('550e8400-e29b-41d4-a716-446655441001', 'probation', 'Standard Probation Period', 'You will be on probation for six months during which your performance will be evaluated before confirmation of employment.', ARRAY['probation', 'employment', 'evaluation'], ARRAY['offer letter', 'employment agreement', 'hiring']),

('550e8400-e29b-41d4-a716-446655441002', 'background_verification', 'Background Verification Requirement', 'This offer is subjected to background verification and medical fitness as per company policies.', ARRAY['background check', 'medical fitness', 'pre-employment'], ARRAY['offer letter', 'hiring process']),

('550e8400-e29b-41d4-a716-446655441003', 'notice_period', 'Mutual Notice Period', 'Either party may terminate employment by giving one (1) month notice. No leave shall be available during notice period.', ARRAY['notice period', 'termination', 'mutual notice'], ARRAY['offer letter', 'employment terms']),

('550e8400-e29b-41d4-a716-446655441004', 'policy_adherence', 'Company Policy Compliance', 'Employment is subject to strict adherence to all company policies and procedures as amended from time to time.', ARRAY['company policies', 'compliance', 'procedures'], ARRAY['offer letter', 'employment agreement']),

('550e8400-e29b-41d4-a716-446655441005', 'confidentiality_acceptance', 'Offer Confidentiality', 'Employee agrees to keep the contents of this offer document confidential and not disclose to unauthorized parties.', ARRAY['confidentiality', 'offer terms', 'non-disclosure'], ARRAY['offer letter', 'hiring process']),

('550e8400-e29b-41d4-a716-446655441006', 'compensation_structure', 'Detailed Compensation Breakdown', 'Compensation includes basic salary, allowances, benefits, and statutory contributions as detailed in the annexure.', ARRAY['compensation', 'salary structure', 'benefits'], ARRAY['offer letter', 'employment terms']),

('550e8400-e29b-41d4-a716-446655441007', 'acceptance_terms', 'Offer Acceptance Requirements', 'Acceptance of offer constitutes agreement to all terms and conditions. Employee must sign and return duplicate copy.', ARRAY['acceptance', 'agreement terms', 'documentation'], ARRAY['offer letter', 'hiring process']),

('550e8400-e29b-41d4-a716-446655441008', 'joining_formalities', 'Joining Date and Formalities', 'Employee must specify joining date and complete all pre-joining formalities before commencement of employment.', ARRAY['joining date', 'formalities', 'commencement'], ARRAY['offer letter', 'onboarding']);

-- Insert contract parameters
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES

('550e8400-e29b-41d4-a716-446655441101', 'offer_letter', 'offer_date', 'Offer Letter Date', 'date', true, 'Date when the offer letter is issued', '2024-01-15', NULL),
('550e8400-e29b-41d4-a716-446655441102', 'offer_letter', 'employee_name', 'Employee Full Name', 'text', true, 'Complete name of the prospective employee', 'Mr. Rajesh Kumar', NULL),
('550e8400-e29b-41d4-a716-446655441103', 'offer_letter', 'employee_address', 'Employee Address', 'text', true, 'Residential address of the employee', '123, MG Road, Bangalore - 560001', NULL),
('550e8400-e29b-41d4-a716-446655441104', 'offer_letter', 'employee_phone', 'Employee Phone Number', 'text', true, 'Contact phone number of the employee', '+91-9876543210', NULL),
('550e8400-e29b-41d4-a716-446655441105', 'offer_letter', 'employee_first_name', 'Employee First Name', 'text', true, 'First name for salutation in the letter', 'Rajesh', NULL),
('550e8400-e29b-41d4-a716-446655441106', 'offer_letter', 'job_position', 'Job Position/Title', 'text', true, 'Position being offered to the employee', 'Software Engineer', NULL),
('550e8400-e29b-41d4-a716-446655441107', 'offer_letter', 'work_location', 'Work Location', 'text', true, 'Primary work location or office', 'Bangalore', NULL),
('550e8400-e29b-41d4-a716-446655441108', 'offer_letter', 'hr_head_name', 'HR Head Name', 'text', true, 'Name of the HR Head signing the letter', 'Priya Sharma', NULL),
('550e8400-e29b-41d4-a716-446655441109', 'offer_letter', 'hr_head_designation', 'HR Head Designation', 'text', true, 'Designation of the HR Head', 'Head - Human Resources', NULL),
('550e8400-e29b-41d4-a716-446655441110', 'offer_letter', 'joining_date', 'Joining Date', 'date', true, 'Date when employee will join the company', '2024-02-01', NULL),
('550e8400-e29b-41d4-a716-446655441111', 'offer_letter', 'employee_name_sign', 'Employee Name for Signature', 'text', true, 'Employee name in signature section', 'Rajesh Kumar', NULL),
('550e8400-e29b-41d4-a716-446655441112', 'offer_letter', 'employee_signature', 'Employee Signature', 'text', false, 'Placeholder for employee signature', '[Signature]', NULL),
('550e8400-e29b-41d4-a716-446655441113', 'offer_letter', 'acceptance_date', 'Acceptance Date', 'date', true, 'Date when employee accepts the offer', '2024-01-20', NULL),
('550e8400-e29b-41d4-a716-446655441114', 'offer_letter', 'basic_monthly', 'Basic Salary Monthly', 'currency', true, 'Monthly basic salary amount', '50000', NULL),
('550e8400-e29b-41d4-a716-446655441115', 'offer_letter', 'basic_annual', 'Basic Salary Annual', 'currency', true, 'Annual basic salary amount', '600000', NULL),
('550e8400-e29b-41d4-a716-446655441116', 'offer_letter', 'hra_monthly', 'HRA Monthly', 'currency', true, 'Monthly House Rent Allowance', '20000', NULL),
('550e8400-e29b-41d4-a716-446655441117', 'offer_letter', 'hra_annual', 'HRA Annual', 'currency', true, 'Annual House Rent Allowance', '240000', NULL),
('550e8400-e29b-41d4-a716-446655441118', 'offer_letter', 'special_allowance_monthly', 'Special Allowance Monthly', 'currency', true, 'Monthly special allowance', '15000', NULL),
('550e8400-e29b-41d4-a716-446655441119', 'offer_letter', 'special_allowance_annual', 'Special Allowance Annual', 'currency', true, 'Annual special allowance', '180000', NULL),
('550e8400-e29b-41d4-a716-446655441120', 'offer_letter', 'conveyance_monthly', 'Conveyance Monthly', 'currency', false, 'Monthly conveyance allowance', '2000', NULL),
('550e8400-e29b-41d4-a716-446655441121', 'offer_letter', 'conveyance_annual', 'Conveyance Annual', 'currency', false, 'Annual conveyance allowance', '24000', NULL),
('550e8400-e29b-41d4-a716-446655441122', 'offer_letter', 'medical_monthly', 'Medical Monthly', 'currency', false, 'Monthly medical allowance', '1250', NULL),
('550e8400-e29b-41d4-a716-446655441123', 'offer_letter', 'medical_annual', 'Medical Annual', 'currency', false, 'Annual medical allowance', '15000', NULL),
('550e8400-e29b-41d4-a716-446655441124', 'offer_letter', 'lta_monthly', 'LTA Monthly', 'currency', false, 'Monthly Leave Travel Allowance', '1667', NULL),
('550e8400-e29b-41d4-a716-446655441125', 'offer_letter', 'lta_annual', 'LTA Annual', 'currency', false, 'Annual Leave Travel Allowance', '20000', NULL),
('550e8400-e29b-41d4-a716-446655441126', 'offer_letter', 'pf_monthly', 'PF Monthly Contribution', 'currency', false, 'Monthly PF employer contribution', '6000', NULL),
('550e8400-e29b-41d4-a716-446655441127', 'offer_letter', 'pf_annual', 'PF Annual Contribution', 'currency', false, 'Annual PF employer contribution', '72000', NULL),
('550e8400-e29b-41d4-a716-446655441128', 'offer_letter', 'bonus_annual', 'Annual Bonus', 'currency', false, 'Annual performance bonus', '50000', NULL),
('550e8400-e29b-41d4-a716-446655441129', 'offer_letter', 'total_monthly', 'Total Monthly Amount', 'currency', true, 'Total monthly compensation', '90917', NULL),
('550e8400-e29b-41d4-a716-446655441130', 'offer_letter', 'total_annual', 'Total Annual Amount', 'currency', true, 'Total annual compensation', '1091000', NULL),
('550e8400-e29b-41d4-a716-446655441131', 'offer_letter', 'ctc_amount', 'Cost to Company (CTC)', 'currency', true, 'Total cost to company annually', '1200000', NULL);

-- ========================================
-- End of Template 15: Offer Letter
-- ========================================

-- Template 16: Relieving Letter
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES
('550e8400-e29b-41d4-a716-446655440016', 'relieving_letter', 'Relieving Letter', 'Official employment termination letter confirming cessation of employment, final settlement, property return, and continuing obligations post-employment', 'employment', 'India', ARRAY['relieving letter', 'employment termination', 'final settlement', 'continuing obligations', 'confidentiality', 'property return', 'hr']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES

-- Header and Date
('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440016', 'header', 'Relieving Letter Header', 'Date: ____', '["relieving_date"]', 1, false),

-- Recipient Details
('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440016', 'recipient', 'Recipient Information', 'To
Mr. ____
____ (residential address)
Phone No: ____', '["employee_name", "employee_address", "employee_phone"]', 2, false),

-- Subject Line
('550e8400-e29b-41d4-a716-446655440903', '550e8400-e29b-41d4-a716-446655440016', 'subject', 'Subject Line', 'Sub: Relieving from your employment

Dear ____,', '["employee_first_name"]', 3, false),

-- Employment Details
('550e8400-e29b-41d4-a716-446655440904', '550e8400-e29b-41d4-a716-446655440016', 'employment_period', 'Employment Period and Termination', 'You worked at ____ ("Company") from ____ to ____ for ____ years ("Term"). Pursuant to your cessation of employment with the Company from ____, the Employment Agreement dated ____ ("Employment Agreement") also stands terminated.', '["company_name", "employment_start_date", "employment_end_date", "years_of_service", "cessation_date", "employment_agreement_date"]', 4, false),

-- Continuing Obligations Reminder
('550e8400-e29b-41d4-a716-446655440905', '550e8400-e29b-41d4-a716-446655440016', 'continuing_obligations', 'Continuing Obligations Reminder', 'We would also like to take this opportunity to remind you that, notwithstanding the termination of your employment with the Company, certain of your obligations under your Employment Agreement will continue. These obligations include, but may not be limited to the following obligations –', '[]', 5, false),

-- Intellectual Property Rights
('550e8400-e29b-41d4-a716-446655440906', '550e8400-e29b-41d4-a716-446655440016', 'intellectual_property', 'Intellectual Property Rights', 'All developments made and works created by you during the Term of your employment with the Company is the exclusive proprietary property of the Company, that any and all copyright(s) and other proprietary interest(s) therein shall belong to Company.', '[]', 6, false),

-- Confidentiality Obligation
('550e8400-e29b-41d4-a716-446655440907', '550e8400-e29b-41d4-a716-446655440016', 'confidentiality', 'Confidentiality Obligation', 'You shall not divulge the Confidential Information of the Company to any third party.', '[]', 7, false),

-- Media Restriction
('550e8400-e29b-41d4-a716-446655440908', '550e8400-e29b-41d4-a716-446655440016', 'media_restriction', 'Media and Communication Restriction', 'You shall not give any statement or send write-ups or post anything regarding the Company in any form of media.', '[]', 8, false),

-- Final Settlement Confirmation
('550e8400-e29b-41d4-a716-446655440909', '550e8400-e29b-41d4-a716-446655440016', 'final_settlement', 'Final Settlement and Property Return', 'You have received your full and final settlement, you have returned the properties of the Company and have completed all formalities with respect to your cessation of employment with the Company.', '[]', 9, false),

-- Contact Information
('550e8400-e29b-41d4-a716-446655440910', '550e8400-e29b-41d4-a716-446655440016', 'contact', 'Contact Information', 'If you have any questions concerning the information contained in this letter, please contact me directly.', '[]', 10, false),

-- Closing Wishes
('550e8400-e29b-41d4-a716-446655440911', '550e8400-e29b-41d4-a716-446655440016', 'closing', 'Closing Wishes', 'We wish you all the best for your future endeavours!

Yours sincerely,', '[]', 11, false),

-- Company Signature Section
('550e8400-e29b-41d4-a716-446655440912', '550e8400-e29b-41d4-a716-446655440016', 'company_signature', 'Company Signature Section', 'SIGNED AND DELIVERED BY: 

Signed for and on behalf of the Company by:         
 ____                 
[____]', '["company_representative_signature", "company_representative_name"]', 12, false),

-- Employee Acknowledgment
('550e8400-e29b-41d4-a716-446655440913', '550e8400-e29b-41d4-a716-446655440016', 'employee_acknowledgment', 'Employee Acknowledgment', 'Signed by the Employee while accepting the relieving letter:

____', '["employee_signature"]', 13, false),

-- Witness Section
('550e8400-e29b-41d4-a716-446655440914', '550e8400-e29b-41d4-a716-446655440016', 'witnesses', 'Witness Section', 'WITNESSED BY:
 ____               ____ 
Name: ____                             Name: ____
Address: ____                         Address: ____', '["witness1_signature", "witness2_signature", "witness1_name", "witness2_name", "witness1_address", "witness2_address"]', 14, true);

-- Insert reusable contract clauses
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES

('550e8400-e29b-41d4-a716-446655441001', 'continuing_obligations', 'Post-Employment Continuing Obligations', 'Notwithstanding termination of employment, certain obligations under the Employment Agreement continue including intellectual property, confidentiality, and media restrictions.', ARRAY['continuing obligations', 'post-employment', 'survival clauses'], ARRAY['relieving letter', 'employment termination', 'exit documentation']),

('550e8400-e29b-41d4-a716-446655441002', 'intellectual_property_retention', 'Company Intellectual Property Rights', 'All developments, works, copyrights, and proprietary interests created during employment term remain exclusive property of the Company.', ARRAY['intellectual property', 'work for hire', 'company ownership'], ARRAY['relieving letter', 'employment termination', 'ip protection']),

('550e8400-e29b-41d4-a716-446655441003', 'confidentiality_survival', 'Post-Employment Confidentiality', 'Employee shall not divulge any Confidential Information of the Company to third parties after employment termination.', ARRAY['confidentiality', 'non-disclosure', 'post-employment'], ARRAY['relieving letter', 'employment termination', 'information protection']),

('550e8400-e29b-41d4-a716-446655441004', 'media_restriction_clause', 'Media and Communication Prohibition', 'Employee prohibited from giving statements, writing, or posting anything about the Company in any form of media.', ARRAY['media restriction', 'communication control', 'reputation protection'], ARRAY['relieving letter', 'employment termination', 'brand protection']),

('550e8400-e29b-41d4-a716-446655441005', 'final_settlement_confirmation', 'Complete Settlement and Property Return', 'Employee confirms receipt of full final settlement and return of all Company property with completion of all exit formalities.', ARRAY['final settlement', 'property return', 'exit formalities'], ARRAY['relieving letter', 'employment termination', 'exit procedures']),

('550e8400-e29b-41d4-a716-446655441006', 'employment_period_acknowledgment', 'Employment Period and Agreement Termination', 'Formal acknowledgment of employment period, service duration, and automatic termination of employment agreement.', ARRAY['employment period', 'service duration', 'agreement termination'], ARRAY['relieving letter', 'employment records', 'termination documentation']),

('550e8400-e29b-41d4-a716-446655441007', 'witness_requirement', 'Witnessed Document Execution', 'Document execution requires witnessing by two independent parties with full name and address documentation.', ARRAY['witness requirement', 'document execution', 'legal formality'], ARRAY['relieving letter', 'legal documentation', 'formal execution']),

('550e8400-e29b-41d4-a716-446655441008', 'future_endeavors_wishes', 'Professional Well-Wishes for Future', 'Company extends best wishes for employee''s future professional endeavors and career growth.', ARRAY['professional courtesy', 'future wishes', 'positive closure'], ARRAY['relieving letter', 'employment termination', 'professional relations']);

-- Insert contract parameters
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES

('550e8400-e29b-41d4-a716-446655441101', 'relieving_letter', 'relieving_date', 'Relieving Letter Date', 'date', true, 'Date when the relieving letter is issued', '2024-03-15', NULL),
('550e8400-e29b-41d4-a716-446655441102', 'relieving_letter', 'employee_name', 'Employee Full Name', 'text', true, 'Complete name of the departing employee', 'Mr. Rajesh Kumar', NULL),
('550e8400-e29b-41d4-a716-446655441103', 'relieving_letter', 'employee_address', 'Employee Address', 'text', true, 'Residential address of the employee', '123, MG Road, Bangalore - 560001', NULL),
('550e8400-e29b-41d4-a716-446655441104', 'relieving_letter', 'employee_phone', 'Employee Phone Number', 'text', true, 'Contact phone number of the employee', '+91-9876543210', NULL),
('550e8400-e29b-41d4-a716-446655441105', 'relieving_letter', 'employee_first_name', 'Employee First Name', 'text', true, 'First name for salutation in the letter', 'Rajesh', NULL),
('550e8400-e29b-41d4-a716-446655441106', 'relieving_letter', 'company_name', 'Company Name', 'text', true, 'Legal name of the company', 'Tech Innovations Pvt Ltd', NULL),
('550e8400-e29b-41d4-a716-446655441107', 'relieving_letter', 'employment_start_date', 'Employment Start Date', 'date', true, 'Date when employee joined the company', '2021-06-01', NULL),
('550e8400-e29b-41d4-a716-446655441108', 'relieving_letter', 'employment_end_date', 'Employment End Date', 'date', true, 'Last working day of the employee', '2024-03-14', NULL),
('550e8400-e29b-41d4-a716-446655441109', 'relieving_letter', 'years_of_service', 'Years of Service', 'text', true, 'Total years and months of service', '2 years and 9 months', NULL),
('550e8400-e29b-41d4-a716-446655441110', 'relieving_letter', 'cessation_date', 'Cessation Date', 'date', true, 'Date of employment cessation', '2024-03-14', NULL),
('550e8400-e29b-41d4-a716-446655441111', 'relieving_letter', 'employment_agreement_date', 'Employment Agreement Date', 'date', true, 'Date of original employment agreement', '2021-05-20', NULL),
('550e8400-e29b-41d4-a716-446655441112', 'relieving_letter', 'company_representative_signature', 'Company Representative Signature', 'text', false, 'Signature placeholder for company representative', '[Signature]', NULL),
('550e8400-e29b-41d4-a716-446655441113', 'relieving_letter', 'company_representative_name', 'Company Representative Name', 'text', true, 'Name of company representative signing', 'Priya Sharma, HR Head', NULL),
('550e8400-e29b-41d4-a716-446655441114', 'relieving_letter', 'employee_signature', 'Employee Signature', 'text', false, 'Employee signature for acknowledgment', '[Employee Signature]', NULL),
('550e8400-e29b-41d4-a716-446655441115', 'relieving_letter', 'witness1_signature', 'Witness 1 Signature', 'text', false, 'First witness signature', '[Witness 1 Signature]', NULL),
('550e8400-e29b-41d4-a716-446655441116', 'relieving_letter', 'witness2_signature', 'Witness 2 Signature', 'text', false, 'Second witness signature', '[Witness 2 Signature]', NULL),
('550e8400-e29b-41d4-a716-446655441117', 'relieving_letter', 'witness1_name', 'Witness 1 Name', 'text', false, 'Full name of first witness', 'Amit Singh', NULL),
('550e8400-e29b-41d4-a716-446655441118', 'relieving_letter', 'witness2_name', 'Witness 2 Name', 'text', false, 'Full name of second witness', 'Sunita Mehta', NULL),
('550e8400-e29b-41d4-a716-446655441119', 'relieving_letter', 'witness1_address', 'Witness 1 Address', 'text', false, 'Address of first witness', 'Electronic City, Bangalore', NULL),
('550e8400-e29b-41d4-a716-446655441120', 'relieving_letter', 'witness2_address', 'Witness 2 Address', 'text', false, 'Address of second witness', 'Koramangala, Bangalore', NULL);

-- ========================================
-- End of Template 16: Relieving Letter
-- ========================================

-- Template 17: Special Power of Attorney to Present Document for Registration
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES
('550e8400-e29b-41d4-a716-446655440017', 'power_of_attorney', 'Special Power of Attorney to Present Document for Registration', 'Legal document authorizing an attorney to present conveyance deed for registration, admit execution, and handle registration formalities on behalf of the principal', 'legal', 'India', ARRAY['power of attorney', 'property registration', 'conveyance deed', 'sub-registrar', 'legal authorization', 'property transfer']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES

-- Opening Declaration
('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440017', 'preamble', 'Opening Declaration', 'Know all men by these presents that (or By This Power of Attorney), I ____ resident of ____ do hereby appoint ____ resident of ____ as my attorney on behalf of to appear before the Sub-Registrar of ____ and to present and lodge before him for registration of the deed of conveyance dated the ____ made between me and Mr. ____ resident of ____ executed by me in favour of ____, to admit the execution there of conveyance by me and receipt of sale consideration by me and to do any act, deed or thing that may be necessary for effectively registering the said deed of conveyance and to receive it back when it has been duly registered and to sign and deliver a proper receipt for the same.', '["principal_name", "principal_address", "attorney_name", "attorney_address", "sub_registrar_location", "conveyance_date", "buyer_name", "buyer_address", "beneficiary_name"]', 1, false),

-- Ratification Clause
('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440017', 'ratification', 'Ratification and Confirmation', 'AND I DO HEREBY agree to ratify and confirm all and whatever my said Attorney shall or purport to do or cause to be done by virtue of these presents.', '[]', 2, false),

-- Execution Clause
('550e8400-e29b-41d4-a716-446655440903', '550e8400-e29b-41d4-a716-446655440017', 'execution', 'Execution Statement', 'IN WITNESS WHEREOF, I have executed this power ____ this ____ day of ____, 2016.', '["execution_location", "execution_day", "execution_month"]', 3, false),

-- Principal Signature
('550e8400-e29b-41d4-a716-446655440904', '550e8400-e29b-41d4-a716-446655440017', 'principal_signature', 'Principal Signature', 'Signed and delivered by,

____', '["principal_signature"]', 4, false),

-- Witness Section
('550e8400-e29b-41d4-a716-446655440905', '550e8400-e29b-41d4-a716-446655440017', 'witnesses', 'Witness and Notary Section', 'WITNESSES;

Identified by me

Before me

____ Advocate Notary Public', '["notary_advocate_name"]', 5, false);

-- Insert reusable contract clauses
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES

('550e8400-e29b-41d4-a716-446655441001', 'attorney_appointment', 'Attorney Appointment for Registration', 'Principal appoints attorney to appear before Sub-Registrar and present conveyance deed for registration on behalf of principal.', ARRAY['attorney appointment', 'registration authority', 'legal representation'], ARRAY['power of attorney', 'property registration', 'legal delegation']),

('550e8400-e29b-41d4-a716-446655441002', 'registration_powers', 'Registration and Document Powers', 'Attorney authorized to present deed, admit execution, confirm sale consideration receipt, and perform all acts necessary for effective registration.', ARRAY['registration powers', 'document presentation', 'execution admission'], ARRAY['power of attorney', 'property transactions', 'registration process']),

('550e8400-e29b-41d4-a716-446655441003', 'document_receipt', 'Registered Document Receipt Authority', 'Attorney empowered to receive registered deed back from Sub-Registrar and sign proper receipt for the same upon completion of registration.', ARRAY['document receipt', 'completion authority', 'receipt signing'], ARRAY['power of attorney', 'registration completion', 'document handling']),

('550e8400-e29b-41d4-a716-446655441004', 'ratification_confirmation', 'Universal Ratification of Attorney Actions', 'Principal agrees to ratify and confirm all actions taken by attorney under this power of attorney authorization.', ARRAY['ratification', 'confirmation', 'attorney protection'], ARRAY['power of attorney', 'legal validation', 'action endorsement']),

('550e8400-e29b-41d4-a716-446655441005', 'witness_notary_requirement', 'Notarized Witness Requirement', 'Document execution requires witnessing and identification by qualified Advocate Notary Public for legal validity.', ARRAY['notary requirement', 'witness identification', 'legal validation'], ARRAY['power of attorney', 'legal documentation', 'notarization']),

('550e8400-e29b-41d4-a716-446655441006', 'conveyance_specificity', 'Specific Conveyance Deed Authorization', 'Power limited to specific conveyance deed dated and executed between identified parties for particular property transaction.', ARRAY['specific authorization', 'conveyance deed', 'limited scope'], ARRAY['power of attorney', 'property transfer', 'specific mandate']),

('550e8400-e29b-41d4-a716-446655441007', 'sub_registrar_jurisdiction', 'Sub-Registrar Jurisdictional Authority', 'Attorney authorized to appear before Sub-Registrar of specified jurisdiction for document registration proceedings.', ARRAY['jurisdictional authority', 'sub-registrar', 'registration jurisdiction'], ARRAY['power of attorney', 'property registration', 'jurisdictional compliance']),

('550e8400-e29b-41d4-a716-446655441008', 'sale_consideration_confirmation', 'Sale Consideration Receipt Confirmation', 'Attorney empowered to confirm and admit receipt of sale consideration by principal as part of registration process.', ARRAY['sale consideration', 'payment confirmation', 'transaction validation'], ARRAY['power of attorney', 'property sale', 'payment acknowledgment']);

-- Insert contract parameters
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES

('550e8400-e29b-41d4-a716-446655441101', 'power_of_attorney', 'principal_name', 'Principal Name', 'text', true, 'Full name of the person granting power of attorney', 'Rajesh Kumar Sharma', NULL),
('550e8400-e29b-41d4-a716-446655441102', 'power_of_attorney', 'principal_address', 'Principal Address', 'text', true, 'Complete residential address of the principal', 'House No. 123, MG Road, Bangalore - 560001', NULL),
('550e8400-e29b-41d4-a716-446655441103', 'power_of_attorney', 'attorney_name', 'Attorney Name', 'text', true, 'Full name of the person being appointed as attorney', 'Priya Sharma', NULL),
('550e8400-e29b-41d4-a716-446655441104', 'power_of_attorney', 'attorney_address', 'Attorney Address', 'text', true, 'Complete residential address of the attorney', 'Flat 45, Electronic City, Bangalore - 560100', NULL),
('550e8400-e29b-41d4-a716-446655441105', 'power_of_attorney', 'sub_registrar_location', 'Sub-Registrar Location', 'text', true, 'Location/jurisdiction of the Sub-Registrar office', 'Bangalore South', NULL),
('550e8400-e29b-41d4-a716-446655441106', 'power_of_attorney', 'conveyance_date', 'Conveyance Deed Date', 'date', true, 'Date of the conveyance deed to be registered', '2016-05-15', NULL),
('550e8400-e29b-41d4-a716-446655441107', 'power_of_attorney', 'buyer_name', 'Buyer Name', 'text', true, 'Full name of the property buyer', 'Mr. Amit Singh', NULL),
('550e8400-e29b-41d4-a716-446655441108', 'power_of_attorney', 'buyer_address', 'Buyer Address', 'text', true, 'Complete address of the property buyer', 'Plot 67, Koramangala, Bangalore - 560034', NULL),
('550e8400-e29b-41d4-a716-446655441109', 'power_of_attorney', 'beneficiary_name', 'Beneficiary Name', 'text', true, 'Name of the person in whose favor the deed is executed', 'Amit Singh', NULL),
('550e8400-e29b-41d4-a716-446655441110', 'power_of_attorney', 'execution_location', 'Execution Location', 'text', true, 'Location where the power of attorney is executed', 'Bangalore', NULL),
('550e8400-e29b-41d4-a716-446655441111', 'power_of_attorney', 'execution_day', 'Execution Day', 'text', true, 'Day of execution of power of attorney', '15th', NULL),
('550e8400-e29b-41d4-a716-446655441112', 'power_of_attorney', 'execution_month', 'Execution Month', 'text', true, 'Month of execution of power of attorney', 'May', NULL),
('550e8400-e29b-41d4-a716-446655441113', 'power_of_attorney', 'principal_signature', 'Principal Signature', 'text', false, 'Signature of the principal granting power', '[Principal Signature]', NULL),
('550e8400-e29b-41d4-a716-446655441114', 'power_of_attorney', 'notary_advocate_name', 'Notary Advocate Name', 'text', true, 'Name of the Advocate Notary Public', 'Advocate Sunita Mehta', NULL);

-- ========================================
-- End of Template 17: Special Power of Attorney to Present Document for Registration
-- ========================================

-- Template 18: Letter of Guarantee and Indemnity
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES
('550e8400-e29b-41d4-a716-446655440018', 'guarantee_indemnity', 'Letter of Guarantee and Indemnity', 'Comprehensive guarantee and indemnity letter for lease agreements providing security for lease rentals, performance obligations, and comprehensive liability coverage', 'agreement', 'India', ARRAY['guarantee', 'indemnity', 'lease agreement', 'liability', 'security', 'performance guarantee', 'rental guarantee']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES

-- Addressee
('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440018', 'addressee', 'Addressee Details', 'To,
____
____', '["lessor_name", "lessor_address"]', 1, false),

-- Opening Consideration
('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440018', 'consideration', 'Consideration and Lease Reference', 'In consideration of your agreeing to grant lease of (description of premises) ____ to ____ (Name of guarantor) (hereinafter referred to as "the lessee") under the terms of a lease agreement proposed to be made between yourselves and the lessee of the equipment specified in the Schedule to the said lease agreement and more particularly described in the Schedule hereto, we the undersigned hereby jointly and severally guarantee on demand by you the punctual payment by the lessee of all lease rentals, interest, all other sums whatsoever due and the Agreed loss Value referred to in the Schedule of the lease agreement and the due performance and observance of all the lessee''s covenants and obligations thereunder and we further undertake to jointly and severally indemnify and keep you indemnified against all losses, claims, damages, charges and proceedings incurred or suffered by you in consequence of any failure by the lessee to perform any of the lessee''s covenants and obligations under the lease agreement.', '["premises_description", "lessee_name"]', 2, false),

-- Notice and Payment Terms
('550e8400-e29b-41d4-a716-446655440903', '550e8400-e29b-41d4-a716-446655440018', 'notice_payment', 'Notice and Payment Terms', 'We jointly and severally agree that any notice in writing by you about the indebtedness of the lessee about the lease rentals and other sums whatsoever due under the lease agreement shall be conclusive evidence against us and we shall pay the said sum to you within 15 days of service of notice by you in this regard.', '[]', 3, false),

-- Guarantee Terms
('550e8400-e29b-41d4-a716-446655440904', '550e8400-e29b-41d4-a716-446655440018', 'guarantee_terms', 'Guarantee Terms and Conditions', 'We further jointly and severally agree that:
i. Our liability under this guarantee and indemnity shall be as principal debtors and shall be a continuing guarantee and irrevocable;
ii. Our liability shall subsist whether or not you have availed legal right or remedies against the lessee;
iii. Our liability shall also extend to cover any renewal or renewals of the lease agreement; and
iv. This guarantee and indemnity shall not be affected or prejudiced by any other guarantee/indemnity and any other form of security now or hereafter held by the lessor.', '[]', 4, false),

-- Non-Discharge Conditions
('550e8400-e29b-41d4-a716-446655440905', '550e8400-e29b-41d4-a716-446655440018', 'non_discharge', 'Non-Discharge Conditions', 'Our liability under this guarantee shall not in any way be discharged, diminished or affected:
i. By the grant of time or indulgence to the lessee or by effecting any compromise with the lessee or any agreement not to sue the lessee or any variations of the terms of the lease agreement.
ii. Any change in the constitution of the lessee.', '[]', 5, false),

-- Additional Security Terms
('550e8400-e29b-41d4-a716-446655440906', '550e8400-e29b-41d4-a716-446655440018', 'additional_security', 'Additional Security and Release Terms', 'Our liability under this guarantee shall be in addition to any security or additional security obtained by you from the lessee and the loss or release of any security will not in any way diminish or affect our liability.', '[]', 6, false),

-- Binding and Survival Terms
('550e8400-e29b-41d4-a716-446655440907', '550e8400-e29b-41d4-a716-446655440018', 'binding_survival', 'Binding and Survival Terms', 'Any waiver, forbearance or indulgence granted by you to us or any of us shall not affect our liability to you hereunder and this guarantee and indemnity shall bind our respective heirs, representatives, executors, successors and assigns and shall not be determined or affected by the incapacity of any one of us.', '[]', 7, false),

-- Schedule Reference
('550e8400-e29b-41d4-a716-446655440908', '550e8400-e29b-41d4-a716-446655440018', 'schedule', 'Schedule Reference', 'The Schedule above referred to', '[]', 8, false),

-- Guarantor 1 Signature
('550e8400-e29b-41d4-a716-446655440909', '550e8400-e29b-41d4-a716-446655440018', 'guarantor1', 'First Guarantor Details', '(1) Signature: ____
Full Name: ____
Description and address: ____', '["guarantor1_signature", "guarantor1_name", "guarantor1_details"]', 9, false),

-- Guarantor 2 Signature
('550e8400-e29b-41d4-a716-446655440910', '550e8400-e29b-41d4-a716-446655440018', 'guarantor2', 'Second Guarantor Details', '(2) Signature: ____
Full Name: ____
Description and address: ____', '["guarantor2_signature", "guarantor2_name", "guarantor2_details"]', 10, false),

-- Witness Section
('550e8400-e29b-41d4-a716-446655440911', '550e8400-e29b-41d4-a716-446655440018', 'witnesses', 'Witness Section', 'WITNESSES:
____

____', '["witness1_signature", "witness2_signature"]', 11, false);

-- Insert reusable contract clauses
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES

('550e8400-e29b-41d4-a716-446655441001', 'joint_several_guarantee', 'Joint and Several Guarantee', 'Guarantors jointly and severally guarantee punctual payment of all lease rentals, interest, sums due, and performance of all lessee obligations under lease agreement.', ARRAY['joint guarantee', 'several liability', 'payment guarantee', 'performance guarantee'], ARRAY['guarantee letters', 'lease agreements', 'rental security']),

('550e8400-e29b-41d4-a716-446655441002', 'indemnity_comprehensive', 'Comprehensive Indemnity Coverage', 'Guarantors undertake to indemnify lessor against all losses, claims, damages, charges, and proceedings arising from lessee''s failure to perform lease obligations.', ARRAY['comprehensive indemnity', 'loss coverage', 'damage protection', 'legal proceedings'], ARRAY['guarantee letters', 'indemnity agreements', 'liability protection']),

('550e8400-e29b-41d4-a716-446655441003', 'notice_conclusive_evidence', 'Notice as Conclusive Evidence', 'Written notice from lessor regarding lessee indebtedness constitutes conclusive evidence with 15-day payment requirement upon service of notice.', ARRAY['conclusive evidence', 'notice requirement', '15-day payment', 'service of notice'], ARRAY['guarantee letters', 'payment enforcement', 'debt collection']),

('550e8400-e29b-41d4-a716-446655441004', 'principal_debtor_status', 'Principal Debtor Liability Status', 'Guarantor liability as principal debtors with continuing, irrevocable guarantee extending to lease renewals and unaffected by other securities.', ARRAY['principal debtor', 'continuing guarantee', 'irrevocable guarantee', 'renewal coverage'], ARRAY['guarantee letters', 'primary liability', 'security arrangements']),

('550e8400-e29b-41d4-a716-446655441005', 'non_discharge_protection', 'Non-Discharge Liability Protection', 'Guarantee liability unaffected by time grants, indulgence, compromises, agreements not to sue, lease variations, or lessee constitutional changes.', ARRAY['non-discharge', 'liability protection', 'compromise immunity', 'variation immunity'], ARRAY['guarantee letters', 'creditor protection', 'guarantee preservation']),

('550e8400-e29b-41d4-a716-446655441006', 'additional_security_independence', 'Additional Security Independence', 'Guarantee liability additional to other securities with guarantee unaffected by loss or release of any other security obtained from lessee.', ARRAY['additional security', 'security independence', 'guarantee preservation', 'security release immunity'], ARRAY['guarantee letters', 'security arrangements', 'collateral independence']),

('550e8400-e29b-41d4-a716-446655441007', 'binding_succession', 'Binding Succession and Survival', 'Guarantee binds guarantors'' heirs, representatives, executors, successors, and assigns with immunity from individual incapacity effects.', ARRAY['binding succession', 'heir liability', 'successor obligations', 'incapacity immunity'], ARRAY['guarantee letters', 'estate planning', 'succession planning']),

('550e8400-e29b-41d4-a716-446655441008', 'waiver_forbearance_immunity', 'Waiver and Forbearance Immunity', 'Guarantor liability unaffected by any waiver, forbearance, or indulgence granted by lessor to guarantors individually or collectively.', ARRAY['waiver immunity', 'forbearance immunity', 'indulgence immunity', 'liability preservation'], ARRAY['guarantee letters', 'creditor flexibility', 'guarantee preservation']);

-- Insert contract parameters
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES

('550e8400-e29b-41d4-a716-446655441101', 'guarantee_indemnity', 'lessor_name', 'Lessor Name', 'text', true, 'Name of the lessor/landlord', 'ABC Properties Pvt Ltd', NULL),
('550e8400-e29b-41d4-a716-446655441102', 'guarantee_indemnity', 'lessor_address', 'Lessor Address', 'text', true, 'Complete address of the lessor', 'Commercial Complex, MG Road, Bangalore - 560001', NULL),
('550e8400-e29b-41d4-a716-446655441103', 'guarantee_indemnity', 'premises_description', 'Premises Description', 'text', true, 'Detailed description of the leased premises', 'Office space on 3rd Floor, measuring 2000 sq ft, Commercial Tower, Electronic City', NULL),
('550e8400-e29b-41d4-a716-446655441104', 'guarantee_indemnity', 'lessee_name', 'Lessee Name', 'text', true, 'Name of the lessee/tenant', 'XYZ Technologies Pvt Ltd', NULL),
('550e8400-e29b-41d4-a716-446655441105', 'guarantee_indemnity', 'guarantor1_signature', 'First Guarantor Signature', 'text', false, 'Signature of the first guarantor', '[Guarantor 1 Signature]', NULL),
('550e8400-e29b-41d4-a716-446655441106', 'guarantee_indemnity', 'guarantor1_name', 'First Guarantor Name', 'text', true, 'Full name of the first guarantor', 'Rajesh Kumar Sharma', NULL),
('550e8400-e29b-41d4-a716-446655441107', 'guarantee_indemnity', 'guarantor1_details', 'First Guarantor Details', 'text', true, 'Description and address of first guarantor', 'Director, XYZ Technologies, House No. 123, Koramangala, Bangalore - 560034', NULL),
('550e8400-e29b-41d4-a716-446655441108', 'guarantee_indemnity', 'guarantor2_signature', 'Second Guarantor Signature', 'text', false, 'Signature of the second guarantor', '[Guarantor 2 Signature]', NULL),
('550e8400-e29b-41d4-a716-446655441109', 'guarantee_indemnity', 'guarantor2_name', 'Second Guarantor Name', 'text', true, 'Full name of the second guarantor', 'Priya Sharma', NULL),
('550e8400-e29b-41d4-a716-446655441110', 'guarantee_indemnity', 'guarantor2_details', 'Second Guarantor Details', 'text', true, 'Description and address of second guarantor', 'CEO, XYZ Technologies, Flat 45, Electronic City, Bangalore - 560100', NULL),
('550e8400-e29b-41d4-a716-446655441111', 'guarantee_indemnity', 'witness1_signature', 'First Witness Signature', 'text', false, 'Signature of the first witness', '[Witness 1 Signature]', NULL),
('550e8400-e29b-41d4-a716-446655441112', 'guarantee_indemnity', 'witness2_signature', 'Second Witness Signature', 'text', false, 'Signature of the second witness', '[Witness 2 Signature]', NULL);

-- ========================================
-- End of Template 18: Letter of Guarantee and Indemnity
-- ========================================

-- Template 19: Indemnity for Title
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES
('550e8400-e29b-41d4-a716-446655440019', 'indemnity_deed', 'Indemnity for Title', 'Deed of indemnity executed by vendor to purchaser for protection against title claims on property sold based on adverse possession without proper title documents', 'property', 'India', ARRAY['indemnity deed', 'property title', 'adverse possession', 'title protection', 'property transfer', 'title claims', 'vendor protection']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES

-- Preamble and Parties
('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440019', 'preamble', 'Deed Introduction and Parties', 'This Deed of Indemnity is made at ____ on this ____ day of ____ between Mr. ____ of ____ hereinafter referred to as "the Vendor"- of the One Part and Mr. ____ of ____ hereinafter referred to as "The Purchaser" of the Other Part:', '["deed_location", "deed_day", "deed_month_year", "vendor_name", "vendor_address", "purchaser_name", "purchaser_address"]', 1, false),

-- Conveyance Reference
('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440019', 'recital_conveyance', 'Conveyance Deed Reference', '(A) Whereas, by a Deed of Conveyance bearing even date with these Presents but executed before this deed and made between the Vendor of the One Part and the Purchaser of the Other Part, the Vendor has granted and transferred by way of sale the land and premises at ____ more particularly described in the Schedule by the said Deed of Conveyance.', '["property_location"]', 2, false),

-- Title Basis and Adverse Possession
('550e8400-e29b-41d4-a716-446655440903', '550e8400-e29b-41d4-a716-446655440019', 'recital_title', 'Title Basis and Adverse Possession', '(B) And Whereas, the title of the Vendor to the said land and premises described in the Schedule hereunder written is based on the Vendor being in possession thereof for the last more than ____ years as of right and without any interruption from anybody else and which possession has now become adverse and there is no document of title in respect thereof in favour of the Vendor.', '["possession_years"]', 3, false),

-- Sale Agreement Terms
('550e8400-e29b-41d4-a716-446655440904', '550e8400-e29b-41d4-a716-446655440019', 'recital_agreement', 'Sale Agreement and Indemnity Terms', '(C) And Whereas, at the treaty of the sale of the said land and premises it was agreed between the Vendor and the Purchaser that the Vendor shall execute a separate deed indemnifying the Purchaser against any claim made and established by any of the owners of the said land described and the Schedule of the said Deed of Conveyance being the same as described in the Schedule hereunder written and which the Vendor now proposes to do,', '[]', 4, false),

-- Indemnity Covenant
('550e8400-e29b-41d4-a716-446655440905', '550e8400-e29b-41d4-a716-446655440019', 'indemnity_covenant', 'Main Indemnity Covenant', '(D) NOW THIS DEED WITNESSETH THAT pursuant to the said agreement, the Vendor both hereby covenant with the Purchaser that the Vendor will indemnify and will keep indemnified the Purchaser against any loss, costs, charges and expenses the Purchaser may incur or suffer on account of any claim being made and established by any person or persons found interested in the said land and premises described in the Schedule.', '[]', 5, false),

-- Execution Clause
('550e8400-e29b-41d4-a716-446655440906', '550e8400-e29b-41d4-a716-446655440019', 'execution', 'Execution and Witness Clause', 'IN WITNESS WHEREOF the Vendor has put his hand the day and the year first hereinabove written.', '[]', 6, false),

-- Schedule Reference
('550e8400-e29b-41d4-a716-446655440907', '550e8400-e29b-41d4-a716-446655440019', 'schedule', 'Property Schedule Reference', 'THE SCHEDULE ABOVE REFERRED TO

____', '["property_schedule_details"]', 7, false),

-- Signature and Witness
('550e8400-e29b-41d4-a716-446655440908', '550e8400-e29b-41d4-a716-446655440019', 'signatures', 'Vendor Signature and Witness', 'Signed and delivered by the
Vendor – Mr. ____ in the presence of ____
____ (witness)', '["vendor_signature_name", "vendor_signature", "witness_signature", "witness_name"]', 8, false);

-- Insert reusable contract clauses
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES

('550e8400-e29b-41d4-a716-446655441001', 'adverse_possession_title', 'Adverse Possession Title Basis', 'Vendor title based on adverse possession for specified years without interruption, lacking formal title documents.', ARRAY['adverse possession', 'title basis', 'possession rights', 'no formal title'], ARRAY['property indemnity', 'title disputes', 'possession claims']),

('550e8400-e29b-41d4-a716-446655441002', 'comprehensive_indemnity_coverage', 'Comprehensive Title Indemnity', 'Vendor indemnifies purchaser against all losses, costs, charges, and expenses from any established title claims by interested parties.', ARRAY['title indemnity', 'comprehensive coverage', 'loss protection', 'cost coverage'], ARRAY['property indemnity', 'title protection', 'purchaser security']),

('550e8400-e29b-41d4-a716-446655441003', 'concurrent_deed_execution', 'Concurrent Conveyance and Indemnity', 'Indemnity deed executed on same date as conveyance deed but after conveyance execution for additional purchaser protection.', ARRAY['concurrent execution', 'conveyance reference', 'additional protection'], ARRAY['property transfer', 'deed coordination', 'title protection']),

('550e8400-e29b-41d4-a716-446655441004', 'sale_treaty_indemnity', 'Sale Treaty Indemnity Agreement', 'Separate indemnity deed execution agreed during sale negotiations as condition of property transfer completion.', ARRAY['sale treaty', 'negotiation condition', 'separate deed'], ARRAY['property sale', 'negotiation terms', 'conditional transfer']),

('550e8400-e29b-41d4-a716-446655441005', 'interested_party_claims', 'Protection Against Interested Party Claims', 'Indemnity covers claims made and established by any persons found to have interest in the transferred property.', ARRAY['interested parties', 'established claims', 'third party protection'], ARRAY['property indemnity', 'title disputes', 'ownership conflicts']),

('550e8400-e29b-41d4-a716-446655441006', 'property_schedule_reference', 'Property Schedule Integration', 'Property description referenced in schedule consistent with conveyance deed for precise identification.', ARRAY['property schedule', 'deed consistency', 'property identification'], ARRAY['property documentation', 'deed coordination', 'property description']),

('550e8400-e29b-41d4-a716-446655441007', 'vendor_covenant_commitment', 'Vendor Indemnity Covenant', 'Vendor enters into binding covenant to provide ongoing indemnification to purchaser against title claims.', ARRAY['vendor covenant', 'binding commitment', 'ongoing protection'], ARRAY['property indemnity', 'vendor obligations', 'purchaser protection']),

('550e8400-e29b-41d4-a716-446655441008', 'witnessed_execution', 'Witnessed Deed Execution', 'Deed execution by vendor requires witnessing for legal validity and enforceability of indemnity commitments.', ARRAY['witnessed execution', 'legal validity', 'deed enforceability'], ARRAY['property documentation', 'legal formalities', 'deed execution']);

-- Insert contract parameters
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES

('550e8400-e29b-41d4-a716-446655441101', 'indemnity_deed', 'deed_location', 'Deed Execution Location', 'text', true, 'Place where the indemnity deed is executed', 'Bangalore', NULL),
('550e8400-e29b-41d4-a716-446655441102', 'indemnity_deed', 'deed_day', 'Deed Execution Day', 'text', true, 'Day of deed execution', '15th', NULL),
('550e8400-e29b-41d4-a716-446655441103', 'indemnity_deed', 'deed_month_year', 'Deed Month and Year', 'text', true, 'Month and year of deed execution', 'May 2024', NULL),
('550e8400-e29b-41d4-a716-446655441104', 'indemnity_deed', 'vendor_name', 'Vendor Name', 'text', true, 'Full name of the property vendor', 'Mr. Rajesh Kumar Sharma', NULL),
('550e8400-e29b-41d4-a716-446655441105', 'indemnity_deed', 'vendor_address', 'Vendor Address', 'text', true, 'Complete address of the vendor', 'House No. 123, MG Road, Bangalore - 560001', NULL),
('550e8400-e29b-41d4-a716-446655441106', 'indemnity_deed', 'purchaser_name', 'Purchaser Name', 'text', true, 'Full name of the property purchaser', 'Mr. Amit Singh', NULL),
('550e8400-e29b-41d4-a716-446655441107', 'indemnity_deed', 'purchaser_address', 'Purchaser Address', 'text', true, 'Complete address of the purchaser', 'Plot 67, Koramangala, Bangalore - 560034', NULL),
('550e8400-e29b-41d4-a716-446655441108', 'indemnity_deed', 'property_location', 'Property Location', 'text', true, 'Location and description of the property being sold', 'Survey No. 45, Electronic City Phase 2, Bangalore', NULL),
('550e8400-e29b-41d4-a716-446655441109', 'indemnity_deed', 'possession_years', 'Years of Possession', 'number', true, 'Number of years vendor has been in adverse possession', '15', NULL),
('550e8400-e29b-41d4-a716-446655441110', 'indemnity_deed', 'property_schedule_details', 'Property Schedule Details', 'text', true, 'Detailed property description as per schedule', 'Land measuring 2400 sq ft, Survey No. 45, Village Begur, Electronic City Phase 2, Bangalore South Taluk', NULL),
('550e8400-e29b-41d4-a716-446655441111', 'indemnity_deed', 'vendor_signature_name', 'Vendor Name for Signature', 'text', true, 'Vendor name as it appears in signature section', 'Mr. Rajesh Kumar Sharma', NULL),
('550e8400-e29b-41d4-a716-446655441112', 'indemnity_deed', 'vendor_signature', 'Vendor Signature', 'text', false, 'Vendor signature placeholder', '[Vendor Signature]', NULL),
('550e8400-e29b-41d4-a716-446655441113', 'indemnity_deed', 'witness_signature', 'Witness Signature', 'text', false, 'Witness signature placeholder', '[Witness Signature]', NULL),
('550e8400-e29b-41d4-a716-446655441114', 'indemnity_deed', 'witness_name', 'Witness Name', 'text', true, 'Full name of the witness', 'Priya Sharma', NULL);

-- ========================================
-- End of Template 19: Indemnity for Title
-- ========================================

-- Template 20: Release to the Rights of Possession
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'possession_release', 'Release to the Rights of Possession', 'Tenant release document surrendering all rights to possession and occupation of rental property with confirmation of vacating and key return', 'property', 'India', ARRAY['possession release', 'tenant surrender', 'property vacation', 'rental termination', 'key return', 'landlord release', 'tenancy end']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES

-- Document Header
('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440020', 'header', 'Document Header Information', 'Landlord: ____
Property: ____
Date: ____', '["landlord_name", "property_address", "release_date"]', 1, false),

-- Tenant Verification
('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440020', 'tenant_verification', 'Tenant Identity Verification', 'I, ____, verify that I have been the tenant at ____ from the date of ____ to ____.', '["tenant_name", "property_verification", "tenancy_start_date", "tenancy_end_date"]', 2, false),

-- Rights Release
('550e8400-e29b-41d4-a716-446655440903', '550e8400-e29b-41d4-a716-446655440020', 'rights_release', 'Release of Possession Rights', 'I now hereby release all of my rights to possession and occupation of the property mentioned above. I verify that I have removed all of my possessions and returned keys to the Landlord. I will not return to the premises, nor make any claims against the Landlord or his successors, assigns, or representative.', '[]', 3, false),

-- Signature Section
('550e8400-e29b-41d4-a716-446655440904', '550e8400-e29b-41d4-a716-446655440020', 'signatures', 'Signatures and Witness Section', '(tenant''s Signature) (Landlord''s Signature)

(Witness) (Date)
1. ____
2. ____', '["tenant_signature", "landlord_signature", "witness1_signature", "witness2_signature", "signature_date"]', 4, false);

-- Insert reusable contract clauses
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES

('550e8400-e29b-41d4-a716-446655441001', 'tenancy_verification', 'Tenancy Period Verification', 'Tenant confirms identity and verifies specific tenancy period with start and end dates for property occupation.', ARRAY['tenancy verification', 'occupation period', 'tenant identity'], ARRAY['possession release', 'tenancy termination', 'rental documentation']),

('550e8400-e29b-41d4-a716-446655441002', 'complete_possession_release', 'Complete Possession Rights Release', 'Tenant releases all rights to possession and occupation of property with confirmation of complete vacation.', ARRAY['possession release', 'occupation rights', 'complete surrender'], ARRAY['possession release', 'tenancy termination', 'property surrender']),

('550e8400-e29b-41d4-a716-446655441003', 'possessions_removal_confirmation', 'Possessions Removal Confirmation', 'Tenant confirms removal of all personal possessions from the property and return of all keys to landlord.', ARRAY['possessions removal', 'key return', 'property clearance'], ARRAY['possession release', 'move-out documentation', 'property handover']),

('550e8400-e29b-41d4-a716-446655441004', 'no_return_commitment', 'No Return to Premises Commitment', 'Tenant commits to not returning to premises and waives any future claims against landlord or successors.', ARRAY['no return', 'premises prohibition', 'future claims waiver'], ARRAY['possession release', 'landlord protection', 'claim prevention']),

('550e8400-e29b-41d4-a716-446655441005', 'landlord_successor_protection', 'Landlord and Successor Protection', 'Release extends to landlord''s successors, assigns, and representatives for comprehensive protection against future claims.', ARRAY['successor protection', 'assign protection', 'representative coverage'], ARRAY['possession release', 'ownership transition', 'comprehensive protection']),

('550e8400-e29b-41d4-a716-446655441006', 'dual_party_execution', 'Dual Party Signature Requirement', 'Document requires signatures from both tenant and landlord for mutual acknowledgment and legal validity.', ARRAY['dual signature', 'mutual acknowledgment', 'legal validity'], ARRAY['possession release', 'agreement execution', 'legal documentation']),

('550e8400-e29b-41d4-a716-446655441007', 'witness_requirement', 'Witness Documentation Requirement', 'Document execution requires witnessing by two independent parties for enhanced legal enforceability.', ARRAY['witness requirement', 'independent parties', 'legal enforceability'], ARRAY['possession release', 'legal formalities', 'document validation']),

('550e8400-e29b-41d4-a716-446655441008', 'property_identification', 'Specific Property Identification', 'Clear identification of specific property address for precise scope of possession release and rights surrender.', ARRAY['property identification', 'specific address', 'precise scope'], ARRAY['possession release', 'property documentation', 'scope definition']);

-- Insert contract parameters
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES

('550e8400-e29b-41d4-a716-446655441101', 'possession_release', 'landlord_name', 'Landlord Name', 'text', true, 'Full name of the landlord/property owner', 'Mr. Rajesh Kumar Sharma', NULL),
('550e8400-e29b-41d4-a716-446655441102', 'possession_release', 'property_address', 'Property Address', 'text', true, 'Complete address of the rental property', 'Flat 3B, Sunrise Apartments, Electronic City, Bangalore - 560100', NULL),
('550e8400-e29b-41d4-a716-446655441103', 'possession_release', 'release_date', 'Release Date', 'date', true, 'Date when the possession release is executed', '2024-03-15', NULL),
('550e8400-e29b-41d4-a716-446655441104', 'possession_release', 'tenant_name', 'Tenant Name', 'text', true, 'Full name of the tenant releasing possession', 'Ms. Priya Sharma', NULL),
('550e8400-e29b-41d4-a716-446655441105', 'possession_release', 'property_verification', 'Property for Verification', 'text', true, 'Property address for tenant verification', 'Flat 3B, Sunrise Apartments, Electronic City, Bangalore', NULL),
('550e8400-e29b-41d4-a716-446655441106', 'possession_release', 'tenancy_start_date', 'Tenancy Start Date', 'date', true, 'Date when tenancy period began', '2022-06-01', NULL),
('550e8400-e29b-41d4-a716-446655441107', 'possession_release', 'tenancy_end_date', 'Tenancy End Date', 'date', true, 'Date when tenancy period ended', '2024-03-14', NULL),
('550e8400-e29b-41d4-a716-446655441108', 'possession_release', 'tenant_signature', 'Tenant Signature', 'text', false, 'Tenant signature for possession release', '[Tenant Signature]', NULL),
('550e8400-e29b-41d4-a716-446655441109', 'possession_release', 'landlord_signature', 'Landlord Signature', 'text', false, 'Landlord signature acknowledging release', '[Landlord Signature]', NULL),
('550e8400-e29b-41d4-a716-446655441110', 'possession_release', 'witness1_signature', 'First Witness', 'text', false, 'First witness signature', '[Witness 1]', NULL),
('550e8400-e29b-41d4-a716-446655441111', 'possession_release', 'witness2_signature', 'Second Witness', 'text', false, 'Second witness signature', '[Witness 2]', NULL),
('550e8400-e29b-41d4-a716-446655441112', 'possession_release', 'signature_date', 'Signature Date', 'date', true, 'Date when signatures are executed', '2024-03-15', NULL);

-- ========================================
-- End of Template 20: Release to the Rights of Possession
-- ========================================

-- Template 21: Agreement for Hire-Purchase of Machinery
-- ========================================

-- Insert main template record
INSERT INTO contract_templates (id, type, name, description, category, jurisdiction, tags) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'hire_purchase', 'Agreement for Hire-Purchase of Machinery', 'Comprehensive hire-purchase agreement for machinery with owner financing, monthly payments, insurance requirements, and surety guarantee provisions', 'commercial', 'India', ARRAY['hire purchase', 'machinery financing', 'equipment lease', 'monthly payments', 'insurance requirements', 'surety guarantee', 'equipment rental']);

-- Insert contract sections
INSERT INTO contract_sections (id, template_id, section_type, title, content, variables, order_index, is_optional) VALUES

-- Preamble and Parties
('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440021', 'preamble', 'Agreement Parties and Introduction', 'This Agreement made at ____ this ____ day of ____, 2016, between ____ having its registered office at ____ (hereinafter called "the Owner") ____ and having its place of business at ____ (hereinafter called "the Hirer") of the Second Part and ____ resident of ____ (hereinafter called ''the Surety").', '["agreement_location", "agreement_day", "agreement_month", "owner_name", "owner_address", "hirer_name", "hirer_address", "surety_name", "surety_address"]', 1, false),

-- Finance Request
('550e8400-e29b-41d4-a716-446655440902', '550e8400-e29b-41d4-a716-446655440021', 'recital_request', 'Finance Request Recital', 'Whereas, the hirer has vide his letter dated ____ requested the owner to provide finance for the purchase of ____ machine.', '["request_letter_date", "machine_type"]', 2, false),

-- Finance Agreement
('550e8400-e29b-41d4-a716-446655440903', '550e8400-e29b-41d4-a716-446655440021', 'recital_agreement', 'Finance Agreement Recital', 'And Whereas, the owner has by its reply dated ____ agreed to provide finance for the purchase of ____ machine on the terms and conditions laid down in the said letter and the documents to be executed for the said purpose.', '["reply_date", "machine_type_agreement"]', 3, false),

-- Purchase Order
('550e8400-e29b-41d4-a716-446655440904', '550e8400-e29b-41d4-a716-446655440021', 'recital_order', 'Purchase Order Recital', 'And Whereas the hirer has placed an order with M/s ____ for the purchase of ____ machine.', '["supplier_name", "machine_order_type"]', 4, false),

-- Finance Provision
('550e8400-e29b-41d4-a716-446655440905', '550e8400-e29b-41d4-a716-446655440021', 'recital_payment', 'Finance Provision Recital', 'And Whereas, the owner has provided the finance by making payment of an amount of Rs.____ vide cheque No.____ dated ____ drawn on ____ to the supplier ____', '["finance_amount", "cheque_number", "cheque_date", "bank_name", "supplier_payment"]', 5, false),

-- Hire Agreement Terms
('550e8400-e29b-41d4-a716-446655440906', '550e8400-e29b-41d4-a716-446655440021', 'hire_terms', 'Hire Agreement Terms', 'Now in consideration of the above, it is agreed between the parties as follows:

The owner, being the owner of the ____ machine with fittings, tools, and accessories, more particularly described in the Schedule hereto shall let and the hirer shall take on hire from the ____ day of ____', '["machine_description", "hire_start_day", "hire_start_month"]', 6, false),

-- Payment Terms
('550e8400-e29b-41d4-a716-446655440907', '550e8400-e29b-41d4-a716-446655440021', 'payment_terms', 'Payment Terms and Schedule', 'On execution of these presents, the hirer shall pay a sum of Rs. ____ to the owner as initial payment by way of hire and shall during the continuance of this agreement pay to the owner at his address for the time and without previous demand by way of rent for the hire of the said ____ machine the monthly sum of Rs.____ the first payment to be made on the ____ day of ____ next and each subsequent payment on the ____ day of each succeeding month during the said term.', '["initial_payment", "machine_payment_type", "monthly_rent", "first_payment_day", "first_payment_month", "subsequent_payment_day"]', 7, false),

-- Hirer Obligations - Non-disposal
('550e8400-e29b-41d4-a716-446655440908', '550e8400-e29b-41d4-a716-446655440021', 'obligations_non_disposal', 'Non-disposal Obligations', 'During the continuance of the agreement, the hirer shall

a. not sell or offer for sale, assign, mortgage, pledge, sub-let, let or otherwise deal with the said ____ machine or any part or parts thereof or with any interest therein;', '["machine_obligation_type"]', 8, false),

-- Hirer Obligations - Possession
('550e8400-e29b-41d4-a716-446655440909', '550e8400-e29b-41d4-a716-446655440021', 'obligations_possession', 'Possession and Custody Obligations', 'b. keep the said ____ machine in his own possession and will not remove the same or any part or parts thereof without the previous consent in writing of the owner;', '["machine_possession_type"]', 9, false),

-- Hirer Obligations - Maintenance
('550e8400-e29b-41d4-a716-446655440910', '550e8400-e29b-41d4-a716-446655440021', 'obligations_maintenance', 'Maintenance and Repair Obligations', 'c. use the ____ machine in a skilful and proper manner and shall at his own expense keep the said weighing machine in good and substantial repair and condition (reasonable wear and tear excepted);', '["machine_maintenance_type"]', 10, false),

-- Insurance Obligations
('550e8400-e29b-41d4-a716-446655440911', '550e8400-e29b-41d4-a716-446655440021', 'obligations_insurance', 'Insurance Requirements', 'd. keep insured the ____ machine during the period of hiring against any loss or damage by hire or otherwise in the sum of Rs ____ with an insurance company in the name of the owner and deliver the policy of such insurance to the owner and duly and punctually pay all premiums necessary for keeping the said insurance effective throughout the period of this agreement:', '["machine_insurance_type", "insurance_amount"]', 11, false),

-- Insurance Default Provision
('550e8400-e29b-41d4-a716-446655440912', '550e8400-e29b-41d4-a716-446655440021', 'insurance_default', 'Insurance Default Provision', 'Provided that in case the hirer shall at any time fail to effect or keep effect the said policy by making default in any payment of premium, the owner shall be entitled to effect such insurance and pay the premium to the said insurance company and the hirer shall forthwith pay to the owner all the premiums and other sums paid by the owner;', '[]', 12, false),

-- Compliance Obligations
('550e8400-e29b-41d4-a716-446655440913', '550e8400-e29b-41d4-a716-446655440021', 'obligations_compliance', 'Legal Compliance Obligations', 'e. not do or omit to do any act which may result in seizure and/or the confiscation of the ____ machine by the Central or State Government or local authority or any public officer or authority under any law for the time being in force.', '["machine_compliance_type"]', 13, false),

-- Insurance Proceeds
('550e8400-e29b-41d4-a716-446655440914', '550e8400-e29b-41d4-a716-446655440021', 'insurance_proceeds', 'Insurance Proceeds and Replacement', 'If the said ____ machine shall be destroyed or damaged by fire or otherwise, all moneys received or receivable in respect of such insurance as aforesaid shall forthwith be received by the owner who shall as the case may require, apply such money either in making good the damage done or in replacing the said ____ machine by other articles of similar description and value and such substituted articles shall become subject to the provisions of this agreement in the same manner as the articles for which they shall have been substituted.', '["machine_insurance_proceeds_type"]', 14, false),

-- Termination Notice
('550e8400-e29b-41d4-a716-446655440915', '550e8400-e29b-41d4-a716-446655440021', 'termination_notice', 'Termination Notice Provision', 'The hirer may determine the hiring at any time by giving 15 days notice in writing to the owner at his address for the time being and by returning the said ____ machine at the hirer''s own risk and expense and shall thereupon forthwith pay to the owner all hire charges upto the date of such determination and other sums due under the agreement.', '["machine_termination_type"]', 15, false),

-- Document Return
('550e8400-e29b-41d4-a716-446655440916', '550e8400-e29b-41d4-a716-446655440021', 'document_return', 'Document Return Upon Termination', 'If the agreement is determined before the property in the said ____ machine passes to the hirer, the hirer shall forthwith return to the owner, policies and other documents relating to the said ____ machine.', '["machine_document_type"]', 16, false),

-- Inspection Acknowledgment
('550e8400-e29b-41d4-a716-446655440917', '550e8400-e29b-41d4-a716-446655440021', 'inspection_acknowledgment', 'Inspection and Suitability Acknowledgment', 'The hirer acknowledges and agrees with the owner that he has inspected the weighing machine and he is satisfied that the ____ machine is suitable for his purpose and the owner shall not be liable to the hirer for any liability, claim, loss, damage or expenses caused directly or indirectly by the said ____ machine or any inadequacy thereof for any purpose or any defect therein or by the use thereof or in relation to any repairs, servicing, maintenance of the said ____ machine.', '["machine_inspection_type"]', 17, false),

-- Cost and Tax Liability
('550e8400-e29b-41d4-a716-446655440918', '550e8400-e29b-41d4-a716-446655440021', 'cost_tax_liability', 'Installation and Tax Liability', 'The hirer shall be liable to bear and incur the installation cost, cost of detachment of the ____ machine taken on hire and to pay any tax, levy, rates or assessments levied at any time by the Central Government, State Government or any local authority on the total of or any installments payable under this agreement.', '["machine_cost_type"]', 18, false),

-- Performance Condition
('550e8400-e29b-41d4-a716-446655440919', '550e8400-e29b-41d4-a716-446655440021', 'performance_condition', 'Performance Condition Clause', 'If the hirer shall duly perform and observe all the terms and conditions in this agreement and the covenants on his part to be performed and observed and shall punctually pay to the owner the sums as agreed', '[]', 19, false),

-- Waiver Clause
('550e8400-e29b-41d4-a716-446655440920', '550e8400-e29b-41d4-a716-446655440021', 'waiver_clause', 'Owner Rights Waiver Protection', 'No neglect, delay, indulgence, forbearance or waiver on the part of the owner in enforcing any terms or conditions of this agreement shall prejudice the rights of the owner hereunder.', '[]', 20, false),

-- Surety Guarantee
('550e8400-e29b-41d4-a716-446655440921', '550e8400-e29b-41d4-a716-446655440021', 'surety_guarantee', 'Surety Guarantee Provision', 'In consideration of the owner letting the said ____ machine to the hirer at the rent and under the agreements and conditions hereinbefore expressed, the surety hereby guarantees the due payment of the said rents and all other sums of money which may become payable under this agreement and the performance and observance of the said agreements and conditions by the hirer and this guarantee shall not be prejudiced by the owner neglecting or forbearing to enforce this agreement against the hirer or giving time for the payment of the said rents when due or delaying to take any steps to enforce the performance or observance of the said agreements or conditions or granting any indulgence to the hirer.', '["machine_surety_type"]', 21, false),

-- Declaration of Understanding
('550e8400-e29b-41d4-a716-446655440922', '550e8400-e29b-41d4-a716-446655440021', 'understanding_declaration', 'Declaration of Understanding', 'The parties to this agreement hereby declare that they have fully understood the meaning of all the clauses, terms and conditions of this agreement and they have accepted and executed this agreement with full knowledge and understanding of the obligations herein.', '[]', 22, false),

-- Execution Clause
('550e8400-e29b-41d4-a716-446655440923', '550e8400-e29b-41d4-a716-446655440021', 'execution', 'Execution Clause', 'IN WITNESS WHEREOF, the parties have executed this agreement on the day and the year first hereinabove written.', '[]', 23, false),

-- Signatures
('550e8400-e29b-41d4-a716-446655440924', '550e8400-e29b-41d4-a716-446655440021', 'signatures', 'Party Signatures', 'Signatures
____ 
(the owner)
____
(the hirer)
____
(the surety)', '["owner_signature", "hirer_signature", "surety_signature"]', 24, false),

-- Witnesses
('550e8400-e29b-41d4-a716-446655440925', '550e8400-e29b-41d4-a716-446655440021', 'witnesses', 'Witness Section', 'WITNESSES:
1. ____
2. ____', '["witness1_signature", "witness2_signature"]', 25, false);

-- Insert reusable contract clauses
INSERT INTO contract_clauses (id, clause_type, title, content, tags, use_cases) VALUES

('550e8400-e29b-41d4-a716-446655441001', 'hire_purchase_financing', 'Owner Financing for Equipment Purchase', 'Owner provides financing for machinery purchase through hire-purchase arrangement with scheduled monthly payments.', ARRAY['equipment financing', 'hire purchase', 'monthly payments', 'owner financing'], ARRAY['machinery agreements', 'equipment leasing', 'business financing']),

('550e8400-e29b-41d4-a716-446655441002', 'comprehensive_restrictions', 'Comprehensive Equipment Use Restrictions', 'Hirer prohibited from selling, assigning, mortgaging, pledging, or otherwise dealing with hired equipment without owner consent.', ARRAY['use restrictions', 'equipment protection', 'disposal prohibition'], ARRAY['hire purchase', 'equipment protection', 'asset security']),

('550e8400-e29b-41d4-a716-446655441003', 'maintenance_repair_obligation', 'Hirer Maintenance and Repair Obligation', 'Hirer responsible for skilful use and maintenance of equipment at own expense, excluding reasonable wear and tear.', ARRAY['maintenance obligation', 'repair responsibility', 'equipment care'], ARRAY['hire purchase', 'equipment maintenance', 'operational responsibility']),

('550e8400-e29b-41d4-a716-446655441004', 'mandatory_insurance_coverage', 'Mandatory Equipment Insurance Coverage', 'Hirer must maintain comprehensive insurance coverage in owner''s name with timely premium payments throughout agreement term.', ARRAY['mandatory insurance', 'coverage requirement', 'premium responsibility'], ARRAY['hire purchase', 'equipment protection', 'risk management']),

('550e8400-e29b-41d4-a716-446655441005', 'owner_insurance_default_rights', 'Owner Insurance Default Intervention Rights', 'Owner may obtain insurance and recover premiums from hirer in case of insurance default or premium payment failure.', ARRAY['insurance default', 'owner intervention', 'premium recovery'], ARRAY['hire purchase', 'insurance protection', 'default remedies']),

('550e8400-e29b-41d4-a716-446655441006', 'legal_compliance_requirement', 'Legal Compliance and Seizure Prevention', 'Hirer must ensure compliance with all laws to prevent equipment seizure or confiscation by government authorities.', ARRAY['legal compliance', 'seizure prevention', 'regulatory adherence'], ARRAY['hire purchase', 'legal protection', 'compliance requirements']),

('550e8400-e29b-41d4-a716-446655441007', 'insurance_proceeds_control', 'Owner Control of Insurance Proceeds', 'Owner receives and controls insurance proceeds for equipment repair, replacement, or damage compensation.', ARRAY['insurance proceeds', 'owner control', 'replacement authority'], ARRAY['hire purchase', 'insurance management', 'asset protection']),

('550e8400-e29b-41d4-a716-446655441008', 'termination_notice_requirement', 'Fifteen-Day Termination Notice Requirement', 'Hirer may terminate agreement with 15-day written notice, equipment return, and payment of all outstanding charges.', ARRAY['termination notice', '15-day requirement', 'equipment return'], ARRAY['hire purchase', 'agreement termination', 'exit procedures']),

('550e8400-e29b-41d4-a716-446655441009', 'inspection_suitability_disclaimer', 'Equipment Inspection and Suitability Disclaimer', 'Hirer acknowledges equipment inspection and suitability with owner disclaimer for defects, inadequacy, or damages.', ARRAY['inspection acknowledgment', 'suitability confirmation', 'owner disclaimer'], ARRAY['hire purchase', 'liability limitation', 'equipment acceptance']),

('550e8400-e29b-41d4-a716-446655441010', 'comprehensive_surety_guarantee', 'Comprehensive Surety Performance Guarantee', 'Surety guarantees all hirer obligations including rent payments and performance with protection against owner forbearance.', ARRAY['surety guarantee', 'performance security', 'payment guarantee'], ARRAY['hire purchase', 'credit enhancement', 'payment security']);

-- Insert contract parameters
INSERT INTO contract_parameters (id, contract_type, parameter_key, parameter_label, parameter_type, is_required, help_text, example_value, options) VALUES

('550e8400-e29b-41d4-a716-446655441101', 'hire_purchase', 'agreement_location', 'Agreement Location', 'text', true, 'Place where the hire-purchase agreement is made', 'Mumbai', NULL),
('550e8400-e29b-41d4-a716-446655441102', 'hire_purchase', 'agreement_day', 'Agreement Day', 'text', true, 'Day of agreement execution', '15th', NULL),
('550e8400-e29b-41d4-a716-446655441103', 'hire_purchase', 'agreement_month', 'Agreement Month', 'text', true, 'Month of agreement execution', 'June', NULL),
('550e8400-e29b-41d4-a716-446655441104', 'hire_purchase', 'owner_name', 'Owner Company Name', 'text', true, 'Name of the financing company/owner', 'ABC Equipment Finance Ltd', NULL),
('550e8400-e29b-41d4-a716-446655441105', 'hire_purchase', 'owner_address', 'Owner Registered Address', 'text', true, 'Registered office address of the owner', 'Industrial Estate, Andheri East, Mumbai - 400069', NULL),
('550e8400-e29b-41d4-a716-446655441106', 'hire_purchase', 'hirer_name', 'Hirer Company Name', 'text', true, 'Name of the company hiring the equipment', 'XYZ Manufacturing Pvt Ltd', NULL),
('550e8400-e29b-41d4-a716-446655441107', 'hire_purchase', 'hirer_address', 'Hirer Business Address', 'text', true, 'Place of business of the hirer', 'Plot 123, Electronic City, Bangalore - 560100', NULL),
('550e8400-e29b-41d4-a716-446655441108', 'hire_purchase', 'surety_name', 'Surety Name', 'text', true, 'Name of the person providing surety', 'Mr. Rajesh Kumar Sharma', NULL),
('550e8400-e29b-41d4-a716-446655441109', 'hire_purchase', 'surety_address', 'Surety Address', 'text', true, 'Residential address of the surety', 'House No. 45, MG Road, Bangalore - 560001', NULL),
('550e8400-e29b-41d4-a716-446655441110', 'hire_purchase', 'request_letter_date', 'Finance Request Date', 'date', true, 'Date of hirer''s finance request letter', '2016-05-01', NULL),
('550e8400-e29b-41d4-a716-446655441111', 'hire_purchase', 'machine_type', 'Type of Machine', 'text', true, 'Type of machinery being financed', 'CNC Milling Machine', NULL),
('550e8400-e29b-41d4-a716-446655441112', 'hire_purchase', 'reply_date', 'Finance Approval Date', 'date', true, 'Date of owner''s approval reply', '2016-05-10', NULL),
('550e8400-e29b-41d4-a716-446655441113', 'hire_purchase', 'machine_type_agreement', 'Machine Type in Agreement', 'text', true, 'Machine type as mentioned in finance agreement', 'CNC Milling Machine', NULL),
('550e8400-e29b-41d4-a716-446655441114', 'hire_purchase', 'supplier_name', 'Equipment Supplier Name', 'text', true, 'Name of the machinery supplier', 'M/s Precision Engineering Works', NULL),
('550e8400-e29b-41d4-a716-446655441115', 'hire_purchase', 'machine_order_type', 'Machine Order Type', 'text', true, 'Type of machine ordered from supplier', 'CNC Milling Machine', NULL),
('550e8400-e29b-41d4-a716-446655441116', 'hire_purchase', 'finance_amount', 'Finance Amount', 'currency', true, 'Amount financed by the owner', '2500000', NULL),
('550e8400-e29b-41d4-a716-446655441117', 'hire_purchase', 'cheque_number', 'Payment Cheque Number', 'text', true, 'Cheque number for supplier payment', 'CHQ001234', NULL),
('550e8400-e29b-41d4-a716-446655441118', 'hire_purchase', 'cheque_date', 'Payment Cheque Date', 'date', true, 'Date of payment cheque', '2016-05-15', NULL),
('550e8400-e29b-41d4-a716-446655441119', 'hire_purchase', 'bank_name', 'Bank Name', 'text', true, 'Bank on which payment cheque is drawn', 'State Bank of India', NULL),
('550e8400-e29b-41d4-a716-446655441120', 'hire_purchase', 'supplier_payment', 'Supplier Payment Name', 'text', true, 'Supplier receiving the payment', 'Precision Engineering Works', NULL),
('550e8400-e29b-41d4-a716-446655441121', 'hire_purchase', 'machine_description', 'Machine Description', 'text', true, 'Detailed description of the machine', 'CNC Milling Machine with fittings and accessories', NULL),
('550e8400-e29b-41d4-a716-446655441122', 'hire_purchase', 'hire_start_day', 'Hire Start Day', 'text', true, 'Day when hire period begins', '1st', NULL),
('550e8400-e29b-41d4-a716-446655441123', 'hire_purchase', 'hire_start_month', 'Hire Start Month', 'text', true, 'Month when hire period begins', 'July', NULL),
('550e8400-e29b-41d4-a716-446655441124', 'hire_purchase', 'initial_payment', 'Initial Payment Amount', 'currency', true, 'Initial payment by hirer upon execution', '250000', NULL),
('550e8400-e29b-41d4-a716-446655441125', 'hire_purchase', 'machine_payment_type', 'Machine Type for Payment', 'text', true, 'Machine type referenced in payment terms', 'CNC Milling Machine', NULL),
('550e8400-e29b-41d4-a716-446655441126', 'hire_purchase', 'monthly_rent', 'Monthly Rent Amount', 'currency', true, 'Monthly hire rent amount', '125000', NULL),
('550e8400-e29b-41d4-a716-446655441127', 'hire_purchase', 'first_payment_day', 'First Payment Day', 'text', true, 'Day of first monthly payment', '1st', NULL),
('550e8400-e29b-41d4-a716-446655441128', 'hire_purchase', 'first_payment_month', 'First Payment Month', 'text', true, 'Month of first payment', 'August', NULL),
('550e8400-e29b-41d4-a716-446655441129', 'hire_purchase', 'subsequent_payment_day', 'Subsequent Payment Day', 'text', true, 'Day of each subsequent monthly payment', '1st', NULL),
('550e8400-e29b-41d4-a716-446655441130', 'hire_purchase', 'insurance_amount', 'Insurance Coverage Amount', 'currency', true, 'Insurance coverage amount required', '3000000', NULL),
('550e8400-e29b-41d4-a716-446655441131', 'hire_purchase', 'owner_signature', 'Owner Signature', 'text', false, 'Owner signature for agreement', '[Owner Signature]', NULL),
('550e8400-e29b-41d4-a716-446655441132', 'hire_purchase', 'hirer_signature', 'Hirer Signature', 'text', false, 'Hirer signature for agreement', '[Hirer Signature]', NULL),
('550e8400-e29b-41d4-a716-446655441133', 'hire_purchase', 'surety_signature', 'Surety Signature', 'text', false, 'Surety signature for guarantee', '[Surety Signature]', NULL),
('550e8400-e29b-41d4-a716-446655441134', 'hire_purchase', 'witness1_signature', 'First Witness Signature', 'text', false, 'First witness signature', '[Witness 1 Signature]', NULL),
('550e8400-e29b-41d4-a716-446655441135', 'hire_purchase', 'witness2_signature', 'Second Witness Signature', 'text', false, 'Second witness signature', '[Witness 2 Signature]', NULL);

-- ========================================
-- End of Template 21: Agreement for Hire-Purchase of Machinery
-- ========================================