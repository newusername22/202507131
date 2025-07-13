class TodoApp {
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
        this.updateProgressRings();
    }

    bindEvents() {
        // 할일 추가
        const addBtn = document.getElementById('addBtn');
        const todoInput = document.getElementById('todoInput');
        const floatingAddBtn = document.getElementById('floatingAddBtn');
        
        addBtn.addEventListener('click', () => this.addTodo());
        floatingAddBtn.addEventListener('click', () => this.showAddTodoModal());
        todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        // 필터 버튼
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.closest('.filter-btn').dataset.filter);
            });
        });

        // 삭제 버튼들
        document.getElementById('clearCompleted').addEventListener('click', () => this.clearCompleted());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
    }

    showAddTodoModal() {
        Swal.fire({
            title: '새로운 할일 추가',
            input: 'text',
            inputPlaceholder: '할일을 입력하세요...',
            inputAttributes: {
                maxlength: '100'
            },
            showCancelButton: true,
            confirmButtonText: '추가',
            cancelButtonText: '취소',
            confirmButtonColor: '#667eea',
            cancelButtonColor: '#6c757d',
            inputValidator: (value) => {
                if (!value.trim()) {
                    return '할일을 입력해주세요!';
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.addTodoWithText(result.value);
            }
        });
    }

    addTodo() {
        const input = document.getElementById('todoInput');
        const text = input.value.trim();
        
        if (text === '') {
            Swal.fire({
                icon: 'warning',
                title: '입력 오류',
                text: '할일을 입력해주세요!',
                confirmButtonColor: '#667eea'
            });
            return;
        }

        this.addTodoWithText(text);
        input.value = '';
    }

    addTodoWithText(text) {
        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo);
        this.saveToLocalStorage();
        this.render();
        this.updateStats();
        this.updateProgressRings();
        
        Swal.fire({
            icon: 'success',
            title: '할일 추가 완료!',
            text: '새로운 할일이 추가되었습니다.',
            timer: 1500,
            showConfirmButton: false,
            confirmButtonColor: '#667eea'
        });
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToLocalStorage();
            this.render();
            this.updateStats();
            this.updateProgressRings();
            
            const message = todo.completed ? '할일을 완료했습니다!' : '할일을 다시 시작합니다!';
            Swal.fire({
                icon: todo.completed ? 'success' : 'info',
                title: message,
                timer: 1000,
                showConfirmButton: false,
                confirmButtonColor: '#667eea'
            });
        }
    }

    deleteTodo(id) {
        Swal.fire({
            title: '할일 삭제',
            text: '정말로 이 할일을 삭제하시겠습니까?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d'
        }).then((result) => {
            if (result.isConfirmed) {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveToLocalStorage();
                this.render();
                this.updateStats();
                this.updateProgressRings();
                
                Swal.fire({
                    icon: 'success',
                    title: '삭제 완료!',
                    text: '할일이 삭제되었습니다.',
                    timer: 1500,
                    showConfirmButton: false,
                    confirmButtonColor: '#667eea'
                });
            }
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // 필터 버튼 활성화 상태 변경
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) {
            Swal.fire({
                icon: 'info',
                title: '삭제할 항목 없음',
                text: '완료된 할일이 없습니다.',
                confirmButtonColor: '#667eea'
            });
            return;
        }
        
        Swal.fire({
            title: '완료된 항목 삭제',
            text: `완료된 ${completedCount}개의 할일을 삭제하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d'
        }).then((result) => {
            if (result.isConfirmed) {
                this.todos = this.todos.filter(t => !t.completed);
                this.saveToLocalStorage();
                this.render();
                this.updateStats();
                this.updateProgressRings();
                
                Swal.fire({
                    icon: 'success',
                    title: '삭제 완료!',
                    text: `${completedCount}개의 완료된 할일이 삭제되었습니다.`,
                    timer: 2000,
                    showConfirmButton: false,
                    confirmButtonColor: '#667eea'
                });
            }
        });
    }

    clearAll() {
        if (this.todos.length === 0) {
            Swal.fire({
                icon: 'info',
                title: '삭제할 항목 없음',
                text: '삭제할 할일이 없습니다.',
                confirmButtonColor: '#667eea'
            });
            return;
        }
        
        Swal.fire({
            title: '전체 삭제',
            text: '정말로 모든 할일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '전체 삭제',
            cancelButtonText: '취소',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d'
        }).then((result) => {
            if (result.isConfirmed) {
                this.todos = [];
                this.saveToLocalStorage();
                this.render();
                this.updateStats();
                this.updateProgressRings();
                
                Swal.fire({
                    icon: 'success',
                    title: '전체 삭제 완료!',
                    text: '모든 할일이 삭제되었습니다.',
                    timer: 2000,
                    showConfirmButton: false,
                    confirmButtonColor: '#667eea'
                });
            }
        });
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const remaining = total - completed;

        document.getElementById('totalCount').textContent = total;
        document.getElementById('completedCount').textContent = completed;
        document.getElementById('remainingCount').textContent = remaining;
    }

    updateProgressRings() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const remaining = total - completed;
        
        const circumference = 2 * Math.PI * 26; // r=26
        
        // 전체 진행률 (항상 100%)
        const totalProgress = document.getElementById('totalProgress');
        totalProgress.style.strokeDasharray = `${circumference} ${circumference}`;
        
        // 완료 진행률
        const completedProgress = document.getElementById('completedProgress');
        const completedPercentage = total > 0 ? (completed / total) : 0;
        const completedDasharray = `${completedPercentage * circumference} ${circumference}`;
        completedProgress.style.strokeDasharray = completedDasharray;
        
        // 남은 진행률
        const remainingProgress = document.getElementById('remainingProgress');
        const remainingPercentage = total > 0 ? (remaining / total) : 0;
        const remainingDasharray = `${remainingPercentage * circumference} ${circumference}`;
        remainingProgress.style.strokeDasharray = remainingDasharray;
    }

    render() {
        const todoList = document.getElementById('todoList');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            const emptyMessages = {
                all: '할일이 없습니다. 새로운 할일을 추가해보세요!',
                active: '진행중인 할일이 없습니다.',
                completed: '완료된 할일이 없습니다.'
            };
            
            todoList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p class="mt-3">${emptyMessages[this.currentFilter]}</p>
                </div>
            `;
            return;
        }

        todoList.innerHTML = filteredTodos.map((todo, index) => `
            <li class="todo-item bg-white p-3 rounded-3 shadow-sm" 
                data-id="${todo.id}" 
                style="animation-delay: ${index * 0.1}s;">
                <div class="d-flex align-items-center gap-3">
                    <div class="custom-checkbox ${todo.completed ? 'checked' : ''}" 
                         onclick="todoApp.toggleTodo(${todo.id})"></div>
                    <span class="todo-text flex-grow-1 ${todo.completed ? 'text-decoration-line-through text-muted' : ''}">
                        ${this.escapeHtml(todo.text)}
                    </span>
                    <button class="btn btn-sm btn-outline-danger" onclick="todoApp.deleteTodo(${todo.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </li>
        `).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveToLocalStorage() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }
}

// 앱 초기화
const todoApp = new TodoApp();

// 페이지 로드 시 애니메이션 효과
document.addEventListener('DOMContentLoaded', () => {
    // 스크롤 애니메이션
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // 모든 카드 요소에 애니메이션 적용
    document.querySelectorAll('.card, .todo-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}); 