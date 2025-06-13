# Eco-Fi

🚀 Eco-Fi AI (EcoFi AI) – Smart Ticket Triage Dashboard
Eco-Fi AI (also known as EcoFi AI) is an intelligent, AI-powered dashboard that revolutionizes how engineering and operations teams triage, analyze, and resolve issue tickets. It combines the power of Natural Language Processing (NLP), Machine Learning, and data visualization to drastically improve resolution times and decision-making.

📌 Problem Statement
Engineering teams waste countless hours manually triaging tickets, analyzing logs, and searching past issues in platforms like Jira or ServiceNow. Tribal knowledge is lost, critical tickets are delayed, and valuable time is consumed by inefficiencies.

💡 What Eco-Fi AI Does


AI-Powered Ticket Triage
Uses BERT to suggest the best owner/team, fetch relevant past tickets, and estimate resolution times.

Dead Ticket Detection
ML classifier flags tickets stuck in limbo using metadata like timestamps, comments, and activity patterns.

Impact-Based Prioritization
NLP-based urgency classifier highlights critical issues based on business impact and affected systems.

Dynamic Visual Dashboard
Live heatmaps, pie charts, and state breakdowns using Power BI or Chart.js to visualize ticket lifecycles.

⚙️ Tech Stack

Layer	Tools / Technologies
Frontend	Power BI / React (dashboard visualizations)
Backend	FastAPI / Node.js
ML Models	BERT (Hugging Face), RandomForest, Regression
DB/Storage	PostgreSQL, Redis
Integration	Jira REST API / GitHub Issues / CSV Import

📊 Core Features

🧠 NLP-based ticket summarization

🔗 Linked tickets via semantic similarity

🚦 Dead ticket detection with filterable dashboards

⏱ Resolution time predictions

🔥 Urgency-based prioritization

📈 Real-time visual dashboards

🧪 Sample Use Case
"Imagine submitting a new incident. FixScope AI instantly summarizes it, links relevant past fixes, suggests the best owner, and predicts how long it’ll take — all within seconds."

📈 Performance Metrics (Based on Demo Data)

Metric	Value
Auto-classification rate	~85%
Reduction in triage time	70%+
Dead ticket accuracy	92%
Time to value (ROI)	< 3 months

🔮 Future Scope

Live chat assistant for ticket handling

Multilingual NLP support

CI/CD ticket integration

Role-based access and escalation triggers

🤝 Contributors

[Rayman Ahluwalia] – Software Engineer -2

[Anshika Thakur] – Software Developer Intern


📜 License
MIT License. See LICENSE file for details.
