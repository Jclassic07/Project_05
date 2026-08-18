// App State
let tasks = JSON.parse(localStorage.getItem('taskmaster_tasks')) || [];
let currentView = 'all';

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const categorySelect = document.getElementById('category-select');
const customCategoryGroup = document.getElementById('custom-category-group');
const customCategoryInput = document.getElementById('custom-category-input');
const prioritySelect = document.getElementById('priority-select');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const navButtons = document.querySelectorAll('.nav-btn');
const viewTitle = document.getElementById('view-title');
const viewSubtitle = document.getElementById('view-subtitle');
const activeTasksCount = document.getElementById('active-tasks-count');
const todayDate = document.getElementById('today-date');

// Feedback Elements
const feedbackBtn = document.getElementById('feedback-btn');
const feedbackModal = document.getElementById('feedback-modal');
const closeFeedback = document.getElementById('close-feedback');
const feedbackForm = document.getElementById('feedback-form');
const ratingStars = document.getElementById('rating-stars');
const feedbackRating = document.getElementById('feedback-rating');

// Navigation View Switcher
navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.id === 'feedback-btn') {
      feedbackModal.classList.remove('hidden');
      return;
    }

    navButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    currentView = btn.dataset.view;
    switchView(currentView);
  });
});

// Custom Category Handling
categorySelect.addEventListener('change', () => {
  if (categorySelect.value === 'custom') {
    customCategoryGroup.classList.remove('hidden');
    customCategoryInput.focus();
  } else {
    customCategoryGroup.classList.add('hidden');
    customCategoryInput.value = '';
  }
});

// Feedback Modal Handlers
feedbackBtn.addEventListener('click', () => {
  feedbackModal.classList.remove('hidden');
});

closeFeedback.addEventListener('click', () => {
  feedbackModal.classList.add('hidden');
});

feedbackModal.addEventListener('click', (e) => {
  if (e.target === feedbackModal) {
    feedbackModal.classList.add('hidden');
  }
});

// Star Rating System
ratingStars.addEventListener('click', (e) => {
  if (e.target.classList.contains('fa-star')) {
    const rating = parseInt(e.target.dataset.rating);
    feedbackRating.value = rating;

    // Update star visuals
    const stars = ratingStars.querySelectorAll('.fa-star');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.remove('fa-regular');
        star.classList.add('fa-solid');
      } else {
        star.classList.remove('fa-solid');
        star.classList.add('fa-regular');
      }
    });
  }
});

// Feedback Form Submission
feedbackForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const feedback = {
    id: Date.now().toString(),
    name: document.getElementById('feedback-name').value.trim(),
    email: document.getElementById('feedback-email').value.trim(),
    type: document.getElementById('feedback-type').value,
    message: document.getElementById('feedback-message').value.trim(),
    rating: parseInt(feedbackRating.value),
    createdAt: new Date().toLocaleDateString()
  };

  // Save feedback to localStorage
  const feedbacks = JSON.parse(localStorage.getItem('taskmaster_feedbacks')) || [];
  feedbacks.push(feedback);
  localStorage.setItem('taskmaster_feedbacks', JSON.stringify(feedbacks));

  // Reset form and close modal
  feedbackForm.reset();
  feedbackRating.value = '0';
  const stars = ratingStars.querySelectorAll('.fa-star');
  stars.forEach(star => {
    star.classList.remove('fa-solid');
    star.classList.add('fa-regular');
  });

  feedbackModal.classList.add('hidden');

  // Show success message
  alert('Thank you for your feedback! We appreciate your input.');
});

function switchView(view) {
  const tasksPanel = document.getElementById('tasks-view');
  const analyticsPanel = document.getElementById('analytics-view');
  const overviewPanel = document.getElementById('overview-view');

  // Hide all panels first
  tasksPanel.classList.add('hidden');
  analyticsPanel.classList.add('hidden');
  overviewPanel.classList.add('hidden');

  if (view === 'analytics') {
    analyticsPanel.classList.remove('hidden');
    viewTitle.textContent = 'Analytics';
    viewSubtitle.textContent = 'Track your task productivity and metrics';
    updateAnalytics();
  } else if (view === 'overview') {
    overviewPanel.classList.remove('hidden');
    viewTitle.textContent = 'Overview';
    viewSubtitle.textContent = 'Get a comprehensive view of your productivity';
    updateOverview();
  } else {
    tasksPanel.classList.remove('hidden');

    const titles = {
      all: 'All Tasks',
      active: 'Active Tasks',
      completed: 'Completed Tasks',
    };
    viewTitle.textContent = titles[view];
    viewSubtitle.textContent = 'Manage and track your daily priorities';
    renderTasks();
  }
}

