const { useState, useEffect, useRef } = React;

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [formData, setFormData] = useState({
    id: "demo",
    template: "modern", // 'modern' | 'classic'
    personal: {
      fullName: "Иван Иванов",
      title: "Fullstack Web Developer",
      email: "ivan.ivanov@example.com",
      phone: "+7 (999) 123-45-67",
      city: "Москва",
      summary: "Опытный веб-разработчик с глубокими знаниями JavaScript, TypeScript, React и Node.js. Успешно проектирую и разрабатываю масштабируемые веб-приложения."
    },
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "Express", "PostgreSQL", "Docker", "Git"],
    experience: [
      {
        id: 1,
        company: "Tech Solutions Inc.",
        position: "Senior Frontend Developer",
        period: "2022 — Настоящее время",
        description: "Разработка высоконагруженных SPA-приложений на React. Оптимизация производительности интерфейса и интеграция REST API."
      },
      {
        id: 2,
        company: "Web Studio Pro",
        position: "Middle Web Developer",
        period: "2020 — 2022",
        description: "Создание адаптивных версток, интеграция бэкенд-сервисов на Node.js, участие в архитектурных обсуждениях."
      }
    ],
    education: [
      {
        id: 1,
        institution: "МГТУ им. Н.Э. Баумана",
        degree: "Бакалавр",
        field: "Информатика и вычислительная техника",
        year: "2016 — 2020"
      }
    ],
    projects: [
      {
        id: 1,
        name: "3D Web Configurator",
        link: "https://github.com/example/3d-configurator",
        description: "Интерактивный веб-конфигуратор архитектурных моделей с использованием React Three Fiber и Zustand."
      }
    ]
  });

  const [errors, setErrors] = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState('');
  const resumeRef = useRef(null);

  // Валидация полей
  const validate = () => {
    const errs = {};
    if (!formData.personal.fullName.trim()) errs.fullName = 'ФИО обязательно для заполнения';
    if (!formData.personal.title.trim()) errs.title = 'Должность обязательна';
    if (!formData.personal.email.trim()) errs.email = 'Email обязателен';
    if (!formData.personal.phone.trim()) errs.phone = 'Телефон обязателен';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Изменение личных данных
  const handlePersonalChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  // Навыки
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove)
    }));
  };

  // Опыт работы
  const addExperience = () => {
    const newExp = { id: Date.now(), company: '', position: '', period: '', description: '' };
    setFormData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
  };

  const updateExperience = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeExperience = (id) => {
    setFormData(prev => ({ ...prev, experience: prev.experience.filter(item => item.id !== id) }));
  };

  // Образование
  const addEducation = () => {
    const newEdu = { id: Date.now(), institution: '', degree: '', field: '', year: '' };
    setFormData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const updateEducation = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeEducation = (id) => {
    setFormData(prev => ({ ...prev, education: prev.education.filter(item => item.id !== id) }));
  };

  // Проекты
  const addProject = () => {
    const newProj = { id: Date.now(), name: '', link: '', description: '' };
    setFormData(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  const updateProject = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeProject = (id) => {
    setFormData(prev => ({ ...prev, projects: prev.projects.filter(item => item.id !== id) }));
  };

  // Сохранение на сервер Node.js
  const handleSaveBackend = async () => {
    if (!validate()) {
      alert("Заполните все обязательные поля формы перед сохранением.");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/resumes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setNotification('Резюме успешно сохранено на сервере!');
      setTimeout(() => setNotification(''), 3000);
    } catch (err) {
      console.error(err);
      setNotification('Ошибка при сохранении на сервер (проверьте, запущен ли Node.js сервер)');
      setTimeout(() => setNotification(''), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Генерация PDF с использованием html2pdf.js
  const handleDownloadPDF = () => {
    if (!validate()) {
      alert("Пожалуйста, устраните ошибки в обязательных полях перед скачиванием.");
      return;
    }

    const element = resumeRef.current;
    const opt = {
      margin:       [10, 10, 10, 10], // верх, лево, низ, право
      filename:     `${formData.personal.fullName || 'resume'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div class="min-h-screen flex flex-col bg-gray-100 text-gray-800">
      {/* Header */}
      <header class="bg-indigo-600 text-white px-6 py-4 shadow-md flex justify-between items-center">
        <h1 class="text-xl font-bold flex items-center gap-2">
          📄 Сервис генерации резюме и портфолио
        </h1>
        <div class="flex gap-3">
          <button 
            onClick={handleSaveBackend} 
            disabled={isSaving}
            class="bg-indigo-500 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow font-medium transition"
          >
            {isSaving ? 'Сохранение...' : 'Сохранить на сервер'}
          </button>
          <button 
            onClick={handleDownloadPDF} 
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow font-medium transition flex items-center gap-1"
          >
            📥 Скачать PDF
          </button>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div class="bg-blue-600 text-white text-center py-2 px-4 shadow">
          {notification}
        </div>
      )}

      {/* Main Content */}
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-w-7xl mx-auto w-full">
        
        {/* LEFT COLUMN: Input Form */}
        <div class="bg-white p-6 rounded-lg shadow-sm space-y-6 overflow-y-auto max-h-[85vh]">
          
          {/* Template Switcher */}
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Выберите визуальный шаблон:</label>
            <div class="flex gap-4">
              <button 
                onClick={() => setFormData(prev => ({ ...prev, template: 'modern' }))}
                class={`flex-1 py-2 rounded border text-center font-medium transition ${formData.template === 'modern' ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'border-gray-300 text-gray-600'}`}
              >
                Современный
              </button>
              <button 
                onClick={() => setFormData(prev => ({ ...prev, template: 'classic' }))}
                class={`flex-1 py-2 rounded border text-center font-medium transition ${formData.template === 'classic' ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'border-gray-300 text-gray-600'}`}
              >
                Классический
              </button>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <h2 class="text-lg font-bold text-gray-800 border-b pb-2 mb-4">1. Личные данные</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">ФИО *</label>
                <input 
                  type="text" 
                  value={formData.personal.fullName}
                  onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                  class={`w-full p-2 border rounded text-sm ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Иван Иванов"
                />
                {errors.fullName && <p class="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Желаемая должность *</label>
                <input 
                  type="text" 
                  value={formData.personal.title}
                  onChange={(e) => handlePersonalChange('title', e.target.value)}
                  class={`w-full p-2 border rounded text-sm ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Frontend Developer"
                />
                {errors.title && <p class="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Email *</label>
                <input 
                  type="email" 
                  value={formData.personal.email}
                  onChange={(e) => handlePersonalChange('email', e.target.value)}
                  class={`w-full p-2 border rounded text-sm ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="email@example.com"
                />
                {errors.email && <p class="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Телефон *</label>
                <input 
                  type="text" 
                  value={formData.personal.phone}
                  onChange={(e) => handlePersonalChange('phone', e.target.value)}
                  class={`w-full p-2 border rounded text-sm ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="+7 (999) 000-00-00"
                />
                {errors.phone && <p class="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-gray-600 mb-1">Город</label>
                <input 
                  type="text" 
                  value={formData.personal.city}
                  onChange={(e) => handlePersonalChange('city', e.target.value)}
                  class="w-full p-2 border border-gray-300 rounded text-sm"
                  placeholder="Москва"
                />
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-semibold text-gray-600 mb-1">О себе / Краткое описание</label>
                <textarea 
                  rows="3"
                  value={formData.personal.summary}
                  onChange={(e) => handlePersonalChange('summary', e.target.value)}
                  class="w-full p-2 border border-gray-300 rounded text-sm"
                  placeholder="Опишите ваши ключевые навыки и достижения..."
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h2 class="text-lg font-bold text-gray-800 border-b pb-2 mb-4">2. Навыки</h2>
            <div class="flex gap-2 mb-3">
              <input 
                type="text" 
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                class="flex-1 p-2 border border-gray-300 rounded text-sm"
                placeholder="Добавить навык (например, TypeScript)"
              />
              <button onClick={addSkill} class="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">
                Добавить
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              {formData.skills.map(skill => (
                <span key={skill} class="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  {skill}
                  <button onClick={() => removeSkill(skill)} class="hover:text-red-600 font-bold ml-1">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <div class="flex justify-between items-center border-b pb-2 mb-4">
              <h2 class="text-lg font-bold text-gray-800">3. Опыт работы</h2>
              <button onClick={addExperience} class="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">
                + Добавить место
              </button>
            </div>
            {formData.experience.map((exp) => (
              <div key={exp.id} class="p-3 border rounded mb-3 bg-gray-50 relative space-y-2">
                <button onClick={() => removeExperience(exp.id)} class="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700">✕</button>
                <div class="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Компания" 
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    class="p-2 border rounded text-xs bg-white"
                  />
                  <input 
                    type="text" 
                    placeholder="Должность" 
                    value={exp.position}
                    onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                    class="p-2 border rounded text-xs bg-white"
                  />
                </div>
                <input 
                  type="text" 
                  placeholder="Период (например, 2021 — 2023)" 
                  value={exp.period}
                  onChange={(e) => updateExperience(exp.id, 'period', e.target.value)}
                  class="w-full p-2 border rounded text-xs bg-white"
                />
                <textarea 
                  placeholder="Обязанности и достижения" 
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                  class="w-full p-2 border rounded text-xs bg-white"
                  rows="2"
                />
              </div>
            ))}
          </div>

          {/* Education */}
          <div>
            <div class="flex justify-between items-center border-b pb-2 mb-4">
              <h2 class="text-lg font-bold text-gray-800">4. Образование</h2>
              <button onClick={addEducation} class="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">
                + Добавить
              </button>
            </div>
            {formData.education.map((edu) => (
              <div key={edu.id} class="p-3 border rounded mb-3 bg-gray-50 relative space-y-2">
                <button onClick={() => removeEducation(edu.id)} class="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700">✕</button>
                <input 
                  type="text" 
                  placeholder="Учебное заведение" 
                  value={edu.institution}
                  onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                  class="w-full p-2 border rounded text-xs bg-white"
                />
                <div class="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Специальность" 
                    value={edu.field}
                    onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                    class="p-2 border rounded text-xs bg-white"
                  />
                  <input 
                    type="text" 
                    placeholder="Годы обучения" 
                    value={edu.year}
                    onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                    class="p-2 border rounded text-xs bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div>
            <div class="flex justify-between items-center border-b pb-2 mb-4">
              <h2 class="text-lg font-bold text-gray-800">5. Проекты / Портфолио</h2>
              <button onClick={addProject} class="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded">
                + Добавить проект
              </button>
            </div>
            {formData.projects.map((proj) => (
              <div key={proj.id} class="p-3 border rounded mb-3 bg-gray-50 relative space-y-2">
                <button onClick={() => removeProject(proj.id)} class="absolute top-2 right-2 text-red-500 font-bold hover:text-red-700">✕</button>
                <div class="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Название проекта" 
                    value={proj.name}
                    onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                    class="p-2 border rounded text-xs bg-white"
                  />
                  <input 
                    type="text" 
                    placeholder="Ссылка (URL)" 
                    value={proj.link}
                    onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                    class="p-2 border rounded text-xs bg-white"
                  />
                </div>
                <textarea 
                  placeholder="Описание проекта" 
                  value={proj.description}
                  onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                  class="w-full p-2 border rounded text-xs bg-white"
                  rows="2"
                />
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT COLUMN: Live PDF Preview */}
        <div class="bg-gray-200 p-4 rounded-lg flex justify-center items-start overflow-y-auto max-h-[85vh]">
          <div 
            ref={resumeRef} 
            class="bg-white shadow-xl w-full max-w-[210mm] min-h-[297mm] p-8 text-gray-800 preview-container"
          >
            {formData.template === 'modern' ? (
              /* MODERN TEMPLATE */
              <div class="space-y-6">
                <header class="border-b-2 border-indigo-600 pb-4">
                  <h1 class="text-3xl font-extrabold text-indigo-900">{formData.personal.fullName || 'Ваше Имя'}</h1>
                  <p class="text-lg font-semibold text-indigo-600 mt-1">{formData.personal.title || 'Должность'}</p>
                  <div class="flex flex-wrap gap-4 text-xs text-gray-600 mt-3">
                    {formData.personal.email && <span>📧 {formData.personal.email}</span>}
                    {formData.personal.phone && <span>📞 {formData.personal.phone}</span>}
                    {formData.personal.city && <span>📍 {formData.personal.city}</span>}
                  </div>
                </header>

                {formData.personal.summary && (
                  <section class="pdf-page-break">
                    <h2 class="text-xs uppercase tracking-wider font-bold text-indigo-700 border-b mb-2">О себе</h2>
                    <p class="text-xs leading-relaxed text-gray-700">{formData.personal.summary}</p>
                  </section>
                )}

                {formData.skills.length > 0 && (
                  <section class="pdf-page-break">
                    <h2 class="text-xs uppercase tracking-wider font-bold text-indigo-700 border-b mb-2">Навыки</h2>
                    <div class="flex flex-wrap gap-1.5">
                      {formData.skills.map(s => (
                        <span key={s} class="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {formData.experience.length > 0 && (
                  <section class="pdf-page-break">
                    <h2 class="text-xs uppercase tracking-wider font-bold text-indigo-700 border-b mb-3">Опыт работы</h2>
                    <div class="space-y-3">
                      {formData.experience.map(exp => (
                        <div key={exp.id} class="pdf-page-break">
                          <div class="flex justify-between items-baseline">
                            <span class="font-bold text-sm text-gray-900">{exp.position}</span>
                            <span class="text-[11px] text-gray-500">{exp.period}</span>
                          </div>
                          <p class="text-xs font-medium text-indigo-600">{exp.company}</p>
                          <p class="text-xs text-gray-600 mt-1 whitespace-pre-line">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {formData.education.length > 0 && (
                  <section class="pdf-page-break">
                    <h2 class="text-xs uppercase tracking-wider font-bold text-indigo-700 border-b mb-3">Образование</h2>
                    <div class="space-y-2">
                      {formData.education.map(edu => (
                        <div key={edu.id} class="pdf-page-break">
                          <div class="flex justify-between items-baseline">
                            <span class="font-bold text-xs text-gray-900">{edu.institution}</span>
                            <span class="text-[11px] text-gray-500">{edu.year}</span>
                          </div>
                          <p class="text-xs text-gray-700">{edu.degree} {edu.field && `— ${edu.field}`}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {formData.projects.length > 0 && (
                  <section class="pdf-page-break">
                    <h2 class="text-xs uppercase tracking-wider font-bold text-indigo-700 border-b mb-3">Проекты / Портфолио</h2>
                    <div class="space-y-2">
                      {formData.projects.map(proj => (
                        <div key={proj.id} class="pdf-page-break">
                          <div class="flex justify-between items-baseline">
                            <span class="font-bold text-xs text-gray-900">{proj.name}</span>
                            {proj.link && <a href={proj.link} class="text-[11px] text-indigo-600 underline" target="_blank">{proj.link}</a>}
                          </div>
                          <p class="text-xs text-gray-600 mt-0.5">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              /* CLASSIC TEMPLATE */
              <div class="space-y-6 font-serif">
                <header class="text-center border-b pb-4 border-gray-400">
                  <h1 class="text-3xl font-bold uppercase tracking-wide text-gray-900">{formData.personal.fullName || 'Ваше Имя'}</h1>
                  <p class="text-md italic text-gray-700 mt-1">{formData.personal.title || 'Должность'}</p>
                  <div class="flex justify-center gap-4 text-xs text-gray-600 mt-2">
                    {formData.personal.email && <span>Email: {formData.personal.email}</span>}
                    {formData.personal.phone && <span>Тел: {formData.personal.phone}</span>}
                    {formData.personal.city && <span>г. {formData.personal.city}</span>}
                  </div>
                </header>

                {formData.personal.summary && (
                  <section class="pdf-page-break">
                    <h2 class="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-2 text-gray-800">Профиль</h2>
                    <p class="text-xs leading-relaxed text-gray-800">{formData.personal.summary}</p>
                  </section>
                )}

                {formData.experience.length > 0 && (
                  <section class="pdf-page-break">
                    <h2 class="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-3 text-gray-800">Опыт работы</h2>
                    <div class="space-y-4">
                      {formData.experience.map(exp => (
                        <div key={exp.id} class="pdf-page-break">
                          <div class="flex justify-between font-bold text-xs">
                            <span>{exp.company} — {exp.position}</span>
                            <span>{exp.period}</span>
                          </div>
                          <p class="text-xs text-gray-700 mt-1 whitespace-pre-line">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {formData.skills.length > 0 && (
                  <section class="pdf-page-break">
                    <h2 class="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-2 text-gray-800">Профессиональные навыки</h2>
                    <p class="text-xs text-gray-800">{formData.skills.join(' • ')}</p>
                  </section>
                )}

                {formData.education.length > 0 && (
                  <section class="pdf-page-break">
                    <h2 class="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-3 text-gray-800">Образование</h2>
                    <div class="space-y-2">
                      {formData.education.map(edu => (
                        <div key={edu.id} class="pdf-page-break text-xs">
                          <div class="flex justify-between font-bold">
                            <span>{edu.institution}</span>
                            <span>{edu.year}</span>
                          </div>
                          <p class="text-gray-700">{edu.degree}, {edu.field}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {formData.projects.length > 0 && (
                  <section class="pdf-page-break">
                    <h2 class="text-sm font-bold uppercase border-b border-gray-300 pb-1 mb-3 text-gray-800">Проекты</h2>
                    <div class="space-y-2">
                      {formData.projects.map(proj => (
                        <div key={proj.id} class="pdf-page-break text-xs">
                          <span class="font-bold">{proj.name}</span>
                          {proj.link && <span class="text-gray-600"> ({proj.link})</span>}
                          <p class="text-gray-700 mt-0.5">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
