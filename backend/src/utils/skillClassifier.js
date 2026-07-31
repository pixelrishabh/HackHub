const skillCategories = {
  frontend: [
    "html",
    "css",
    "javascript",
    "typescript",
    "react",
    "nextjs",
    "next.js",
    "vue",
    "angular",
    "tailwind",
    "bootstrap",
    "redux",
    "material ui",
    "chakra ui",
  ],

  backend: [
    "node",
    "nodejs",
    "express",
    "nestjs",
    "java",
    "spring",
    "spring boot",
    "python",
    "django",
    "flask",
    "php",
    "laravel",
    "c#",
    ".net",
    "golang",
    "go",
  ],

  ai: [
    "ai",
    "ml",
    "machine learning",
    "deep learning",
    "tensorflow",
    "pytorch",
    "opencv",
    "llm",
    "nlp",
    "computer vision",
    "generative ai",
  ],

  database: [
    "mongodb",
    "mysql",
    "postgresql",
    "postgres",
    "sqlite",
    "redis",
    "firebase",
    "supabase",
  ],

  devops: [
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "github actions",
    "jenkins",
    "nginx",
  ],

  design: [
    "figma",
    "ui",
    "ux",
    "adobe xd",
    "photoshop",
    "illustrator",
    "canva",
  ],
};

function classifyParticipant(user) {
  let skills = [];

  try {
    skills = Array.isArray(user.skills)
      ? user.skills
      : JSON.parse(user.skills || "[]");
  } catch {
    skills = [];
  }

  const text = skills.join(" ").toLowerCase();

  for (const category in skillCategories) {
    if (
      skillCategories[category].some((keyword) =>
        text.includes(keyword)
      )
    ) {
      return category;
    }
  }

  return "other";
}

module.exports = {
  classifyParticipant,
};