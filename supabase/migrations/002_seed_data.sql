-- ── Skills ───────────────────────────────────────────────────────────────────

insert into skills (name, category) values
  ('JavaScript', 'Programming'),
  ('TypeScript', 'Programming'),
  ('Python', 'Programming'),
  ('Java', 'Programming'),
  ('Go', 'Programming'),
  ('React', 'Frontend'),
  ('Next.js', 'Frontend'),
  ('Vue.js', 'Frontend'),
  ('HTML/CSS', 'Frontend'),
  ('Tailwind CSS', 'Frontend'),
  ('Node.js', 'Backend'),
  ('FastAPI', 'Backend'),
  ('Django', 'Backend'),
  ('PostgreSQL', 'Database'),
  ('MySQL', 'Database'),
  ('MongoDB', 'Database'),
  ('Redis', 'Database'),
  ('Docker', 'DevOps'),
  ('Kubernetes', 'DevOps'),
  ('AWS', 'Cloud'),
  ('Azure', 'Cloud'),
  ('GCP', 'Cloud'),
  ('Git', 'Tools'),
  ('CI/CD', 'DevOps'),
  ('Machine Learning', 'AI/ML'),
  ('Data Analysis', 'Data'),
  ('SQL', 'Data'),
  ('Tableau', 'Data'),
  ('Power BI', 'Data'),
  ('Product Management', 'Product'),
  ('Agile/Scrum', 'Process'),
  ('UI/UX Design', 'Design'),
  ('Figma', 'Design'),
  ('Digital Marketing', 'Marketing'),
  ('SEO', 'Marketing'),
  ('Project Management', 'Management'),
  ('Communication', 'Soft Skills'),
  ('Leadership', 'Soft Skills');

-- ── Career Nodes ─────────────────────────────────────────────────────────────

insert into career_nodes (title, level, avg_salary_myr_min, avg_salary_myr_max, typical_years_in_role, category, description) values
  -- Software Engineering
  ('Software Engineering Intern', 'entry', 1000, 2500, 1, 'Engineering', 'Internship role for aspiring software engineers'),
  ('Junior Software Engineer', 'entry', 3500, 5500, 2, 'Engineering', 'Entry-level software development role'),
  ('Software Engineer', 'mid', 5500, 9000, 3, 'Engineering', 'Mid-level software development role'),
  ('Senior Software Engineer', 'senior', 9000, 15000, 3, 'Engineering', 'Senior-level software development role'),
  ('Lead Software Engineer', 'lead', 14000, 22000, 3, 'Engineering', 'Technical lead for engineering teams'),
  ('Engineering Manager', 'lead', 16000, 28000, 3, 'Engineering', 'Manages engineering teams and delivery'),
  ('VP of Engineering', 'executive', 25000, 45000, 4, 'Engineering', 'Heads engineering organisation'),

  -- Data / AI
  ('Data Analyst Intern', 'entry', 1000, 2000, 1, 'Data', 'Internship in data analysis'),
  ('Data Analyst', 'entry', 3500, 6000, 2, 'Data', 'Analyses data to support business decisions'),
  ('Senior Data Analyst', 'mid', 6000, 10000, 3, 'Data', 'Leads analysis projects and mentors juniors'),
  ('Data Scientist', 'mid', 7000, 13000, 3, 'Data', 'Builds ML models and extracts insights'),
  ('Senior Data Scientist', 'senior', 12000, 20000, 3, 'Data', 'Leads data science initiatives'),
  ('Head of Data', 'lead', 18000, 30000, 3, 'Data', 'Leads data strategy and teams'),
  ('Machine Learning Engineer', 'mid', 8000, 15000, 3, 'AI/ML', 'Builds and deploys ML systems at scale'),

  -- Product
  ('Product Management Intern', 'entry', 1000, 2000, 1, 'Product', 'Internship in product management'),
  ('Associate Product Manager', 'entry', 4000, 6500, 2, 'Product', 'Entry-level product management role'),
  ('Product Manager', 'mid', 7000, 12000, 3, 'Product', 'Owns product features and roadmap'),
  ('Senior Product Manager', 'senior', 12000, 20000, 3, 'Product', 'Leads product strategy for key areas'),
  ('Director of Product', 'lead', 18000, 30000, 4, 'Product', 'Heads product organisation'),

  -- Design
  ('UI/UX Design Intern', 'entry', 800, 2000, 1, 'Design', 'Internship in product design'),
  ('Junior UI/UX Designer', 'entry', 3000, 5000, 2, 'Design', 'Entry-level product design role'),
  ('UI/UX Designer', 'mid', 5000, 9000, 3, 'Design', 'Designs user interfaces and experiences'),
  ('Senior UI/UX Designer', 'senior', 9000, 15000, 3, 'Design', 'Leads design for complex products'),
  ('Head of Design', 'lead', 15000, 26000, 4, 'Design', 'Leads design organisation'),

  -- Business / Strategy
  ('Business Analyst Intern', 'entry', 1000, 2000, 1, 'Business', 'Internship in business analysis'),
  ('Business Analyst', 'entry', 3500, 6000, 2, 'Business', 'Bridges business and technology'),
  ('Senior Business Analyst', 'mid', 6000, 10000, 3, 'Business', 'Leads complex analysis and stakeholder management'),
  ('Strategy Consultant', 'mid', 7000, 14000, 3, 'Business', 'Advises on business strategy'),
  ('Product Analyst', 'mid', 5500, 9000, 3, 'Product', 'Analyses product metrics and drives decisions');

