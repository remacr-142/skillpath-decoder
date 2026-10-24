// ═══════════════════════════════════════
//   SkillPath Decoder — Data Store
// ═══════════════════════════════════════

(function () {
const CAREER_PATHS = {
  "ml-engineer": {
    id: "ml-engineer",
    title: "Machine Learning Engineer",
    emoji: "🤖",
    level: "Advanced",
    description: "Build, deploy, and maintain production ML systems",
    skills: [
      { id: "python", name: "Python Programming", category: "Foundation", level: "beginner", prereqs: [], parallel: true, resources: ["py-cs50", "py-automate", "py-corey"] },
      { id: "math-stat", name: "Math & Statistics", category: "Foundation", level: "beginner", prereqs: [], parallel: true, resources: ["khan-stats", "stat-quest"] },
      { id: "pandas-numpy", name: "Pandas & NumPy", category: "Data Manipulation", level: "intermediate", prereqs: ["python"], parallel: true, resources: ["pandas-doc", "kaggle-pandas"] },
      { id: "data-viz", name: "Data Visualisation", category: "Data Analysis", level: "intermediate", prereqs: ["pandas-numpy"], parallel: true, resources: ["matplotlib-tut", "seaborn-tut"] },
      { id: "ml-fundamentals", name: "ML Fundamentals", category: "Machine Learning", level: "intermediate", prereqs: ["pandas-numpy","math-stat"], parallel: false, resources: ["andrew-ng","fast-ai","ml-crash"] },
      { id: "sklearn", name: "Scikit-learn", category: "Machine Learning", level: "intermediate", prereqs: ["ml-fundamentals"], parallel: true, resources: ["sklearn-docs","kaggle-ml"] },
      { id: "deep-learning", name: "Deep Learning & Neural Nets", category: "Advanced ML", level: "advanced", prereqs: ["ml-fundamentals"], parallel: true, resources: ["fast-ai-dl","dl-specialization","3b1b-nn"] },
      { id: "sql", name: "SQL & Databases", category: "Data Engineering", level: "beginner", prereqs: [], parallel: true, resources: ["mode-sql","sqlzoo"] },
      { id: "feature-eng", name: "Feature Engineering", category: "Machine Learning", level: "intermediate", prereqs: ["sklearn"], parallel: false, resources: ["kaggle-fe"] },
      { id: "mlops", name: "MLOps & Deployment", category: "Production", level: "advanced", prereqs: ["sklearn","deep-learning"], parallel: false, resources: ["mlops-coursera","dvc-tut"] },
      { id: "cloud-ml", name: "Cloud ML Platforms", category: "Production", level: "advanced", prereqs: ["mlops"], parallel: false, resources: ["gcp-ml","aws-ml"] },
      { id: "git", name: "Git & Version Control", category: "Engineering", level: "beginner", prereqs: [], parallel: true, resources: ["git-scm","github-guide"] },
    ]
  },
  "fullstack-dev": {
    id: "fullstack-dev",
    title: "Full Stack Developer",
    emoji: "🌐",
    level: "Intermediate",
    description: "Build end-to-end web applications from UI to database",
    skills: [
      { id: "html-css", name: "HTML & CSS", category: "Frontend Foundation", level: "beginner", prereqs: [], parallel: true, resources: ["mdn-html","css-tricks","fcc-web"] },
      { id: "javascript", name: "JavaScript", category: "Frontend Foundation", level: "beginner", prereqs: ["html-css"], parallel: true, resources: ["js-info","eloquent-js","fcc-js"] },
      { id: "react", name: "React.js", category: "Frontend Framework", level: "intermediate", prereqs: ["javascript"], parallel: true, resources: ["react-docs","scrimba-react"] },
      { id: "nodejs", name: "Node.js & Express", category: "Backend", level: "intermediate", prereqs: ["javascript"], parallel: true, resources: ["nodejs-docs","traversy-node"] },
      { id: "sql", name: "SQL & Databases", category: "Database", level: "beginner", prereqs: [], parallel: true, resources: ["mode-sql","sqlzoo"] },
      { id: "mongodb", name: "MongoDB / NoSQL", category: "Database", level: "intermediate", prereqs: ["nodejs"], parallel: true, resources: ["mongo-university","traversy-mongo"] },
      { id: "rest-api", name: "REST API Design", category: "Backend", level: "intermediate", prereqs: ["nodejs"], parallel: false, resources: ["restful-api","postman-tut"] },
      { id: "git", name: "Git & Version Control", category: "Engineering", level: "beginner", prereqs: [], parallel: true, resources: ["git-scm","github-guide"] },
      { id: "auth", name: "Authentication & Security", category: "Security", level: "intermediate", prereqs: ["rest-api"], parallel: false, resources: ["auth0-docs","owasp"] },
      { id: "deployment", name: "Deployment & CI/CD", category: "DevOps", level: "advanced", prereqs: ["auth","react"], parallel: false, resources: ["vercel-docs","netlify-docs","docker-gs"] },
      { id: "typescript", name: "TypeScript", category: "Frontend", level: "intermediate", prereqs: ["javascript"], parallel: true, resources: ["ts-handbook","total-ts"] },
      { id: "testing", name: "Testing (Jest/Cypress)", category: "Quality", level: "intermediate", prereqs: ["react","nodejs"], parallel: true, resources: ["jest-docs","cypress-docs"] },
    ]
  },
  "data-scientist": {
    id: "data-scientist",
    title: "Data Scientist",
    emoji: "📊",
    level: "Advanced",
    description: "Extract insights and value from complex datasets",
    skills: [
      { id: "python", name: "Python Programming", category: "Foundation", level: "beginner", prereqs: [], parallel: true, resources: ["py-cs50","py-automate"] },
      { id: "math-stat", name: "Math & Statistics", category: "Foundation", level: "beginner", prereqs: [], parallel: true, resources: ["khan-stats","stat-quest"] },
      { id: "pandas-numpy", name: "Pandas & NumPy", category: "Data Manipulation", level: "intermediate", prereqs: ["python"], parallel: true, resources: ["pandas-doc","kaggle-pandas"] },
      { id: "sql", name: "SQL & Databases", category: "Data Engineering", level: "beginner", prereqs: [], parallel: true, resources: ["mode-sql","sqlzoo"] },
      { id: "data-viz", name: "Data Visualisation", category: "Analysis", level: "intermediate", prereqs: ["pandas-numpy"], parallel: true, resources: ["matplotlib-tut","seaborn-tut","plotly-tut"] },
      { id: "eda", name: "Exploratory Data Analysis", category: "Analysis", level: "intermediate", prereqs: ["data-viz","math-stat"], parallel: false, resources: ["kaggle-eda"] },
      { id: "ml-fundamentals", name: "ML Fundamentals", category: "Machine Learning", level: "intermediate", prereqs: ["math-stat","pandas-numpy"], parallel: false, resources: ["andrew-ng","fast-ai","ml-crash"] },
      { id: "a-b-testing", name: "A/B Testing & Experimentation", category: "Statistics", level: "advanced", prereqs: ["math-stat","eda"], parallel: true, resources: ["udacity-ab"] },
      { id: "storytelling", name: "Data Storytelling", category: "Communication", level: "intermediate", prereqs: ["data-viz"], parallel: true, resources: ["tableau-public"] },
      { id: "nlp", name: "Natural Language Processing", category: "Advanced ML", level: "advanced", prereqs: ["ml-fundamentals"], parallel: true, resources: ["huggingface-course"] },
      { id: "big-data", name: "Big Data (Spark/Hadoop)", category: "Engineering", level: "advanced", prereqs: ["sql","pandas-numpy"], parallel: true, resources: ["databricks-tut"] },
      { id: "git", name: "Git & Version Control", category: "Engineering", level: "beginner", prereqs: [], parallel: true, resources: ["git-scm","github-guide"] },
    ]
  },
  "ux-designer": {
    id: "ux-designer",
    title: "UX Designer",
    emoji: "🎨",
    level: "Intermediate",
    description: "Create meaningful, user-centred digital experiences",
    skills: [
      { id: "design-thinking", name: "Design Thinking", category: "Foundation", level: "beginner", prereqs: [], parallel: true, resources: ["ideo-dt","coursera-dt"] },
      { id: "user-research", name: "User Research Methods", category: "Research", level: "beginner", prereqs: ["design-thinking"], parallel: false, resources: ["nngroup-ux"] },
      { id: "information-arch", name: "Information Architecture", category: "UX Core", level: "intermediate", prereqs: ["user-research"], parallel: true, resources: ["ia-institute"] },
      { id: "wireframing", name: "Wireframing & Prototyping", category: "Design", level: "intermediate", prereqs: ["design-thinking"], parallel: true, resources: ["figma-tut","balsamiq-tut"] },
      { id: "figma", name: "Figma Proficiency", category: "Tools", level: "intermediate", prereqs: ["wireframing"], parallel: false, resources: ["figma-learn","figma-yt"] },
      { id: "visual-design", name: "Visual Design Principles", category: "Design", level: "beginner", prereqs: [], parallel: true, resources: ["canva-school","refactoring-ui"] },
      { id: "usability", name: "Usability Testing", category: "Research", level: "intermediate", prereqs: ["user-research","wireframing"], parallel: false, resources: ["nngroup-usability"] },
      { id: "accessibility", name: "Accessibility & Inclusive Design", category: "Quality", level: "intermediate", prereqs: ["visual-design"], parallel: true, resources: ["web-a11y","inclusive-design"] },
      { id: "interaction-design", name: "Interaction Design", category: "UX Core", level: "advanced", prereqs: ["figma","usability"], parallel: false, resources: ["interaction-design-org"] },
      { id: "portfolio", name: "Portfolio & Case Studies", category: "Career", level: "intermediate", prereqs: ["usability","figma"], parallel: false, resources: ["portfolio-guide"] },
    ]
  },
  "cybersecurity": {
    id: "cybersecurity",
    title: "Cybersecurity Analyst",
    emoji: "🔐",
    level: "Advanced",
    description: "Protect systems and networks from digital threats",
    skills: [
      { id: "networking", name: "Networking Fundamentals", category: "Foundation", level: "beginner", prereqs: [], parallel: true, resources: ["professor-messer","cisco-netacad"] },
      { id: "os-linux", name: "Linux & OS Fundamentals", category: "Foundation", level: "beginner", prereqs: [], parallel: true, resources: ["linux-journey","overthewire"] },
      { id: "python", name: "Python for Security", category: "Scripting", level: "intermediate", prereqs: ["os-linux"], parallel: true, resources: ["py-automate"] },
      { id: "cryptography", name: "Cryptography Basics", category: "Security Core", level: "intermediate", prereqs: ["networking"], parallel: true, resources: ["crypto-coursera","khan-crypto"] },
      { id: "ethical-hacking", name: "Ethical Hacking / Pen Testing", category: "Offensive Security", level: "advanced", prereqs: ["networking","os-linux"], parallel: false, resources: ["tryhackme","hackthebox","elearn"] },
      { id: "siem", name: "SIEM & Log Analysis", category: "Defensive Security", level: "intermediate", prereqs: ["networking"], parallel: true, resources: ["splunk-free","elk-tut"] },
      { id: "incident-response", name: "Incident Response", category: "Operations", level: "advanced", prereqs: ["siem"], parallel: false, resources: ["sans-ir"] },
      { id: "cloud-security", name: "Cloud Security", category: "Cloud", level: "advanced", prereqs: ["cryptography","ethical-hacking"], parallel: true, resources: ["aws-security","gcp-security"] },
      { id: "compliance", name: "Governance, Risk & Compliance", category: "GRC", level: "intermediate", prereqs: ["networking"], parallel: true, resources: ["isaca-resources"] },
      { id: "cert-prep", name: "CompTIA Security+ / CEH Prep", category: "Certification", level: "intermediate", prereqs: ["ethical-hacking","siem"], parallel: false, resources: ["comptia-sy0","ceh-ec"] },
    ]
  },
  "product-manager": {
    id: "product-manager",
    title: "Product Manager",
    emoji: "📱",
    level: "Intermediate",
    description: "Define product vision and drive cross-functional execution",
    skills: [
      { id: "product-thinking", name: "Product Thinking & Strategy", category: "Foundation", level: "beginner", prereqs: [], parallel: true, resources: ["product-school","inspired-book"] },
      { id: "user-research", name: "User Research & Interviews", category: "Research", level: "beginner", prereqs: ["product-thinking"], parallel: true, resources: ["ideo-dt","nngroup-ux"] },
      { id: "prioritisation", name: "Prioritisation Frameworks", category: "Execution", level: "intermediate", prereqs: ["product-thinking"], parallel: true, resources: ["pm-exercises"] },
      { id: "roadmapping", name: "Roadmapping & Planning", category: "Execution", level: "intermediate", prereqs: ["prioritisation"], parallel: false, resources: ["productboard-guide"] },
      { id: "agile", name: "Agile & Scrum", category: "Process", level: "beginner", prereqs: [], parallel: true, resources: ["agile-manifesto","scrum-guide"] },
      { id: "data-analytics", name: "Product Analytics & Metrics", category: "Data", level: "intermediate", prereqs: ["product-thinking"], parallel: true, resources: ["ga4-academy","mixpanel-tut"] },
      { id: "stakeholder", name: "Stakeholder Communication", category: "Leadership", level: "intermediate", prereqs: ["roadmapping"], parallel: true, resources: ["coursera-comm"] },
      { id: "wireframing", name: "Wireframing Basics", category: "Design", level: "beginner", prereqs: [], parallel: true, resources: ["figma-tut","balsamiq-tut"] },
      { id: "go-to-market", name: "Go-to-Market Strategy", category: "Growth", level: "advanced", prereqs: ["roadmapping","data-analytics"], parallel: false, resources: ["gtm-guide"] },
      { id: "sql", name: "SQL for Product Managers", category: "Data", level: "intermediate", prereqs: ["data-analytics"], parallel: true, resources: ["mode-sql"] },
    ]
  }
};

const RESOURCES_DB = {
  // Python
  "py-cs50": { title: "Harvard CS50P – Python", type: "course", platform: "edX", url: "https://cs50.harvard.edu/python/", free: true, duration: "10 weeks" },
  "py-automate": { title: "Automate the Boring Stuff with Python", type: "doc", platform: "Book/Web", url: "https://automatetheboringstuff.com/", free: true, duration: "Self-paced" },
  "py-corey": { title: "Python Tutorial – Corey Schafer", type: "youtube", platform: "YouTube", url: "https://www.youtube.com/playlist?list=PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU", free: true, duration: "30 hrs" },
  // Stats
  "khan-stats": { title: "Statistics & Probability – Khan Academy", type: "course", platform: "Khan Academy", url: "https://www.khanacademy.org/math/statistics-probability", free: true, duration: "Self-paced" },
  "stat-quest": { title: "StatQuest with Josh Starmer", type: "youtube", platform: "YouTube", url: "https://www.youtube.com/@statquest", free: true, duration: "Various" },
  // Pandas
  "pandas-doc": { title: "Pandas Official Documentation", type: "doc", platform: "Docs", url: "https://pandas.pydata.org/docs/", free: true, duration: "Reference" },
  "kaggle-pandas": { title: "Pandas Micro-Course – Kaggle", type: "course", platform: "Kaggle", url: "https://www.kaggle.com/learn/pandas", free: true, duration: "4 hrs" },
  // Visualisation
  "matplotlib-tut": { title: "Matplotlib Official Tutorials", type: "doc", platform: "Docs", url: "https://matplotlib.org/stable/tutorials/", free: true, duration: "Reference" },
  "seaborn-tut": { title: "Seaborn Gallery & Tutorial", type: "doc", platform: "Docs", url: "https://seaborn.pydata.org/tutorial.html", free: true, duration: "Reference" },
  "plotly-tut": { title: "Plotly Python Graphing Library", type: "doc", platform: "Docs", url: "https://plotly.com/python/", free: true, duration: "Reference" },
  // ML
  "andrew-ng": { title: "Machine Learning Specialization – Andrew Ng", type: "cert", platform: "Coursera", url: "https://www.coursera.org/specializations/machine-learning-introduction", free: true, duration: "3 months" },
  "fast-ai": { title: "Practical Deep Learning for Coders", type: "course", platform: "fast.ai", url: "https://course.fast.ai/", free: true, duration: "7 weeks" },
  "ml-crash": { title: "Machine Learning Crash Course – Google", type: "course", platform: "Google", url: "https://developers.google.com/machine-learning/crash-course", free: true, duration: "15 hrs" },
  "sklearn-docs": { title: "Scikit-learn User Guide", type: "doc", platform: "Docs", url: "https://scikit-learn.org/stable/user_guide.html", free: true, duration: "Reference" },
  "kaggle-ml": { title: "Intro to Machine Learning – Kaggle", type: "course", platform: "Kaggle", url: "https://www.kaggle.com/learn/intro-to-machine-learning", free: true, duration: "3 hrs" },
  // Deep Learning
  "fast-ai-dl": { title: "Deep Learning Part 2 – fast.ai", type: "course", platform: "fast.ai", url: "https://course.fast.ai/Lessons/part2.html", free: true, duration: "8 weeks" },
  "dl-specialization": { title: "Deep Learning Specialization – Coursera", type: "cert", platform: "Coursera", url: "https://www.coursera.org/specializations/deep-learning", free: true, duration: "5 months" },
  "3b1b-nn": { title: "Neural Networks – 3Blue1Brown", type: "youtube", platform: "YouTube", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi", free: true, duration: "4 hrs" },
  // SQL
  "mode-sql": { title: "SQL Tutorial – Mode Analytics", type: "course", platform: "Mode", url: "https://mode.com/sql-tutorial/", free: true, duration: "6 hrs" },
  "sqlzoo": { title: "SQLZoo Interactive Exercises", type: "course", platform: "SQLZoo", url: "https://sqlzoo.net/", free: true, duration: "Self-paced" },
  // MLOps
  "mlops-coursera": { title: "MLOps Specialization – Coursera", type: "cert", platform: "Coursera", url: "https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops", free: true, duration: "4 months" },
  "dvc-tut": { title: "DVC – Data Version Control", type: "doc", platform: "Docs", url: "https://dvc.org/doc/start", free: true, duration: "Reference" },
  "gcp-ml": { title: "Google Cloud ML Free Tier", type: "cert", platform: "Google Cloud", url: "https://cloud.google.com/free", free: true, duration: "Self-paced" },
  "aws-ml": { title: "AWS Machine Learning Free Tier", type: "cert", platform: "AWS", url: "https://aws.amazon.com/free/machine-learning/", free: true, duration: "Self-paced" },
  // Feature Engineering
  "kaggle-fe": { title: "Feature Engineering – Kaggle", type: "course", platform: "Kaggle", url: "https://www.kaggle.com/learn/feature-engineering", free: true, duration: "5 hrs" },
  // EDA
  "kaggle-eda": { title: "EDA with Python – Kaggle", type: "course", platform: "Kaggle", url: "https://www.kaggle.com/learn/data-cleaning", free: true, duration: "4 hrs" },
  // A/B Testing
  "udacity-ab": { title: "A/B Testing – Udacity", type: "course", platform: "Udacity", url: "https://www.udacity.com/course/ab-testing--ud979", free: true, duration: "2 months" },
  // NLP
  "huggingface-course": { title: "HuggingFace NLP Course", type: "course", platform: "HuggingFace", url: "https://huggingface.co/learn/nlp-course/", free: true, duration: "8 weeks" },
  // Big Data
  "databricks-tut": { title: "Apache Spark – Databricks Academy", type: "course", platform: "Databricks", url: "https://www.databricks.com/learn/training", free: true, duration: "Self-paced" },
  // Git
  "git-scm": { title: "Pro Git Book (Free)", type: "doc", platform: "Book/Web", url: "https://git-scm.com/book", free: true, duration: "Reference" },
  "github-guide": { title: "GitHub Skills", type: "course", platform: "GitHub", url: "https://skills.github.com/", free: true, duration: "Self-paced" },
  // Tableau/Storytelling
  "tableau-public": { title: "Tableau Public (Free)", type: "project", platform: "Tableau", url: "https://public.tableau.com/", free: true, duration: "Practice" },
  // HTML/CSS/JS
  "mdn-html": { title: "MDN Web Docs – HTML", type: "doc", platform: "MDN", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML", free: true, duration: "Reference" },
  "css-tricks": { title: "CSS-Tricks Guides", type: "doc", platform: "Web", url: "https://css-tricks.com/guides/", free: true, duration: "Reference" },
  "fcc-web": { title: "Responsive Web Design – freeCodeCamp", type: "cert", platform: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/2022/responsive-web-design/", free: true, duration: "300 hrs" },
  "js-info": { title: "JavaScript.info – The Modern Tutorial", type: "doc", platform: "Web", url: "https://javascript.info/", free: true, duration: "Reference" },
  "eloquent-js": { title: "Eloquent JavaScript – Free Book", type: "doc", platform: "Book", url: "https://eloquentjavascript.net/", free: true, duration: "Reference" },
  "fcc-js": { title: "JavaScript Algorithms – freeCodeCamp", type: "cert", platform: "freeCodeCamp", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", free: true, duration: "300 hrs" },
  "react-docs": { title: "React Official Documentation", type: "doc", platform: "React", url: "https://react.dev/learn", free: true, duration: "Reference" },
  "scrimba-react": { title: "Learn React – Scrimba", type: "course", platform: "Scrimba", url: "https://scrimba.com/learn/learnreact", free: true, duration: "11 hrs" },
  "nodejs-docs": { title: "Node.js Official Guides", type: "doc", platform: "Docs", url: "https://nodejs.org/en/docs/guides", free: true, duration: "Reference" },
  "traversy-node": { title: "Node.js Crash Course – Traversy Media", type: "youtube", platform: "YouTube", url: "https://www.youtube.com/watch?v=fBNz5xF-Kx4", free: true, duration: "1.5 hrs" },
  "traversy-mongo": { title: "MongoDB Crash Course – Traversy Media", type: "youtube", platform: "YouTube", url: "https://www.youtube.com/watch?v=-56x56UppqQ", free: true, duration: "1.5 hrs" },
  "mongo-university": { title: "MongoDB University – Free Courses", type: "course", platform: "MongoDB", url: "https://learn.mongodb.com/", free: true, duration: "Self-paced" },
  "restful-api": { title: "RESTful API Design – Microsoft Learn", type: "doc", platform: "Microsoft", url: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design", free: true, duration: "Reference" },
  "postman-tut": { title: "Postman API Testing Tutorial", type: "youtube", platform: "YouTube", url: "https://www.youtube.com/watch?v=VywxIQ2ZXw4", free: true, duration: "2 hrs" },
  "auth0-docs": { title: "Auth0 Documentation", type: "doc", platform: "Auth0", url: "https://auth0.com/docs", free: true, duration: "Reference" },
  "owasp": { title: "OWASP Top 10 – Web Security", type: "doc", platform: "OWASP", url: "https://owasp.org/www-project-top-ten/", free: true, duration: "Reference" },
  "vercel-docs": { title: "Vercel Deployment Guide", type: "doc", platform: "Vercel", url: "https://vercel.com/docs", free: true, duration: "Reference" },
  "netlify-docs": { title: "Netlify Documentation", type: "doc", platform: "Netlify", url: "https://docs.netlify.com/", free: true, duration: "Reference" },
  "docker-gs": { title: "Docker Getting Started", type: "doc", platform: "Docker", url: "https://docs.docker.com/get-started/", free: true, duration: "Reference" },
  "ts-handbook": { title: "TypeScript Handbook", type: "doc", platform: "TypeScript", url: "https://www.typescriptlang.org/docs/handbook/intro.html", free: true, duration: "Reference" },
  "total-ts": { title: "Total TypeScript – Matt Pocock", type: "course", platform: "Web", url: "https://www.totaltypescript.com/", free: true, duration: "Self-paced" },
  "jest-docs": { title: "Jest Testing Framework Docs", type: "doc", platform: "Jest", url: "https://jestjs.io/docs/getting-started", free: true, duration: "Reference" },
  "cypress-docs": { title: "Cypress E2E Testing Docs", type: "doc", platform: "Cypress", url: "https://docs.cypress.io/", free: true, duration: "Reference" },
  // UX
  "ideo-dt": { title: "Design Thinking – IDEO U (Free Intro)", type: "course", platform: "IDEO", url: "https://www.ideou.com/pages/design-thinking", free: true, duration: "Self-paced" },
  "coursera-dt": { title: "Design Thinking for Innovation – UVA", type: "cert", platform: "Coursera", url: "https://www.coursera.org/learn/uva-darden-design-thinking-innovation", free: true, duration: "4 weeks" },
  "nngroup-ux": { title: "Nielsen Norman Group – UX Research", type: "doc", platform: "NN/g", url: "https://www.nngroup.com/articles/", free: true, duration: "Reference" },
  "ia-institute": { title: "Information Architecture Tutorial", type: "doc", platform: "Web", url: "https://www.usability.gov/what-and-why/information-architecture.html", free: true, duration: "Reference" },
  "figma-tut": { title: "Figma for Beginners", type: "youtube", platform: "YouTube", url: "https://www.youtube.com/watch?v=jk1T0CdLxwU", free: true, duration: "3 hrs" },
  "balsamiq-tut": { title: "Balsamiq Wireframing Tutorial", type: "doc", platform: "Balsamiq", url: "https://balsamiq.com/learn/", free: true, duration: "Reference" },
  "figma-learn": { title: "Figma Learn (Official)", type: "course", platform: "Figma", url: "https://www.figma.com/resources/learn-design/", free: true, duration: "Self-paced" },
  "figma-yt": { title: "Figma Tutorial – DesignCode", type: "youtube", platform: "YouTube", url: "https://www.youtube.com/c/DesignCodeTeam", free: true, duration: "Various" },
  "canva-school": { title: "Canva Design School", type: "course", platform: "Canva", url: "https://www.canva.com/designschool/", free: true, duration: "Self-paced" },
  "refactoring-ui": { title: "Refactoring UI – Design Tips", type: "doc", platform: "Web", url: "https://www.refactoringui.com/", free: true, duration: "Reference" },
  "nngroup-usability": { title: "Usability Testing Guide – NN/g", type: "doc", platform: "NN/g", url: "https://www.nngroup.com/articles/usability-testing-101/", free: true, duration: "Reference" },
  "web-a11y": { title: "Web Accessibility – W3C WAI", type: "doc", platform: "W3C", url: "https://www.w3.org/WAI/tutorials/", free: true, duration: "Reference" },
  "inclusive-design": { title: "Inclusive Design – Microsoft", type: "doc", platform: "Microsoft", url: "https://inclusive.microsoft.design/", free: true, duration: "Reference" },
  "interaction-design-org": { title: "Interaction Design Foundation", type: "course", platform: "IDF", url: "https://www.interaction-design.org/courses", free: true, duration: "Self-paced" },
  "portfolio-guide": { title: "UX Portfolio Guide – CareerFoundry", type: "doc", platform: "Web", url: "https://careerfoundry.com/en/blog/ux-design/ux-portfolio/", free: true, duration: "Reference" },
  // Cybersecurity
  "professor-messer": { title: "CompTIA Network+ – Professor Messer", type: "youtube", platform: "YouTube", url: "https://www.professormesser.com/", free: true, duration: "20+ hrs" },
  "cisco-netacad": { title: "Cisco Networking Academy (Free)", type: "course", platform: "Cisco", url: "https://www.netacad.com/", free: true, duration: "Self-paced" },
  "linux-journey": { title: "Linux Journey – Interactive Tutorial", type: "course", platform: "Web", url: "https://linuxjourney.com/", free: true, duration: "Self-paced" },
  "overthewire": { title: "OverTheWire – Wargames", type: "project", platform: "Web", url: "https://overthewire.org/wargames/", free: true, duration: "Practice" },
  "crypto-coursera": { title: "Cryptography I – Stanford", type: "cert", platform: "Coursera", url: "https://www.coursera.org/learn/crypto", free: true, duration: "7 weeks" },
  "khan-crypto": { title: "Cryptography – Khan Academy", type: "course", platform: "Khan Academy", url: "https://www.khanacademy.org/computing/computer-science/cryptography", free: true, duration: "Self-paced" },
  "tryhackme": { title: "TryHackMe – Ethical Hacking Labs", type: "project", platform: "TryHackMe", url: "https://tryhackme.com/", free: true, duration: "Self-paced" },
  "hackthebox": { title: "Hack The Box – Cyber Labs", type: "project", platform: "HackTheBox", url: "https://www.hackthebox.com/", free: true, duration: "Practice" },
  "elearn": { title: "eLearnSecurity / INE Free Intro", type: "course", platform: "INE", url: "https://ine.com/", free: true, duration: "Self-paced" },
  "splunk-free": { title: "Splunk Free Training", type: "course", platform: "Splunk", url: "https://www.splunk.com/en_us/training/free-courses.html", free: true, duration: "Self-paced" },
  "elk-tut": { title: "ELK Stack Tutorial – Logz.io", type: "doc", platform: "Web", url: "https://logz.io/blog/elk-stack-tutorial/", free: true, duration: "Reference" },
  "sans-ir": { title: "SANS – Incident Response (Free Papers)", type: "doc", platform: "SANS", url: "https://www.sans.org/white-papers/", free: true, duration: "Reference" },
  "aws-security": { title: "AWS Security Learning Plan", type: "cert", platform: "AWS", url: "https://explore.skillbuilder.aws/learn", free: true, duration: "Self-paced" },
  "gcp-security": { title: "Google Cloud Security Courses", type: "cert", platform: "Google Cloud", url: "https://cloud.google.com/learn/training/security", free: true, duration: "Self-paced" },
  "isaca-resources": { title: "ISACA Free GRC Resources", type: "doc", platform: "ISACA", url: "https://www.isaca.org/resources", free: true, duration: "Reference" },
  "comptia-sy0": { title: "CompTIA Security+ Study Materials", type: "cert", platform: "CompTIA", url: "https://www.comptia.org/certifications/security", free: true, duration: "Reference" },
  "ceh-ec": { title: "CEH – EC-Council (Free Intro)", type: "cert", platform: "EC-Council", url: "https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh/", free: true, duration: "Reference" },
  // PM
  "product-school": { title: "Product School – Free Resources", type: "doc", platform: "Product School", url: "https://productschool.com/resources/", free: true, duration: "Reference" },
  "inspired-book": { title: "INSPIRED – Marty Cagan Summary", type: "doc", platform: "Web", url: "https://www.svpg.com/inspired-how-to-create-tech-products-customers-love/", free: true, duration: "Reference" },
  "pm-exercises": { title: "PM Exercises – Prioritisation Frameworks", type: "doc", platform: "Web", url: "https://www.pmexercises.com/", free: true, duration: "Reference" },
  "productboard-guide": { title: "Productboard Roadmapping Guide", type: "doc", platform: "Productboard", url: "https://www.productboard.com/blog/", free: true, duration: "Reference" },
  "agile-manifesto": { title: "Agile Manifesto & Principles", type: "doc", platform: "Web", url: "https://agilemanifesto.org/", free: true, duration: "Reference" },
  "scrum-guide": { title: "Official Scrum Guide 2020", type: "doc", platform: "Scrum.org", url: "https://scrumguides.org/", free: true, duration: "Reference" },
  "ga4-academy": { title: "Google Analytics 4 Academy", type: "cert", platform: "Google", url: "https://skillshop.withgoogle.com/", free: true, duration: "Self-paced" },
  "mixpanel-tut": { title: "Mixpanel Product Analytics", type: "doc", platform: "Mixpanel", url: "https://docs.mixpanel.com/docs", free: true, duration: "Reference" },
  "coursera-comm": { title: "Communication Skills – Coursera", type: "cert", platform: "Coursera", url: "https://www.coursera.org/courses?query=communication+skills", free: true, duration: "Various" },
  "gtm-guide": { title: "Go-to-Market Guide – HubSpot", type: "doc", platform: "HubSpot", url: "https://blog.hubspot.com/sales/go-to-market-strategy", free: true, duration: "Reference" },
};

const QUIZ_DB = {
  "python": [
    { q: "What is the output of `print(type([]))`?", options: ["<class 'list'>","<class 'array'>","list","Array"], correct: 0, explanation: "In Python, `[]` is a list literal. `type([])` returns `<class 'list'>`." },
    { q: "Which keyword is used to define a function in Python?", options: ["function","def","fn","define"], correct: 1, explanation: "`def` is the keyword used to define functions in Python, followed by the function name." },
    { q: "What does `len([1,2,3])` return?", options: ["2","3","4","[1,2,3]"], correct: 1, explanation: "`len()` returns the number of items. The list has 3 elements, so it returns 3." },
    { q: "Which of these is a mutable data type in Python?", options: ["tuple","string","list","int"], correct: 2, explanation: "Lists are mutable (can be changed). Tuples and strings are immutable." },
    { q: "What does `//` operator do in Python?", options: ["Regular division","Floor division","Modulus","Power"], correct: 1, explanation: "`//` is the floor division operator – it divides and rounds down to the nearest integer." },
  ],
  "ml-fundamentals": [
    { q: "Which of the following is a supervised learning algorithm?", options: ["K-Means","PCA","Linear Regression","t-SNE"], correct: 2, explanation: "Linear Regression uses labelled training data to predict continuous values — that's supervised learning." },
    { q: "What does 'overfitting' mean in machine learning?", options: ["Model performs well on training data only","Model fails to learn patterns","Model is too simple","Model uses too little data"], correct: 0, explanation: "Overfitting is when a model memorises training data and fails to generalise to unseen data." },
    { q: "Which metric is most appropriate for imbalanced classification?", options: ["Accuracy","Mean Squared Error","F1-Score","R²"], correct: 2, explanation: "F1-Score balances precision and recall, making it better for imbalanced datasets than plain accuracy." },
    { q: "What is the purpose of a validation set?", options: ["Train the model","Test final model performance","Tune hyperparameters","Normalise features"], correct: 2, explanation: "The validation set is used to tune model hyperparameters and select the best model during training." },
    { q: "Which algorithm is used in gradient boosting?", options: ["Decision Trees","Linear Regression","Neural Networks","SVMs"], correct: 0, explanation: "Gradient boosting builds an ensemble of weak learners, typically Decision Trees, iteratively." },
  ],
  "javascript": [
    { q: "What does `typeof null` return in JavaScript?", options: ['"null"','"object"','"undefined"','"boolean"'], correct: 1, explanation: "This is a historical JavaScript bug. `typeof null` returns `'object'` despite null not being an object." },
    { q: "Which method adds an element to the end of an array?", options: ["shift()","unshift()","push()","pop()"], correct: 2, explanation: "`push()` adds elements to the end. `unshift()` adds to the beginning. `pop()` removes from end." },
    { q: "What is a closure in JavaScript?", options: ["A loop construct","A function with access to its outer scope","An error handling block","A class method"], correct: 1, explanation: "A closure is a function that retains access to variables from its enclosing lexical scope." },
    { q: "What does `===` do differently from `==`?", options: ["Checks value only","Checks type only","Checks both value and type","Nothing different"], correct: 2, explanation: "`===` (strict equality) checks both value AND type. `==` (loose equality) allows type coercion." },
    { q: "Which keyword declares a block-scoped variable?", options: ["var","let","function","const"], correct: 1, explanation: "`let` and `const` are block-scoped. `var` is function-scoped and can cause bugs." },
  ],
  "html-css": [
    { q: "Which CSS property controls the space INSIDE an element's border?", options: ["margin","padding","border","spacing"], correct: 1, explanation: "Padding is the space inside an element, between content and border. Margin is outside the border." },
    { q: "Which HTML element is used for the largest heading?", options: ["<heading>","<h6>","<h1>","<title>"], correct: 2, explanation: "`<h1>` is the largest heading. Headings go from `<h1>` (largest) to `<h6>` (smallest)." },
    { q: "What does CSS Flexbox's `justify-content: center` do?", options: ["Centres items vertically","Centres items horizontally","Centres text","Aligns items to start"], correct: 1, explanation: "In a flex container, `justify-content` controls alignment along the main axis (horizontal by default)." },
    { q: "Which selector has the highest specificity?", options: ["Element (div)","Class (.item)","ID (#main)","Universal (*)"], correct: 2, explanation: "ID selectors have the highest specificity (0,1,0,0) compared to classes (0,0,1,0) and elements (0,0,0,1)." },
    { q: "What does `position: absolute` do?", options: ["Positions relative to browser viewport","Positions relative to nearest positioned ancestor","Fixes element to screen","Positions in normal document flow"], correct: 1, explanation: "`absolute` positioning removes the element from normal flow and positions it relative to its nearest positioned (non-static) ancestor." },
  ],
  "design-thinking": [
    { q: "What is the FIRST stage of the Design Thinking process?", options: ["Define","Prototype","Empathise","Ideate"], correct: 2, explanation: "Empathise is first — understanding users' needs, challenges, and experiences through observation and research." },
    { q: "What is the purpose of a 'How Might We' (HMW) question?", options: ["Define the business model","Reframe problems as opportunities","Create user personas","Build prototypes"], correct: 1, explanation: "HMW questions reframe problems into open-ended opportunities for ideation, encouraging creative solutions." },
    { q: "What is the key characteristic of a prototype in Design Thinking?", options: ["It must be fully functional","It should be quick and cheap to make","It should be made of real materials","It should be user-tested 100 times"], correct: 1, explanation: "Prototypes should be quick and inexpensive to build — the goal is to test ideas fast and learn, not perfect." },
    { q: "What does 'divergent thinking' mean in ideation?", options: ["Narrowing ideas down","Generating many diverse ideas","Following a single best path","Analysing competitor products"], correct: 1, explanation: "Divergent thinking is about generating a large quantity of diverse ideas without judgment during brainstorming." },
    { q: "Which tool is commonly used for user journey mapping?", options: ["Gantt Chart","Service Blueprint","Database ERD","Network Diagram"], correct: 1, explanation: "A Service Blueprint maps the full user journey including frontstage actions, backstage processes, and touchpoints." },
  ],
  "networking": [
    { q: "What does IP stand for?", options: ["Internet Process","Internet Protocol","Internal Package","Integrated Protocol"], correct: 1, explanation: "IP stands for Internet Protocol — the addressing system used to identify devices on a network." },
    { q: "Which port does HTTPS use by default?", options: ["80","21","443","22"], correct: 2, explanation: "HTTPS uses port 443 by default. HTTP uses port 80. SSH uses 22. FTP uses 21." },
    { q: "What is the purpose of a subnet mask?", options: ["Encrypt network traffic","Identify network vs host portion of an IP","Block malicious IPs","Speed up DNS resolution"], correct: 1, explanation: "A subnet mask divides an IP address into its network portion and host portion." },
    { q: "Which OSI layer is responsible for routing?", options: ["Layer 1 (Physical)","Layer 2 (Data Link)","Layer 3 (Network)","Layer 4 (Transport)"], correct: 2, explanation: "Layer 3 (Network layer) handles routing — determining the best path for packets across networks." },
    { q: "What does DNS stand for?", options: ["Data Network System","Domain Name System","Dynamic Node Server","Digital Name Service"], correct: 1, explanation: "DNS (Domain Name System) translates human-readable domain names (like google.com) into IP addresses." },
  ],
};

// Default quizzes for skills not explicitly mapped
const DEFAULT_QUIZ_KEYS = {
  "pandas-numpy": "python", "data-viz": "ml-fundamentals", "sklearn": "ml-fundamentals",
  "deep-learning": "ml-fundamentals", "mlops": "ml-fundamentals", "feature-eng": "ml-fundamentals",
  "cloud-ml": "ml-fundamentals", "sql": "python", "math-stat": "ml-fundamentals",
  "eda": "ml-fundamentals", "a-b-testing": "ml-fundamentals", "nlp": "ml-fundamentals",
  "big-data": "python", "storytelling": "design-thinking", "git": "python",
  "react": "javascript", "nodejs": "javascript", "mongodb": "javascript",
  "rest-api": "javascript", "auth": "javascript", "deployment": "javascript",
  "typescript": "javascript", "testing": "javascript",
  "user-research": "design-thinking", "wireframing": "design-thinking",
  "figma": "design-thinking", "visual-design": "design-thinking",
  "usability": "design-thinking", "accessibility": "design-thinking",
  "interaction-design": "design-thinking", "portfolio": "design-thinking",
  "information-arch": "design-thinking",
  "os-linux": "networking", "cryptography": "networking",
  "ethical-hacking": "networking", "siem": "networking",
  "incident-response": "networking", "cloud-security": "networking",
  "compliance": "networking", "cert-prep": "networking",
  "product-thinking": "design-thinking", "prioritisation": "design-thinking",
  "roadmapping": "design-thinking", "agile": "design-thinking",
  "data-analytics": "ml-fundamentals", "stakeholder": "design-thinking",
  "go-to-market": "design-thinking",
};

function getQuizForSkill(skillId, careerId) {
  const career = careerId ? CAREER_PATHS[careerId] : null;
  const skill = career?.skills.find(item => item.id === skillId);
  if (skill?.custom) return skill.quizQuestions || [];
  if (QUIZ_DB[skillId]) return QUIZ_DB[skillId];
  const mapped = DEFAULT_QUIZ_KEYS[skillId];
  if (mapped && QUIZ_DB[mapped]) return QUIZ_DB[mapped];
  return QUIZ_DB["python"]; // ultimate fallback
}

// ── LOCAL STORAGE PERSISTENCE ──
const STORE_KEY = "skillpath_data_v2";
const CUSTOM_CAREERS_KEY = "skillpath_custom_careers_v1";

function registerCustomCareer(career) {
  CAREER_PATHS[career.id] = career;
  career.skills.forEach(skill => {
    (skill.customResources || []).forEach(resource => {
      RESOURCES_DB[resource.id] = resource;
    });
    skill.resources = (skill.customResources || []).map(resource => resource.id);
  });
}

function loadCustomCareers() {
  const raw = localStorage.getItem(CUSTOM_CAREERS_KEY);
  if (!raw) return;
  const careers = JSON.parse(raw);
  if (!Array.isArray(careers)) {
    throw new Error("Saved custom career data is invalid.");
  }
  careers.forEach(registerCustomCareer);
}

function saveCustomCareer(career) {
  const saved = Object.values(CAREER_PATHS).filter(item => item.custom && item.id !== career.id);
  saved.push(career);
  localStorage.setItem(CUSTOM_CAREERS_KEY, JSON.stringify(saved));
  registerCustomCareer(career);
}

loadCustomCareers();

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveState(state) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
}

function createFreshState(careerId) {
  const career = CAREER_PATHS[careerId];
  if (!career) return null;
  const skills = {};
  career.skills.forEach(s => {
    skills[s.id] = {
      id: s.id,
      confidence: 0,
      status: "gap", // gap | learning | mastered
      quizPassed: false,
      lastUpdated: null,
    };
  });
  return {
    careerId,
    skills,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };
}

window.SP = {
  CAREER_PATHS, RESOURCES_DB, QUIZ_DB, getQuizForSkill,
  loadState, saveState, createFreshState, saveCustomCareer,
};
})();
