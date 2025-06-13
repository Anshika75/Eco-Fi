let currentTicket = null
let allTickets = []
let suggestedTickets = []
let timeEntries = []
let activities = []
let comments = []
let statusTimeline = []
let statusHistory = {}

// Available assignees
const availableAssignees = [
  { name: "John Doe", initials: "JD", workload: 3 },
  { name: "Jane Smith", initials: "JS", workload: 2 },
  { name: "Mike Johnson", initials: "MJ", workload: 4 },
  { name: "Sarah Wilson", initials: "SW", workload: 1 },
  { name: "Tom Brown", initials: "TB", workload: 5 },
  { name: "Lisa Davis", initials: "LD", workload: 2 },
  { name: "Alex Chen", initials: "AC", workload: 3 },
  { name: "Emma Wilson", initials: "EW", workload: 2 },
  { name: "Ryan Park", initials: "RP", workload: 3 },
  { name: "Diana Lee", initials: "DL", workload: 4 },
]

// Status workflow and forms - Updated labels
const statusWorkflow = {
  defined: {
    label: "Newly Reported",
    next: ["review"],
    prev: [],
    form: "investigation",
    order: 0,
  },
  review: {
    label: "Investigated", // Changed from "Being Investigated"
    next: ["test"],
    prev: ["defined"],
    form: "investigation",
    order: 1,
  },
  test: {
    label: "Verified", // Changed from "Verification"
    next: ["completed"],
    prev: ["review"],
    form: "testing",
    order: 2,
  },
  completed: {
    label: "Resolved",
    next: ["accepted"],
    prev: ["test"],
    form: "resolution",
    order: 3,
  },
  accepted: {
    label: "Closed/Rejected",
    next: [],
    prev: ["completed"],
    form: "closure",
    order: 4,
  },
}

// Load ticket data from localStorage
function loadTicketData() {
  const ticketData = localStorage.getItem("currentTicket")
  const allTicketsData = localStorage.getItem("allTickets")
  const suggestedTicketsData = localStorage.getItem("suggestedTickets")

  if (ticketData) {
    currentTicket = JSON.parse(ticketData)
    allTickets = JSON.parse(allTicketsData || "[]")
    suggestedTickets = JSON.parse(suggestedTicketsData || "[]")

    // Load stored data
    timeEntries = JSON.parse(localStorage.getItem(`timeEntries_${currentTicket.id}`) || "[]")
    activities = JSON.parse(localStorage.getItem(`activities_${currentTicket.id}`) || "[]")
    comments = JSON.parse(localStorage.getItem(`comments_${currentTicket.id}`) || "[]")
    statusTimeline = JSON.parse(localStorage.getItem(`statusTimeline_${currentTicket.id}`) || "[]")
    statusHistory = JSON.parse(localStorage.getItem(`statusHistory_${currentTicket.id}`) || "{}")

    populateTicketDetails()
  } else {
    // Fallback: redirect to dashboard if no ticket data
    window.location.href = "index.html"
  }
}

function populateTicketDetails() {
  if (!currentTicket) return

  // Update page title
  document.title = `${currentTicket.id} - ${currentTicket.summary} | EcoFi`

  // Populate header
  document.getElementById("ticketId").textContent = currentTicket.id
  document.getElementById("ticketTitle").textContent = currentTicket.summary

  // Update status badge
  const statusBadge = document.getElementById("statusBadge")
  statusBadge.textContent = formatStatus(currentTicket.status)
  statusBadge.className = `status-badge status-${currentTicket.status}`

  // Update priority badge
  const priorityBadge = document.getElementById("priorityBadge")
  priorityBadge.textContent = `${currentTicket.urgency} Priority`
  priorityBadge.className = `priority-badge priority-${currentTicket.urgency}`

  // Populate description and additional fields
  document.getElementById("ticketDescription").textContent = currentTicket.description
  document.getElementById("expectedBehavior").textContent = currentTicket.expectedBehavior || "Not specified"
  document.getElementById("observedIssues").textContent = currentTicket.observedIssues || "Not specified"

  // Format steps to reproduce as simple list
  const stepsElement = document.getElementById("stepsToReproduce")
  if (currentTicket.stepsToReproduce) {
    const steps = currentTicket.stepsToReproduce.split("\n").filter((step) => step.trim())
    stepsElement.innerHTML = steps.map((step) => `<div class="step-item">${step.trim()}</div>`).join("")
  } else {
    stepsElement.textContent = "Not specified"
  }

  document.getElementById("errorMessages").textContent = currentTicket.errorMessages || "No error messages provided"

  // Populate meta information
  populateMetaInfo()

  // Populate similar tickets
  populateSimilarTickets()

  // Initialize data with dummy content if none exist
  initializeComments()
  initializeStatusTimeline()
  initializeStatusHistory()

  // Check if ticket is closed (accepted) and show appropriate view
  if (currentTicket.status === "accepted") {
    document.getElementById("regularTicketView").style.display = "none"
    document.getElementById("resolvedTicketView").style.display = "block"
    populateResolvedView()
  } else {
    document.getElementById("regularTicketView").style.display = "block"
    document.getElementById("resolvedTicketView").style.display = "none"

    // Populate form options for regular view
    populateStatusOptions()
    populatePriorityOptions()
    populateAssigneeOptions()

    // Populate feeds
    populateActivityFeed()
    populateTimeTracking()
  }

  // Always populate timeline in sidebar
  populateStatusTimeline()

  // Set today's date as default for time tracking
  document.getElementById("time-date").value = new Date().toISOString().split("T")[0]
  if (document.getElementById("resolved-time-date")) {
    document.getElementById("resolved-time-date").value = new Date().toISOString().split("T")[0]
  }
}

function formatStatus(status) {
  return statusWorkflow[status]?.label || status
}