-- ── Career Edges (transitions) ────────────────────────────────────────────────

insert into career_edges (from_node_id, to_node_id, avg_transition_months, skill_gaps)
select fn.id, tn.id, months, gaps::text[]
from (values
  -- Engineering track
  ('Software Engineering Intern',    'Junior Software Engineer',   6,  '{"TypeScript","System Design"}'),
  ('Junior Software Engineer',       'Software Engineer',          24, '{"System Design","Code Review","Mentoring"}'),
  ('Software Engineer',              'Senior Software Engineer',   36, '{"Architecture","Leadership","Performance"}'),
  ('Senior Software Engineer',       'Lead Software Engineer',     30, '{"Team Management","Roadmap Planning","Stakeholder Communication"}'),
  ('Senior Software Engineer',       'Engineering Manager',        24, '{"People Management","OKRs","Hiring"}'),
  ('Lead Software Engineer',         'Engineering Manager',        18, '{"People Management","OKRs","Hiring"}'),
  ('Engineering Manager',            'VP of Engineering',          36, '{"Org Design","Executive Communication","Budget Management"}'),

  -- Data track
  ('Data Analyst Intern',            'Data Analyst',               6,  '{"SQL Advanced","Python","Statistics"}'),
  ('Data Analyst',                   'Senior Data Analyst',        24, '{"Python","Machine Learning basics","Stakeholder Management"}'),
  ('Senior Data Analyst',            'Data Scientist',             18, '{"Machine Learning","Deep Learning","MLOps"}'),
  ('Data Scientist',                 'Senior Data Scientist',      30, '{"ML Architecture","Research","Leadership"}'),
  ('Senior Data Scientist',          'Head of Data',               24, '{"Strategy","People Management","Data Governance"}'),
  ('Software Engineer',              'Machine Learning Engineer',  18, '{"Python","Machine Learning","MLOps","TensorFlow/PyTorch"}'),
  ('Data Scientist',                 'Machine Learning Engineer',  12, '{"Software Engineering","Docker","APIs"}'),

  -- Product track
  ('Product Management Intern',      'Associate Product Manager',  6,  '{"User Research","Data Analysis","PRD Writing"}'),
  ('Associate Product Manager',      'Product Manager',            24, '{"Roadmap Planning","Stakeholder Management","OKRs"}'),
  ('Product Manager',                'Senior Product Manager',     30, '{"Product Strategy","Team Leadership","P&L basics"}'),
  ('Senior Product Manager',         'Director of Product',        36, '{"Org Strategy","Executive Presence","Portfolio Management"}'),

  -- Design track
  ('UI/UX Design Intern',            'Junior UI/UX Designer',      6,  '{"Figma Advanced","User Research","Design Systems"}'),
  ('Junior UI/UX Designer',          'UI/UX Designer',             24, '{"Prototyping","Usability Testing","Component Libraries"}'),
  ('UI/UX Designer',                 'Senior UI/UX Designer',      30, '{"Design Leadership","Cross-functional Collaboration","Design Ops"}'),
  ('Senior UI/UX Designer',          'Head of Design',             24, '{"Team Building","Design Strategy","Brand Systems"}'),

  -- Cross-track transitions
  ('Business Analyst',               'Product Manager',            18, '{"User Research","Roadmapping","Tech Fundamentals"}'),
  ('Software Engineer',              'Product Manager',            24, '{"User Research","Business Strategy","Stakeholder Management"}'),
  ('Data Analyst',                   'Product Analyst',            12, '{"Product Metrics","A/B Testing","SQL Advanced"}'),
  ('Business Analyst',               'Data Analyst',               12, '{"Python","SQL Advanced","Statistics"}'),
  ('UI/UX Designer',                 'Product Manager',            18, '{"Data Analysis","Business Strategy","Roadmapping"}')
) as t(from_title, to_title, months, gaps)
join career_nodes fn on fn.title = t.from_title
join career_nodes tn on tn.title = t.to_title;

