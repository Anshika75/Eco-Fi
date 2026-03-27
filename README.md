# 🌿 Eco-Fi AI – Smart Ticket Triage Dashboard



**Eco-Fi AI** is an intelligent, AI-powered dashboard designed to transform how engineering and operations teams **triage**, **analyze**, and **resolve issue tickets**. By leveraging **Natural Language Processing (NLP)**, **Machine Learning**, and powerful **data visualizations**, it enhances decision-making and drastically reduces resolution times.


---

## ❗ Problem Statement

Engineering teams often spend **countless hours** manually:
- Triaging tickets
- Analyzing logs
- Searching historical issues in Jira, ServiceNow, etc.

This leads to:
- **Loss of tribal knowledge**
- **Delayed resolution of critical tickets**
- **Significant inefficiencies**

---

## 💡 What Eco-Fi AI Does

### 🤖 AI-Powered Ticket Triage
- Suggests the best owner/team using **BERT**
- Fetches similar past tickets
- Estimates resolution time

### 🧊 Dead Ticket Detection
- Flags inactive tickets using ML classifiers
- Detects based on timestamps, comments & activity

### 🚨 Impact-Based Prioritization
- Classifies urgency using NLP
- Highlights high-impact tickets based on affected systems

### 📊 Dynamic Visual Dashboards
- Visualizes ticket lifecycle with **heatmaps**, **pie charts**, and **state breakdowns** using **Power BI** or **Chart.js**

---

## ⚙️ Tech Stack

| Layer        | Tools / Technologies                             |
|--------------|--------------------------------------------------|
| **Frontend** | Power BI / React                                 |
| **Backend**  | FastAPI / Node.js                                |
| **ML Models**| BERT (Hugging Face), Random Forest, Regression   |
| **Storage**  | PostgreSQL, Redis                                |
| **Integration** | Jira REST API, GitHub Issues, CSV Import     |

---

## 📌 Core Features

- 🧠 **NLP-based ticket summarization**
- 🔗 **Linked tickets** using semantic similarity
- 🚦 **Dead ticket detection** with interactive filters
- ⏱ **Resolution time prediction**
- 🔥 **Urgency-based prioritization**
- 📈 **Live dashboards** with real-time insights 

---

## 🧪 Sample Use Case

> *"Imagine submitting a new incident. Eco-Fi AI instantly summarizes it, links related historical issues, recommends the most suitable owner, and predicts resolution time — all within seconds."*

---

## 📈 Performance Metrics *(Demo Data)*

| Metric                    | Value       |
|---------------------------|-------------|
| Auto-classification rate  | ~85%        |
| Reduction in triage time  | 70%+        |
| Dead ticket accuracy      | 92%         |
| Time to ROI               | < 3 months  |

---

## 🔮 Future Scope

- 🤖 Live chatbot assistant for ticket handling  
- 🌐 Multilingual NLP support  
- 🔁 CI/CD system integration  
- 🔐 Role-based access and escalation triggers  

---

## 🤝 Contributors

- **Rayman Ahluwalia** – Software Engineer - 2  
- **Anshika Thakur** – Software Developer Intern  

---

## 📜 License

This project is licensed under the **MIT License**. See the `LICENSE` file for more details.