function populateMetaInfo() {
  const metaContainer = document.getElementById("ticketMeta")

  // Generate additional ticket data if not present
  if (!currentTicket.reportedBy) {
    currentTicket.reportedBy = "Sarah Johnson"
    currentTicket.reporterDepartment = "Customer Support"
    currentTicket.reporterTeam = "Support Team Alpha"
    currentTicket.reportedDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    currentTicket.dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    currentTicket.assignedDepartment = "Engineering"
    currentTicket.assignedTeam = "Backend Development"
    currentTicket.impactScope = "External Users"
    currentTicket.assignmentReason =
      "Has extensive experience with authentication systems and has resolved similar issues in the past. Currently has moderate workload and is familiar with the affected codebase."
  }

  metaContainer.innerHTML = `
        <div class="meta-item">
            <div class="meta-label">Assigned To</div>
            <div class="meta-value">
                <div class="assignee-info">
                    <div class="avatar">${currentTicket.assigneeInitials}</div>
                    <span>${currentTicket.assignee}</span>
                </div>
            </div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Story Points</div>
            <div class="meta-value">${currentTicket.points || 3} points</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Reported By</div>
            <div class="meta-value">${currentTicket.reportedBy}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Reported On</div>
            <div class="meta-value">${formatDate(currentTicket.reportedDate)}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Reporter Department</div>
            <div class="meta-value">${currentTicket.reporterDepartment}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Reporter Team</div>
            <div class="meta-value">${currentTicket.reporterTeam}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Due Date</div>
            <div class="meta-value">${formatDate(currentTicket.dueDate)}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Assigned Department</div>
            <div class="meta-value">${currentTicket.assignedDepartment}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Assigned Team</div>
            <div class="meta-value">${currentTicket.assignedTeam}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Impact Scope</div>
            <div class="meta-value">${currentTicket.impactScope}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Why Assigned to This User</div>
            <div class="meta-value" style="font-size: 13px; line-height: 1.4;">${currentTicket.assignmentReason}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Predicted Team</div>
            <div class="meta-value">${currentTicket.predictedTeam}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Affected Area</div>
            <div class="meta-value">${currentTicket.affectedArea}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Environment</div>
            <div class="meta-value">${currentTicket.environment || "Production"}</div>
        </div>
        <div class="meta-item">
            <div class="meta-label">Tags</div>
            <div class="meta-value">
                <div class="tags-list">
                    ${currentTicket.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
                </div>
            </div>
        </div>
    `
}

// Update populateSimilarTickets function to open in same tab and add dummy data
function populateSimilarTickets() {
  const similarTicketsContainer = document.getElementById("similarTickets")

  // Always generate comprehensive dummy similar tickets
  const dummySimilarTickets = [
    {
      id: "BUG-1024",
      summary: "Login page not loading correctly on mobile devices",
      status: "completed",
      reportedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      assignee: "Jane Smith",
      assigneeInitials: "JS",
      resolutionTime: "~3h",
      description:
        "Users reported login page not loading correctly on mobile devices. Issue was resolved by updating the mobile CSS framework.",
      tags: ["Frontend", "Auth", "Mobile"],
      urgency: "high",
      isDead: false,
      predictedTeam: "Frontend Development",
      estimatedDuration: "~3 hours",
      classification: "High Priority",
      affectedArea: "User Authentication",
      longResolution: false,
      reportedBy: "Customer Support",
      reporterDepartment: "Support",
      reporterTeam: "Support Team Alpha",
      dueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDepartment: "Engineering",
      assignedTeam: "Frontend Development",
      impactScope: "Mobile Users",
      assignmentReason: "Expert in mobile frontend development with proven track record.",
      environment: "Production",
    },
    {
      id: "BUG-987",
      summary: "Authentication fails when using special characters in password",
      status: "review",
      reportedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      assignee: "Tom Brown",
      assigneeInitials: "TB",
      resolutionTime: "~4h",
      description:
        "Password validation fails when special characters are used. Currently investigating the root cause.",
      tags: ["Backend", "Security", "Auth"],
      urgency: "critical",
      isDead: false,
      predictedTeam: "Backend Development",
      estimatedDuration: "~4 hours",
      classification: "Critical Priority",
      affectedArea: "User Authentication",
      longResolution: false,
      reportedBy: "Security Team",
      reporterDepartment: "Security",
      reporterTeam: "Security Team Beta",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDepartment: "Engineering",
      assignedTeam: "Backend Development",
      impactScope: "All Users",
      assignmentReason: "Security expert with extensive authentication system experience.",
      environment: "Production",
    },
    {
      id: "BUG-876",
      summary: "Login page crashes on mobile devices with iOS 15",
      status: "completed",
      reportedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      assignee: "Alex Chen",
      assigneeInitials: "AC",
      resolutionTime: "~5h",
      description:
        "Application crashes immediately after loading on iOS 15 devices. Fixed by updating iOS compatibility layer.",
      tags: ["Mobile", "iOS", "Auth"],
      urgency: "medium",
      isDead: false,
      predictedTeam: "Mobile Development",
      estimatedDuration: "~5 hours",
      classification: "Medium Priority",
      affectedArea: "Mobile Application",
      longResolution: false,
      reportedBy: "QA Team",
      reporterDepartment: "Quality Assurance",
      reporterTeam: "Mobile QA Team",
      dueDate: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDepartment: "Engineering",
      assignedTeam: "Mobile Development",
      impactScope: "iOS Users",
      assignmentReason: "iOS specialist with deep knowledge of mobile authentication flows.",
      environment: "Production",
    },
    {
      id: "BUG-654",
      summary: "Session timeout causing authentication errors",
      status: "test",
      reportedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      assignee: "Lisa Davis",
      assigneeInitials: "LD",
      resolutionTime: "~2h",
      description: "Users experiencing unexpected session timeouts leading to authentication failures.",
      tags: ["Backend", "Session", "Auth"],
      urgency: "medium",
      isDead: false,
      predictedTeam: "Backend Development",
      estimatedDuration: "~2 hours",
      classification: "Medium Priority",
      affectedArea: "Session Management",
      longResolution: false,
      reportedBy: "Customer Support",
      reporterDepartment: "Support",
      reporterTeam: "Support Team Gamma",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      assignedDepartment: "Engineering",
      assignedTeam: "Backend Development",
      impactScope: "Active Users",
      assignmentReason: "Session management expert with experience in timeout optimization.",
      environment: "Production",
    },
  ]

  // Update the global suggestedTickets array
  suggestedTickets = dummySimilarTickets
  localStorage.setItem("suggestedTickets", JSON.stringify(suggestedTickets))

  // Generate the HTML for similar tickets
  if (!similarTicketsContainer) {
    console.error("Similar tickets container not found")
    return
  }

  similarTicketsContainer.innerHTML = suggestedTickets
    .map(
      (ticket) => `
    <div class="similar-ticket" onclick="openSimilarTicket('${ticket.id}')" style="cursor: pointer;">
        <div class="similar-ticket-header">
            <div class="similar-ticket-id">${ticket.id}</div>
            <div class="similar-ticket-time">${formatTimeAgo(new Date(ticket.reportedDate))}</div>
        </div>
        <div class="similar-ticket-summary">${ticket.summary}</div>
        <div class="similar-ticket-status" style="font-size: 11px; color: #6b7280; margin-top: 4px;">
            Status: ${formatStatus(ticket.status)} • ${ticket.urgency} priority
        </div>
    </div>
  `,
    )
    .join("")

  console.log("Similar tickets populated:", suggestedTickets.length, "tickets")
}

