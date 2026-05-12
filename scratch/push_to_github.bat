@echo off
git status
git remote add origin https://github.com/NishantJLU/AI-LMS
git remote set-url origin https://github.com/NishantJLU/AI-LMS
git branch -M main
git add .
git commit -m "Pushing project to GitHub"
git push -u origin main
