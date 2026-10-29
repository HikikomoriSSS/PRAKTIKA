const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Раздаем статические файлы из папки client, чтобы фронтенд открывался прямо с бэкенда
app.use(express.static(path.join(__dirname, '../client')));

// Внутреннее хранилище в памяти (In-Memory DB) для сохраненных резюме
let resumesDb = {};

// Шаблон по умолчанию
const defaultResume = {
  id: "demo",
  template: "modern",
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
};

// Сохраняем демо-резюме в память
resumesDb["demo"] = defaultResume;

// GET: Получить резюме по ID
app.get('/api/resumes/:id', (req, res) => {
  const resume = resumesDb[req.params.id] || defaultResume;
  res.json(resume);
});

// POST: Сохранить/обновить резюме
app.post('/api/resumes', (req, res) => {
  const data = req.body;
  if (!data.id) {
    data.id = 'resume_' + Date.now();
  }
  resumesDb[data.id] = data;
  res.status(200).json({ status: "success", message: "Резюме успешно сохранено", id: data.id });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер успешно запущен! Откройте в браузере: http://localhost:${PORT}`);
});