// Add a new function to open similar tickets in the same tab
function openSimilarTicket(ticketId) {
  // Find the ticket in suggested tickets or all tickets
  const ticket = suggestedTickets.find((t) => t.id === ticketId) || allTickets.find((t) => t.id === ticketId)

  if (ticket) {
    console.log("Opening similar ticket:", ticket.id)

    // Store ticket data in localStorage and navigate to ticket details page
    localStorage.setItem("currentTicket", JSON.stringify(ticket))
    localStorage.setItem("allTickets", JSON.stringify(allTickets))
    localStorage.setItem("suggestedTickets", JSON.stringify(suggestedTickets))

    // Navigate to the ticket details page in the same tab
    window.location.href = `ticket-details.html?id=${ticketId}`
  } else {
    console.error("Ticket not found:", ticketId)
  }
}

// Replace the old openSimilarTicketPage function with the new one
function openSimilarTicketPage(ticketId) {
  openSimilarTicket(ticketId)
}

function initializeComments() {
  if (comments.length === 0) {
    // Add some dummy comments if none exist
    comments = [
      {
        id: generateId(),
        author: "John Doe",
        authorInitials: "JD",
        text: "I've started investigating this issue. It seems to be related to the authentication service.",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        internal: false,
      },
      {
        id: generateId(),
        author: "Jane Smith",
        authorInitials: "JS",
        text: "I'm seeing the same issue in the staging environment. Let me know if you need any additional information.",
        timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
        internal: false,
      },
      {
        id: generateId(),
        author: "Mike Johnson",
        authorInitials: "MJ",
        text: "Internal note: We should check the recent changes to the authentication service. There was a deployment last week that might be related.",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        internal: true,
      },
    ]

    localStorage.setItem(`comments_${currentTicket.id}`, JSON.stringify(comments))
  }

  // Populate comments in both views
  populateComments()
}

function populateComments() {
  const commentsContainer = document.getElementById("existingComments")
  const resolvedCommentsContainer = document.getElementById("resolvedComments")

  const commentHTML = comments
    .map(
      (comment) => `
    <div class="activity-item comment ${comment.internal ? "internal-comment" : ""}">
        <div class="activity-avatar">${comment.authorInitials}</div>
        <div class="activity-content">
            <div class="activity-header">
                <span class="activity-author">${comment.author}</span>
                <span class="activity-action">${comment.internal ? "added an internal note" : "commented"}</span>
                <span class="activity-time">${formatTimeAgo(new Date(comment.timestamp))}</span>
            </div>
            <div class="activity-text">${comment.text}</div>
        </div>
        <div class="activity-actions">
            <button class="activity-action-btn" title="Reply">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                </svg>
            </button>
            <button class="activity-action-btn" title="Edit">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
            </button>
        </div>
    </div>
  `,
    )
    .join("")

  commentsContainer.innerHTML = commentHTML
  if (resolvedCommentsContainer) {
    resolvedCommentsContainer.innerHTML = commentHTML
  }
}

function initializeStatusTimeline() {
  if (statusTimeline.length === 0) {
    // Add some dummy timeline entries if none exist
    const now = new Date()

    statusTimeline = [
      {
        id: generateId(),
        status: "defined",
        author: "System",
        authorInitials: "SYS",
        timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        details: "Ticket created and assigned to the development team.",
      },
      {
        id: generateId(),
        status: "review",
        author: "John Doe",
        authorInitials: "JD",
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        details:
          "Started investigating the issue. Initial analysis suggests it's related to the authentication service.",
      },
    ]

    // Add current status if not already in timeline
    if (!statusTimeline.find((item) => item.status === currentTicket.status)) {
      statusTimeline.push({
        id: generateId(),
        status: currentTicket.status,
        author: currentTicket.assignee,
        authorInitials: currentTicket.assigneeInitials,
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        details: `Changed status to ${formatStatus(currentTicket.status)}.`,
      })
    }

    localStorage.setItem(`statusTimeline_${currentTicket.id}`, JSON.stringify(statusTimeline))
  }
}

