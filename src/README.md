# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## How to Push to GitHub

### Initial Setup (Only do this once)

If you haven't pushed this project to GitHub before, follow these steps to upload it to a **new, empty repository**.

1.  **Create a New Repository on GitHub:**
    *   Go to [GitHub](https://github.com) and log in.
    *   Click **+** and select **New repository**.
    *   Give it a name.
    *   **IMPORTANT:** Do **not** initialize with a `README`, `.gitignore`, or `license`.
    *   Click **Create repository**.

2.  **Connect and Push Your Project:**
    *   In your project terminal, run these commands. Replace `YOUR_GITHUB_USERNAME` and `YOUR_REPOSITORY_NAME.git` with your details.

    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
    git push -u origin main
    ```

---

### Pushing Updates (Use this every time you make changes)

After the initial setup, you only need these simple commands to push all your latest changes to GitHub.

**1. Stage Your Changes:**
This command prepares all the new and modified files for saving. (Note: In this environment, changes are often committed automatically, so this step might not be necessary, but it's good practice).

```bash
git add .
```

**2. Commit Your Changes:**
This command saves a snapshot of your changes. Replace the message with a brief description of what you did.

```bash
git commit -m "Add new feature or fix a bug"
```

**3. Push to GitHub:**
This command uploads your saved changes to your GitHub repository.

```bash
git push
```

---

### Troubleshooting: Push Rejected?

Sometimes, you might see an error like `[rejected] main -> main (fetch first)`. This means there are changes on GitHub that you don't have locally.

To fix this, simply **pull** the remote changes first, then **push** again:

**1. Pull and Merge Remote Changes:**
```bash
git pull origin main
```

**2. Push Your Combined Changes:**
```bash
git push
```
