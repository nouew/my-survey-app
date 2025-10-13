# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## How to Push to GitHub

Follow these steps to upload your project to a new GitHub repository.

### 1. Create a New Repository on GitHub

- Go to [GitHub](https://github.com) and log in.
- Click the **+** icon in the top-right corner and select **New repository**.
- Give your repository a name (e.g., `my-survey-app`).
- You can add a description (optional).
- Make sure the repository is set to **Public** or **Private** as you prefer.
- **IMPORTANT**: Do **not** initialize the repository with a `README`, `.gitignore`, or `license` file, as your project already contains these.
- Click **Create repository**.

### 2. Connect Your Project to the GitHub Repository

After creating the repository, GitHub will show you a page with some commands. You'll use the commands under the "**…or push an existing repository from the command line**" section.

Open a terminal or command prompt in your project's root directory and run the following commands one by one.

**Note:** Replace `YOUR_GITHUB_USERNAME` and `YOUR_REPOSITORY_NAME.git` with your actual GitHub username and repository name.

```bash
# Initialize git in your project (if not already done)
git init

# Add all files to be tracked by git
git add .

# Create your first commit (a snapshot of your code)
git commit -m "Initial commit"

# Set the main branch name (standard practice)
git branch -M main

# Add the remote GitHub repository URL
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git

# Push your code to the GitHub repository
git push -u origin main
```

### 3. All Done!

Your code is now on GitHub! To push future changes, you will only need to use these three commands:

```bash
# 1. Add your changes
git add .

# 2. Commit your changes with a message
git commit -m "A message describing your changes"

# 3. Push to GitHub
git push
```