-- ── Salary Benchmarks ─────────────────────────────────────────────────────────

insert into salary_data (role, location, experience_band, p25, p50, p75) values
  -- KL
  ('Software Engineer',        'Kuala Lumpur', '0-2 years',  3500,  4800,  6000),
  ('Software Engineer',        'Kuala Lumpur', '2-5 years',  6000,  8500,  11000),
  ('Software Engineer',        'Kuala Lumpur', '5-8 years',  10000, 13000, 16000),
  ('Software Engineer',        'Kuala Lumpur', '8+ years',   14000, 18000, 24000),
  ('Data Analyst',             'Kuala Lumpur', '0-2 years',  3000,  4200,  5500),
  ('Data Analyst',             'Kuala Lumpur', '2-5 years',  5500,  7500,  9500),
  ('Data Scientist',           'Kuala Lumpur', '2-5 years',  7000,  9500,  13000),
  ('Data Scientist',           'Kuala Lumpur', '5-8 years',  12000, 15000, 20000),
  ('Product Manager',          'Kuala Lumpur', '0-2 years',  4000,  5500,  7000),
  ('Product Manager',          'Kuala Lumpur', '2-5 years',  7000,  10000, 14000),
  ('Product Manager',          'Kuala Lumpur', '5+ years',   12000, 17000, 24000),
  ('UI/UX Designer',           'Kuala Lumpur', '0-2 years',  3000,  4200,  5500),
  ('UI/UX Designer',           'Kuala Lumpur', '2-5 years',  5500,  7500,  10000),
  ('Business Analyst',         'Kuala Lumpur', '0-2 years',  3500,  4800,  6000),
  ('Business Analyst',         'Kuala Lumpur', '2-5 years',  6000,  8000,  10500),
  -- Intern rates (monthly)
  ('Software Engineering Intern', 'Kuala Lumpur', 'Intern',  1000, 1500, 2500),
  ('Data Analyst Intern',         'Kuala Lumpur', 'Intern',  1000, 1400, 2000),
  ('Product Management Intern',   'Kuala Lumpur', 'Intern',  1000, 1400, 2000),
  ('UI/UX Design Intern',         'Kuala Lumpur', 'Intern',  800,  1200, 1800),
  -- Selangor
  ('Software Engineer',        'Selangor',     '0-2 years',  3200,  4500,  5800),
  ('Software Engineer',        'Selangor',     '2-5 years',  5500,  7800,  10000),
  ('Data Analyst',             'Selangor',     '0-2 years',  2800,  4000,  5200),
  ('Product Manager',          'Selangor',     '2-5 years',  6500,  9000,  12000),
  -- Singapore
  ('Software Engineer',        'Singapore',    '0-2 years',  4500,  6500,  8500),
  ('Software Engineer',        'Singapore',    '2-5 years',  8000,  12000, 16000),
  ('Data Scientist',           'Singapore',    '2-5 years',  9000,  14000, 20000),
  ('Product Manager',          'Singapore',    '2-5 years',  10000, 16000, 22000);
