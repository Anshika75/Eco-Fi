import { Chart } from "@/components/ui/chart"
// Global variables
let allTickets = []
let filteredTickets = []
const charts = {}
const currentUser = "John Doe" // This would come from authentication

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
  // Check if we're on the user dashboard page
  if (document.getElementById("statusChart")) {
    loadUserTickets()
    setupEventListeners()
  }
})

// Setup event listeners
function setupEventListeners() {
  const urgencySlider = document.getElementById("urgencySlider")
  if (urgencySlider) {
    urgencySlider.addEventListener("input", function () {
      document.getElementById("urgencyValue").textContent = this.value
    })
  }

  // Add dead tickets toggle functionality
  const deadFlag = document.getElementById("deadFlag")
  if (deadFlag) {
    deadFlag.addEventListener("change", () => {
      applyFilters() // This will handle filtering and updating all charts
    })
  }

  // Add sidebar toggle functionality
  const sidebarToggle = document.getElementById("sidebarToggle")
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar)
  }

  // Help tooltip
  const helpButton = document.getElementById("helpButton")
  const helpContent = document.getElementById("helpContent")
  if (helpButton && helpContent) {
    helpButton.addEventListener("click", () => {
      helpContent.classList.toggle("active")
    })

    document.addEventListener("click", (e) => {
      if (!helpButton.contains(e.target) && !helpContent.contains(e.target)) {
        helpContent.classList.remove("active")
      }
    })
  }
}

// Toggle sidebar
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar")
  if (sidebar) {
    sidebar.classList.toggle("collapsed")
  }
}

// Load user tickets from main data
function loadUserTickets() {
  // Generate mock data - we're not using any external data source
  allTickets = generateMockUserTickets()

  // IMPORTANT: Initially filter out dead tickets (this is the default behavior)
  // We're explicitly filtering here rather than relying on applyFilters to ensure
  // the initial state is correct
  const showDeadOnly = document.getElementById("deadFlag")?.checked || false
  filteredTickets = allTickets.filter((ticket) =>
    showDeadOnly ? ticket.isDead || ticket.deadFlag : !(ticket.isDead || ticket.deadFlag),
  )

  // Update the dashboard with the filtered tickets
  updateDashboard()

  // Show/hide dead tickets section based on toggle
  const deadFlag = document.getElementById("deadFlag")
  if (deadFlag) {
    const deadTicketsSection = document.getElementById("deadTicketsSection")
    if (deadTicketsSection) {
      deadTicketsSection.style.display = deadFlag.checked ? "block" : "none"
    }
  }
}

