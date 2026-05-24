const API_URL = 'http://localhost:3000/api';

let currentUser = null;
let currentToken = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('App loaded!');
    initAuthTabs();
    initForms();
    initFilters();
    checkAuth();
});

function initAuthTabs() {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    loginTab.addEventListener('click', function() {
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    });

    signupTab.addEventListener('click', function() {
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });
}

function initForms() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    document.getElementById('createIssueForm').addEventListener('submit', handleCreateIssue);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

function initFilters() {
    document.getElementById('filterType').addEventListener('change', fetchIssues);
    document.getElementById('filterStatus').addEventListener('change', fetchIssues);
    document.getElementById('sortBy').addEventListener('change', fetchIssues);
}

async function handleLogin(e) {
    e.preventDefault();
    console.log('Login submitted');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await res.json();

        if (data.success) {
            currentUser = data.data.user;
            currentToken = data.data.token;
            localStorage.setItem('token', currentToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            showMainSection();
            fetchIssues();
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Login failed. Please try again.');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    console.log('Signup submitted');
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const role = document.getElementById('signupRole').value;

    try {
        const res = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, email: email, password: password, role: role })
        });

        const data = await res.json();

        if (data.success) {
            alert('Great! Signup successful! Please login now.');
            document.getElementById('loginTab').click();
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Signup failed. Please try again.');
    }
}

function handleLogout() {
    console.log('Logging out');
    currentUser = null;
    currentToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAuthSection();
}

async function handleCreateIssue(e) {
    e.preventDefault();
    console.log('Creating issue');
    
    const title = document.getElementById('issueTitle').value;
    const description = document.getElementById('issueDescription').value;
    const type = document.getElementById('issueType').value;

    try {
        const res = await fetch(`${API_URL}/issues`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': currentToken
            },
            body: JSON.stringify({ title: title, description: description, type: type })
        });

        const data = await res.json();

        if (data.success) {
            alert('Issue created successfully!');
            document.getElementById('createIssueForm').reset();
            fetchIssues();
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Failed to create issue.');
    }
}

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
        currentToken = token;
        currentUser = JSON.parse(user);
        showMainSection();
        fetchIssues();
    } else {
        showAuthSection();
    }
}

function showAuthSection() {
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('mainSection').classList.add('hidden');
}

function showMainSection() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('mainSection').classList.remove('hidden');

    document.getElementById('userName').textContent = currentUser.name;
    const roleBadge = document.getElementById('userRole');
    roleBadge.textContent = currentUser.role;
    roleBadge.className = 'badge ' + currentUser.role;
}

async function fetchIssues() {
    console.log('Fetching issues');
    
    const type = document.getElementById('filterType').value;
    const status = document.getElementById('filterStatus').value;
    const sort = document.getElementById('sortBy').value;

    let queryParams = new URLSearchParams();
    if (type) queryParams.append('type', type);
    if (status) queryParams.append('status', status);
    if (sort) queryParams.append('sort', sort);

    try {
        const res = await fetch(`${API_URL}/issues?` + queryParams.toString());
        const data = await res.json();

        if (data.success) {
            renderIssues(data.data);
        }
    } catch (err) {
        console.error(err);
    }
}

function renderIssues(issues) {
    const issuesList = document.getElementById('issuesList');

    if (!issues || issues.length === 0) {
        issuesList.innerHTML = '<p style="text-align:center; padding:30px; color:#666;">No issues found. Create one!</p>';
        return;
    }

    let html = '';
    for (let i = 0; i < issues.length; i++) {
        const issue = issues[i];
        html += `
            <div class="issue-card">
                <div class="issue-header">
                    <h3 class="issue-title">${escapeHtml(issue.title)}</h3>
                    <div class="issue-meta">
                        <span class="issue-type ${issue.type}">${issue.type.replace('_', ' ')}</span>
                        <span class="issue-status ${issue.status}">${issue.status.replace('_', ' ')}</span>
                    </div>
                </div>
                <p class="issue-description">${escapeHtml(issue.description)}</p>
                <div class="issue-footer">
                    <div>
                        By: <span class="issue-reporter">${escapeHtml(issue.reporter.name)}</span>
                        &nbsp;•&nbsp;
                        ${new Date(issue.created_at).toLocaleDateString()}
                    </div>
                    ${renderIssueActions(issue)}
                </div>
            </div>
        `;
    }
    issuesList.innerHTML = html;
}

function renderIssueActions(issue) {
    if (!currentUser) return '';

    const isOwner = issue.reporter_id === currentUser.id;
    const isMaintainer = currentUser.role === 'maintainer';

    let actions = '';
    
    if (isOwner || isMaintainer) {
        actions += '<button class="edit-btn" onclick="editIssue(' + issue.id + ')">Edit</button>';
    }
    
    if (isMaintainer) {
        actions += '<button class="delete-btn" onclick="deleteIssue(' + issue.id + ')">Delete</button>';
    }

    if (actions) {
        return '<div class="issue-actions">' + actions + '</div>';
    } else {
        return '';
    }
}

async function deleteIssue(id) {
    if (!confirm('Are you sure you want to delete this issue?')) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/issues/` + id, {
            method: 'DELETE',
            headers: { 'Authorization': currentToken }
        });

        const data = await res.json();

        if (data.success) {
            alert('Issue deleted successfully!');
            fetchIssues();
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Failed to delete issue.');
    }
}

function editIssue(id) {
    alert('Edit feature coming soon! (This would be implemented here)');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