function initializeStatusHistory() {
  if (Object.keys(statusHistory).length === 0) {
    // Initialize status history with dummy data for each status
    statusHistory = {
      defined: {
        entries: [
          {
            id: generateId(),
            author: "System",
            authorInitials: "SYS",
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            text: "Ticket created and assigned to the development team.",
            type: "status-change",
          },
          {
            id: generateId(),
            author: "Jane Smith",
            authorInitials: "JS",
            timestamp: new Date(Date.now() - 2.9 * 24 * 60 * 60 * 1000).toISOString(),
            text: "Initial triage completed. This appears to be a critical issue affecting multiple users.",
            type: "comment",
          },
        ],
      },
      review: {
        entries: [
          {
            id: generateId(),
            author: "John Doe",
            authorInitials: "JD",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            text: "Started investigating the issue. Initial analysis suggests it's related to the authentication service.",
            type: "status-change",
          },
          {
            id: generateId(),
            author: "Mike Johnson",
            authorInitials: "MJ",
            timestamp: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000).toISOString(),
            text: "Found potential cause in the login service. Working on a fix.",
            type: "comment",
          },
          {
            id: generateId(),
            author: "John Doe",
            authorInitials: "JD",
            timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
            text: "Identified root cause: The authentication token validation is failing when special characters are used in passwords.",
            type: "comment",
          },
        ],
      },
    }

    // Add current status if not already in history
    if (!statusHistory[currentTicket.status]) {
      statusHistory[currentTicket.status] = {
        entries: [
          {
            id: generateId(),
            author: currentTicket.assignee,
            authorInitials: currentTicket.assigneeInitials,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            text: `Changed status to ${formatStatus(currentTicket.status)}.`,
            type: "status-change",
          },
        ],
      }
    }

    localStorage.setItem(`statusHistory_${currentTicket.id}`, JSON.stringify(statusHistory))
  }
}

function populateStatusTimeline() {
  const timelineContainer = document.getElementById("statusTimeline")

  // Sort timeline by timestamp
  const sortedTimeline = [...statusTimeline].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  )

  timelineContainer.innerHTML = sortedTimeline
    .map(
      (item, index) => `
    <div class="timeline-item">
        <div class="timeline-marker">
            <div class="timeline-dot status-${item.status}"></div>
            ${index < sortedTimeline.length - 1 ? '<div class="timeline-line"></div>' : ""}
        </div>
        <div class="timeline-content">
            <div class="timeline-header">
                <div class="timeline-status-change">
                    <span class="status-badge status-${item.status}" style="font-size: 10px; padding: 4px 8px;">
                        ${formatStatus(item.status)}
                    </span>
                </div>
                <div class="timeline-meta">
                    <span class="timeline-author">${item.author}</span>
                    <span class="timeline-time">${formatTimeAgo(new Date(item.timestamp))}</span>
                </div>
            </div>
            ${
              item.details
                ? `
                <div class="timeline-details">
                    <div class="timeline-details-content">${item.details}</div>
                </div>
            `
                : ""
            }
        </div>
    </div>
  `,
    )
    .join("")
}

// Update populateStatusOptions function
function populateStatusOptions() {
  const statusTabs = document.getElementById("statusTabs")
  const statusTabContent = document.getElementById("statusTabContent")

  // Show ALL status tabs
  const allStatuses = Object.keys(statusWorkflow)
  const currentStatusData = statusWorkflow[currentTicket.status]

  statusTabs.innerHTML = allStatuses
    .map(
      (status) => `
    <button class="status-tab ${status === currentTicket.status ? "current" : ""}" 
            data-status="${status}">
      ${formatStatus(status)}
    </button>
  `,
    )
    .join("")

  // Add event listeners to tabs
  const tabs = statusTabs.querySelectorAll(".status-tab")
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      const targetStatus = this.dataset.status

      // If clicking current status, show current status info
      if (targetStatus === currentTicket.status) {
        renderCurrentStatusContent()
        tabs.forEach((t) => t.classList.remove("active"))
        this.classList.add("active")
        return
      }

      // Check if this is a valid transition
      if (isValidTransition(currentTicket.status, targetStatus)) {
        tabs.forEach((t) => t.classList.remove("active"))
        this.classList.add("active")
        renderStatusTabContent(targetStatus)
      } else {
        // Show warning for invalid transition
        showTransitionWarning(currentTicket.status, targetStatus)
        tabs.forEach((t) => t.classList.remove("active"))
        this.classList.add("active")
      }
    })
  })

  // Set first valid transition as active by default
  const validTransitions = [...(currentStatusData.next || []), ...(currentStatusData.prev || [])]
  if (validTransitions.length > 0) {
    const firstValidTab = statusTabs.querySelector(`[data-status="${validTransitions[0]}"]`)
    if (firstValidTab) {
      firstValidTab.click()
    }
  } else {
    // If no valid transitions, show current status
    const currentTab = statusTabs.querySelector(`[data-status="${currentTicket.status}"]`)
    if (currentTab) {
      currentTab.click()
    }
  }
}

