const portfolioData = {
  basics: {
    name: "Praveen Ganapathy Ravi",
    title: "Data Engineer",
    email: "erpraveenganapathy@gmail.com",
    linkedin: "linkedin.com/in/pravi01",
    github: "github.com/PraveenGanapathy",
    about: "I build the pipelines that move financial, budget and HR data out of SAP, REST APIs, SFTP drops and ODBC sources and into the World Bank's new Budget Planning Systems. Before that I migrated 4TB of production data at Infosys without losing a row, built AI automation agents at Goodie Bag, and finished an MS in Data Science at UMass Dartmouth with a 3.97 GPA."
  },
  // Copy for the page's set pieces. Run `node build.mjs` after editing this file.
  page: {
    heroLines: ["Praveen", "Ganapathy"],
    heroSentence: "Data engineer at the World Bank Group, building the pipelines behind its new budget planning systems.",
    stat: {
      claim: "Budget data, on time, every day",
      figure: "20",
      unit: "+",
      caption: "Azure Data Factory pipelines I designed and built at the World Bank Group, each run on one of 20+ daily triggers.",
      source: "World Bank Group, since Feb 2026"
    },
    flow: {
      heading: "In one end, out the other",
      text: "Each morning, finance, budget and HR records leave SAP's FI, CO and HR modules, are shaped into Budget, CapEx, Commitment Item, Fund Center and Exchange Rate tables, and land curated in Azure Data Lake Storage, where Jedox picks them up for planning.",
      from: { label: "From", word: "SAP" },
      to: { label: "To", word: "ADLS" }
    },
    facts: [
      { label: "Based in", value: "Washington, DC" },
      { label: "Working since", value: "2020" },
      { label: "Studied", value: "MS Data Science, 3.97 GPA" }
    ],
    record: [
      { name: "Infosys INSTA Award", value: "Sep 2023" },
      { name: "Infosys INSTA Award", value: "Dec 2022" },
      { name: "First place, Jia.Seed hackathon", value: "Fall 2024" },
      { name: "Paper, Journal of Xidian University", value: "Aug 2020" },
      { name: "4TB migrated with zero data loss", value: "Infosys" },
      { name: "Deploy time cut by 40% with CI/CD", value: "Infosys" }
    ]
  },

  contact: {
    email: "erpraveenganapathy@gmail.com",
    location: "Washington, DC"
  },

  education: [
    {
      institution: "University of Massachusetts Dartmouth",
      degree: "Master of Science in Data Science",
      period: "Jan 2024 – May 2025",
      location: "Dartmouth, MA",
      gpa: "3.97",
      logo: "fas fa-university",
      highlights: [
        "Advanced coursework in data mining, artificial intelligence, and statistical analysis",
        "Research focus on data pipelines, statistical modeling, and interactive visualization",
        "Applied machine learning and deep learning to real-world datasets"
      ],
      courses: [
        "Advanced Data Mining",
        "Artificial Intelligence",
        "Big Data Analytics",
        "High Performance Scientific Computing",
        "Database Design",
        "Advanced Machine Learning",
        "Advanced Mathematical Statistics",
        "Visual Analytics",
        "Statistical Analysis"
      ]
    },
    {
      institution: "Anna University",
      degree: "Bachelor of Engineering, Electronics and Communication",
      period: "Jun 2016 – Nov 2020",
      location: "Chennai, India",
      gpa: "7.39",
      logo: "fas fa-graduation-cap",
      highlights: [
        "Completed technical coursework in programming, electronics, and communications systems",
        "Published research on antenna design in the Journal of Xidian University",
        "Gained foundational skills in programming and engineering principles"
      ],
      courses: [
        "Object-Oriented Programming and Data Structures",
        "Digital Electronics",
        "Signals and Systems",
        "Communication Theory",
        "Microprocessor and Microcontroller",
        "VLSI Design",
        "Control Systems",
        "Antenna and Wave Propagation",
        "Cryptography and Network Security",
        "Embedded and Real-Time Systems",
        "Wireless Communication",
        "Radar and Navigational Aids"
      ]
    }
  ],

  skills: {
    categories: [
      {
        title: "Programming Languages",
        icon: "fas fa-laptop-code",
        skills: ["Python", "SQL", "R", "JavaScript", "Node.js", "PHP", "HTML/CSS"]
      },
      {
        title: "Data Engineering",
        icon: "fas fa-database",
        skills: ["ETL Pipelines", "Apache Airflow", "Data Warehousing", "Data Migration", "n8n"]
      },
      {
        title: "Data Analysis",
        icon: "fas fa-chart-bar",
        skills: ["EDA", "Hypothesis Testing", "Predictive Modeling", "Statistical Analysis", "PostHog"]
      },
      {
        title: "Cloud & DevOps",
        icon: "fas fa-cloud",
        skills: ["AWS (EC2, S3, Lambda)", "Docker", "CI/CD", "Scalability"]
      },
      {
        title: "Databases",
        icon: "fas fa-server",
        skills: ["PostgreSQL", "MySQL", "SQLite", "NoSQL", "DB Optimization"]
      },
      {
        title: "Visualization",
        icon: "fas fa-chart-pie",
        skills: ["Power BI", "Tableau", "Streamlit", "D3.js", "Matplotlib", "Seaborn"]
      },
      {
        title: "Frameworks & Libraries",
        icon: "fas fa-cubes",
        skills: ["Pandas", "NumPy", "Django", "Streamlit", "Next.js", "Symfony"]
      },
      {
        title: "Tools",
        icon: "fas fa-tools",
        skills: ["Git", "Jupyter", "VS Code", "Excel", "Shell Scripting", "HubSpot CRM"]
      }
    ]
  },

  certifications: [
        {
      title: "Intermediate Web Development",
      date: "Aug 2025",
      issuer: "CodePath",
      description: "Comprehensive certification covering web development ( React + vite ), API development, and modern web technologies. Credential ID: 313434",
      credentialLink: "https://www.linkedin.com/in/pravi01/overlay/1755271314648/single-media-viewer?type=LINK&profileId=ACoAACK6Sk4Bb88vZOA3-5wQ2hq-xdmp10Eqy2w&lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BQsNkqNpnQcWumfzT%2BgifxQ%3D%3D"
    },
    {
      title: "Intermediate Technical Interview Prep (TIP 102)",
      date: "May 2025",
      issuer: "CodePath",
      description: "Mastered data structures, algorithms, and problem-solving through coding challenges and mock interviews. Gained practical experience in solution optimization and technical interview preparation.",
      credentialLink: "https://www.linkedin.com/in/pravi01/overlay/1746624385860/single-media-viewer/?type=DOCUMENT&profileId=ACoAACK6Sk4Bb88vZOA3-5wQ2hq-xdmp10Eqy2w"
    },
    {
      title: "Data Engineer Associate",
      date: "Apr 2025",
      issuer: "DataCamp",
      description: "Professional certification demonstrating proficiency in data engineering principles, ETL processes, and data pipeline development.",
      credentialLink: "https://www.datacamp.com/certificate/DEA0016061916204"
    },
    {
      title: "Engineer Data for Predictive Modeling with BigQuery ML",
      date: "Sep 2024",
      issuer: "Google Cloud",
      description: "Demonstrated proficiency in using BigQuery ML for predictive modeling and data engineering on Google Cloud Platform.",
      credentialLink: null
    },
    {
      title: "Data Science Methodology",
      date: "Sep 2023",
      issuer: "Coursera",
      description: "Mastered data science methodologies including CRISP-DM for structured problem-solving and project implementation.",
      credentialLink: "https://www.coursera.org/account/accomplishments/verify/7Q7RJYN9DWCZ"
    },
    {
      title: "What is Data Science?",
      date: "Sep 2023",
      issuer: "Coursera",
      description: "Comprehensive introduction to data science principles, applications, and career paths in the field.",
      credentialLink: "https://www.coursera.org/account/accomplishments/verify/FQLAMXWYR4SK"
    },
    {
      title: "Infosys Certified Python Programmer",
      date: "Feb 2023",
      issuer: "Infosys",
      description: "Advanced certification in Python programming focusing on production-ready code and best practices.",
      credentialLink: null
    }
  ],

  experience: [
    {
      title: "Data Engineer",
      company: "World Bank Group",
      period: "Feb 2026 – Present",
      location: "Washington, DC",
      details: [
        "Designed and built 20+ Azure Data Factory ETL/ELT pipelines and data flows integrating financial, budget, and HR data from ODBC sources, REST APIs, SFTP, and SAP (FI, CO, HR) into the World Bank's new Budget Planning Systems.",
        "Developed core pipelines and transformations for Budget, CapEx (assets, depreciation, cost share, fund movements, investments), Commitment Items, Fund Center Hierarchy, Exchange Rate, and consolidated FICO/RMRF (incl. secure variants), loading curated data into ADLS.",
        "Built and configured Jedox ETL integrators to connect planning and budgeting data flows between Jedox and upstream Azure/SAP sources, enabling accurate, automated data refreshes for enterprise budget planning.",
        "Set up and managed 20+ scheduled triggers to orchestrate daily pipeline execution across budget, CapEx, commitment, fund hierarchy, and SAP integration workflows, ensuring reliable, timely data availability.",
        "Configured linked services, integration runtimes, and connections for secure data movement across on-prem and cloud sources."
      ]
    },
    {
      title: "AI and Data Engineer",
      company: "Goodie Bag",
      period: "Aug 2025 – Present",
      location: "Boulder, CO (Remote)",
      icon: "fas fa-robot",
      details: [
        "Developing AI automation agents using n8n and Node.js; deploy serverless workflows with AWS Lambda.",
        "Integrate HubSpot CRM and PostgreSQL for lead management and data operations.",
        "Implement analytics dashboards with PostHog to track product usage and agent performance."
      ]
    },
    {
      title: "Career Ambassador – Data engineer",
      company: "University of Massachusetts Dartmouth",
      period: "Sep 2024 – May 2025",
      location: "Dartmouth, MA",
      icon: "fas fa-chart-line",
      details: [
        "Developed a custom D3.js dashboard to visualize key Career Center performance metrics such as student appointment trends, resume reviews, and employer engagement, improving data accessibility for internal stakeholders.",
        "Created interactive Power BI dashboards to monitor student participation in events and appointments, streamlining reporting processes and supporting data-informed decision-making.",
        "Automated data extraction and preprocessing from Handshake using Python and Pandas, reducing manual work and enhancing data accuracy.",
        "Compiled and analyzed event data to drive strategic decision-making for job fairs and outreach initiatives."
      ]
    },
    {
      title: "Grader – MTH 280: Scientific Computation",
      company: "University of Massachusetts Dartmouth",
      period: "Jan 2025 – May 2025",
      location: "Dartmouth, MA",
      icon: "fas fa-chalkboard-teacher",
      details: [
        "Evaluated student assignments and projects involving computational modeling, simulation, and visualization techniques using mathematical programming tools and scripting languages.",
        "Ensured accurate and timely feedback on coursework requiring a strong foundation in calculus and applied mathematics, supporting student learning in preparation for advanced computational math courses."
      ]
    },
    {
      title: "Grader – DSC 520: High Performance Computing",
      company: "University of Massachusetts Dartmouth",
      period: "Sep 2024 – Dec 2024",
      location: "Dartmouth, MA",
      icon: "fas fa-server",
      details: [
        "Assessed graduate-level assignments on topics such as parallel processing, memory hierarchies, multi-core systems, and message passing in HPC environments.",
        "Provided constructive, technical feedback on student submissions related to the design, analysis, and implementation of high-performance computational applications."
      ]
    },
    {
      title: "Senior Data Engineer",
      company: "Infosys Limited",
      period: "Jun 2021 – Jan 2024",
      location: "Chennai, India",
      icon: "fas fa-database",
      details: [
        "Designed and executed robust ETL pipelines to migrate 4TB of production data from SQL Azure Virtual Machines to Azure Managed Instances, ensuring zero data loss and improved query performance across client-facing analytics systems. (NTT Data)",
        "Led backend data engineering efforts for telecom applications at TalkTalk Business (UK), including legacy modernization from Zend/Symfony PHP stacks to newer frameworks.",
        "Built and maintained CI/CD pipelines using Bamboo, GitLab, and Azure DevOps, reducing deployment time by 40% and enhancing release stability.",
        "Managed SEO domain migration and infrastructure consolidation projects, maintaining over 99% data integrity and minimizing service disruption during large-scale rollouts.",
        "Awarded Infosys INSTA Awards (Sep 2023, Dec 2022) for outstanding contributions to project leadership, enabling $50K+ in client operational savings."
      ]
    },
    {
      title: "Data Engineer",
      company: "Wipro Limited",
      period: "Feb 2020 – May 2021",
      location: "Chennai, India",
      icon: "fas fa-code",
      details: [
        "Completed intensive technical training in backend development and data center operations, with strong performance in Python-based application development modules.",
        "Developed and optimized sample web application modules in Python during training, achieving improved response time benchmarks in simulated environments."
      ]
    }
  ],

  projects: [
    {
      title: "Brain Tumor Detection Using Deep Learning",
      kind: "Deep learning",
      period: "Spring 2025",
      association: "University of Massachusetts Dartmouth",
      brief: "CNN-based classification system for brain tumor detection from MRI scans with 94.87% accuracy.",
      skills: ["Python", "TensorFlow", "Streamlit", "Deep Learning", "CNN"],
      repo: "https://github.com/PraveenGanapathy/BrainMRI",
      demo: null,
      image: "images/projects/brain-mri",
      imagePlaceholder: "A medical image analysis dashboard showing MRI scan classification with brain tumor regions highlighted",
      description: "Developed an MRI-based Convolutional Neural Network (CNN) classification system using EfficientNet and other pretrained models, achieving 94.87% accuracy in brain tumor detection. Deployed a Streamlit interface for live inference, enhancing clinical decision-making utility for healthcare professionals.",
      learnings: [
        "Implemented and fine-tuned CNN architectures for medical image analysis",
        "Developed techniques for handling imbalanced medical datasets",
        "Created interactive web interfaces for AI model deployment",
        "Applied transfer learning principles to specialized domains",
        "Gained experience in medical data preprocessing and augmentation"
      ]
    },
    {
      title: "DocViz – Interactive Document Clustering",
      kind: "NLP and visualization",
      period: "Spring 2025",
      association: "University of Massachusetts Dartmouth",
      brief: "Document analysis platform using TF-IDF, KMeans, and MDS visualized with D3.js.",
      skills: ["Python", "Node.js", "D3.js", "Machine Learning", "NLP"],
      repo: "https://github.com/PraveenGanapathy/DocViz",
      demo: "https://va-hw-1.vercel.app/",
      image: "images/projects/doc_viz",
      imagePlaceholder: "Interactive D3.js visualization showing document clusters with connecting lines and hover effects",
      description: "Built a document analysis platform that employs TF-IDF vectorization and KMeans clustering, with results visualized through Multidimensional Scaling (MDS) and D3.js. The system enables multi-document interaction, dynamic clustering, and visual insights through an intuitive browser-based user interface.",
      learnings: [
        "Applied natural language processing techniques for document analysis",
        "Implemented unsupervised learning algorithms for text clustering",
        "Created interactive data visualizations with D3.js",
        "Designed intuitive user interfaces for complex data exploration",
        "Integrated Python backend with JavaScript frontend"
      ]
    },
    {
      title: "Career Centre Analytics Dashboard",
      kind: "Analytics dashboard",
      period: "Spring 2025",
      association: "University of Massachusetts Dartmouth",
      brief: "Dashboard combining Flask, D3.js, and Power BI to track UMass career center metrics.",
      skills: ["Flask", "D3.js", "Power BI", "Azure", "Python"],
      repo: "https://github.com/PraveenGanapathy/careercentreanalytics",
      demo: null,
      image: "images/projects/cc_metrics",
      imagePlaceholder: "Dashboard with multiple charts showing student appointments, employer engagement, and career fair attendance metrics",
      description: "Created a comprehensive dashboard using Flask and D3.js to track key UMass career center performance metrics, with data stored in Azure Blob Storage. The system significantly improved internal reporting by automating metric updates from Excel sheets and providing interactive visualizations for stakeholder analysis.",
      learnings: [
        "Developed end-to-end data pipeline from Excel to web dashboard",
        "Integrated Azure cloud services for data storage and processing",
        "Created custom D3.js visualizations for specialized metrics",
        "Implemented Flask backend for data serving and processing",
        "Applied user experience principles for analytics dashboards"
      ]
    },
    {
      title: "Flight Delay Analysis",
      kind: "Data pipeline",
      period: "Fall 2024",
      association: "University of Massachusetts Dartmouth",
      brief: "Data pipeline with Apache Airflow, Papermill, and Streamlit to analyze FAA flight delays.",
      skills: ["Python", "Apache Airflow", "AWS S3", "Streamlit", "Docker"],
      repo: "https://github.com/PraveenGanapathy/flight_analysis_project",
      demo: null,
      image: "images/projects/flight-delay",
      imagePlaceholder: "Streamlit application showing flight delay visualization with interactive filters and an Airflow DAG workflow diagram",
      description: "Built a comprehensive data pipeline using Apache Airflow, Papermill, and Streamlit to analyze FAA flight delay data. The system utilizes AWS S3 for scalable data storage and Docker for deployment orchestration, providing insights into delay patterns and operational efficiency across airlines and airports.",
      learnings: [
        "Gained expertise in building and orchestrating ETL pipelines",
        "Implemented workflow automation using Apache Airflow",
        "Deployed data applications with Docker containers",
        "Utilized AWS S3 for scalable data storage",
        "Created interactive data visualizations with Streamlit"
      ]
    },
    {
      title: "SimuChat – AI Roleplay Game (Hackathon Winner)",
      kind: "LLM game",
      period: "Fall 2024",
      association: "Jia.Seed Hackathon",
      brief: "Real-time AI roleplay game with 36 characters and 12 scenarios using Next.js and Shadcn.",
      skills: ["Next.js", "Shadcn", "AI/LLM", "React", "JavaScript"],
      repo: "https://github.com/phanturne/ai-chat-game",
      demo: "https://ai-chat-game-swart.vercel.app",
      image: "images/projects/simuchat",
      imagePlaceholder: "Interactive chat interface showing roleplay with AI characters in various scenarios with customization options",
      description: "Developed an immersive real-time roleplay game featuring 36 AI characters across 12 engaging scenarios using Next.js and Shadcn. The project won first place for innovation in the Jia.Seed hackathon, generating over 15,000 interactions with 95% engagement accuracy across various user demographics.",
      learnings: [
        "Integrated advanced LLM models for interactive character experiences",
        "Implemented responsive UI with Next.js and Shadcn components",
        "Designed character personas with distinct personality traits",
        "Created branching conversation pathways based on user choices",
        "Optimized API calls for cost-effective LLM usage",
        "Developed under pressure in a competitive hackathon environment"
      ]
    },
    {
      title: "Local Library Management System",
      kind: "Web application",
      period: "Summer 2024",
      association: "University of Massachusetts Dartmouth",
      brief: "Django-based library system with user authentication and permission-based lending.",
      skills: ["Django", "SQLite", "Ajax", "Python", "HTML/CSS"],
      repo: "https://github.com/PraveenGanapathy/locallibrary",
      demo: null,
      image: "images/projects/library-management",
      imagePlaceholder: "Library management interface showing book catalog, borrowing status, and user authentication screens",
      description: "Designed a comprehensive Django-based library management system featuring user authentication, book browsing, and permission-based lending functionalities. The application was hosted on PythonAnywhere and supports database operations with SQLite and Ajax validation for improved user experience.",
      learnings: [
        "Implemented Django's authentication and permission systems",
        "Designed relational database models for library operations",
        "Created responsive web interfaces with Django templates",
        "Utilized Ajax for asynchronous form validation",
        "Deployed web applications on PythonAnywhere hosting"
      ]
    },
    {
      title: "Bank Marketing Dataset Analysis",
      kind: "Predictive modelling",
      period: "Spring 2024",
      association: "University of Massachusetts Dartmouth",
      brief: "Predictive models and Streamlit dashboard for term deposit subscription prediction.",
      skills: ["Python", "Streamlit", "XGBoost", "Scikit-learn", "Data Analysis"],
      repo: "https://github.com/PraveenGanapathy/Bankmarketing",
      demo: null,
      image: "images/projects/bank-marketing",
      imagePlaceholder: "Streamlit dashboard with predictive model results, feature importance plots, and customer segment analysis",
      description: "Built sophisticated predictive models including Random Forest and XGBoost to classify term deposit subscriptions based on customer data. Created an interactive Streamlit dashboard for exploring factors influencing client behavior and generating actionable insights for marketing optimization.",
      learnings: [
        "Applied ensemble learning techniques for classification tasks",
        "Implemented feature engineering for improved model performance",
        "Created interactive data visualizations with Streamlit",
        "Performed model evaluation and comparison",
        "Translated technical findings into actionable business insights"
      ]
    }
  ],

  publications: [
    {
      title: "Design of Microstrip Fractal Antenna",
      date: "August 2020",
      publisher: "Journal of Xidian University",
      description: "Published undergraduate research on antenna design to support vehicle-to-vehicle (V2V) communication systems.",
      link: "https://xadzkjdx.cn/index.php/volume-14-issue-8-aug-20/"
    }
  ],

  social: [
    {
      platform: "GitHub",
      url: "https://github.com/PraveenGanapathy",
      icon: "fab fa-github"
    },
    {
      platform: "LinkedIn",
      url: "https://linkedin.com/in/pravi01",
      icon: "fab fa-linkedin"
    }
  ]
};
