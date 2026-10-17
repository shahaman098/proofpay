# Competition Brief: Build Agents That Run Code (CreateOS × Stripe Projects)

**Event:** Build Agents That Run Code: CreateOS × Stripe Projects Online Hackathon  
**Date:** Saturday, October 17, 2026  
**Time:** 12:00 PM – 7:00 PM PT (20:00 – 03:00 BST)  
**Submission Deadline:** 5:30 PM PT (01:30 BST)  
**Live Demos:** 6:00 PM PT (02:00 BST)  
**Prize Pool:** $10,000 ($5,000 cash + $5,000 CreateOS credits)  
- 🥇 **1st Place:** $2,500 cash + $2,500 CreateOS credits  
- 🥈 **2nd Place:** $1,500 cash + $1,500 CreateOS credits  
- 🥉 **3rd Place:** $1,000 cash + $1,000 CreateOS credits  

---

## 1. Core Challenge & Mandatory Rules

> **Challenge:** Build an AI agent that writes its own code and runs it safely in a CreateOS Sandbox, with your stack running through Stripe Projects.

### Mandatory Requirements:
1. **Stripe Projects:** Set up your stack using the Stripe Projects CLI (`stripe projects init`, `stripe projects add`).
2. **CreateOS Sandbox:** Agent code must execute inside an isolated CreateOS microVM sandbox (`@nodeops-createos/sandbox` or `createos-sandbox` Python).
3. **Submission Package (Lock at 5:30 PM PT):**
   - 2 to 3 minute demo video (YouTube link) with **at least one team member on camera**.
   - Public GitHub repository with a clear README.
   - Public post on X/LinkedIn tagging `@createosai` (X) or `CreateOS` (LinkedIn).
   - Project added to `projects.dev/leaderboard` with code `CreateOS-2026`.

---

## 2. Technical Stack & Documentation Reference

- **CreateOS Sandbox:**
  - Docs: https://createos.sh/docs/Sandbox
  - NPM: `@nodeops-createos/sandbox` (v0.8.2)
  - PyPI: `createos-sandbox` (v0.1.3)
  - CLI: `brew tap nodeops-app/tap && brew install createos` or `createos login --token <TOKEN>`
  - API Endpoint: `https://api.sb.createos.sh`
  - Core features: Firecracker microVMs, in-kernel egress control, live process streaming, snapshot / fork / resume, preview URLs.
- **Stripe Projects:**
  - Guide: https://projects.dev/hackathon-participants
  - CLI Plugin: `stripe plugin install projects`
  - Stack initialization: `stripe projects init`
  - Environment pull: `stripe projects env --pull`
  - Agent Skills: `npx skills add https://docs.stripe.com --skill stripe-projects -g -y`
  - Leaderboard: `https://projects.dev/leaderboard` (Code: `CreateOS-2026`)
