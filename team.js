/* CPP v2 — Datos del equipo (español e inglés)

   ⚠ TEXTO DE EJEMPLO: las bios, perfiles, tareas y stack son provisionales.
   Reemplázalos con la información real de cada socio.

   Estructura de cada socio (por idioma):
     specialty  Especialidad corta (bajo el nombre y en la tarjeta de la grilla)
     bio        2 o 3 líneas sobre la persona
     quote      Frase propia sobre cómo trabaja
     profile    Filas [etiqueta, valor] de la pestaña "Perfil"
     atCpp      { summary, tasks[], focus[] } de la pestaña "En CPP"
     stack      [{ group, items[] }] de la pestaña "Stack"
   Los campos o pestañas vacíos no se muestran. */

window.CPP_I18N.teamTabs = {
  es: { profile: 'Perfil', atCpp: 'En CPP', stack: 'Stack' },
  en: { profile: 'Profile', atCpp: 'At CPP', stack: 'Stack' }
};

window.CPP_I18N.team = [
  {
    id: 'jose', name: 'José Santana', initials: 'JS', photo: 'jose', module: 1,
    linkedin: 'https://www.linkedin.com/in/jose-santana-sl-2005-pc/',
    es: {
      specialty: 'Frontend y experiencia de usuario',
      bio: 'Se encarga de que lo que construimos se entienda a la primera. Traduce las ideas del cliente en pantallas claras, rápidas y cómodas de usar en cualquier dispositivo.',
      quote: 'Si un cliente tiene que pensar dónde hacer clic, todavía no terminamos.',
      profile: [['Especialidad', 'Frontend y UX'], ['Base', 'Lima, Perú'], ['Estudios', 'Ingeniería de Software · UPC'], ['Idiomas', 'Español, inglés']],
      atCpp: {
        summary: 'Lidera el diseño de interfaces y la parte visible de cada proyecto.',
        tasks: ['Convierte los requerimientos en prototipos navegables', 'Construye interfaces responsive y accesibles', 'Cuida la velocidad de carga y los detalles de interacción'],
        focus: ['Diseño de interfaces', 'Prototipos', 'Landing pages', 'Accesibilidad']
      },
      stack: [
        { group: 'Frontend', items: ['HTML y CSS', 'JavaScript', 'TypeScript', 'React', 'Astro'] },
        { group: 'Diseño', items: ['Figma', 'Sistemas de diseño', 'Animación web'] },
        { group: 'Calidad', items: ['Lighthouse', 'Pruebas en dispositivos'] }
      ]
    },
    en: {
      specialty: 'Frontend & user experience',
      bio: 'Makes sure what we build is understood at first sight. Turns client ideas into clear, fast screens that are comfortable to use on any device.',
      quote: 'If a customer has to think about where to click, we’re not done yet.',
      profile: [['Specialty', 'Frontend & UX'], ['Based in', 'Lima, Peru'], ['Education', 'Software Engineering · UPC'], ['Languages', 'Spanish, English']],
      atCpp: {
        summary: 'Leads interface design and the visible side of every project.',
        tasks: ['Turns requirements into clickable prototypes', 'Builds responsive, accessible interfaces', 'Takes care of load speed and interaction details'],
        focus: ['Interface design', 'Prototyping', 'Landing pages', 'Accessibility']
      },
      stack: [
        { group: 'Frontend', items: ['HTML & CSS', 'JavaScript', 'TypeScript', 'React', 'Astro'] },
        { group: 'Design', items: ['Figma', 'Design systems', 'Web animation'] },
        { group: 'Quality', items: ['Lighthouse', 'Device testing'] }
      ]
    }
  },
  {
    id: 'darnell', name: 'Darnell Cuba', initials: 'DC', photo: 'darnell', module: 2,
    linkedin: 'https://www.linkedin.com/in/darnell-cuba-vega-a7b91b377/',
    es: {
      specialty: 'Backend y arquitectura',
      bio: 'Diseña lo que no se ve pero sostiene todo: datos, cuentas de usuario, pagos e integraciones. Busca que cada sistema sea seguro, ordenado y fácil de hacer crecer.',
      quote: 'Un buen sistema es el que nadie nota porque simplemente funciona.',
      profile: [['Especialidad', 'Backend y arquitectura'], ['Base', 'Lima, Perú'], ['Estudios', 'Ingeniería de Software · UPC'], ['Idiomas', 'Español, inglés']],
      atCpp: {
        summary: 'Define la arquitectura técnica y construye la lógica de cada solución.',
        tasks: ['Modela la base de datos y la estructura del sistema', 'Desarrolla APIs, accesos por usuario e integraciones de pago', 'Prepara la publicación, las copias de seguridad y el monitoreo'],
        focus: ['Aplicaciones a medida', 'Sistemas de reservas', 'Integraciones', 'Seguridad']
      },
      stack: [
        { group: 'Backend', items: ['Node.js', 'TypeScript', 'Python', 'APIs REST'] },
        { group: 'Datos', items: ['PostgreSQL', 'MySQL', 'Firebase'] },
        { group: 'Infraestructura', items: ['Git', 'Docker', 'Vercel', 'Netlify'] }
      ]
    },
    en: {
      specialty: 'Backend & architecture',
      bio: 'Designs what you don’t see but holds everything together: data, user accounts, payments and integrations. Aims for every system to be secure, organized and easy to grow.',
      quote: 'A good system is one nobody notices because it simply works.',
      profile: [['Specialty', 'Backend & architecture'], ['Based in', 'Lima, Peru'], ['Education', 'Software Engineering · UPC'], ['Languages', 'Spanish, English']],
      atCpp: {
        summary: 'Defines the technical architecture and builds the logic behind each solution.',
        tasks: ['Models the database and the system structure', 'Develops APIs, per-user access and payment integrations', 'Sets up deployment, backups and monitoring'],
        focus: ['Custom applications', 'Booking systems', 'Integrations', 'Security']
      },
      stack: [
        { group: 'Backend', items: ['Node.js', 'TypeScript', 'Python', 'REST APIs'] },
        { group: 'Data', items: ['PostgreSQL', 'MySQL', 'Firebase'] },
        { group: 'Infrastructure', items: ['Git', 'Docker', 'Vercel', 'Netlify'] }
      ]
    }
  },
  {
    id: 'juan', name: 'Juan Flores', initials: 'JF', photo: 'juan', module: 3,
    linkedin: 'https://www.linkedin.com/in/juan-diego-flores-rios-425340311/',
    es: {
      specialty: 'Producto y automatización',
      bio: 'Es el puente entre el negocio y el código. Escucha cómo trabaja cada cliente, detecta las tareas que se repiten y propone la solución con mejor retorno.',
      quote: 'Antes de programar algo, preguntamos si realmente hace falta.',
      profile: [['Especialidad', 'Producto y automatización'], ['Base', 'Lima, Perú'], ['Estudios', 'Ingeniería de Software · UPC'], ['Idiomas', 'Español, inglés']],
      atCpp: {
        summary: 'Acompaña al cliente de principio a fin y automatiza sus procesos.',
        tasks: ['Levanta requerimientos y define el alcance de cada propuesta', 'Organiza las entregas y las revisiones con el cliente', 'Conecta herramientas para eliminar trabajo manual'],
        focus: ['Estrategia de producto', 'Automatización', 'E-commerce', 'Relación con clientes']
      },
      stack: [
        { group: 'Automatización', items: ['Python', 'Make', 'Zapier', 'Google Apps Script'] },
        { group: 'Producto', items: ['Notion', 'Jira', 'Prototipado'] },
        { group: 'Comercio', items: ['Shopify', 'WooCommerce', 'Pasarelas de pago'] }
      ]
    },
    en: {
      specialty: 'Product & automation',
      bio: 'The bridge between business and code. Listens to how each client works, spots the tasks that keep repeating and proposes the solution with the best return.',
      quote: 'Before we build something, we ask whether it’s really needed.',
      profile: [['Specialty', 'Product & automation'], ['Based in', 'Lima, Peru'], ['Education', 'Software Engineering · UPC'], ['Languages', 'Spanish, English']],
      atCpp: {
        summary: 'Guides clients from start to finish and automates their processes.',
        tasks: ['Gathers requirements and defines the scope of each proposal', 'Organizes deliveries and reviews with the client', 'Connects tools to remove manual work'],
        focus: ['Product strategy', 'Automation', 'E-commerce', 'Client relationships']
      },
      stack: [
        { group: 'Automation', items: ['Python', 'Make', 'Zapier', 'Google Apps Script'] },
        { group: 'Product', items: ['Notion', 'Jira', 'Prototyping'] },
        { group: 'Commerce', items: ['Shopify', 'WooCommerce', 'Payment gateways'] }
      ]
    }
  }
];
