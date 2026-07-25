export const AVAILABLE_FIELDS = [
  { id: 'AI/ML', name: 'AI / Machine Learning', icon: 'Brain' },
  { id: 'Frontend Development', name: 'Frontend Development', icon: 'Layout' },
  { id: 'Backend Development', name: 'Backend Development', icon: 'Server' },
  { id: 'Design/UX', name: 'Design & UX', icon: 'Palette' },
  { id: 'Data Science', name: 'Data Science & Analytics', icon: 'BarChart3' },
  { id: 'Mobile Dev', name: 'Mobile App Development', icon: 'Smartphone' },
  { id: 'DevOps/Cloud', name: 'DevOps & Cloud Infrastructure', icon: 'Cloud' },
  { id: 'Product/Business', name: 'Product & Business Strategy', icon: 'Briefcase' },
];

export const FIELD_CONFIGS = {
  'AI/ML': {
    id: 'AI/ML',
    name: 'AI / Machine Learning',
    iconName: 'Brain',
    badgeText: 'Neural Workspace Active',
    accentBadgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    sectionOrder: ['idea-validator', 'mentor', 'submission'],
    heroTitle: 'Build Cutting-Edge AI Models & RAG Workflows',
    heroSubtitle: 'Validate your architecture, optimize prompt engineering, and chat with AI Mentor for model integration.',
    emptyStateCopy: 'No team or submission data yet. Start by validating your AI project idea or requesting team matching.',
    quickPrompts: [
      'How do I structure RAG retrieval with vector embeddings under 24 hours?',
      'What are the best practices for handling LLM latency in hackathon demos?',
      'How to evaluate model accuracy without long benchmark training?'
    ]
  },
  'Frontend Development': {
    id: 'Frontend Development',
    name: 'Frontend Development',
    iconName: 'Layout',
    badgeText: 'UI/UX Interactive Engine Active',
    accentBadgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    sectionOrder: ['submission', 'idea-validator', 'mentor'],
    heroTitle: 'Craft Delightful & Responsive Interfaces',
    heroSubtitle: 'Focus on user experience, state management, dynamic UI components, and flawless demo polish.',
    emptyStateCopy: 'Ready to build stunning web interfaces? Connect your team repo or validate your frontend concept.',
    quickPrompts: [
      'How can I implement smooth micro-animations without heavy bundle size?',
      'What is the quickest way to mock complex state for our hackathon pitch?',
      'How do I structure clean React context for multi-role workflows?'
    ]
  },
  'Backend Development': {
    id: 'Backend Development',
    name: 'Backend Development',
    iconName: 'Server',
    badgeText: 'API & Microservices Architecture Active',
    accentBadgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    sectionOrder: ['mentor', 'idea-validator', 'submission'],
    heroTitle: 'Architect Robust APIs & Database Schemas',
    heroSubtitle: 'Ensure bulletproof authentication, database queries, webhooks, and scalable endpoint performance.',
    emptyStateCopy: 'No backend services linked yet. Consult the AI Mentor on schema design or submit your API repository.',
    quickPrompts: [
      'How do I implement JWT rotation and RBAC securely in Express/Prisma?',
      'What database indexing strategies prevent timeouts under load testing?',
      'How can we mock third-party webhooks efficiently during the hackathon?'
    ]
  },
  'Design/UX': {
    id: 'Design/UX',
    name: 'Design & UX',
    iconName: 'Palette',
    badgeText: 'Design System & Prototype Hub Active',
    accentBadgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    sectionOrder: ['submission', 'mentor', 'idea-validator'],
    heroTitle: 'Design Human-Centered Product Experiences',
    heroSubtitle: 'Showcase wireframes, visual hierarchy, micro-interactions, and high-fidelity demo walk-throughs.',
    emptyStateCopy: 'No submission showcase active. Validate product design scope or prepare your demo video link.',
    quickPrompts: [
      'How do we communicate design decisions effectively in 3-minute pitch slides?',
      'What accessible color contrasts work best for high-impact pitch decks?',
      'How to structure a product demo video flow for judge evaluation?'
    ]
  },
  'Data Science': {
    id: 'Data Science',
    name: 'Data Science & Analytics',
    iconName: 'BarChart3',
    badgeText: 'Analytics Pipeline Active',
    accentBadgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    sectionOrder: ['idea-validator', 'mentor', 'submission'],
    heroTitle: 'Extract Insights & Predictive Data Pipelines',
    heroSubtitle: 'Validate statistical feasibility, process raw datasets, and build actionable data dashboards.',
    emptyStateCopy: 'Data pipeline awaiting project initialization. Run an idea check or ask mentor about data sources.',
    quickPrompts: [
      'Where can we find clean public datasets for real-time inference?',
      'How to visualize multidimensional metrics simply for non-technical judges?',
      'What baseline metrics demonstrate pipeline accuracy best?'
    ]
  },
  'Mobile Dev': {
    id: 'Mobile Dev',
    name: 'Mobile App Development',
    iconName: 'Smartphone',
    badgeText: 'Mobile Cross-Platform Hub Active',
    accentBadgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    sectionOrder: ['submission', 'idea-validator', 'mentor'],
    heroTitle: 'Build Native & Cross-Platform Mobile Apps',
    heroSubtitle: 'Optimize touch controls, offline capabilities, mobile APIs, and responsive mobile viewports.',
    emptyStateCopy: 'No mobile build submitted yet. Check feasibility for mobile features or submit your repository.',
    quickPrompts: [
      'How to test mobile PWA features offline during demo presentations?',
      'What mobile-first UI patterns score highest in hackathon judging?',
      'How to streamline mobile app demo recording with device frame preview?'
    ]
  },
  'DevOps/Cloud': {
    id: 'DevOps/Cloud',
    name: 'DevOps & Cloud Infrastructure',
    iconName: 'Cloud',
    badgeText: 'Cloud Deployment Pipeline Active',
    accentBadgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    sectionOrder: ['mentor', 'submission', 'idea-validator'],
    heroTitle: 'Deploy Scalable Containers & CI/CD Pipelines',
    heroSubtitle: 'Manage Docker containers, environment variables, serverless functions, and zero-downtime deploys.',
    emptyStateCopy: 'Infrastructure ready for deployment. Ask mentor about deployment environments or submit live URLs.',
    quickPrompts: [
      'What is the fastest zero-cost deployment host for Node.js + Prisma DB?',
      'How to configure CORS and SSL headers correctly for local + cloud API domains?',
      'How to protect API keys securely in production environment builds?'
    ]
  },
  'Product/Business': {
    id: 'Product/Business',
    name: 'Product & Business Strategy',
    iconName: 'Briefcase',
    badgeText: 'Product Strategy & Pitch Hub Active',
    accentBadgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    sectionOrder: ['idea-validator', 'submission', 'mentor'],
    heroTitle: 'Define Business Viability & Market Impact',
    heroSubtitle: 'Validate value propositions, target user personas, market TAM/SAM, and pitch deck clarity.',
    emptyStateCopy: 'Product roadmap ready for definition. Test your project scope with the AI Idea Validator.',
    quickPrompts: [
      'How to scope a hackathon MVP cut to fit within 24 hours strictly?',
      'What value proposition frameworks convince judges within 30 seconds?',
      'How to calculate realistic user traction metrics for early prototypes?'
    ]
  },
};

export function getFieldConfig(field) {
  if (!field || !FIELD_CONFIGS[field]) {
    return FIELD_CONFIGS['AI/ML'];
  }
  return FIELD_CONFIGS[field];
}