// Add function to render current status content
function renderCurrentStatusContent() {
  const statusTabContent = document.getElementById("statusTabContent")
  const historyEntries = statusHistory[currentTicket.status]?.entries || []

  statusTabContent.innerHTML = `
    <div class="current-status-info">
      <h5>Current Status: ${formatStatus(currentTicket.status)}</h5>
      <p>This ticket is currently in ${formatStatus(currentTicket.status)} status. Use the other tabs to change the status.</p>
    </div>
    
    ${
      historyEntries.length > 0
        ? `
      <div>
        <h5 style="margin-bottom: 16px; font-size: 14px; color: #374151;">Activity in ${formatStatus(currentTicket.status)}</h5>
        <div class="status-activities">
          ${historyEntries
            .map(
              (entry) => `
            <div class="mini-activity-item ${entry.type === "comment" ? "comment" : ""}">
              <div class="activity-avatar small">${entry.authorInitials}</div>
              <div class="mini-activity-content">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-weight: 600; font-size: 12px;">${entry.author}</span>
                  <span style="font-size: 11px; color: #6b7280;">${formatTimeAgo(new Date(entry.timestamp))}</span>
                </div>
                <div style="font-size: 12px;">${entry.text}</div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `
        : ""
    }
  `
}

function isValidTransition(currentStatus, targetStatus) {
  const currentStatusData = statusWorkflow[currentStatus]
  const validTransitions = [...(currentStatusData.next || []), ...(currentStatusData.prev || [])]
  return validTransitions.includes(targetStatus)
}

// Update showTransitionWarning function with better UI
function showTransitionWarning(currentStatus, targetStatus) {
  const statusTabContent = document.getElementById("statusTabContent")
  const currentOrder = statusWorkflow[currentStatus].order
  const targetOrder = statusWorkflow[targetStatus].order

  let warningMessage = ""

  if (targetOrder > currentOrder + 1) {
    const requiredStatuses = Object.keys(statusWorkflow)
      .filter((status) => statusWorkflow[status].order > currentOrder && statusWorkflow[status].order < targetOrder)
      .map((status) => formatStatus(status))

    if (requiredStatuses.length > 0) {
      warningMessage = `You cannot skip to ${formatStatus(targetStatus)} directly. Please complete ${requiredStatuses.join(" → ")} first.`
    }
  } else if (targetOrder < currentOrder - 1) {
    const requiredStatuses = Object.keys(statusWorkflow)
      .filter((status) => statusWorkflow[status].order < currentOrder && statusWorkflow[status].order > targetOrder)
      .map((status) => formatStatus(status))
      .reverse()

    if (requiredStatuses.length > 0) {
      warningMessage = `You cannot jump back to ${formatStatus(targetStatus)} directly. Please go through ${requiredStatuses.join(" → ")} first.`
    }
  }

  statusTabContent.innerHTML = `
    <div class="status-warning-container">
      <div class="status-warning">
        <div class="warning-icon">
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <div class="warning-content">
          <h5>Invalid Status Transition</h5>
          <p>${warningMessage}</p>
          <div class="workflow-guide">
            <h6>Workflow Progress</h6>
            <div class="workflow-steps">
              ${Object.keys(statusWorkflow)
                .sort((a, b) => statusWorkflow[a].order - statusWorkflow[b].order)
                .map(
                  (status) => `
                  <div class="workflow-step ${status === currentTicket.status ? "current" : ""} ${status === targetStatus ? "target" : ""}">
                    <span class="step-number">${statusWorkflow[status].order + 1}</span>
                    <span class="step-label">${formatStatus(status)}</span>
                  </div>
                `,
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderStatusTabContent(status) {
  const statusTabContent = document.getElementById("statusTabContent")
  const statusData = statusWorkflow[status]

  // Get history entries for this status
  const historyEntries = statusHistory[status]?.entries || []

  statusTabContent.innerHTML = `
    <div class="status-change-form-container">
      <form class="status-change-form" onsubmit="updateStatus(event, '${status}')">
        <div class="status-form">
          <h5>Change Status to ${formatStatus(status)}</h5>
          <textarea class="comment-input" placeholder="Add details about this status change..." rows="3" required></textarea>
          
          ${
            statusData.form === "investigation"
              ? `
            <div style="margin-top: 16px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 600;">Investigation Details</label>
              <div class="form-group">
                <label>Root Cause Analysis</label>
                <textarea placeholder="Describe what's causing the issue..." rows="3"></textarea>
              </div>
              <div class="form-group" style="margin-top: 12px;">
                <label>Affected Components</label>
                <input type="text" placeholder="List affected components or services">
              </div>
            </div>
          `
              : ""
          }
          
          ${
            statusData.form === "testing"
              ? `
            <div style="margin-top: 16px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 600;">Verification Details</label>
              <div class="form-group">
                <label>Test Results</label>
                <textarea placeholder="Describe test results..." rows="3"></textarea>
              </div>
              <div class="form-group" style="margin-top: 12px;">
                <label>Test Environment</label>
                <select>
                  <option value="dev">Development</option>
                  <option value="staging">Staging</option>
                  <option value="qa">QA</option>
                  <option value="prod">Production</option>
                </select>
              </div>
            </div>
          `
              : ""
          }
          
          ${
            statusData.form === "resolution"
              ? `
            <div style="margin-top: 16px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 600;">Resolution Details</label>
              <div class="form-group">
                <label>Solution Implemented</label>
                <textarea placeholder="Describe the solution..." rows="3"></textarea>
              </div>
              <div class="form-group" style="margin-top: 12px;">
                <label>Fixed in Version</label>
                <input type="text" placeholder="e.g., v2.3.1">
              </div>
            </div>
          `
              : ""
          }
          
          ${
            statusData.form === "closure"
              ? `
            <div style="margin-top: 16px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 600;">Closure Details</label>
              <div class="form-group">
                <label>Reason for Closure</label>
                <select>
                  <option value="fixed">Fixed</option>
                  <option value="wontfix">Won't Fix</option>
                  <option value="duplicate">Duplicate</option>
                  <option value="notabug">Not a Bug</option>
                  <option value="cannotreproduce">Cannot Reproduce</option>
                </select>
              </div>
              <div class="form-group" style="margin-top: 12px;">
                <label>Additional Notes</label>
                <textarea placeholder="Any additional notes..." rows="3"></textarea>
              </div>
            </div>
          `
              : ""
          }
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Update Status</button>
        </div>
      </form>
    </div>
    
    ${
      historyEntries.length > 0
        ? `
      <div style="margin-top: 24px;">
        <h5 style="margin-bottom: 16px; font-size: 14px; color: #374151;">Previous Activity in ${formatStatus(status)}</h5>
        <div class="status-activities">
          ${historyEntries
            .map(
              (entry) => `
            <div class="mini-activity-item ${entry.type === "comment" ? "comment" : ""}">
              <div class="activity-avatar small">${entry.authorInitials}</div>
              <div class="mini-activity-content">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-weight: 600; font-size: 12px;">${entry.author}</span>
                  <span style="font-size: 11px; color: #6b7280;">${formatTimeAgo(new Date(entry.timestamp))}</span>
                </div>
                <div style="font-size: 12px;">${entry.text}</div>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `
        : ""
    }
  `
}

// Add success modal functions
function showSuccessModal(message) {
  const modalHTML = `
    <div class="success-modal-overlay" id="successModal">
      <div class="success-modal">
        <div class="success-icon">
          <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h3>Success!</h3>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="closeSuccessModal()">Continue</button>
      </div>
    </div>
  `

  document.body.insertAdjacentHTML("beforeend", modalHTML)
  const modal = document.getElementById("successModal")

  setTimeout(() => {
    modal.classList.add("active")
  }, 100)

  // Auto close after 3 seconds
  setTimeout(() => {
    closeSuccessModal()
  }, 3000)
}

function closeSuccessModal() {
  const modal = document.getElementById("successModal")
  if (modal) {
    modal.classList.remove("active")
    setTimeout(() => {
      modal.remove()
    }, 300)
  }
}

// Update changeStatus function to use success modal
function updateStatus(event, newStatus) {
  event.preventDefault()

  // Validate transition again
  if (!isValidTransition(currentTicket.status, newStatus)) {
    showSuccessModal("Invalid status transition. Please follow the proper workflow.")
    return
  }

  const form = event.target
  const details = form.querySelector("textarea").value

  // Update ticket status
  currentTicket.status = newStatus
  localStorage.setItem("currentTicket", JSON.stringify(currentTicket))

  // Update status badge
  const statusBadge = document.getElementById("statusBadge")
  statusBadge.textContent = formatStatus(newStatus)
  statusBadge.className = `status-badge status-${newStatus}`

  // Add to timeline
  const timelineEntry = {
    id: generateId(),
    status: newStatus,
    author: "Current User",
    authorInitials: "CU",
    timestamp: new Date().toISOString(),
    details: details,
  }

  statusTimeline.push(timelineEntry)
  localStorage.setItem(`statusTimeline_${currentTicket.id}`, JSON.stringify(statusTimeline))

  // Add to status history
  if (!statusHistory[newStatus]) {
    statusHistory[newStatus] = { entries: [] }
  }

  statusHistory[newStatus].entries.push({
    id: generateId(),
    author: "Current User",
    authorInitials: "CU",
    timestamp: new Date().toISOString(),
    text: details,
    type: "status-change",
  })

  localStorage.setItem(`statusHistory_${currentTicket.id}`, JSON.stringify(statusHistory))

  // Add to activities
  activities.push({
    id: generateId(),
    type: "status-change",
    author: "Current User",
    authorInitials: "CU",
    text: `Changed status to ${formatStatus(newStatus)}`,
    timestamp: new Date().toISOString(),
  })
  localStorage.setItem(`activities_${currentTicket.id}`, JSON.stringify(activities))

  // Check if ticket is now closed (accepted) and update view
  if (newStatus === "accepted") {
    document.getElementById("regularTicketView").style.display = "none"
    document.getElementById("resolvedTicketView").style.display = "block"
    populateResolvedView()
  } else {
    // Update status tabs for new available transitions
    populateStatusOptions()
  }

  // Update timeline in sidebar
  populateStatusTimeline()

  // Show success modal instead of alert
  showSuccessModal(`Status successfully updated to ${formatStatus(newStatus)}!`)
}

function populatePriorityOptions() {
  const priorityOptions = document.getElementById("priorityOptions")

  const priorities = [
    { value: "critical", label: "Critical", icon: "critical" },
    { value: "high", label: "High", icon: "high" },
    { value: "medium", label: "Medium", icon: "medium" },
    { value: "low", label: "Low", icon: "low" },
  ]

  priorityOptions.innerHTML = priorities
    .map(
      (priority) => `
    <div class="priority-option">
      <input type="radio" name="priority" id="priority-${priority.value}" value="${priority.value}" 
        ${currentTicket.urgency === priority.value ? "checked disabled" : ""}>
      <label for="priority-${priority.value}" class="${currentTicket.urgency === priority.value ? "current-option" : ""}">
        <div class="priority-indicator ${priority.icon}"></div>
        ${priority.label}
      </label>
    </div>
  `,
    )
    .join("")
}

function populateAssigneeOptions() {
  const assigneeOptions = document.getElementById("assigneeOptions")

  assigneeOptions.innerHTML = availableAssignees
    .map(
      (assignee) => `
    <div class="assignee-option ${currentTicket.assignee === assignee.name ? "current-assignee" : ""}" 
         data-assignee="${assignee.name}" 
         data-initials="${assignee.initials}">
      <div class="avatar">${assignee.initials}</div>
      <div>${assignee.name}</div>
      <div class="assignee-workload">
        ${assignee.workload} active tickets
      </div>
    </div>
  `,
    )
    .join("")

  // Add click event to select assignee
  const options = assigneeOptions.querySelectorAll(".assignee-option:not(.current-assignee)")
  options.forEach((option) => {
    option.addEventListener("click", function () {
      options.forEach((opt) => opt.classList.remove("selected"))
      this.classList.add("selected")
    })
  })
}

function populateActivityFeed() {
  const activityFeed = document.getElementById("activity-feed")

  if (activities.length === 0) {
    // Generate dummy activities if none exist
    activities = [
      {
        id: generateId(),
        type: "comment",
        author: "John Doe",
        authorInitials: "JD",
        text: "I've started investigating this issue. It seems to be related to the authentication service.",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: generateId(),
        type: "status-change",
        author: "John Doe",
        authorInitials: "JD",
        text: "Changed status from Newly Reported to Being Investigated",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: generateId(),
        type: "comment",
        author: "Jane Smith",
        authorInitials: "JS",
        text: "I'm seeing the same issue in the staging environment. Let me know if you need any additional information.",
        timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: generateId(),
        type: "time-log",
        author: "John Doe",
        authorInitials: "JD",
        text: "Logged 2 hours - Investigating authentication service issues",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    localStorage.setItem(`activities_${currentTicket.id}`, JSON.stringify(activities))
  }

  // Sort activities by timestamp (newest first)
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )

  activityFeed.innerHTML = sortedActivities
    .map(
      (activity) => `
    <div class="activity-item ${activity.type}">
      <div class="activity-avatar">${activity.authorInitials}</div>
      <div class="activity-content">
        <div class="activity-header">
          <span class="activity-author">${activity.author}</span>
          <span class="activity-action">${getActivityAction(activity.type)}</span>
          <span class="activity-time">${formatTimeAgo(new Date(activity.timestamp))}</span>
        </div>
        <div class="activity-text">${activity.text}</div>
      </div>
    </div>
  `,
    )
    .join("")
}

function getActivityAction(type) {
  switch (type) {
    case "comment":
      return "commented"
    case "status-change":
      return "changed status"
    case "assignment":
      return "reassigned ticket"
    case "priority-change":
      return "changed priority"
    case "edit":
      return "edited ticket"
    case "time-log":
      return "logged time"
    default:
      return "took action"
  }
}

function populateTimeTracking() {
  const timeEntriesContainer = document.getElementById("timeEntries")
  const totalTimeContainer = document.getElementById("totalTime")

  if (timeEntries.length === 0) {
    // Generate dummy time entries if none exist
    timeEntries = [
      {
        id: generateId(),
        author: "John Doe",
        authorInitials: "JD",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        duration: 1.5,
        description: "Initial investigation of the issue",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: generateId(),
        author: "John Doe",
        authorInitials: "JD",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        duration: 2,
        description: "Debugging authentication service",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    localStorage.setItem(`timeEntries_${currentTicket.id}`, JSON.stringify(timeEntries))
  }

  // Sort time entries by date (newest first)
  const sortedEntries = [...timeEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  timeEntriesContainer.innerHTML = sortedEntries
    .map(
      (entry) => `
    <div class="time-entry">
      <div class="time-entry-date">${formatDate(entry.date)}</div>
      <div class="time-entry-duration">${entry.duration}h</div>
      <div class="time-entry-description">${entry.description}</div>
      <div class="time-entry-author">
        <div class="avatar small">${entry.authorInitials}</div>
        <span>${entry.author}</span>
      </div>
    </div>
  `,
    )
    .join("")

  // Calculate total time
  const totalHours = timeEntries.reduce((total, entry) => total + entry.duration, 0)
  totalTimeContainer.textContent = `Total Time Logged: ${totalHours} hours`
}

function populateResolvedView() {
  // Populate comments (already done in populateComments)

  // Add reopen button to the first card
  const resolvedCommentsCard = document.querySelector("#resolvedTicketView .card:first-child .card-header")
  if (resolvedCommentsCard && !resolvedCommentsCard.querySelector(".reopen-button")) {
    resolvedCommentsCard.innerHTML += `
      <button class="btn btn-secondary reopen-button" onclick="reopenTicket()" style="margin-left: auto;">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        Reopen Ticket
      </button>
    `
  }

  // Populate status history sections
  const statusHistorySections = document.getElementById("statusHistorySections")

  // Get all statuses that have history
  const statusesWithHistory = Object.keys(statusHistory)

  statusHistorySections.innerHTML = statusesWithHistory
    .map((status) => {
      const entries = statusHistory[status].entries || []
      if (entries.length === 0) return ""

      return `
      <div class="status-history-section">
        <div class="status-history-header">
          <span class="status-badge status-${status}">${formatStatus(status)}</span>
          <h4>${formatStatus(status)}</h4>
        </div>
        <div class="status-history-content">
          <div class="status-history-items">
            ${entries
              .map(
                (entry) => `
              <div class="status-history-item ${status}">
                <div class="status-history-meta">
                  <span class="status-history-author">${entry.author}</span>
                  <span class="status-history-time">${formatTimeAgo(new Date(entry.timestamp))}</span>
                </div>
                <div class="status-history-details">${entry.text}</div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>
    `
    })
    .join("")

  // Populate time tracking for resolved view
  const resolvedTimeEntries = document.getElementById("resolvedTimeEntries")
  const resolvedTotalTime = document.getElementById("resolvedTotalTime")

  // Sort time entries by date (newest first)
  const sortedEntries = [...timeEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  resolvedTimeEntries.innerHTML = sortedEntries
    .map(
      (entry) => `
    <div class="time-entry">
      <div class="time-entry-date">${formatDate(entry.date)}</div>
      <div class="time-entry-duration">${entry.duration}h</div>
      <div class="time-entry-description">${entry.description}</div>
      <div class="time-entry-author">
        <div class="avatar small">${entry.authorInitials}</div>
        <span>${entry.author}</span>
      </div>
    </div>
  `,
    )
    .join("")

  // Calculate total time
  const totalHours = timeEntries.reduce((total, entry) => total + entry.duration, 0)
  resolvedTotalTime.textContent = `Total Time Logged: ${totalHours} hours`
}

// Event handlers
function addComment(event) {
  event.preventDefault()

  const form = event.target
  const commentText = form.querySelector(".comment-input").value
  const isInternal =
    form.querySelector("#internal-comment")?.checked ||
    form.querySelector("#resolved-internal-comment")?.checked ||
    false
  const notifyAssignee =
    form.querySelector("#notify-assignee")?.checked || form.querySelector("#resolved-notify-assignee")?.checked || false

  const newComment = {
    id: generateId(),
    author: "Current User", // In a real app, this would be the logged-in user
    authorInitials: "CU",
    text: commentText,
    timestamp: new Date().toISOString(),
    internal: isInternal,
  }

  comments.push(newComment)
  localStorage.setItem(`comments_${currentTicket.id}`, JSON.stringify(comments))

  // Add to activities
  activities.push({
    id: generateId(),
    type: "comment",
    author: newComment.author,
    authorInitials: newComment.authorInitials,
    text: commentText,
    timestamp: newComment.timestamp,
  })
  localStorage.setItem(`activities_${currentTicket.id}`, JSON.stringify(activities))

  // Update UI
  populateComments()
  populateActivityFeed()

  // Reset form
  form.reset()
}

function changePriority(event) {
  event.preventDefault()

  const form = event.target
  const selectedPriority = form.querySelector('input[name="priority"]:checked')

  if (!selectedPriority) {
    alert("Please select a priority")
    return
  }

  const newPriority = selectedPriority.value
  const reason = form.querySelector("textarea").value

  // Update ticket priority
  currentTicket.urgency = newPriority
  localStorage.setItem("currentTicket", JSON.stringify(currentTicket))

  // Update priority badge
  const priorityBadge = document.getElementById("priorityBadge")
  priorityBadge.textContent = `${newPriority} Priority`
  priorityBadge.className = `priority-badge priority-${newPriority}`

  // Add to activities
  activities.push({
    id: generateId(),
    type: "priority-change",
    author: "Current User",
    authorInitials: "CU",
    text: `Changed priority to ${newPriority}${reason ? `: ${reason}` : ""}`,
    timestamp: new Date().toISOString(),
  })
  localStorage.setItem(`activities_${currentTicket.id}`, JSON.stringify(activities))

  // Update activity feed
  populateActivityFeed()

  // Reset form
  form.reset()

  // Show success message
  alert(`Priority updated to ${newPriority}`)
}

function reassignTicket(event) {
  event.preventDefault()

  const form = event.target
  const selectedAssignee = form.querySelector(".assignee-option.selected")

  if (!selectedAssignee) {
    alert("Please select an assignee")
    return
  }

  const newAssignee = selectedAssignee.dataset.assignee
  const newAssigneeInitials = selectedAssignee.dataset.initials
  const reason = form.querySelector("textarea").value

  // Update ticket assignee
  currentTicket.assignee = newAssignee
  currentTicket.assigneeInitials = newAssigneeInitials
  localStorage.setItem("currentTicket", JSON.stringify(currentTicket))

  // Update meta info
  populateMetaInfo()

  // Add to activities
  activities.push({
    id: generateId(),
    type: "assignment",
    author: "Current User",
    authorInitials: "CU",
    text: `Reassigned ticket to ${newAssignee}${reason ? `: ${reason}` : ""}`,
    timestamp: new Date().toISOString(),
  })
  localStorage.setItem(`activities_${currentTicket.id}`, JSON.stringify(activities))

  // Update activity feed
  populateActivityFeed()

  // Reset form
  form.reset()

  // Show success message
  alert(`Ticket reassigned to ${newAssignee}`)
}

function addTimeEntry(event) {
  event.preventDefault()

  const form = event.target
  const date = form.querySelector('input[name="date"]').value
  const duration = Number.parseFloat(form.querySelector('input[name="duration"]').value)
  const description = form.querySelector('textarea[name="description"]').value

  const newEntry = {
    id: generateId(),
    author: "Current User", // In a real app, this would be the logged-in user
    authorInitials: "CU",
    date: date,
    duration: duration,
    description: description,
    timestamp: new Date().toISOString(),
  }

  timeEntries.push(newEntry)
  localStorage.setItem(`timeEntries_${currentTicket.id}`, JSON.stringify(timeEntries))

  // Add to activities
  activities.push({
    id: generateId(),
    type: "time-log",
    author: newEntry.author,
    authorInitials: newEntry.authorInitials,
    text: `Logged ${duration} hours - ${description}`,
    timestamp: newEntry.timestamp,
  })
  localStorage.setItem(`activities_${currentTicket.id}`, JSON.stringify(activities))

  // Update UI
  populateTimeTracking()
  populateActivityFeed()

  // If in resolved view, update that too
  if (document.getElementById("resolvedTicketView").style.display === "block") {
    populateResolvedView()
  }

  // Reset form
  form.reset()
  form.querySelector('input[name="date"]').value = new Date().toISOString().split("T")[0]
}

function deleteTicket() {
  if (confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
    // In a real app, this would make an API call to delete the ticket
    alert("Ticket deleted successfully")
    window.location.href = "index.html"
  }
}

function viewSimilarTicket(ticketId) {
  // In a real app, this would navigate to the selected ticket
  alert(`Navigating to ticket ${ticketId}`)
}

function goBackToDashboard() {
  window.location.href = "index.html"
}

function reopenTicket() {
  if (confirm("Are you sure you want to reopen this ticket? It will be moved back to Resolved status.")) {
    // Change status back to completed (resolved)
    currentTicket.status = "completed"
    localStorage.setItem("currentTicket", JSON.stringify(currentTicket))

    // Update status badge
    const statusBadge = document.getElementById("statusBadge")
    statusBadge.textContent = formatStatus("completed")
    statusBadge.className = `status-badge status-completed`

    // Add to timeline
    const timelineEntry = {
      id: generateId(),
      status: "completed",
      author: "Current User",
      authorInitials: "CU",
      timestamp: new Date().toISOString(),
      details: "Ticket reopened and moved back to Resolved status",
    }

    statusTimeline.push(timelineEntry)
    localStorage.setItem(`statusTimeline_${currentTicket.id}`, JSON.stringify(statusTimeline))

    // Add to activities
    activities.push({
      id: generateId(),
      type: "status-change",
      author: "Current User",
      authorInitials: "CU",
      text: "Reopened ticket and changed status to Resolved",
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem(`activities_${currentTicket.id}`, JSON.stringify(activities))

    // Switch back to regular view
    document.getElementById("regularTicketView").style.display = "block"
    document.getElementById("resolvedTicketView").style.display = "none"

    // Repopulate regular view
    populateStatusOptions()
    populateActivityFeed()
    populateTimeTracking()
    populateStatusTimeline()

    alert("Ticket has been reopened successfully")
  }
}

// Tab switching
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("work-tab")) {
    const tabName = event.target.dataset.tab

    // Update active tab
    document.querySelectorAll(".work-tab").forEach((tab) => {
      tab.classList.remove("active")
    })
    event.target.classList.add("active")

    // Show corresponding content
    document.querySelectorAll(".work-content").forEach((content) => {
      content.classList.remove("active")
    })
    document.querySelector(`.work-content[data-content="${tabName}"]`).classList.add("active")
  }
})

// Helper functions
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatTimeAgo(date) {
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) {
    return "just now"
  } else if (diffMin < 60) {
    return `${diffMin}m ago`
  } else if (diffHour < 24) {
    return `${diffHour}h ago`
  } else if (diffDay < 7) {
    return `${diffDay}d ago`
  } else {
    return formatDate(date)
  }
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Initialize the page
document.addEventListener("DOMContentLoaded", loadTicketData)
