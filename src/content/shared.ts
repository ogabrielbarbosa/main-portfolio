// Dados que não mudam entre idiomas.

export const LINKS = {
  linkedin: { value: "linkedin.com/in/ogabarbosa", href: "https://www.linkedin.com/in/ogabarbosa/" },
  instagram: { value: "instagram.com/ogabarbosa", href: "https://www.instagram.com/ogabarbosa/" },
  github: { value: "github.com/ogabrielbarbosa", href: "https://github.com/ogabrielbarbosa" },
  whatsapp: { value: "+55 12 99685-9020", href: "https://wa.me/5512996859020" },
  email: { value: "contato@ogabarbosa.com", href: "mailto:contato@ogabarbosa.com" },
};

export const SECTION_IDS = {
  work: "work",
  projects: "projects",
} as const;

export const HOME_PATH = { pt: "/", en: "/en" } as const;

export const ABOUT_PATH = { pt: "/about", en: "/en/about" } as const;

// Case pages: /projects/<slug> and /en/projects/<slug>.
export const CASE_PATH = { pt: "/projects", en: "/en/projects" } as const;


// Experience pages: /experience/<slug> and /en/experience/<slug>.
export const EXPERIENCE_PATH = { pt: "/experience", en: "/en/experience" } as const;