// Generate mock user tickets with better dummy data
function generateMockUserTickets() {
  const tickets = []
  const statuses = ["defined", "review", "test", "completed", "accepted"]
  const priorities = ["low", "medium", "high", "critical"]
  const systems = ["Authentication", "Payment", "Dashboard", "API", "Database", "Frontend", "Mobile", "DevOps"]

  // Predefined ticket scenarios for better visualization
  const ticketScenarios = [
    {
      title: "Login authentication failing on mobile devices",
      system: "Authentication",
      priority: "critical",
      status: "review",
      resolutionHours: 8,
      impactScore: 9.2,
      urgency: 9,
      isDead: false,
      daysOld: 2,
    },
    {
      title: "Payment gateway timeout errors",
      system: "Payment",
      priority: "high",
      status: "test",
      resolutionHours: 6,
      impactScore: 8.5,
      urgency: 8,
      isDead: false,
      daysOld: 5,
    },
    {
      title: "Dashboard loading performance issues",
      system: "Dashboard",
      priority: "medium",
      status: "completed",
      resolutionHours: 4,
      impactScore: 6.8,
      urgency: 6,
      isDead: false,
      daysOld: 12,
    },
    {
      title: "API rate limiting causing timeouts",
      system: "API",
      priority: "high",
      status: "defined",
      resolutionHours: 12,
      impactScore: 7.9,
      urgency: 7,
      isDead: false,
      daysOld: 1,
    },
    {
      title: "Database connection pool exhaustion",
      system: "Database",
      priority: "critical",
      status: "review",
      resolutionHours: 16,
      impactScore: 9.5,
      urgency: 10,
      isDead: false,
      daysOld: 3,
    },
    {
      title: "Frontend component rendering issues",
      system: "Frontend",
      priority: "low",
      status: "accepted",
      resolutionHours: 2,
      impactScore: 3.2,
      urgency: 3,
      isDead: false,
      daysOld: 20,
    },
    {
      title: "Mobile app crashes on startup",
      system: "Mobile",
      priority: "critical",
      status: "test",
      resolutionHours: 10,
      impactScore: 8.8,
      urgency: 9,
      isDead: false,
      daysOld: 4,
    },
    {
      title: "CI/CD pipeline failing intermittently",
      system: "DevOps",
      priority: "medium",
      status: "completed",
      resolutionHours: 5,
      impactScore: 5.5,
      urgency: 5,
      isDead: false,
      daysOld: 8,
    },
    {
      title: "Legacy authentication module cleanup",
      system: "Authentication",
      priority: "low",
      status: "defined",
      resolutionHours: 24,
      impactScore: 2.1,
      urgency: 2,
      isDead: true,
      daysOld: 45,
    },
    {
      title: "Old payment integration removal",
      system: "Payment",
      priority: "low",
      status: "defined",
      resolutionHours: 18,
      impactScore: 1.8,
      urgency: 1,
      isDead: true,
      daysOld: 60,
    },
  ]

  // Create tickets from scenarios
  ticketScenarios.forEach((scenario, index) => {
    const createdDate = new Date()
    createdDate.setDate(createdDate.getDate() - scenario.daysOld)

    const updatedDate = new Date(createdDate)
    updatedDate.setDate(updatedDate.getDate() + Math.floor(Math.random() * scenario.daysOld))

    const ticket = {
      id: `TCK-${1200 + index}`,
      summary: scenario.title,
      status: scenario.status,
      urgency: scenario.priority,
      assignee: currentUser,
      assigneeInitials: "JD",
      createdDate: createdDate,
      updatedDate: updatedDate,
      resolutionTime: `~${scenario.resolutionHours}h`,
      resolutionEstimate: scenario.resolutionHours,
      impactScore: scenario.impactScore,
      urgencyLevel: scenario.urgency,
      isDead: scenario.isDead,
      deadFlag: scenario.isDead,
      systemZone: scenario.system,
      tags: [scenario.system],
      nlpSummary: generateNLPSummary(index),
    }

    tickets.push(ticket)
  })

  // Generate additional random tickets for better data visualization
  // IMPORTANT: Limit to 30 additional tickets (40 total) to match expected count
  for (let i = 10; i < 40; i++) {
    const createdDate = new Date()
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90))

    const updatedDate = new Date(createdDate)
    updatedDate.setDate(updatedDate.getDate() + Math.floor(Math.random() * 30))

    const resolutionHours = Math.floor(Math.random() * 40) + 1
    const urgencyLevel = Math.floor(Math.random() * 10) + 1
    const isDead = Math.random() < 0.15 // 15% chance of being dead
    const selectedSystem = systems[Math.floor(Math.random() * systems.length)]
    const selectedPriority = priorities[Math.floor(Math.random() * priorities.length)]

    const ticket = {
      id: `TCK-${1200 + i}`,
      summary: `${selectedSystem} issue - ${generateRandomIssueType()}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      urgency: selectedPriority,
      assignee: currentUser,
      assigneeInitials: "JD",
      createdDate: createdDate,
      updatedDate: updatedDate,
      resolutionTime: `~${resolutionHours}h`,
      resolutionEstimate: resolutionHours,
      impactScore: Math.random() * 10,
      urgencyLevel: urgencyLevel,
      isDead: isDead,
      deadFlag: isDead,
      systemZone: selectedSystem,
      tags: [selectedSystem],
      nlpSummary: generateNLPSummary(i),
    }

    tickets.push(ticket)
  }

  return tickets
}

// Generate random issue types for better dummy data
function generateRandomIssueType() {
  const issueTypes = [
    "performance degradation",
    "security vulnerability",
    "integration failure",
    "memory leak",
    "configuration error",
    "validation bug",
    "timeout issue",
    "data corruption",
    "UI inconsistency",
    "service unavailable",
  ]

  return issueTypes[Math.floor(Math.random() * issueTypes.length)]
}

// Generate NLP summary
function generateNLPSummary(ticketNum) {
  const summaries = [
    "Authentication service experiencing intermittent failures during peak hours. Requires immediate investigation of load balancing configuration.",
    "Payment gateway integration returning 500 errors for specific card types. Database connection timeout suspected.",
    "Dashboard loading performance degraded by 40%. Frontend optimization and caching strategy needed.",
    "API rate limiting causing client timeouts. Need to review throttling policies and implement better error handling.",
    "Database query optimization required for user search functionality. Current response time exceeds SLA.",
    "Frontend component rendering issues on mobile devices. CSS media queries need adjustment.",
    "User session management bug causing premature logouts. Session storage mechanism needs review.",
    "Email notification service failing silently. SMTP configuration and error logging need attention.",
    "File upload functionality timing out for large files. Need to implement chunked upload strategy.",
    "Search functionality returning inconsistent results. Elasticsearch indexing requires maintenance.",
  ]

  return summaries[ticketNum % summaries.length]
}

// Apply filters
function applyFilters() {
  const statusFilter = document.getElementById("statusFilter").value
  const timeRange = document.getElementById("timeRange").value
  const priorityFilter = document.getElementById("priorityFilter").value
  const showDeadOnly = document.getElementById("deadFlag").checked
  const maxUrgencyLevel = document.getElementById("urgencyFilter").value

  // Start with all tickets
  filteredTickets = allTickets.filter((ticket) => {
    // Status filter
    if (statusFilter !== "all" && ticket.status !== statusFilter) return false

    // Time range filter
    if (timeRange !== "all") {
      const daysDiff = Math.floor((new Date() - ticket.createdDate) / (1000 * 60 * 60 * 24))
      if (daysDiff > Number.parseInt(timeRange)) return false
    }

    // Priority filter
    if (priorityFilter !== "all" && ticket.urgency !== priorityFilter) return false

    // Dead flag filter - FIXED LOGIC
    if (showDeadOnly) {
      // When toggle is ON, show ONLY dead tickets
      if (!ticket.isDead && !ticket.deadFlag) return false
    } else {
      // When toggle is OFF, show ONLY non-dead tickets
      if (ticket.isDead || ticket.deadFlag) return false
    }

    // Urgency filter - only show tickets with urgency level less than or equal to selected
    if (maxUrgencyLevel !== "critical") {
      // If not showing all urgencies, filter based on the hierarchy
      const urgencyHierarchy = ["low", "medium", "high", "critical"]
      const maxIndex = urgencyHierarchy.indexOf(maxUrgencyLevel)
      const allowedUrgencies = urgencyHierarchy.slice(0, maxIndex + 1)

      if (!allowedUrgencies.includes(ticket.urgency)) {
        return false
      }
    }

    return true
  })

  updateDashboard()
}

// Update entire dashboard
function updateDashboard() {
  updateKPIs()
  updateCharts()
  updateTables()
}

// Update KPI cards
function updateKPIs() {
  const totalTickets = filteredTickets.length
  const oldTickets = filteredTickets.filter((ticket) => {
    const daysDiff = Math.floor((new Date() - ticket.createdDate) / (1000 * 60 * 60 * 24))
    return daysDiff > 7 && ticket.status !== "completed" && ticket.status !== "accepted"
  }).length

  // Calculate average resolution time
  let avgResolutionTime = 0
  const ticketsWithResolution = filteredTickets.filter((ticket) => {
    const timeStr = ticket.resolutionTime ? ticket.resolutionTime.replace("~", "").replace("h", "") : "0"
    const hours = Number.parseInt(timeStr || 0)
    return hours > 0 && !isNaN(hours)
  })

  if (ticketsWithResolution.length > 0) {
    const totalHours = ticketsWithResolution.reduce((sum, ticket) => {
      const timeStr = ticket.resolutionTime.replace("~", "").replace("h", "")
      return sum + Number.parseInt(timeStr || 0)
    }, 0)
    avgResolutionTime = Math.round(totalHours / ticketsWithResolution.length)
  }

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const closedThisWeek = filteredTickets.filter(
    (ticket) => (ticket.status === "completed" || ticket.status === "accepted") && ticket.updatedDate >= oneWeekAgo,
  ).length

  // Calculate average impact score
  let avgImpactScore = 0
  const ticketsWithImpact = filteredTickets.filter(
    (ticket) => ticket.impactScore !== undefined && ticket.impactScore !== null && !isNaN(ticket.impactScore),
  )

  if (ticketsWithImpact.length > 0) {
    const totalImpact = ticketsWithImpact.reduce((sum, ticket) => sum + ticket.impactScore, 0)
    avgImpactScore = (totalImpact / ticketsWithImpact.length).toFixed(1)
  }

  // Update KPI values
  document.getElementById("totalTickets").textContent = totalTickets
  document.getElementById("oldTickets").textContent = oldTickets
  document.getElementById("avgResolutionTime").textContent = `${avgResolutionTime}h`
  document.getElementById("closedThisWeek").textContent = closedThisWeek
  document.getElementById("avgImpactScore").textContent = avgImpactScore
}

// Update all charts
function updateCharts() {
  try {
    updateStatusChart()
    updatePriorityChart()
    updateResolutionTimeChart()
    updateImpactScoreChart()
    updateAgingChart()
    updateLastUpdateChart()
    updateImpactZonesChart()
    updateCreationTrendChart() // Moved to just above heatmaps
    updateTicketCountHeatmap() // Heatmap at the end
    updateResolutionTimeHeatmap() // Heatmap at the end
  } catch (error) {
    console.error("Error updating charts:", error)
  }
}

// Status chart (Donut)
function updateStatusChart() {
  const ctx = document.getElementById("statusChart")
  if (!ctx) {
    console.warn("Status chart canvas not found")
    return
  }

  try {
    if (charts.statusChart) {
      charts.statusChart.destroy()
    }

    const statusCounts = {
      defined: filteredTickets.filter((t) => t.status === "defined").length,
      review: filteredTickets.filter((t) => t.status === "review").length,
      test: filteredTickets.filter((t) => t.status === "test").length,
      completed: filteredTickets.filter((t) => t.status === "completed").length,
      accepted: filteredTickets.filter((t) => t.status === "accepted").length,
    }

    // Debug log to check status counts
    console.log("Status counts for chart:", statusCounts)

    charts.statusChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Newly Reported", "Being Investigated", "Verification", "Resolved", "Closed/Rejected"],
        datasets: [
          {
            data: [
              statusCounts.defined,
              statusCounts.review,
              statusCounts.test,
              statusCounts.completed,
              statusCounts.accepted,
            ],
            backgroundColor: ["#007bff", "#fd7e14", "#6f42c1", "#28a745", "#6c757d"],
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 12,
              padding: 15,
            },
          },
        },
      },
    })
  } catch (error) {
    console.error("Error updating status chart:", error)
  }
}

// Priority chart (Stacked Column)
function updatePriorityChart() {
  const ctx = document.getElementById("priorityChart")
  if (!ctx) {
    console.warn("Priority chart canvas not found")
    return
  }

  try {
    if (charts.priorityChart) {
      charts.priorityChart.destroy()
    }

    const priorityCounts = {
      low: filteredTickets.filter((t) => t.urgency === "low").length,
      medium: filteredTickets.filter((t) => t.urgency === "medium").length,
      high: filteredTickets.filter((t) => t.urgency === "high").length,
      critical: filteredTickets.filter((t) => t.urgency === "critical").length,
    }

    charts.priorityChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Low", "Medium", "High", "Critical"],
        datasets: [
          {
            label: "Tickets",
            data: [priorityCounts.low, priorityCounts.medium, priorityCounts.high, priorityCounts.critical],
            backgroundColor: ["#28a745", "#ffc107", "#fd7e14", "#dc3545"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  } catch (error) {
    console.error("Error updating priority chart:", error)
  }
}

// Resolution time distribution (Histogram)
function updateResolutionTimeChart() {
  const ctx = document.getElementById("resolutionTimeChart")
  if (!ctx) {
    console.warn("Resolution time chart canvas not found")
    return
  }

  try {
    if (charts.resolutionTimeChart) {
      charts.resolutionTimeChart.destroy()
    }

    // Create histogram bins
    const bins = ["0-5h", "6-10h", "11-20h", "21-30h", "30h+"]
    const binCounts = [0, 0, 0, 0, 0]

    filteredTickets.forEach((ticket) => {
      const timeStr = ticket.resolutionTime ? ticket.resolutionTime.replace("~", "").replace("h", "") : "0"
      const hours = Number.parseInt(timeStr || 0)

      if (hours <= 5) binCounts[0]++
      else if (hours <= 10) binCounts[1]++
      else if (hours <= 20) binCounts[2]++
      else if (hours <= 30) binCounts[3]++
      else binCounts[4]++
    })

    charts.resolutionTimeChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: bins,
        datasets: [
          {
            label: "Number of Tickets",
            data: binCounts,
            backgroundColor: "#0a6de6",
            borderColor: "#0856b8",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  } catch (error) {
    console.error("Error updating resolution time chart:", error)
  }
}

// Creation trend chart (Line)
function updateCreationTrendChart() {
  const ctx = document.getElementById("creationTrendChart")
  if (!ctx) {
    console.warn("Creation trend chart canvas not found")
    return
  }

  try {
    if (charts.creationTrendChart) {
      charts.creationTrendChart.destroy()
    }

    // Group tickets by week
    const weeklyData = {}
    filteredTickets.forEach((ticket) => {
      const weekStart = new Date(ticket.createdDate)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekKey = weekStart.toISOString().split("T")[0]

      weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1
    })

    const sortedWeeks = Object.keys(weeklyData).sort()
    const counts = sortedWeeks.map((week) => weeklyData[week])

    charts.creationTrendChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: sortedWeeks.map((week) => new Date(week).toLocaleDateString()),
        datasets: [
          {
            label: "Tickets Created",
            data: counts,
            borderColor: "#0a6de6",
            backgroundColor: "rgba(10, 109, 230, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  } catch (error) {
    console.error("Error updating creation trend chart:", error)
  }
}

// Impact score trend
function updateImpactScoreChart() {
  const ctx = document.getElementById("impactScoreChart")
  if (!ctx) {
    console.warn("Impact score chart canvas not found")
    return
  }

  try {
    if (charts.impactScoreChart) {
      charts.impactScoreChart.destroy()
    }

    // Group by week and calculate average impact score
    const weeklyImpact = {}
    filteredTickets.forEach((ticket) => {
      const weekStart = new Date(ticket.createdDate)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekKey = weekStart.toISOString().split("T")[0]

      if (!weeklyImpact[weekKey]) {
        weeklyImpact[weekKey] = { total: 0, count: 0 }
      }
      weeklyImpact[weekKey].total += ticket.impactScore || 0
      weeklyImpact[weekKey].count++
    })

    const sortedWeeks = Object.keys(weeklyImpact).sort()
    const avgImpacts = sortedWeeks.map((week) => weeklyImpact[week].total / weeklyImpact[week].count)

    charts.impactScoreChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: sortedWeeks.map((week) => new Date(week).toLocaleDateString()),
        datasets: [
          {
            label: "Avg Impact Score",
            data: avgImpacts,
            borderColor: "#fd7e14",
            backgroundColor: "rgba(253, 126, 20, 0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
          },
        },
      },
    })
  } catch (error) {
    console.error("Error updating impact score chart:", error)
  }
}

// Aging chart
function updateAgingChart() {
  const ctx = document.getElementById("agingChart")
  if (!ctx) {
    console.warn("Aging chart canvas not found")
    return
  }

  try {
    if (charts.agingChart) {
      charts.agingChart.destroy()
    }

    const openTickets = filteredTickets.filter((t) => t.status !== "completed" && t.status !== "accepted")

    const agingData = openTickets
      .map((ticket) => {
        const daysDiff = Math.floor((new Date() - ticket.createdDate) / (1000 * 60 * 60 * 24))
        return {
          id: ticket.id,
          days: daysDiff,
          color: daysDiff > 14 ? "#dc3545" : daysDiff > 7 ? "#ffc107" : "#28a745",
        }
      })
      .sort((a, b) => b.days - a.days)
      .slice(0, 10) // Top 10 oldest

    charts.agingChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: agingData.map((item) => item.id),
        datasets: [
          {
            label: "Days Open",
            data: agingData.map((item) => item.days),
            backgroundColor: agingData.map((item) => item.color),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  } catch (error) {
    console.error("Error updating aging chart:", error)
  }
}

// Last update chart
function updateLastUpdateChart() {
  const ctx = document.getElementById("lastUpdateChart")
  if (!ctx) {
    console.warn("Last update chart canvas not found")
    return
  }

  try {
    if (charts.lastUpdateChart) {
      charts.lastUpdateChart.destroy()
    }

    const updateData = filteredTickets
      .map((ticket) => {
        const daysSinceUpdate = Math.floor((new Date() - ticket.updatedDate) / (1000 * 60 * 60 * 24))
        return {
          id: ticket.id,
          days: daysSinceUpdate,
          color: daysSinceUpdate > 7 ? "#dc3545" : daysSinceUpdate > 3 ? "#ffc107" : "#28a745",
        }
      })
      .sort((a, b) => b.days - a.days)
      .slice(0, 10) // Top 10 stale

    charts.lastUpdateChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: updateData.map((item) => item.id),
        datasets: [
          {
            label: "Days Since Update",
            data: updateData.map((item) => item.days),
            backgroundColor: updateData.map((item) => item.color),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    })
  } catch (error) {
    console.error("Error updating last update chart:", error)
  }
}

// Impact zones chart
function updateImpactZonesChart() {
  const ctx = document.getElementById("impactZonesChart")
  if (!ctx) {
    console.warn("Impact zones chart canvas not found")
    return
  }

  try {
    if (charts.impactZonesChart) {
      charts.impactZonesChart.destroy()
    }

    // Use tags or systemZone to group tickets
    const zoneCounts = {}
    filteredTickets.forEach((ticket) => {
      const zone = ticket.systemZone || (ticket.tags && ticket.tags[0]) || "Unknown"
      zoneCounts[zone] = (zoneCounts[zone] || 0) + 1
    })

    const zones = Object.keys(zoneCounts)
    const counts = zones.map((zone) => zoneCounts[zone])

    // Generate colors based on the number of zones
    const colors = [
      "#0a6de6",
      "#0856b8",
      "#fd7e14",
      "#dc3545",
      "#28a745",
      "#6f42c1",
      "#17a2b8",
      "#ffc107",
      "#6c757d",
      "#20c997",
    ]

    charts.impactZonesChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: zones,
        datasets: [
          {
            data: counts,
            backgroundColor: zones.map((_, i) => colors[i % colors.length]),
            borderWidth: 2,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 12,
              padding: 10,
            },
          },
        },
      },
    })
  } catch (error) {
    console.error("Error updating impact zones chart:", error)
  }
}

// Update ticket count heatmap
function updateTicketCountHeatmap() {
  const heatmapContainer = document.getElementById("ticketCountHeatmap")
  if (!heatmapContainer) {
    console.warn("Ticket count heatmap container not found")
    return
  }

  try {
    // Clear existing heatmap
    heatmapContainer.innerHTML = ""

    // Create heatmap data based on urgency vs status
    const urgencyLevels = ["low", "medium", "high", "critical"]
    const statuses = ["defined", "review", "test", "completed", "accepted"]
    const statusLabels = ["Newly Reported", "Being Investigated", "Verification", "Resolved", "Closed/Rejected"]

    // Create heatmap grid
    const heatmapGrid = document.createElement("div")
    heatmapGrid.className = "heatmap-grid"
    heatmapGrid.style.cssText = `
      display: grid;
      grid-template-columns: 120px repeat(${statuses.length}, 1fr);
      gap: 2px;
      background: #f8f9fa;
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 10px;
    `

    // Add header row
    const headerEmpty = document.createElement("div")
    headerEmpty.style.cssText = "padding: 8px; font-weight: bold; text-align: center;"
    heatmapGrid.appendChild(headerEmpty)

    statusLabels.forEach((statusLabel) => {
      const header = document.createElement("div")
      header.textContent = statusLabel
      header.style.cssText = "padding: 8px; font-weight: bold; text-align: center; font-size: 11px; line-height: 1.2;"
      heatmapGrid.appendChild(header)
    })

    // Add data rows
    urgencyLevels.forEach((urgency) => {
      // Urgency label
      const urgencyLabel = document.createElement("div")
      urgencyLabel.textContent = urgency.charAt(0).toUpperCase() + urgency.slice(1)
      urgencyLabel.style.cssText =
        "padding: 8px; font-weight: 500; font-size: 12px; display: flex; align-items: center;"
      heatmapGrid.appendChild(urgencyLabel)

      // Status cells
      statuses.forEach((status) => {
        const count = filteredTickets.filter((ticket) => ticket.urgency === urgency && ticket.status === status).length

        const cell = document.createElement("div")
        cell.textContent = count || "0"

        // Color intensity based on count
        let intensity = 0
        if (count > 0) {
          const maxCount = Math.max(
            ...urgencyLevels.flatMap((u) =>
              statuses.map((s) => filteredTickets.filter((t) => t.urgency === u && t.status === s).length),
            ),
          )
          intensity = count / Math.max(maxCount, 1)
        }

        const urgencyColors = {
          low: `rgba(40, 167, 69, ${0.2 + intensity * 0.8})`,
          medium: `rgba(255, 193, 7, ${0.2 + intensity * 0.8})`,
          high: `rgba(253, 126, 20, ${0.2 + intensity * 0.8})`,
          critical: `rgba(220, 53, 69, ${0.2 + intensity * 0.8})`,
        }

        cell.style.cssText = `
          padding: 12px 8px;
          text-align: center;
          font-weight: 500;
          font-size: 14px;
          background: ${urgencyColors[urgency]};
          border-radius: 4px;
          min-height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: ${count > 0 ? "pointer" : "default"};
          transition: all 0.2s ease;
        `

        if (count > 0) {
          cell.addEventListener("mouseenter", () => {
            cell.style.transform = "scale(1.05)"
            cell.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)"
          })
          cell.addEventListener("mouseleave", () => {
            cell.style.transform = "scale(1)"
            cell.style.boxShadow = "none"
          })
          cell.title = `${urgency} priority - ${statusLabels[statuses.indexOf(status)]}: ${count} ticket${count !== 1 ? "s" : ""}`
        }

        heatmapGrid.appendChild(cell)
      })
    })

    heatmapContainer.appendChild(heatmapGrid)
  } catch (error) {
    console.error("Error updating ticket count heatmap:", error)
  }
}

// Update resolution time heatmap
function updateResolutionTimeHeatmap() {
  const heatmapContainer = document.getElementById("resolutionTimeHeatmap")
  if (!heatmapContainer) {
    console.warn("Resolution time heatmap container not found")
    return
  }

  try {
    // Clear existing heatmap
    heatmapContainer.innerHTML = ""

    // Create heatmap data based on urgency vs status for resolution times
    const urgencyLevels = ["low", "medium", "high", "critical"]
    const statuses = ["defined", "review", "test", "completed", "accepted"]
    const statusLabels = ["Newly Reported", "Being Investigated", "Verification", "Resolved", "Closed/Rejected"]

    // Create heatmap grid
    const heatmapGrid = document.createElement("div")
    heatmapGrid.className = "heatmap-grid"
    heatmapGrid.style.cssText = `
      display: grid;
      grid-template-columns: 120px repeat(${statuses.length}, 1fr);
      gap: 2px;
      background: #f8f9fa;
      padding: 10px;
      border-radius: 8px;
    `

    // Add header row
    const headerEmpty = document.createElement("div")
    headerEmpty.style.cssText = "padding: 8px; font-weight: bold; text-align: center;"
    heatmapGrid.appendChild(headerEmpty)

    statusLabels.forEach((statusLabel) => {
      const header = document.createElement("div")
      header.textContent = statusLabel
      header.style.cssText = "padding: 8px; font-weight: bold; text-align: center; font-size: 11px; line-height: 1.2;"
      heatmapGrid.appendChild(header)
    })

    // Calculate max resolution time for intensity
    const allResolutionTimes = filteredTickets
      .map((ticket) => {
        const timeStr = ticket.resolutionTime ? ticket.resolutionTime.replace("~", "").replace("h", "") : "0"
        return Number.parseInt(timeStr || 0)
      })
      .filter((time) => time > 0)

    const maxResolutionTime = Math.max(...allResolutionTimes, 1)

    // Add data rows
    urgencyLevels.forEach((urgency) => {
      // Urgency label
      const urgencyLabel = document.createElement("div")
      urgencyLabel.textContent = urgency.charAt(0).toUpperCase() + urgency.slice(1)
      urgencyLabel.style.cssText =
        "padding: 8px; font-weight: 500; font-size: 12px; display: flex; align-items: center;"
      heatmapGrid.appendChild(urgencyLabel)

      // Status cells
      statuses.forEach((status) => {
        const relevantTickets = filteredTickets.filter(
          (ticket) => ticket.urgency === urgency && ticket.status === status,
        )

        let avgResolutionTime = 0
        if (relevantTickets.length > 0) {
          const totalTime = relevantTickets.reduce((sum, ticket) => {
            const timeStr = ticket.resolutionTime ? ticket.resolutionTime.replace("~", "").replace("h", "") : "0"
            return sum + Number.parseInt(timeStr || 0)
          }, 0)
          avgResolutionTime = Math.round(totalTime / relevantTickets.length)
        }

        const cell = document.createElement("div")
        cell.textContent = avgResolutionTime > 0 ? `${avgResolutionTime}h` : "-"

        // Color intensity based on resolution time
        let intensity = 0
        if (avgResolutionTime > 0) {
          intensity = avgResolutionTime / maxResolutionTime
        }

        const baseColor =
          avgResolutionTime > 20
            ? "220, 53, 69"
            : avgResolutionTime > 10
              ? "253, 126, 20"
              : avgResolutionTime > 5
                ? "255, 193, 7"
                : "40, 167, 69"

        cell.style.cssText = `
          padding: 12px 8px;
          text-align: center;
          font-weight: 500;
          font-size: 14px;
          background: rgba(${baseColor}, ${0.2 + intensity * 0.6});
          border-radius: 4px;
          min-height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: ${avgResolutionTime > 0 ? "pointer" : "default"};
          transition: all 0.2s ease;
        `

        if (avgResolutionTime > 0) {
          cell.addEventListener("mouseenter", () => {
            cell.style.transform = "scale(1.05)"
            cell.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)"
          })
          cell.addEventListener("mouseleave", () => {
            cell.style.transform = "scale(1)"
            cell.style.boxShadow = "none"
          })
          cell.title = `${urgency} priority - ${statusLabels[statuses.indexOf(status)]}: ${avgResolutionTime}h avg resolution time (${relevantTickets.length} tickets)`
        }

        heatmapGrid.appendChild(cell)
      })
    })

    heatmapContainer.appendChild(heatmapGrid)
  } catch (error) {
    console.error("Error updating resolution time heatmap:", error)
  }
}

// Update tables
function updateTables() {
  updateDeadTicketsTable()
  updateNLPSummariesTable()
}

// Dead tickets table
function updateDeadTicketsTable() {
  const deadTicketsTable = document.getElementById("deadTicketsTable")
  if (!deadTicketsTable) return

  const tbody = deadTicketsTable.querySelector("tbody")
  tbody.innerHTML = ""

  // Always show dead tickets from allTickets, not filteredTickets
  const deadTickets = allTickets.filter((ticket) => ticket.isDead || ticket.deadFlag)

  if (deadTickets.length === 0) {
    const row = document.createElement("tr")
    row.innerHTML = `<td colspan="6" style="text-align: center;">No dead tickets found</td>`
    tbody.appendChild(row)
    return
  }

  deadTickets.forEach((ticket) => {
    const daysSinceUpdate = Math.floor((new Date() - ticket.updatedDate) / (1000 * 60 * 60 * 24))
    const row = document.createElement("tr")
    row.className = "dead-ticket"

    row.innerHTML = `
      <td>${ticket.id}</td>
      <td>${ticket.summary}</td>
      <td><span class="status-${ticket.status}">${formatStatus(ticket.status)}</span></td>
      <td><span class="priority-${ticket.urgency}">${ticket.urgency}</span></td>
      <td>${ticket.createdDate.toLocaleDateString()}</td>
      <td>${daysSinceUpdate} days</td>
    `

    row.addEventListener("click", () => openTicketDetailsPage(ticket))
    tbody.appendChild(row)
  })
}

// NLP summaries table
function updateNLPSummariesTable() {
  const nlpSummariesTable = document.getElementById("nlpSummariesTable")
  if (!nlpSummariesTable) return

  const tbody = nlpSummariesTable.querySelector("tbody")
  tbody.innerHTML = ""

  const openTickets = filteredTickets.filter((ticket) => ticket.status !== "completed" && ticket.status !== "accepted")

  if (openTickets.length === 0) {
    const row = document.createElement("tr")
    row.innerHTML = `<td colspan="5"style="text-align: center;">No open tickets found</td>`
    tbody.appendChild(row)
    return
  }

  openTickets.slice(0, 10).forEach((ticket) => {
    const row = document.createElement("tr")

    row.innerHTML = `
      <td>${ticket.id}</td>
      <td>${ticket.summary}</td>
      <td><span class="priority-${ticket.urgency}">${ticket.urgency}</span></td>
      <td class="nlp-summary">${ticket.nlpSummary}</td>
      <td>
        <button class="action-btn" onclick="openTicketDetailsPage('${ticket.id}')">
          View Details
        </button>
      </td>
    `

    tbody.appendChild(row)
  })
}

// Format status for display
function formatStatus(status) {
  const statusMap = {
    defined: "Newly Reported",
    review: "Being Investigated",
    test: "Verification",
    completed: "Resolved",
    accepted: "Closed/Rejected",
  }
  return statusMap[status] || status
}

// Open ticket details page
function openTicketDetailsPage(ticketId) {
  // If ticketId is an object (ticket), extract the ID
  const id = typeof ticketId === "object" ? ticketId.id : ticketId
  window.open(`ticket-details.html?id=${id}`, "_blank")
}

// Export dashboard data
function exportDashboard() {
  const dashboardData = {
    timestamp: new Date().toISOString(),
    user: currentUser,
    totalTickets: filteredTickets.length,
    filters: {
      status: document.getElementById("statusFilter").value,
      timeRange: document.getElementById("timeRange").value,
      priority: document.getElementById("priorityFilter").value,
      maxUrgency: document.getElementById("urgencySlider").value,
      showDeadOnly: document.getElementById("deadFlag").checked,
    },
    tickets: filteredTickets.map((ticket) => ({
      id: ticket.id,
      summary: ticket.summary,
      status: ticket.status,
      priority: ticket.urgency,
      created: ticket.createdDate.toISOString(),
      updated: ticket.updatedDate.toISOString(),
      resolutionTime: ticket.resolutionTime,
      impactScore: ticket.impactScore,
      isDead: ticket.isDead,
    })),
  }

  const blob = new Blob([JSON.stringify(dashboardData, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `user-dashboard-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
