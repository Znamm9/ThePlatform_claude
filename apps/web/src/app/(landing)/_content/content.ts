export type Lang = 'ua' | 'en';

type Bi = { ua: string; en: string };

export const content = {
  brand: { ua: 'Engineering Club', en: 'Engineering Club' } as Bi,

  nav: {
    why: { ua: 'Чому ми', en: 'Why us' } as Bi,
    how: { ua: 'Як це працює', en: 'How it works' } as Bi,
    team: { ua: 'Команда', en: 'Team' } as Bi,
    stories: { ua: 'Відгуки', en: 'Stories' } as Bi,
    apply: { ua: 'Подати заявку', en: 'Apply' } as Bi,
  },

  hero: {
    eyebrow: {
      ua: 'Спільнота, що змінює карʼєри',
      en: 'A community that rewrites careers',
    } as Bi,
    headlineLine1: {
      ua: 'Від тебе — час і бажання.',
      en: 'From you — time and drive.',
    } as Bi,
    headlineLine2: {
      ua: 'Від нас — знання, ментори, дохід.',
      en: 'From us — knowledge, mentors, income.',
    } as Bi,
    sub: {
      ua: 'Дохід наших студентів — $2 500–$5 000 на місяць і він зростає. Ми вчимо QA Automation з нуля до офера від реальних middle і senior спеціалістів.',
      en: 'Our students earn $2,500–$5,000 a month — and growing. We teach QA Automation from zero to offer, mentored by real middle and senior engineers.',
    } as Bi,
    primaryCta: { ua: 'Подати заявку', en: 'Apply now' } as Bi,
    secondaryCta: { ua: 'Як це працює', en: 'How it works' } as Bi,
  },

  stats: [
    {
      value: { ua: '47', en: '47' } as Bi,
      label: { ua: 'практичних уроків', en: 'hands-on lessons' } as Bi,
    },
    {
      value: { ua: '8', en: '8' } as Bi,
      label: { ua: 'менторів middle / senior', en: 'middle / senior mentors' } as Bi,
    },
    {
      value: { ua: '$2,5–5K', en: '$2.5–5K' } as Bi,
      label: { ua: 'середній дохід випускника', en: 'avg student income' } as Bi,
    },
  ],

  why: {
    heading: { ua: 'Чому обирають нас?', en: 'Why people choose us' } as Bi,
    sub: {
      ua: 'Ми допомогли перейти в ІТ музикантам, атлетам, бухгалтерам, юристам, лінгвістам. Немає людей, кому не під силу опанувати ІТ — є ті, хто не має підтримки.',
      en: 'We have moved musicians, athletes, accountants, lawyers and linguists into IT. There are no people who cannot learn it — only people without support.',
    } as Bi,
    items: [
      {
        title: { ua: 'Менторство від практиків', en: 'Mentor-led, by practitioners' } as Bi,
        body: {
          ua: 'Тебе вчать middle та senior спеціалісти, які щодня працюють у продакшені. Без нудної теорії — лише те, що використовується в роботі.',
          en: 'You learn from middle and senior engineers who ship every day. No theory dumps — only what is actually used on the job.',
        } as Bi,
      },
      {
        title: { ua: 'Підготовка до співбесід', en: 'Brutal interview prep' } as Bi,
        body: {
          ua: 'Ми проводимо надскладні мок-співбесіди, щоб справжня здавалась простою. Ти будеш знати свою ціну.',
          en: 'We run interviews harder than real ones, so the real one feels easy. You will know your market price.',
        } as Bi,
      },
      {
        title: { ua: 'Партнерська програма', en: 'Partnership program' } as Bi,
        body: {
          ua: 'Ми зацікавлені в тому, щоб ти заробляв більше — наш дохід прив’язаний до твого. Працюємо як команда.',
          en: 'Our income is tied to yours, so we are invested in your salary growth. We work as a team.',
        } as Bi,
      },
      {
        title: { ua: 'Місяць оффлайн-стажування', en: 'One-month offline trial' } as Bi,
        body: {
          ua: 'Місяць придивляємось один до одного. Ти бачиш кухню, ми оцінюємо твою енергію. Серйозно — лише з тими, з ким збіг.',
          en: 'One month of getting to know each other offline. You see how we work, we see your drive. Only fully onboard those who fit.',
        } as Bi,
      },
    ],
  },

  how: {
    heading: { ua: 'Як це працює', en: 'How it works' } as Bi,
    steps: [
      {
        title: { ua: 'Заповни анкету', en: 'Fill the form' } as Bi,
        body: {
          ua: 'Заповнюй анкету і чекай на дзвінок. Ми зателефонуємо найближчим часом і розкажемо все детально.',
          en: 'Fill in the form and wait for our call. We will get back to you shortly and walk you through everything.',
        } as Bi,
      },
      {
        title: { ua: 'Тестові + інтервʼю з ментором', en: 'Tasks + mentor interview' } as Bi,
        body: {
          ua: 'Виконуєш короткі завдання та проходиш співбесіду з ментором. Так ми бачимо твій рівень і енергію.',
          en: 'You complete short tasks and interview with a mentor. That is how we read your level and your drive.',
        } as Bi,
      },
      {
        title: { ua: 'Місяць оффлайн', en: 'One month offline' } as Bi,
        body: {
          ua: 'Місяць придивляємось один до одного оффлайн. Ти у потоці навчання, ми поруч у форматі живого менторства.',
          en: 'A month of mutual trial offline. You learn in our flow, we mentor in person.',
        } as Bi,
      },
      {
        title: { ua: 'Беремось серйозно', en: 'We commit, fully' } as Bi,
        body: {
          ua: 'Якщо збіг — беремось за тебе серйозно: технічна підготовка, мок-співбесіди, працевлаштування, перші проєкти.',
          en: 'If it fits — we go all in: technical training, mock interviews, job placement, and your first projects.',
        } as Bi,
      },
    ],
  },

  mentors: {
    heading: { ua: 'Наша команда', en: 'Our team' } as Bi,
    sub: {
      ua: 'Більшість наших експертів пройшли складний шлях до гідного доходу. Ми вчимо своїх друзів, близьких та тих, хто опинився в скрутних умовах чи втратив роботу через війну.',
      en: 'Most of our experts walked a hard road to a real income. We teach our friends, our families, and people who lost their footing — including those displaced by the war.',
    } as Bi,
    items: [
      { name: { ua: 'Вадим Руденко', en: 'Vadym Rudenko' } as Bi, role: { ua: 'Засновник · ментор', en: 'Founder · mentor' } as Bi, initials: 'ВР' },
      { name: { ua: 'Ангеліна Ільчук', en: 'Angelina Ilchuk' } as Bi, role: { ua: 'QA Automation · ментор', en: 'QA Automation · mentor' } as Bi, initials: 'АІ' },
      { name: { ua: 'Андрій Степанюк', en: 'Andrii Stepaniuk' } as Bi, role: { ua: 'Backend · ментор', en: 'Backend · mentor' } as Bi, initials: 'АС' },
      { name: { ua: 'Антон Чувіров', en: 'Anton Chuvirov' } as Bi, role: { ua: 'Frontend · ментор', en: 'Frontend · mentor' } as Bi, initials: 'АЧ' },
      { name: { ua: 'Світлана Прутас', en: 'Svitlana Prutas' } as Bi, role: { ua: 'QA · ментор', en: 'QA · mentor' } as Bi, initials: 'СП' },
      { name: { ua: 'Сергій Лебедєв', en: 'Serhii Lebediev' } as Bi, role: { ua: 'DevOps · ментор', en: 'DevOps · mentor' } as Bi, initials: 'СЛ' },
      { name: { ua: 'Юрій Черняк', en: 'Yurii Cherniak' } as Bi, role: { ua: 'Full-stack · ментор', en: 'Full-stack · mentor' } as Bi, initials: 'ЮЧ' },
      { name: { ua: 'Сергій Пашковський', en: 'Serhii Pashkovskyi' } as Bi, role: { ua: 'Mobile · ментор', en: 'Mobile · mentor' } as Bi, initials: 'СП' },
    ],
  },

  testimonials: {
    heading: { ua: 'Що кажуть студенти', en: 'What students say' } as Bi,
    items: [
      {
        author: { ua: 'Антон Чувіров', en: 'Anton Chuvirov' } as Bi,
        quote: {
          ua: 'Тут я отримав гарну теоретичну і практичну базу для співбесід. Зараз працюю і всім задоволений. Хто не знає з чого почати ІТ карʼєру — категорично раджу!',
          en: 'I got a strong theoretical and practical base for interviews here. Now I am working and happy with everything. If you do not know where to start in IT — I strongly recommend it.',
        } as Bi,
      },
      {
        author: { ua: 'Сергій Пашковський', en: 'Serhii Pashkovskyi' } as Bi,
        quote: {
          ua: 'Дуже вдячний Engineering Club за те, що дали мені змогу швидко досягнути своєї мети. Особлива подяка засновнику й менторам за їхній професійний підхід до кожного кандидата.',
          en: 'Hugely grateful to Engineering Club for letting me reach my goal so fast. Special thanks to the founder and the mentors for the professional approach to every candidate.',
        } as Bi,
      },
      {
        author: { ua: 'Андрій Степанюк', en: 'Andrii Stepaniuk' } as Bi,
        quote: {
          ua: 'Підготовка дуже класна — від теорії до практики. Постійний супровід і під час навчання, і під час роботи. Дуже дружній колектив, планую зростати з Engineering Club далі.',
          en: 'The preparation is great — from theory to practice. Constant support both during training and at work. Very friendly team — I plan to keep growing with Engineering Club.',
        } as Bi,
      },
    ],
  },

  apply: {
    heading: {
      ua: 'Подавай заявку — зателефонуємо найближчим часом',
      en: 'Apply now — we will call you back shortly',
    } as Bi,
    sub: {
      ua: 'Готові відповісти на будь-які твої питання і допомогти стартувати.',
      en: 'Ready to answer any of your questions and help you take off.',
    } as Bi,
    fields: {
      name: { ua: 'Імʼя та прізвище', en: 'Full name' } as Bi,
      phone: { ua: 'Телефон', en: 'Phone' } as Bi,
      email: { ua: 'Email', en: 'Email' } as Bi,
      message: { ua: 'Коротко про себе (опційно)', en: 'A few words about you (optional)' } as Bi,
    },
    submit: { ua: 'Надіслати', en: 'Send' } as Bi,
    success: { ua: 'Дякуємо! Скоро звʼяжемось.', en: 'Thanks! We will be in touch.' } as Bi,
  },

  footer: {
    tagline: {
      ua: 'Шукаємо енергійних людей, які готові вчитися — і вчимо їх знаходити гідні офери.',
      en: 'We look for energetic people ready to learn — and we teach them to land worthy offers.',
    } as Bi,
    rights: {
      ua: '© Engineering Club. Усі права захищені.',
      en: '© Engineering Club. All rights reserved.',
    } as Bi,
  },
} as const;

export type Content = typeof content;

export const t = (bi: Bi, lang: Lang) => bi[lang];