// Add New Task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  let category = categorySelect.value;
  if (category === 'custom') {
    category = customCategoryInput.value.trim() || 'Uncategorized';
  }

  const newTask = {
    id: Date.now().toString(),
    title: taskInput.value.trim(),
    category: category,
    priority: prioritySelect.value,
    completed: false,
    createdAt: new Date().toLocaleDateString(),
  };

  tasks.unshift(newTask);
  saveAndRender();
  taskInput.value = '';

  // Reset custom category if used
  if (categorySelect.value === 'custom') {
    customCategoryInput.value = '';
    categorySelect.value = 'work';
    customCategoryGroup.classList.add('hidden');
  }
});

// Toggle Task Completion & Delete Task
taskList.addEventListener('click', (e) => {
  const item = e.target.closest('.task-item');
  if (!item) return;

  const id = item.dataset.id;

  // Toggle complete
  if (e.target.closest('.custom-checkbox')) {
    tasks = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveAndRender();
  }

  // Delete Task
  if (e.target.closest('.delete-btn')) {
    tasks = tasks.filter((t) => t.id !== id);
    saveAndRender();
  }
});

// Save to LocalStorage & Render UI
function saveAndRender() {
  localStorage.setItem('taskmaster_tasks', JSON.stringify(tasks));
  renderTasks();
  updateBadge();
}

function renderTasks() {
  taskList.innerHTML = '';

  let filteredTasks = tasks;
  if (currentView === 'active') {
    filteredTasks = tasks.filter((t) => !t.completed);
  } else if (currentView === 'completed') {
    filteredTasks = tasks.filter((t) => t.completed);
  }

  if (filteredTasks.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    filteredTasks.forEach((task) => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.dataset.id = task.id;

      li.innerHTML = `
        <div class="task-left">
          <div class="custom-checkbox">
            ${task.completed ? '<i class="fa-solid fa-check" style="color:white; font-size:10px;"></i>' : ''}
          </div>
          <div class="task-info">
            <span class="task-text">${escapeHTML(task.title)}</span>
            <div class="task-tags">
              <span class="badge">${task.category}</span>
              <span class="badge ${task.priority}">${task.priority}</span>
            </div>
          </div>
        </div>
        <button class="delete-btn" title="Delete Task">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      `;

      taskList.appendChild(li);
    });
  }
  updateBadge();
}

// Update Badge Counter
function updateBadge() {
  const activeCount = tasks.filter((t) => !t.completed).length;

  if (activeTasksCount) {
    activeTasksCount.textContent = activeCount;
  }
}

// Update Analytics
function updateAnalytics() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById('total-tasks').textContent = total;
  document.getElementById('stats-active').textContent = active;
  document.getElementById('stats-completed').textContent = completed;
  document.getElementById('stats-rate').textContent = `${rate}%`;

  // Update insights
  document.getElementById('remaining-tasks').textContent = active;
  document.getElementById('top-priority').textContent = getTopPriority();
}

// Update Overview
function updateOverview() {
  const highPriority = tasks.filter((t) => t.priority === 'high' && !t.completed).length;
  const mediumPriority = tasks.filter((t) => t.priority === 'medium' && !t.completed).length;
  const lowPriority = tasks.filter((t) => t.priority === 'low' && !t.completed).length;

  document.getElementById('overview-high').textContent = highPriority;
  document.getElementById('overview-medium').textContent = mediumPriority;
  document.getElementById('overview-low').textContent = lowPriority;

  // Update progress
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById('progress-fill').style.width = `${rate}%`;
  document.getElementById('progress-caption').textContent = `${rate}% complete`;
  document.getElementById('progress-subcaption').textContent = `${completed} tasks finished`;

  // Update mini progress
  document.getElementById('mini-progress-text').textContent = `${rate}%`;
  document.getElementById('mini-goal-label').textContent = `${completed} of ${total} tasks complete`;
}

// Get Top Priority
function getTopPriority() {
  const priorities = tasks.filter((t) => !t.completed).map((t) => t.priority);
  if (priorities.length === 0) return 'No active tasks';

  const highCount = priorities.filter((p) => p === 'high').length;
  const mediumCount = priorities.filter((p) => p === 'medium').length;
  const lowCount = priorities.filter((p) => p === 'low').length;

  if (highCount > 0) return 'High priority';
  if (mediumCount > 0) return 'Medium priority';
  return 'Low priority';
}

// Set Today's Date
function setTodayDate() {
  const today = new Date();
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  if (todayDate) {
    todayDate.textContent = today.toLocaleDateString('en-US', options);
  }
}

// Utility Function
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Initial Render
setTodayDate();
renderTasks();
updateBadge();